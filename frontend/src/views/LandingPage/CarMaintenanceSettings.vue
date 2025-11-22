<template>
    <CarMaintenanceSettingsWeb v-if="!platformIsMobile"/>
    <CarMaintenanceSettingsMobile v-else/>
</template>

<script>
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import store from '@/store'
import CarMaintenanceSettingsWeb from '@/views/web/CarMaintenance/Settings.vue'
import CarMaintenanceSettingsMobile from '@/views/mobile/CarMaintenance/Settings.vue'
import isPlatformMobile from '@/composables/platform'

export default {
    name: "CarMaintenanceSettings",
    components: {
        CarMaintenanceSettingsWeb,
        CarMaintenanceSettingsMobile
    },
    setup() {
        const router = useRouter()
        provide('store', store)
        const platformIsMobile = ref(false)

        isPlatformMobile().then((data) => {
            platformIsMobile.value = data
        })

        const token = localStorage.getItem('token')
        if (!token) {
            router.replace('/login')
        } else {
            store.methods.loginUser(token)
        }

        return {
            router,
            platformIsMobile
        }
    }
}
</script>

<style scoped>
</style>
