<template>
<teleport to="body">
    <transition name="fade">
        <div v-if="show" class="cdm-backdrop" @click.self="emitCancel">
            <div class="cdm-card" role="dialog" aria-modal="true">
                <div class="cdm-icon">
                    <mdicon name="trash-can-outline" :size="28" />
                </div>
                <h3 class="cdm-title">{{ title || 'Delete item?' }}</h3>
                <p class="cdm-message">{{ message || 'This action cannot be undone.' }}</p>
                <slot />
                <div class="cdm-actions">
                    <button class="cdm-btn ghost" type="button" :disabled="loading" @click="emitCancel">
                        {{ cancelLabel || 'Cancel' }}
                    </button>
                    <button class="cdm-btn danger" type="button" :disabled="loading" @click="emitConfirm">
                        <span v-if="loading">Deleting...</span>
                        <span v-else>{{ confirmLabel || 'Delete' }}</span>
                    </button>
                </div>
            </div>
        </div>
    </transition>
</teleport>
</template>

<script>
export default {
    name: 'ConfirmDeleteModal',
    props: {
        show: { type: Boolean, default: false },
        title: { type: String, default: '' },
        message: { type: String, default: '' },
        confirmLabel: { type: String, default: 'Delete' },
        cancelLabel: { type: String, default: 'Cancel' },
        loading: { type: Boolean, default: false }
    },
    emits: ['confirm', 'cancel', 'close'],
    setup(props, { emit }) {
        const emitCancel = () => emit('cancel')
        const emitConfirm = () => emit('confirm')
        return {
            emitCancel,
            emitConfirm
        }
    }
}
</script>

<style scoped>
.cdm-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1200;
    padding: 16px;
}

.cdm-card {
    background: var(--glass-card-bg, #0f172a);
    color: var(--text-primary, #e2e8f0);
    border: 1px solid var(--glass-card-border, rgba(255,255,255,0.08));
    box-shadow: var(--glass-card-shadow, 0 20px 40px rgba(0,0,0,0.35));
    border-radius: 18px;
    padding: 20px 18px 16px;
    width: 100%;
    max-width: 420px;
}

.cdm-icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    background: rgba(239, 68, 68, 0.12);
    color: #f87171;
    display: grid;
    place-items: center;
    margin-bottom: 12px;
}

.cdm-title {
    margin: 0 0 6px;
    font-size: 18px;
    font-weight: 700;
}

.cdm-message {
    margin: 0 0 14px;
    color: var(--text-muted, #94a3b8);
    font-size: 14px;
    line-height: 1.4;
}

.cdm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.cdm-btn {
    border: 1px solid transparent;
    border-radius: 999px;
    padding: 10px 14px;
    font-size: 14px;
    cursor: pointer;
    background: var(--glass-ghost-bg, rgba(255,255,255,0.04));
    color: var(--text-primary, #e2e8f0);
}

.cdm-btn.ghost {
    border-color: var(--glass-card-border, rgba(255,255,255,0.1));
}

.cdm-btn.danger {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.4);
    color: #f87171;
}

.cdm-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
