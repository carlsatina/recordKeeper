<template>
    <CarMaintenanceVehiclesWeb v-if="!platformIsMobile"/>
    <CarMaintenanceVehiclesMobile v-else/>
</template>

<script>
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import store from '@/store'
import CarMaintenanceVehiclesWeb from '@/views/web/CarMaintenance/Vehicles.vue'
import CarMaintenanceVehiclesMobile from '@/views/mobile/CarMaintenance/Vehicles.vue'
import isPlatformMobile from '@/composables/platform'

export default {
    name: "CarMaintenanceVehicles",
    components: {
        CarMaintenanceVehiclesWeb,
        CarMaintenanceVehiclesMobile
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
