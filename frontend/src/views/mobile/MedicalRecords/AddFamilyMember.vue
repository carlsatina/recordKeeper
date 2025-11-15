<template>
<div class="add-profile-container">
    <header class="app-bar">
        <button class="icon-btn" @click="router.back()">
            <mdicon name="close" :size="22" />
        </button>
        <h2 class="screen-title">Add Profile</h2>
        <span class="spacer"></span>
    </header>

    <form class="form-card" @submit.prevent="submitProfile">
        <div class="input-block">
            <label>Full Name</label>
            <input type="text" v-model="form.displayName" required placeholder="Enter full name" />
        </div>

        <div class="input-block">
            <label>Relation</label>
            <input type="text" v-model="form.relationToUser" placeholder="e.g., Spouse, Child" />
        </div>

        <div class="double-grid">
            <div class="input-block">
                <label>Date of Birth</label>
                <input type="date" v-model="form.dateOfBirth" />
            </div>
            <div class="input-block">
                <label>Gender</label>
                <select v-model="form.gender">
                    <option value="">Select</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                </select>
            </div>
        </div>

        <div class="input-block">
            <label>Blood Group</label>
            <input type="text" v-model="form.bloodGroup" placeholder="e.g., O+" />
        </div>

        <div class="input-block">
            <label>Allergies</label>
            <textarea v-model="form.allergies" rows="2" placeholder="Known allergies"></textarea>
        </div>

        <div class="input-block">
            <label>Chronic Conditions</label>
            <textarea v-model="form.chronicConditions" rows="2" placeholder="List chronic conditions"></textarea>
        </div>

        <button class="save-btn" type="submit" :disabled="saving">
            <span v-if="!saving">Save Profile</span>
            <span v-else>Saving...</span>
        </button>
    </form>
</div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createProfile } from '@/composables/profiles'

export default {
    name: 'AddFamilyMember',
    setup() {
        const router = useRouter()
        const saving = ref(false)
        const form = reactive({
            displayName: '',
            relationToUser: '',
            dateOfBirth: '',
            gender: '',
            bloodGroup: '',
            allergies: '',
            chronicConditions: ''
        })

        const submitProfile = async () => {
            if (!form.displayName) return
            saving.value = true
            const token = localStorage.getItem('token')
            const payload = {
                ...form,
                dateOfBirth: form.dateOfBirth || null
            }
            const { response, error } = await createProfile(token, payload)
            saving.value = false
            if (error.value === null && response.value?.status === 201) {
                router.back()
            }
        }

        return {
            router,
            form,
            submitProfile,
            saving
        }
    }
}
</script>

<style scoped>
.add-profile-container {
    min-height: 100vh;
    background: #f8f9fa;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.app-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.screen-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
}

.icon-btn {
    border: none;
    background: rgba(0,0,0,0.05);
    border-radius: 12px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.spacer {
    width: 40px;
}

.form-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(15,23,42,0.08);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.input-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.input-block label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
}

.input-block input,
.input-block select,
.input-block textarea {
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 12px;
    font-size: 15px;
    background: #f9fafb;
}

.double-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
}

.save-btn {
    margin-top: 12px;
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    border: none;
    border-radius: 16px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    padding: 14px;
    cursor: pointer;
    box-shadow: 0 12px 20px rgba(79,70,229,0.3);
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
