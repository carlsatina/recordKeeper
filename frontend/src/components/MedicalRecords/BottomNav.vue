<template>
<div class="bottom-nav glass-nav-orb">
    <div 
        class="nav-item" 
        :class="{ active: activeTab === 'home' }"
        @click="$emit('change-tab', 'home')"
    >
        <mdicon name="view-dashboard-outline" :size="24"/>
        <span class="nav-label">Dashboard</span>
    </div>
    
    <div 
        class="nav-item" 
        :class="{ active: activeTab === 'records' }"
        @click="$emit('change-tab', 'records')"
    >
        <mdicon name="file-document-multiple" :size="24"/>
        <span class="nav-label">Records</span>
    </div>
    
    <div 
        class="nav-item" 
        :class="{ active: activeTab === 'health' }"
        @click="$emit('change-tab', 'health')"
    >
        <mdicon name="heart-pulse" :size="24"/>
        <span class="nav-label">My Health</span>
    </div>
    
    <div 
        class="nav-item" 
        :class="{ active: activeTab === 'profile' }"
        @click="$emit('change-tab', 'profile')"
    >
        <mdicon name="account-circle" :size="24"/>
        <span class="nav-label">Profile</span>
    </div>
</div>
</template>

<script>
export default {
    name: "MedicalRecordsBottomNav",
    props: {
        activeTab: {
            type: String,
            default: 'home'
        }
    },
    emits: ['change-tab']
}
</script>

<style scoped>
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--glass-ghost-bg);
    backdrop-filter: blur(12px);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 10px 8px 14px;
    box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.35);
    z-index: 1000;
    border-top: 1px solid var(--glass-card-border);
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--text-secondary);
    flex: 1;
    max-width: 100px;
    border-radius: 12px;
    border: 1px solid transparent;
}

.nav-item:active {
    transform: scale(0.96);
}

.nav-item.active {
    color: var(--text-primary);
    background: linear-gradient(135deg, var(--accent-2), var(--accent-4));
    border-color: rgba(255,255,255,0.18);
    box-shadow: 0 10px 30px rgba(168, 85, 247, 0.35);
}

.nav-item :deep(svg) {
    color: inherit;
}

.nav-label {
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: 0.2px;
}

.nav-item.active .nav-label {
    font-weight: 700;
}

/* Add animation for icon */
.nav-item.active :deep(svg) {
    animation: bounce 0.3s ease;
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-4px);
    }
}
</style>
