<template>
<div class="top-bar glass-nav glass-nav-orb">
    <div class="top-bar-content">
        <div class="left-section">
            <mdicon 
                v-if="showBack"
                name="chevron-left" 
                :size="28" 
                @click="handleBack"
                class="back-button"
            />
            <div v-if="profileName" class="profile-chip main">
                <div class="profile-avatar">
                    <mdicon name="account-circle" :size="26"/>
                </div>
                <span>{{ profileName }}</span>
            </div>
            <div v-else class="title-wrapper">
                <h2 class="title">{{ title }}</h2>
            </div>
        </div>
        <div class="right-section">
            <slot name="actions"></slot>
        </div>
    </div>
</div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
    name: "MedicalRecordsTopBar",
    props: {
        title: {
            type: String,
            default: 'Medical Records'
        },
        showBack: {
            type: Boolean,
            default: false
        },
        backRoute: {
            type: String,
            default: '/'
        },
        subtitle: {
            type: String,
            default: ''
        },
        profileName: {
            type: String,
            default: ''
        }
    },
    setup(props) {
        const router = useRouter()

        const handleBack = () => {
            router.push(props.backRoute)
        }

        return {
            handleBack
        }
    }
}
</script>

<style scoped>
.top-bar {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    background: var(--glass-ghost-bg);
    z-index: 999;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--glass-card-border);
}

.top-bar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    max-width: 100%;
}

.left-section {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.back-button {
    cursor: pointer;
    color: var(--text-primary);
    transition: all 0.2s ease;
    padding: 4px;
    border-radius: 8px;
}

.back-button:active {
    background: var(--glass-ghost-bg);
    transform: scale(0.95);
}

.title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.3px;
}

.title-wrapper {
    display: flex;
    flex-direction: column;
}

.right-section {
    display: flex;
    align-items: center;
    gap: 8px;
}

.profile-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: var(--glass-ghost-bg);
    border: 1px solid var(--glass-card-border);
    border-radius: 999px;
    font-size: 12px;
    color: var(--text-primary);
    backdrop-filter: blur(6px);
}

.profile-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4f46e5, #06b6d4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0b1020;
}

.profile-chip.main {
    padding: 6px 14px;
    font-size: 13px;
}
</style>
