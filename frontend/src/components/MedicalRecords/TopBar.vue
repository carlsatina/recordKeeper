<template>
<div class="top-bar">
    <div class="top-bar-content">
        <div class="left-section">
            <mdicon 
                v-if="showBack"
                name="chevron-left" 
                :size="28" 
                @click="handleBack"
                class="back-button"
            />
            <div class="title-wrapper">
                <h2 class="title">{{ title }}</h2>
                <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
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
    background: white;
    z-index: 999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.top-bar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
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
    color: #374151;
    transition: all 0.2s ease;
    padding: 4px;
    border-radius: 8px;
}

.back-button:active {
    background: #f3f4f6;
    transform: scale(0.95);
}

.title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    letter-spacing: -0.3px;
}

.title-wrapper {
    display: flex;
    flex-direction: column;
}

.subtitle {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
}

.right-section {
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>
