<template>
<div class="login-container">
    <!-- Content -->
    <div class="login-content">
        <!-- Logo/Brand -->
        <div class="brand-section">
            <div class="brand-icon">
                <mdicon name="file-document-multiple" :size="48"/>
            </div>
            <h1 class="brand-title">MEC Logger</h1>
            <p class="brand-subtitle">Welcome back! Please login to continue</p>
        </div>

        <!-- Login Form -->
        <form class="login-form" @submit.prevent="handleLogin">
            <div class="form-group">
                <label class="form-label">Email</label>
                <div class="input-wrapper">
                    <mdicon name="email-outline" :size="20" class="input-icon"/>
                    <input 
                        type="email" 
                        class="form-input" 
                        placeholder="Enter your email" 
                        v-model="email"
                        autocomplete="email"
                    />
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Password</label>
                <div class="input-wrapper">
                    <mdicon name="lock-outline" :size="20" class="input-icon"/>
                    <input 
                        :type="showPassword ? 'text' : 'password'" 
                        class="form-input" 
                        placeholder="Enter your password" 
                        v-model="password"
                        autocomplete="current-password"
                        @keypress.enter="handleLogin"
                    />
                    <button class="toggle-password" @click="showPassword = !showPassword">
                        <mdicon :name="showPassword ? 'eye-off-outline' : 'eye-outline'" :size="20"/>
                    </button>
                </div>
            </div>

            <div v-if="hasError" class="error-message">
                <mdicon name="alert-circle" :size="16"/>
                <span>{{ errorMsg }}</span>
            </div>

            <button class="forgot-password" type="button" @click="router.push('/forgot-password')">
                Forgot Password?
            </button>

            <button class="login-btn" type="submit" :disabled="loadingModal">
                <span v-if="!loadingModal">Log In</span>
                <span v-else class="loading-spinner"></span>
            </button>
        </form>

        <!-- Sign Up Link -->
        <div class="signup-section">
            <span class="signup-text">Don't have an account?</span>
            <button class="signup-link" @click="router.push('/register')">
                Sign Up
            </button>
        </div>
    </div>

    <Loading v-if="loadingModal"/>
</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import login from '@/composables/auth/login'
import store from '@/store'
import getProfile from '@/composables/getProfile'
import Loading from '@/components/Loading.vue'
import { Role } from '@/constants/enums'

export default {
    name: "LoginMobile",
    components: {
        Loading,
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const email = ref('')
        const password = ref('')
        const showPassword = ref(false)
        const hasError = ref(false)
        const errorMsg = ref('')
        const loadingModal = ref(false)

        const handleLogin = async() => {
            hasError.value = false
            if (email.value === '' && password.value === '') {
                return
            }
            loadingModal.value = true
            const { response, error } = await login(email.value, password.value)
            loadingModal.value = false

            if (error.value === null) {
                if (response.value.status > 201) {
                    hasError.value = true
                    errorMsg.value = response.value.message
                } else {
                    store.methods.loginUser(response.value.token)
                    const profileData = await getProfile(response.value.token)
                    if (profileData.error.value === null) {
                        const profile = profileData.response.value.userInfo
                        store.methods.setUserAdmin(profile.role === Role.ADMIN)
                        store.methods.setUserProfile(profile)
                    }
                    const redirectTarget = route.query.redirect
                    if (typeof redirectTarget === 'string' && redirectTarget.length) {
                        router.replace(redirectTarget)
                    } else {
                        router.push('/')
                    }
                }

            }
        }


        return {
            router,
            route,
            email,
            password,
            showPassword,
            handleLogin,
            hasError,
            errorMsg,
            loadingModal
        }
    }
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
}

/* Content */
.login-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px 24px;
}

/* Brand Section */
.brand-section {
    text-align: center;
    margin-bottom: 40px;
}

.brand-icon {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: white;
}

.brand-title {
    font-size: 32px;
    font-weight: 700;
    color: white;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
}

.brand-subtitle {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
}

/* Login Form */
.login-form {
    background: white;
    border-radius: 24px;
    padding: 28px 24px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
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

.toggle-password {
    position: absolute;
    right: 16px;
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.toggle-password:active {
    transform: scale(0.9);
}

.error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    color: #dc2626;
    font-size: 14px;
    margin-bottom: 16px;
}

.forgot-password {
    background: none;
    border: none;
    color: #667eea;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-bottom: 24px;
    display: block;
    text-align: right;
    width: 100%;
}

.login-btn {
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
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.login-btn:active:not(:disabled) {
    transform: scale(0.98);
}

.login-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Sign Up Section */
.signup-section {
    text-align: center;
    margin-top: 24px;
}

.signup-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 15px;
}

.signup-link {
    background: none;
    border: none;
    color: white;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-left: 8px;
    text-decoration: underline;
}

.signup-link:active {
    opacity: 0.8;
}
</style>
