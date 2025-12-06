<template>
<div class="add-record-container">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <!-- Header -->
    <div class="header glass-nav">
        <button class="close-btn" @click="goBack">
            <mdicon name="close" :size="22"/>
        </button>
        <h2 class="page-title">{{ headerTitle }}</h2>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Image Upload Section -->
        <div class="image-upload-section">
            <div 
                class="image-preview existing glass-card" 
                v-for="file in existingFiles" 
                :key="`existing-${file.id}`"
            >
                <img :src="resolveFileUrl(file.url)" :alt="file.originalName || 'Attachment'"/>
                <button 
                    type="button" 
                    class="remove-image-btn"
                    @click="removeExistingFile(file.id)"
                >
                    <mdicon name="close" :size="16"/>
                </button>
            </div>
            <div 
                class="image-preview glass-card" 
                v-for="(file, index) in selectedFiles" 
                :key="file.id"
            >
                <img :src="file.preview" alt="Uploaded record" />
                <button 
                    type="button" 
                    class="remove-image-btn"
                    @click="removeSelectedFile(index)"
                >
                    <mdicon name="close" :size="16"/>
                </button>
            </div>
            <button 
                type="button" 
                class="add-image-card glass-card" 
                @click="triggerFileUpload('device')"
                :disabled="selectedFiles.length >= maxAttachments"
            >
                <mdicon name="image-plus" :size="36" class="plus-icon"/>
                <p>Upload from device</p>
            </button>
            <button 
                type="button" 
                class="add-image-card glass-card" 
                @click="triggerFileUpload('camera')"
                :disabled="selectedFiles.length >= maxAttachments"
            >
                <mdicon name="camera-plus" :size="36" class="plus-icon"/>
                <p>Use camera</p>
            </button>
            <input 
                type="file" 
                ref="deviceInput" 
                class="sr-only"
                accept="image/*"
                multiple
                @change="handleFileUpload"
            />
            <input 
                type="file" 
                ref="cameraInput" 
                class="sr-only"
                accept="image/*"
                capture="environment"
                @change="handleFileUpload"
            />
        </div>

        <!-- Form Fields -->
        <div class="form-section glass-card">
            <!-- Record For -->
            <div class="form-group">
                <label class="form-label">Record for</label>
                <div class="select-wrapper">
                    <select v-model="recordFor" class="form-select glass-select">
                        <option value="">Select family member</option>
                        <option 
                            v-for="member in profileMembers" 
                            :key="member.id" 
                            :value="member.id"
                        >
                            {{ member.name }}
                        </option>
                    </select>
                    <mdicon name="chevron-down" :size="20" class="select-icon"/>
                </div>
            </div>

            <!-- File Name -->
            <div class="form-group">
                <label class="form-label">File name</label>
                <input 
                    type="text" 
                    v-model="fileName" 
                    placeholder="Add file name"
                    class="form-input glass-input"
                />
            </div>

            <!-- Provider Name -->
            <div class="form-group">
                <label class="form-label">Provider / Facility</label>
                <input 
                    type="text" 
                    v-model="providerName" 
                    placeholder="Add hospital or provider name"
                    class="form-input glass-input"
                />
            </div>

            <!-- Record Created On -->
            <div class="form-group">
                <label class="form-label">Record created on</label>
                <input 
                    type="date" 
                    v-model="recordDate" 
                    placeholder="Add record date"
                    class="form-input glass-input"
                />
            </div>

            <!-- Type of Record -->
            <div class="form-group record-type-group">
                <label class="form-label">Type of record</label>
                <div class="record-types">
                    <div 
                        class="record-type-card glass-card"
                        v-for="option in recordTypeOptions"
                        :key="option.id"
                        :class="{ active: recordType === option.id }"
                        @click="recordType = option.id"
                    >
                        <mdicon :name="option.icon" :size="32"/>
                        <span>{{ option.label }}</span>
                    </div>
                </div>
            </div>

            <!-- Tags -->
            <div class="form-group">
                <label class="form-label">Tags</label>
                <input 
                    type="text" 
                    v-model="tagsInput" 
                    placeholder="Separate tags with commas (e.g. scan, follow-up)"
                    class="form-input glass-input"
                />
            </div>

            <!-- Notes -->
            <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea
                    v-model="notes"
                    rows="4"
                    class="form-input glass-input"
                    placeholder="Add any helpful notes about this record"
                ></textarea>
            </div>

            <p v-if="formError" class="form-error">{{ formError }}</p>
        </div>

        <!-- Save Button -->
        <button class="save-btn glass-btn-primary" @click="saveRecord" :disabled="saving">
            {{ saving ? 'Saving...' : (isEditing ? 'Update record' : 'Save record') }}
        </button>
    </div>
