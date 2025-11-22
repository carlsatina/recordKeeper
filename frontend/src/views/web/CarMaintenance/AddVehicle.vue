<template>
<div class="car-maintenance-add-vehicle-web">
    <div class="header">
        <div class="d-flex align-items-center mb-3">
            <mdicon name="chevron-left" size="28" @click="router.push('/car-maintenance/vehicles')" style="cursor: pointer;"/>
            <h3 class="ms-3 mb-0">Add Vehicle</h3>
        </div>
    </div>

    <div class="content">
        <p class="text-center text-muted mt-5">Add vehicle (web) coming soon.</p>
    </div>
</div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
    name: 'CarMaintenanceAddVehicleWeb',
    setup() {
        const router = useRouter()
        return { router }
    }
}
</script>

<style scoped>
.car-maintenance-add-vehicle-web {
    padding: 24px;
}
</style>
