<template>
<div class="record-detail-container">
    <div class="record-detail-wrapper">
        <div class="detail-header">
            <button class="back-btn" @click="goBack">
                <mdicon name="arrow-left" :size="22"/>
            </button>
            <div class="header-text">
                <p class="record-type-label">{{ recordTypeLabel }}</p>
                <h2 class="record-title">{{ record?.title || 'Record Detail' }}</h2>
                <p class="record-date" v-if="record">{{ formattedDate }}</p>
            </div>
            <button 
                class="edit-btn"
                v-if="record"
                @click="goToEdit"
            >
                <mdicon name="pencil" :size="18"/>
                <span>Edit</span>
            </button>
        </div>

        <div v-if="loading" class="state-card">Loading record...</div>
        <div v-else-if="errorMessage" class="state-card error">{{ errorMessage }}</div>

        <div v-else-if="record" class="detail-body">
            <section class="attachments-panel">
                <div class="section-heading">
                    <h3>Attachments</h3>
                    <span class="section-hint">Browse the uploaded files</span>
                </div>
                <div v-if="imageFiles.length" class="image-viewer">
                    <button class="viewer-nav left" @click="previousImage" :disabled="!canGoPrevious">
                        <mdicon name="chevron-left" :size="22"/>
                    </button>
                    <div class="viewer-frame">
                        <img 
                            :src="resolveFileUrl(currentImage?.url)" 
                            :alt="currentImage?.originalName || 'Attachment image'"
                        />
                    </div>
                    <button class="viewer-nav right" @click="nextImage" :disabled="!canGoNext">
                        <mdicon name="chevron-right" :size="22"/>
                    </button>
                </div>
                <p v-else class="empty-hint">No image attachments uploaded.</p>
                <div v-if="imageFiles.length" class="viewer-meta">
                    <p class="viewer-title">{{ currentImage?.originalName || 'Image attachment' }}</p>
                    <p class="viewer-count">Image {{ viewerIndex + 1 }} of {{ imageFiles.length }}</p>
                </div>

                <div v-if="otherFiles.length" class="file-list">
                    <a 
                        class="file-row"
                        v-for="file in otherFiles" 
                        :key="file.id"
                        :href="resolveFileUrl(file.url)"
                        target="_blank"
                        rel="noopener"
                    >
                        <div class="file-icon">
                            <mdicon name="file-document-outline" :size="24"/>
                        </div>
                        <div class="file-meta">
                            <p class="file-name">{{ file.originalName || 'Document' }}</p>
                            <p class="file-size">{{ formatFileSize(file.sizeBytes) }}</p>
                        </div>
                        <mdicon name="open-in-new" :size="18"/>
                    </a>
                </div>
            </section>

            <div class="info-panel">
                <section class="summary-card">
                    <div class="summary-grid">
                        <div class="summary-item">
                            <p class="summary-label">Profile</p>
                            <p class="summary-value">{{ record.profile?.displayName || 'Unknown profile' }}</p>
                        </div>
                        <div class="summary-item">
                            <p class="summary-label">Provider</p>
                            <p class="summary-value">{{ record.providerName || 'Not specified' }}</p>
                        </div>
                        <div class="summary-item">
                            <p class="summary-label">Record Date</p>
                            <p class="summary-value">{{ formattedDate }}</p>
                        </div>
                    </div>
                </section>

                <section class="notes-card">
                    <div class="section-heading">
                        <h3>Notes</h3>
                        <span class="section-hint">Additional context or doctor instructions</span>
                    </div>
                    <p v-if="record.notes" class="notes-text">{{ record.notes }}</p>
                    <p v-else class="empty-hint">No notes added for this record.</p>
                </section>

                <section class="tags-card">
                    <div class="section-heading">
                        <h3>Tags</h3>
                    </div>
                    <div v-if="record.tags?.length" class="tag-list">
                        <span class="tag-chip" v-for="tag in record.tags" :key="tag">{{ tag }}</span>
                    </div>
                    <p v-else class="empty-hint">No tags added.</p>
                </section>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMedicalRecords } from '@/composables/medicalRecords'
import { API_BASE_URL } from '@/constants/config'

const recordTypeMeta = {
    LAB_RESULT: 'Lab Report',
    PRESCRIPTION: 'Prescription',
    INVOICE: 'Invoice',
    VACCINATION: 'Vaccination',
    DIAGNOSIS: 'Diagnosis',
    IMAGING: 'Imaging',
    DISCHARGE_SUMMARY: 'Discharge Summary',
    OTHER: 'Other'
}