</div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProfiles } from '@/composables/profiles'
import { useMedicalRecords } from '@/composables/medicalRecords'
import { API_BASE_URL } from '@/constants/config'

export default {
    name: 'AddRecordMobile',
    setup() {
        const router = useRouter()
        const route = useRoute()
        const getDefaultProfileId = () => localStorage.getItem('selectedProfileId') || ''

        const deviceInput = ref(null)
        const cameraInput = ref(null)
        const selectedFiles = ref([])
        const existingFiles = ref([])
        const recordFor = ref(getDefaultProfileId())
        const fileName = ref('')
        const recordDate = ref(new Date().toISOString().split('T')[0])
        const recordType = ref('LAB_RESULT')
        const providerName = ref('')
        const tagsInput = ref('')
        const notes = ref('')
        const profileMembers = ref([])
        const filesToRemove = ref([])
        const recordId = ref(typeof route.query.recordId === 'string' ? route.query.recordId : null)
        const { fetchProfiles } = useProfiles()
        const { createRecord, fetchRecordById, updateRecord } = useMedicalRecords()
        const maxAttachments = 5
        const saving = ref(false)
        const formError = ref('')
        const recordTypeOptions = [
            { id: 'LAB_RESULT', label: 'Lab Report', icon: 'file-document' },
            { id: 'PRESCRIPTION', label: 'Prescription', icon: 'file-document-edit' },
            { id: 'OTHER', label: 'Invoice', icon: 'receipt' }
        ]

        const isEditing = computed(() => !!recordId.value)
        const headerTitle = computed(() => (isEditing.value ? 'Edit Record' : 'Add Record'))

        const goBack = () => {
            router.back()
        }

        const triggerFileUpload = (mode = 'device') => {
            if (selectedFiles.value.length >= maxAttachments) {
                formError.value = `You can upload up to ${maxAttachments} files.`
                return
            }
            formError.value = ''
            const target = mode === 'camera' ? cameraInput.value : deviceInput.value
            target?.click()
        }

        const toPreviewEntry = (file) => new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                resolve({
                    id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    file,
                    preview: typeof e.target?.result === 'string' ? e.target.result : ''
                })
            }
            reader.readAsDataURL(file)
        })

        const handleFileUpload = async(event) => {
            const files = Array.from(event.target.files || [])
            if (!files.length) return
            const availableSlots = maxAttachments - selectedFiles.value.length
            if (availableSlots <= 0) {
                formError.value = `You can upload up to ${maxAttachments} files.`
                event.target.value = ''
                return
            }
            const filesToUse = files.slice(0, availableSlots)
            const previews = await Promise.all(filesToUse.map(toPreviewEntry))
            selectedFiles.value = [...selectedFiles.value, ...previews]
            formError.value = ''
            event.target.value = ''
        }

        const removeSelectedFile = (index) => {
            selectedFiles.value.splice(index, 1)
        }

        const resolveFileUrl = (url) => {
            if (!url) return ''
            if (url.startsWith('http')) {
                return url
            }
            return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
        }

        const removeExistingFile = (fileId) => {
            existingFiles.value = existingFiles.value.filter(file => file.id !== fileId)
            if (!filesToRemove.value.includes(fileId)) {
                filesToRemove.value.push(fileId)
            }
        }

        const loadRecordDetails = async () => {
            if (!recordId.value) return
            const token = localStorage.getItem('token')
            if (!token) return
            try {
                const record = await fetchRecordById(token, recordId.value)
                recordFor.value = record.profileId
                fileName.value = record.title
                providerName.value = record.providerName || ''
                recordDate.value = new Date(record.recordDate).toISOString().split('T')[0]
                recordType.value = record.recordType || 'OTHER'
                notes.value = record.notes || ''
                tagsInput.value = Array.isArray(record.tags) ? record.tags.join(', ') : ''
                existingFiles.value = (record.files || []).filter(file => (file.mimeType || '').startsWith('image/')).map(file => ({
                    id: file.id,
                    url: file.url,
                    mimeType: file.mimeType,
                    originalName: file.originalName
                }))
                filesToRemove.value = []
                selectedFiles.value = []
            } catch (err) {
                formError.value = err.message || 'Unable to load record details.'
            }
        }

        const resetForm = () => {
            recordFor.value = getDefaultProfileId()
            fileName.value = ''
            providerName.value = ''
            recordDate.value = new Date().toISOString().split('T')[0]
            recordType.value = 'LAB_RESULT'
            tagsInput.value = ''
            notes.value = ''
            selectedFiles.value = []
            existingFiles.value = []
            filesToRemove.value = []
            formError.value = ''
        }

        const saveRecord = async() => {
            formError.value = ''
            if (!recordFor.value) {
                formError.value = 'Please select a profile for this record.'
                return
            }
            if (!fileName.value.trim()) {
                formError.value = 'Please enter a file name.'
                return
            }
            if (!recordDate.value) {
                formError.value = 'Please select a record date.'
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                formError.value = 'Please log in again to continue.'
                router.push('/login')
                return
            }

            const formData = new FormData()
            formData.append('profileId', recordFor.value)
            formData.append('title', fileName.value.trim())
            formData.append('recordType', recordType.value)
            formData.append('recordDate', recordDate.value)
            selectedFiles.value.forEach(fileEntry => {
                formData.append('files', fileEntry.file)
            })
            if (providerName.value.trim()) {
                formData.append('providerName', providerName.value.trim())
            }
            if (notes.value.trim()) {
                formData.append('notes', notes.value.trim())
            }
            const tagsArray = tagsInput.value
                ? tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
                : []
            formData.append('tags', JSON.stringify(tagsArray))
            if (isEditing.value) {
                formData.append('filesToRemove', JSON.stringify(filesToRemove.value))
            }

            try {
                saving.value = true
                if (isEditing.value && recordId.value) {
                    await updateRecord(token, recordId.value, formData)
                    router.replace({ path: `/medical-records/records/${recordId.value}` })
                } else {
                    await createRecord(token, formData)
                    router.replace({ path: '/medical-records', query: { tab: 'records' } })
                }
            } catch (err) {
                formError.value = err.message || 'Unable to save record. Please try again.'
            } finally {
                saving.value = false
            }
        }

        const loadProfiles = async () => {
            const token = localStorage.getItem('token')
            if (!token) return
            const { response, error } = await fetchProfiles(token)
            if (error.value === null && response.value?.profiles) {
                profileMembers.value = response.value.profiles.map(profile => ({
                    id: profile.id,
                    name: profile.displayName || 'Profile'
                }))
                const savedId = localStorage.getItem('selectedProfileId')
                const hasSavedProfile = profileMembers.value.find(member => member.id === savedId)
                if (hasSavedProfile) {
                    recordFor.value = hasSavedProfile.id
                } else if (profileMembers.value.length) {
                    recordFor.value = profileMembers.value[0].id
                }
            }
        }

        onMounted(() => {
            loadProfiles().then(() => {
                loadRecordDetails()
            })
        })

        watch(
            () => route.query.recordId,
            (val) => {
                recordId.value = typeof val === 'string' ? val : null
                if (recordId.value) {
                    loadRecordDetails()
                } else {
                    resetForm()
                }
            }
        )

        return {
            deviceInput,
            cameraInput,
            selectedFiles,
            existingFiles,
            maxAttachments,
            recordFor,
            fileName,
            recordDate,
            recordType,
            providerName,
            tagsInput,
            notes,
            recordTypeOptions,
            isEditing,
            headerTitle,
            goBack,
            triggerFileUpload,
            handleFileUpload,
            removeSelectedFile,
            removeExistingFile,
            saveRecord,
            profileMembers,
            saving,
            formError,
            resolveFileUrl
        }
    }
}
</script>

