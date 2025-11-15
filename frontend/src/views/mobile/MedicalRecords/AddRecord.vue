<template>
<div class="add-record-container">
    <!-- Header -->
    <div class="header">
        <button class="close-btn" @click="goBack">
            <mdicon name="close" :size="24"/>
        </button>
        <h2 class="page-title">Add Record</h2>
    </div>

    <!-- Content -->
    <div class="content">
        <!-- Image Upload Section -->
        <div class="image-upload-section">
            <div 
                class="image-preview" 
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
                class="add-image-card" 
                @click="triggerFileUpload('device')"
                :disabled="selectedFiles.length >= maxAttachments"
            >
                <mdicon name="image-plus" :size="36" class="plus-icon"/>
                <p>Upload from device</p>
            </button>
            <button 
                type="button" 
                class="add-image-card" 
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
        <div class="form-section">
            <!-- Record For -->
            <div class="form-group">
                <label class="form-label">Record for</label>
                <div class="select-wrapper">
                    <select v-model="recordFor" class="form-select">
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
                    class="form-input"
                />
            </div>

            <!-- Provider Name -->
            <div class="form-group">
                <label class="form-label">Provider / Facility</label>
                <input 
                    type="text" 
                    v-model="providerName" 
                    placeholder="Add hospital or provider name"
                    class="form-input"
                />
            </div>

            <!-- Record Created On -->
            <div class="form-group">
                <label class="form-label">Record created on</label>
                <input 
                    type="date" 
                    v-model="recordDate" 
                    placeholder="Add record date"
                    class="form-input"
                />
            </div>

            <!-- Type of Record -->
            <div class="form-group">
                <label class="form-label">Type of record</label>
                <div class="record-types">
                    <div 
                        class="record-type-card"
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
                    class="form-input"
                />
            </div>

            <!-- Notes -->
            <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea
                    v-model="notes"
                    rows="4"
                    class="form-input"
                    placeholder="Add any helpful notes about this record"
                ></textarea>
            </div>

            <p v-if="formError" class="form-error">{{ formError }}</p>
        </div>

        <!-- Save Button -->
        <button class="save-btn" @click="saveRecord" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save record' }}
        </button>
    </div>
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfiles } from '@/composables/profiles'
import { useMedicalRecords } from '@/composables/medicalRecords'

export default {
    name: 'AddRecordMobile',
    setup() {
        const router = useRouter()
        const deviceInput = ref(null)
        const cameraInput = ref(null)
        const selectedFiles = ref([])
        const recordFor = ref(localStorage.getItem('selectedProfileId') || '')
        const fileName = ref('')
        const recordDate = ref(new Date().toISOString().split('T')[0])
        const recordType = ref('LAB_RESULT')
        const providerName = ref('')
        const tagsInput = ref('')
        const notes = ref('')
        const profileMembers = ref([])
        const { fetchProfiles } = useProfiles()
        const { createRecord } = useMedicalRecords()
        const maxAttachments = 5
        const saving = ref(false)
        const formError = ref('')
        const recordTypeOptions = [
            { id: 'LAB_RESULT', label: 'Lab Report', icon: 'file-document' },
            { id: 'PRESCRIPTION', label: 'Prescription', icon: 'file-document-edit' },
            { id: 'OTHER', label: 'Invoice', icon: 'receipt' }
        ]

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

            try {
                saving.value = true
                await createRecord(token, formData)
                router.replace({ path: '/medical-records', query: { tab: 'records' } })
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
            loadProfiles()
        })

        return {
            deviceInput,
            cameraInput,
            selectedFiles,
            maxAttachments,
            recordFor,
            fileName,
            recordDate,
            recordType,
            providerName,
            tagsInput,
            notes,
            recordTypeOptions,
            goBack,
            triggerFileUpload,
            handleFileUpload,
            removeSelectedFile,
            saveRecord,
            profileMembers,
            saving,
            formError
        }
    }
}
</script>

<style scoped>
.add-record-container {
    min-height: 100vh;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
}

/* Header */
.header {
    background: white;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 10;
}

.close-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.close-btn:active {
    transform: scale(0.9);
    background: #f3f4f6;
    border-radius: 8px;
}

.page-title {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

/* Content */
.content {
    flex: 1;
    padding: 20px 16px;
    padding-bottom: 40px;
}

/* Image Upload Section */
.image-upload-section {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 32px;
}

.image-preview {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    aspect-ratio: 1;
    position: relative;
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
    background: rgba(0, 0, 0, 0.6);
    color: white;
    cursor: pointer;
}

.add-image-card {
    border: none;
    background: white;
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #1a1a1a;
}

.add-image-card:active {
    transform: scale(0.98);
    border-color: #667eea;
}

.add-image-card:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.plus-icon {
    color: #9ca3af;
}

.add-image-card p {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
    font-weight: 500;
}

/* Form Section */
.form-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 32px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
}

.form-input {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 14px 16px;
    font-size: 15px;
    color: #1a1a1a;
    transition: all 0.2s ease;
}

.form-input::placeholder {
    color: #9ca3af;
}

.form-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Select Wrapper */
.select-wrapper {
    position: relative;
}

.form-select {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 14px 40px 14px 16px;
    font-size: 15px;
    color: #1a1a1a;
    width: 100%;
    appearance: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.form-select option:first-child {
    color: #9ca3af;
}

.form-select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
}

/* Record Types */
.record-types {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.record-type-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #6b7280;
}

.record-type-card:active {
    transform: scale(0.95);
}

.record-type-card.active {
    border-color: #667eea;
    background: #f0f4ff;
    color: #667eea;
}

.record-type-card span {
    font-size: 12px;
    font-weight: 500;
    text-align: center;
}

/* Save Button */
.save-btn {
    width: 100%;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.save-btn:active {
    transform: scale(0.98);
    background: #5568d3;
}

.form-error {
    color: #dc2626;
    font-size: 14px;
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
