import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import initFacebookSdk from '@/_helpers/init-facebook-sdk'
import vue3GoogleLogin from 'vue3-google-login'
import { initTheme } from './composables/theme'

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import "css-ripple-effect/dist/ripple.min.css"
import "./assets/styles/glass.css"
import "./assets/styles/car/base.css"
import "./assets/styles/expense/base.css"
import "./assets/styles/medical/base.css"
import "./assets/styles/medical/forms.css"
import "./assets/styles/animations.css"

import mdiVue from 'mdi-vue/v3'
import * as mdijs from '@mdi/js'

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VUE_APP_GOOGLE_CLIENT_ID || ''

// Apply the saved or preferred theme before the app mounts to avoid flashes.
if (typeof window !== 'undefined') {
    initTheme()
}

initFacebookSdk().then(createApp)

createApp(App)
    .use(mdiVue, {icons: mdijs})
    .use(vue3GoogleLogin, {
        clientId: googleClientId
    })
    .use(router)
    .mount('#app')
