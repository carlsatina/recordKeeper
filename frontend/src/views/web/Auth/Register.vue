<template>
<div class="register-page">
    <div class="register-grid">
        <div class="brand-panel">
            <div class="brand-icon">
                <mdicon name="file-document-multiple" :size="72"/>
            </div>
            <h1 class="brand-title">MEC Logger</h1>
            <p class="brand-subtitle">Organize and safeguard your records effortlessly</p>
        </div>

        <form class="register-panel" @submit.prevent="handleRegister">
            <div class="panel-header">
                <h2 class="panel-title">Create an account</h2>
                <p class="panel-subtitle">Join MEC Logger in a few quick steps</p>
            </div>

            <div class="form-group">
                <label class="form-label">Full Name</label>
                <div class="input-wrapper">
                    <mdicon name="account-outline" :size="20" class="input-icon"/>
                    <input
                        type="text"
                        class="form-input"
                        placeholder="Enter your full name"
                        v-model="userInfo.fullName"
                        required
                    />
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Contact Number</label>
                <div class="input-wrapper">
                    <mdicon name="phone-outline" :size="20" class="input-icon"/>
                    <input
                        type="tel"
                        class="form-input"
                        placeholder="Enter your contact number"
                        v-model="userInfo.phone"
                        required
                    />
                </div>
                <p v-if="hasError && errorMsg.phone" class="field-error">{{ errorMsg.phone }}</p>
            </div>

            <div class="form-group">
                <label class="form-label">Email</label>
                <div class="input-wrapper">
                    <mdicon name="email-outline" :size="20" class="input-icon"/>
                    <input
                        type="email"
                        class="form-input"
                        :class="{ 'invalid-input': userInfo.email && !isValidEmailFormat }"
                        placeholder="Enter your email"
                        v-model="userInfo.email"
                        required
                    />
                </div>
                <p v-if="hasError && errorMsg.email" class="field-error">{{ errorMsg.email }}</p>
            </div>

            <div class="form-group">
                <label class="form-label">Password</label>
                <div class="input-wrapper">
                    <mdicon name="lock-outline" :size="20" class="input-icon"/>
                    <input
                        type="password"
                        class="form-input"
                        placeholder="Enter your password"
                        v-model="userInfo.password"
                        required
                    />
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Confirm Password</label>
                <div class="input-wrapper">
                    <mdicon name="lock-check-outline" :size="20" class="input-icon"/>
                    <input
                        type="password"
                        class="form-input"
                        placeholder="Re-enter your password"
                        v-model="userInfo.verifyPassword"
                        required
                    />
                </div>
                <p v-if="hasError && errorMsg.password" class="field-error">{{ errorMsg.password }}</p>
            </div>

            <div class="password-hints">
                <div class="password-hint" :class="{ accepted: hasMinimumChar }">
                    <mdicon name="check" size="14"/>
                    <span>8 to 20 characters long</span>
                </div>
                <div class="password-hint" :class="{ accepted: isStrongPassword }">
                    <mdicon name="check" size="14"/>
                    <span>Use upper & lowercase letters, numbers, and symbols</span>
                </div>
            </div>

            <button type="submit" class="register-btn">
                Create Account
            </button>

            <div class="login-redirect">
                <span>Already have an account?</span>
                <button class="login-link" type="button" @click="router.push('/login')">
                    Log In
                </button>
            </div>
        </form>
    </div>
</div>
</template>
    
 <script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import register from '@/composables/auth/register'
import store from '@/store'

export default {
    name: "RegisterWeb",
    setup() {
        const router = useRouter()
        const validated = ref(null)
        const userInfo = ref({
            fullName: '',
            phone: '',
            email: '',
            password: '',
            verifyPassword: ''
        })
        const errorMsg = ref({email: '', password: '', phone: ''})
        const hasError = ref(false)

        const handleRegister = async() => {
            hasError.value = false
            errorMsg.value.email = ''
            errorMsg.value.password = ''
            errorMsg.value.phone = ''

            if (!validated.value) {
                hasError.value = true
                errorMsg.value.email = "Invalid Email Format!"
                return
            }

            if (!userInfo.value.phone) {
                hasError.value = true
                errorMsg.value.phone = "Contact number is required."
                return
            }

            const payload = {
                fullName: userInfo.value.fullName.trim(),
                phone: userInfo.value.phone.trim(),
                email: userInfo.value.email.trim(),
                password: userInfo.value.password,
                verifyPassword: userInfo.value.verifyPassword
            }

            const { response, error } = await register(payload)
            if (error.value === null) {
                if (response.value.status > 201) {
                    hasError.value = true
                    errorMsg.value.password = response.value.message
                } else {
                    router.push('/login')
                }
            }
        }
        
        const isStrongPassword = computed(() => {
            return store.methods.isStrongPassword(userInfo.value.password)
        })

        const hasMinimumChar = computed(() => {
            return store.methods.hasMinimumChar(userInfo.value.password)
        })
        const isValidEmailFormat = computed(() => {
            hasError.value = false
            validated.value = store.methods.isValidEmailFormat(userInfo.value.email)
            return validated.value
        })
        return {
            router,
            userInfo,
            handleRegister,
            isStrongPassword,
            hasMinimumChar,
            isValidEmailFormat,
            errorMsg,
            hasError
        }
    }
}
</script>
    
<style scoped>
.register-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
}

.register-grid {
    width: 100%;
    max-width: 1100px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 32px;
    padding: 32px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 32px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(12px);
}

.brand-panel {
    color: white;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: left;
}

.brand-icon {
    width: 96px;
    height: 96px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
}

.brand-title {
    font-size: 42px;
    font-weight: 700;
    margin: 0 0 12px 0;
    letter-spacing: -0.5px;
}

.brand-subtitle {
    font-size: 17px;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
}

.register-panel {
    background: white;
    border-radius: 28px;
    padding: 36px;
    box-shadow: 0 15px 35px rgba(15, 23, 42, 0.15);
    display: flex;
    flex-direction: column;
}

.panel-header {
    margin-bottom: 32px;
}

.panel-title {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: #111827;
}

.panel-subtitle {
    margin: 8px 0 0 0;
    color: #6b7280;
    font-size: 16px;
}

.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 16px;
    color: #9ca3af;
    pointer-events: none;
}

.form-input {
    width: 100%;
    padding: 14px 16px 14px 48px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 15px;
    color: #1a1a1a;
    transition: all 0.2s ease;
    background: #f9fafb;
}

.form-input:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
    color: #9ca3af;
}

.invalid-input {
    border-color: #f87171;
}

.field-error {
    margin-top: 6px;
    font-size: 13px;
    color: #dc2626;
}

.password-hints {
    background: #f9fafb;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
}

.password-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-size: 13px;
}

.password-hint + .password-hint {
    margin-top: 8px;
}

.password-hint svg {
    color: #d1d5db;
}

.password-hint.accepted {
    color: #166534;
}

.password-hint.accepted svg {
    color: #16a34a;
}

.register-btn {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.register-btn:active {
    transform: scale(0.98);
}

.login-redirect {
    text-align: center;
    margin-top: 24px;
    color: #6b7280;
}

.login-link {
    background: none;
    border: none;
    color: #667eea;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-left: 8px;
    text-decoration: underline;
}

@media (max-width: 768px) {
    .register-page {
        padding: 24px 16px;
    }

    .register-panel {
        padding: 28px 24px;
    }

    .brand-panel {
        text-align: center;
        align-items: center;
    }
}
</style>
