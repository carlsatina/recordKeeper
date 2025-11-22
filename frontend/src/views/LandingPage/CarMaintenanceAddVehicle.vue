<template>
    <CarMaintenanceAddVehicleWeb v-if="!platformIsMobile"/>
    <CarMaintenanceAddVehicleMobile v-else/>
</template>

<script>
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import store from '@/store'
import CarMaintenanceAddVehicleWeb from '@/views/web/CarMaintenance/AddVehicle.vue'
import CarMaintenanceAddVehicleMobile from '@/views/mobile/CarMaintenance/AddVehicle.vue'
import isPlatformMobile from '@/composables/platform'

export default {
    name: "CarMaintenanceAddVehicle",
    components: {
        CarMaintenanceAddVehicleWeb,
        CarMaintenanceAddVehicleMobile
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