<style scoped>
.add-record-container {
    min-height: 100vh;
    background: #05060a;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

.bg-orb {
    position: absolute;
    filter: blur(60px);
    opacity: 0.28;
    z-index: 0;
}
.orb-1 {
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22d3ee, #a855f7);
    top: -140px;
    left: -110px;
}
.orb-2 {
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #06b6d4);
    bottom: -120px;
    right: -90px;
}

/* Header */
.header {
    background: rgba(5,6,10,0.8);
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.close-btn {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    padding: 8px;
    cursor: pointer;
    color: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    transition: all 0.2s ease;
}

.close-btn:active {
    transform: scale(0.92);
    background: rgba(255,255,255,0.12);
}

.page-title {
    font-size: 19px;
    font-weight: 700;
    color: #e2e8f0;
    margin: 0;
}

/* Content */
.content {
    flex: 1;
    padding: 18px 16px 32px;
    position: relative;
    z-index: 1;
}

/* Image Upload Section */
.image-upload-section {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 22px;
}

.image-preview {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    overflow: hidden;
    aspect-ratio: 1;
    position: relative;
    box-shadow: 0 10px 24px rgba(0,0,0,0.35);
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.remove-image-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    border: none;
    border-radius: 999px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(11,16,32,0.8);
    color: #e2e8f0;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.08);
}

.add-image-card {
    border: 1px dashed rgba(103,232,249,0.45);
    background: rgba(255,255,255,0.04);
    border-radius: 16px;
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #e2e8f0;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
}

.add-image-card:active {
    transform: scale(0.98);
    border-color: rgba(168,85,247,0.8);
}

.add-image-card:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.plus-icon {
    color: #94a3b8;
}

.add-image-card p {
    font-size: 13px;
    color: #cbd5e1;
    margin: 0;
    font-weight: 600;
}

/* Form Section */
.form-section {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 26px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.35);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-size: 14px;
    font-weight: 700;
    color: #e2e8f0;
}

.form-input,
.glass-input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 14px;
    color: #e2e8f0;
    transition: all 0.2s ease;
}

