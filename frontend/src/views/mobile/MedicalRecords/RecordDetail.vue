<template>
<div class="record-detail-page">
    <TopBar
        :title="record?.title || 'Record Detail'"
        :show-back="true"
        :back-route="backRoute"
    />

    <div class="record-detail-content">
        <div v-if="loading" class="state-card">
            Loading record...
        </div>

        <div v-else-if="errorMessage" class="state-card error">
            {{ errorMessage }}
        </div>

        <div v-else-if="record" class="detail-stack">
            <section class="summary-card">
                <div class="summary-header">
                    <div>
                        <p class="summary-label">Type</p>
                        <p class="summary-value">{{ recordTypeLabel }}</p>
                    </div>
                    <span class="record-date">{{ formattedDate }}</span>
                </div>
                <div class="summary-grid">
                    <div class="summary-item">
                        <mdicon name="account-outline" :size="22"/>
                        <div>
                            <p class="summary-label">Profile</p>
                            <p class="summary-value">{{ resolvedProfileName }}</p>
                        </div>
                    </div>
                    <div class="summary-item">
                        <mdicon name="hospital-building" :size="22"/>
                        <div>
                            <p class="summary-label">Provider</p>
                            <p class="summary-value">{{ record.providerName || 'Not specified' }}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="notes-card" v-if="record.notes">
                <h3>Notes</h3>
                <p>{{ record.notes }}</p>
            </section>

            <section class="tags-card" v-if="recordTags.length">
                <h3>Tags</h3>
                <div class="tag-chips">
                    <span 
                        class="tag-chip" 
                        v-for="tag in recordTags" 
                        :key="tag"
                    >
                        {{ tag }}
                    </span>
                </div>
            </section>

            <section class="attachments-card" v-if="imageFiles.length || otherFiles.length">
                <h3>Attachments</h3>
                <div v-if="imageFiles.length" class="image-grid">
                    <div 
                        v-for="(image, index) in imageFiles"
                        :key="image.id || index"
                        class="image-thumb"
                        @click="openViewer(index)"
                    >
                        <img :src="resolveFileUrl(image.url)" :alt="image.originalName || 'Attachment'"/>
                        <div class="image-count" v-if="imageFiles.length > 1">
                            {{ index + 1 }} / {{ imageFiles.length }}
                        </div>
                    </div>
                </div>

                <div v-if="otherFiles.length" class="other-files">
                    <div 
                        class="file-row"
                        v-for="file in otherFiles"
                        :key="file.id"
                    >
                        <div class="file-icon">
                            <mdicon name="file-document-outline" :size="24"/>
                        </div>
                        <div class="file-info">
                            <p class="file-name">{{ file.originalName || 'Document' }}</p>
                            <p class="file-meta">{{ formatFileSize(file.sizeBytes) }}</p>
                        </div>
                        <a
                            class="file-download"
                            :href="resolveFileUrl(file.url)"
                            target="_blank"
                            rel="noopener"
                        >
                            <mdicon name="download" :size="22"/>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <div v-if="viewer.open" class="image-viewer-overlay">
        <div class="viewer-content">
            <button class="viewer-close" @click="closeViewer">
                <mdicon name="close" :size="24"/>
            </button>
            <div class="viewer-main">
                <button class="viewer-nav" @click="previousImage" :disabled="!hasMultipleImages">
                    <mdicon name="chevron-left" :size="28"/>
                </button>
                <div class="viewer-image-wrapper">
                    <img 
                        v-if="currentViewerImage"
                        :src="resolveFileUrl(currentViewerImage.url)"
                        :alt="currentViewerImage.originalName || 'Attachment'"
                        :style="viewerImageStyle"
                    />
                </div>
                <button class="viewer-nav" @click="nextImage" :disabled="!hasMultipleImages">
                    <mdicon name="chevron-right" :size="28"/>
                </button>
            </div>
            <div class="viewer-controls" v-if="currentViewerImage">
                <label>Zoom</label>
                <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.1" 
                    v-model.number="viewerZoom"
                />
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TopBar from '@/components/MedicalRecords/TopBar.vue'
import { useMedicalRecords } from '@/composables/medicalRecords'
import { API_BASE_URL } from '@/constants/config'

const recordTypeLabels = {
    PRESCRIPTION: 'Prescription',
    DIAGNOSIS: 'Diagnosis',
    LAB_RESULT: 'Lab Report',
    IMAGING: 'Imaging',
    VACCINATION: 'Vaccination',
    DISCHARGE_SUMMARY: 'Discharge Summary',
    OTHER: 'Other'
}

