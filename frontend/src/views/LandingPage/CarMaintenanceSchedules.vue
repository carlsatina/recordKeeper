<template>
    <CarMaintenanceSchedulesWeb v-if="!platformIsMobile"/>
    <CarMaintenanceSchedulesMobile v-else/>
</template>

<script>
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import store from '@/store'
import CarMaintenanceSchedulesWeb from '@/views/web/CarMaintenance/Schedules.vue'
import CarMaintenanceSchedulesMobile from '@/views/mobile/CarMaintenance/Schedules.vue'
import isPlatformMobile from '@/composables/platform'

export default {
    name: "CarMaintenanceSchedules",
    components: {
        CarMaintenanceSchedulesWeb,
        CarMaintenanceSchedulesMobile
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