export default {
    name: 'WebMedicalRecordDetail',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { fetchRecordById } = useMedicalRecords()
        const record = ref(null)
        const loading = ref(true)
        const errorMessage = ref('')
        const viewerIndex = ref(0)

        const recordId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')

        const recordTypeLabel = computed(() => {
            if (!record.value) return ''
            return recordTypeMeta[record.value.recordType] || recordTypeMeta.OTHER
        })

        const formattedDate = computed(() => {
            if (!record.value?.recordDate) return 'Unknown date'
            return new Date(record.value.recordDate).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            })
        })

        const imageFiles = computed(() => {
            if (!record.value?.files) return []
            return record.value.files.filter(file => file.mimeType?.startsWith('image/'))
        })

        const otherFiles = computed(() => {
            if (!record.value?.files) return []
            return record.value.files.filter(file => !file.mimeType?.startsWith('image/'))
        })

        const currentImage = computed(() => {
            return imageFiles.value[viewerIndex.value] || null
        })

        const canGoPrevious = computed(() => viewerIndex.value > 0)
        const canGoNext = computed(() => viewerIndex.value < imageFiles.value.length - 1)

        const previousImage = () => {
            if (!canGoPrevious.value) return
            viewerIndex.value -= 1
        }

        const nextImage = () => {
            if (!canGoNext.value) return
            viewerIndex.value += 1
        }

        watch(imageFiles, (files) => {
            if (!files.length) {
                viewerIndex.value = 0
                return
            }
            if (viewerIndex.value >= files.length) {
                viewerIndex.value = files.length - 1
            }
        })

        const resolveFileUrl = (url = '') => {
            if (!url) return ''
            if (url.startsWith('http')) {
                return url
            }
            return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
        }

        const formatFileSize = (bytes = 0) => {
            if (!bytes) return 'Unknown size'
            if (bytes < 1024) return `${bytes} B`
            if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        }

        const loadRecord = async () => {
            const token = localStorage.getItem('token')
            if (!token || !recordId.value) {
                errorMessage.value = 'Record not found.'
                loading.value = false
                return
            }
            loading.value = true
            try {
                const data = await fetchRecordById(token, recordId.value)
                record.value = data
                viewerIndex.value = 0
            } catch (err) {
                errorMessage.value = err.message || 'Unable to load record.'
            } finally {
                loading.value = false
            }
        }


        const goBack = () => {
            router.back()
        }

        const goToEdit = () => {
            router.push({
                path: '/medical-records/add-record',
                query: { recordId: recordId.value }
            })
        }

        onMounted(() => {
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
            currentImage,
            viewerIndex,
            canGoPrevious,
            canGoNext,
            resolveFileUrl,
            formatFileSize,
            goBack,
            goToEdit,
            previousImage,
            nextImage
        }
    }
}
</script>

<style scoped>
.record-detail-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 32px 16px;
}

.record-detail-wrapper {
    width: 100%;
    max-width: 960px;
    background: white;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
    padding: 32px;
}

.detail-header {
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 20px;
    margin-bottom: 24px;
}

.back-btn {
    border: none;
    background: #eef2ff;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #4338ca;
}

.header-text {
    flex: 1;
}

.record-type-label {
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 1px;
    color: #818cf8;
    margin: 0 0 6px;
}

.record-title {
    margin: 0;
    font-size: 28px;
    color: #0f172a;
}

.record-date {
    margin: 6px 0 0;
    color: #64748b;
}

.edit-btn {
    border: none;
    background: #6366f1;
    color: white;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border-radius: 12px;
    padding: 10px 18px;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 6px 18px rgba(99, 102, 241, 0.3);
}

.detail-body {
    display: flex;
    gap: 24px;
}

.attachments-panel,
.summary-card,
.notes-card,
.tags-card {
    background: #f8fafc;
    border-radius: 20px;
    padding: 24px;
    border: 1px solid #e2e8f0;
}

.attachments-panel {
    flex: 0 0 360px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 100%;
}

.info-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
}

.summary-label {
    font-size: 12px;
    text-transform: uppercase;
    color: #94a3b8;
    margin: 0 0 4px;
}

.summary-value {
    font-size: 16px;
    color: #0f172a;
    margin: 0;
}

.section-heading {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 12px;
}

.section-heading h3 {
    margin: 0;
}

.section-hint {
    font-size: 13px;
    color: #94a3b8;
}

.notes-text {
    margin: 0;
    line-height: 1.6;
    color: #1f2937;
}

.empty-hint {
    color: #94a3b8;
    margin: 0;
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.tag-chip {
    background: #eef2ff;
    color: #4338ca;
    padding: 6px 14px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 13px;
}

.image-viewer {
    position: relative;
    background: white;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
}

.viewer-frame {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 16px;
}

.viewer-frame img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.viewer-nav {
    border: none;
    background: rgba(15, 23, 42, 0.65);
    color: white;
    width: 38px;
    height: 38px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.viewer-nav:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.viewer-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
}

.viewer-title {
    margin: 0;
    font-weight: 600;
    color: #0f172a;
}

.viewer-count {
    margin: 0;
    color: #94a3b8;
    font-size: 13px;
}

.file-list {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.file-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    text-decoration: none;
    color: inherit;
    gap: 12px;
    transition: border-color 0.2s ease;
}

.file-row:hover {
    border-color: #6366f1;
}

.file-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: #eef2ff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4338ca;
}

.file-meta {
    flex: 1;
}

.file-name {
    margin: 0;
    font-weight: 600;
    color: #111827;
}

.file-size {
    margin: 2px 0 0;
    color: #94a3b8;
    font-size: 13px;
}

.state-card {
    padding: 24px;
    border-radius: 16px;
    background: #f8fafc;
    text-align: center;
    color: #475569;
}

.state-card.error {
    color: #dc2626;
}

@media (max-width: 768px) {
    .record-detail-wrapper {
        padding: 24px;
    }

    .detail-body {
        flex-direction: column;
    }

    .attachments-panel {
        flex: 1;
    }

    .detail-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .edit-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