export default {
    name: 'MedicalRecordDetailMobile',
    components: {
        TopBar
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const record = ref(null)
        const loading = ref(true)
        const errorMessage = ref('')
        const { fetchRecordById } = useMedicalRecords()
        const viewer = reactive({
            open: false,
            index: 0,
            zoom: 1
        })

        const recordId = computed(() => route.params.id)
        const backRoute = computed(() => {
            const from = route.query.from
            return typeof from === 'string' && from.length ? from : '/medical-records'
        })

        const resolvedProfileName = computed(() => {
            if (record.value?.profile?.displayName) {
                return record.value.profile.displayName
            }
            if (typeof route.query.profileName === 'string' && route.query.profileName.length) {
                return route.query.profileName
            }
            return localStorage.getItem('selectedProfileName') || 'Profile'
        })

        const recordTypeLabel = computed(() => {
            if (!record.value) return 'Record'
            return recordTypeLabels[record.value.recordType] || recordTypeLabels.OTHER
        })

        const formattedDate = computed(() => {
            if (!record.value) return ''
            const parsed = new Date(record.value.recordDate)
            if (Number.isNaN(parsed.getTime())) return ''
            return parsed.toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            })
        })

        const imageFiles = computed(() => {
            return (record.value?.files || []).filter(file => (file.mimeType || '').startsWith('image/'))
        })

        const otherFiles = computed(() => {
            return (record.value?.files || []).filter(file => !(file.mimeType || '').startsWith('image/'))
        })

        const recordTags = computed(() => {
            return Array.isArray(record.value?.tags) ? record.value.tags : []
        })

        const currentViewerImage = computed(() => {
            if (!viewer.open) return null
            return imageFiles.value[viewer.index] || null
        })

        const hasMultipleImages = computed(() => imageFiles.value.length > 1)

        const viewerZoom = computed({
            get: () => viewer.zoom,
            set: (value) => {
                viewer.zoom = Number(value) || 1
            }
        })

        const viewerImageStyle = computed(() => ({
            transform: `scale(${viewer.zoom})`
        }))

        const resolveFileUrl = (url) => {
            if (!url) return ''
            if (url.startsWith('http')) {
                return url
            }
            return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
        }

        const formatFileSize = (bytes = 0) => {
            const size = Number(bytes)
            if (!size) {
                return 'Unknown size'
            }
            if (size >= 1024 * 1024) {
                return `${(size / (1024 * 1024)).toFixed(1)} MB`
            }
            return `${(size / 1024).toFixed(1)} KB`
        }

        const openViewer = (index) => {
            viewer.index = index
            viewer.zoom = 1
            viewer.open = true
        }

        const closeViewer = () => {
            viewer.open = false
            viewer.zoom = 1
        }

        const nextImage = () => {
            if (!hasMultipleImages.value) return
            viewer.index = (viewer.index + 1) % imageFiles.value.length
            viewer.zoom = 1
        }

        const previousImage = () => {
            if (!hasMultipleImages.value) return
            viewer.index = (viewer.index - 1 + imageFiles.value.length) % imageFiles.value.length
            viewer.zoom = 1
        }

        const loadRecord = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }
            try {
                loading.value = true
                errorMessage.value = ''
                const data = await fetchRecordById(token, recordId.value)
                record.value = data
            } catch (err) {
                errorMessage.value = err.message || 'Unable to load record.'
            } finally {
                loading.value = false
            }
        }

        watch(imageFiles, (files) => {
            if (!files.length) {
                closeViewer()
            } else if (viewer.index >= files.length) {
                viewer.index = files.length - 1
            }
        })

        onMounted(() => {
            if (!recordId.value) {
                errorMessage.value = 'Record not found.'
                loading.value = false
                return
            }
            loadRecord()
        })

        return {
            record,
            loading,
            errorMessage,
            recordTypeLabel,
            formattedDate,
            imageFiles,
            otherFiles,
            openViewer,
            closeViewer,
            nextImage,
            previousImage,
            currentViewerImage,
            viewer,
            viewerZoom,
            viewerImageStyle,
            hasMultipleImages,
            resolveFileUrl,
            formatFileSize,
            backRoute,
            resolvedProfileName,
            recordTags
        }
    }
}
</script>

<style scoped>
.record-detail-page {
    min-height: 100vh;
    background: #f8f9fa;
}

.record-detail-content {
    padding: 20px 16px 40px;
}

.state-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    color: #4b5563;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.state-card.error {
    color: #b91c1c;
}

.detail-stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.summary-card,
.notes-card,
.attachments-card,
.tags-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.summary-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.summary-label {
    font-size: 13px;
    color: #9ca3af;
    margin: 0;
}

.summary-value {
    margin: 2px 0 0 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
}

.record-date {
    font-size: 14px;
    color: #6b7280;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.summary-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid #f3f4f6;
    border-radius: 12px;
    background: #f9fafb;
    color: #4b5563;
}

.notes-card h3,
.attachments-card h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
}

.notes-card p {
    margin: 0;
    color: #4b5563;
    line-height: 1.5;
}

.image-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.image-thumb {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    cursor: pointer;
}

.image-thumb img {
    width: 100%;
    height: 140px;
    object-fit: cover;
}

.image-count {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 12px;
    border-radius: 999px;
    padding: 4px 8px;
}

.other-files {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.file-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid #f3f4f6;
    border-radius: 12px;
}

.file-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #f0f4ff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
}

.file-info {
    flex: 1;
}

.file-name {
    margin: 0;
    font-weight: 600;
    color: #111827;
}

.file-meta {
    margin: 2px 0 0;
    font-size: 13px;
    color: #6b7280;
}

.file-download {
    color: #4b5563;
    display: flex;
}

.image-viewer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 24px;
}

.viewer-content {
    width: 100%;
    max-width: 480px;
    position: relative;
    color: white;
}

.viewer-close {
    position: absolute;
    top: -12px;
    right: 0;
    border: none;
    background: transparent;
    color: white;
    padding: 8px;
    cursor: pointer;
}

.viewer-main {
    display: flex;
    align-items: center;
    gap: 8px;
}

.viewer-nav {
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: 999px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.viewer-nav:disabled {
    opacity: 0.4;
}

.viewer-image-wrapper {
    flex: 1;
    max-height: 70vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.viewer-image-wrapper img {
    max-width: 100%;
    max-height: 70vh;
    transition: transform 0.2s ease;
}

.viewer-controls {
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.viewer-controls label {
    font-size: 14px;
}

.viewer-controls input[type="range"] {
    flex: 1;
}
</style>
.tags-card h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
}

.tag-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.tag-chip {
    padding: 6px 12px;
    border-radius: 999px;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 13px;
    font-weight: 500;
}
