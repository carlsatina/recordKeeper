<template>
    <CarMaintenanceAddMaintenanceWeb v-if="!platformIsMobile"/>
    <CarMaintenanceAddMaintenanceMobile v-else/>
</template>

<script>
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import store from '@/store'
import CarMaintenanceAddMaintenanceWeb from '@/views/web/CarMaintenance/AddMaintenance.vue'
import CarMaintenanceAddMaintenanceMobile from '@/views/mobile/CarMaintenance/AddMaintenance.vue'
import isPlatformMobile from '@/composables/platform'

export default {
    name: "CarMaintenanceAddMaintenance",
    components: {
        CarMaintenanceAddMaintenanceWeb,
        CarMaintenanceAddMaintenanceMobile
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