.form-input::placeholder,
.glass-input::placeholder {
    color: #94a3b8;
}

.form-input:focus,
.glass-input:focus {
    outline: none;
    border-color: rgba(103,232,249,0.6);
    box-shadow: 0 0 0 2px rgba(103,232,249,0.25);
}

/* Select Wrapper */
.select-wrapper {
    position: relative;
}

.form-select {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 12px 38px 12px 14px;
    font-size: 14px;
    color: #e2e8f0;
    width: 100%;
    appearance: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.form-select option:first-child {
    color: #94a3b8;
}

.form-select:focus {
    outline: none;
    border-color: rgba(103,232,249,0.6);
    box-shadow: 0 0 0 2px rgba(103,232,249,0.25);
}

.select-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    pointer-events: none;
}

/* Record Types */
.record-types {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.record-type-card {
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.05);
    border-radius: 14px;
    padding: 16px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.25s ease;
    color: #cbd5e1;
}

.record-type-card:active {
    transform: scale(0.97);
}

.record-type-card.active {
    border-color: rgba(103,232,249,0.5);
    background: linear-gradient(135deg, rgba(34,211,238,0.22), rgba(168,85,247,0.2));
    color: #0b1020;
    box-shadow: 0 12px 24px rgba(168,85,247,0.25);
}

.record-type-card span {
    font-size: 12px;
    font-weight: 700;
    text-align: center;
}

/* Save Button */
.save-btn {
    width: 100%;
    margin-top: 10px;
}

.form-error {
    color: #f87171;
    font-size: 13px;
    margin: 4px 0 0 0;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
</style>
