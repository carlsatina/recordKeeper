import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/LandingPage/Home.vue'

// Auth 
import Login from '@/views/LandingPage/Login.vue'
import Register from '@/views/LandingPage/Register.vue'

// Features
import MedicalRecords from '@/views/LandingPage/MedicalRecords.vue'
import AddRecord from '@/views/LandingPage/MedicalRecords/AddRecord.vue'
import BloodPressure from '@/views/mobile/MedicalRecords/BloodPressure.vue'
import BloodPressureEntry from '@/views/mobile/MedicalRecords/BloodPressureEntry.vue'
import BloodSugar from '@/views/mobile/MedicalRecords/BloodSugar.vue'
import BloodSugarEntry from '@/views/mobile/MedicalRecords/BloodSugarEntry.vue'
import BodyWeight from '@/views/mobile/MedicalRecords/BodyWeight.vue'
import BodyWeightEntry from '@/views/mobile/MedicalRecords/BodyWeightEntry.vue'
import AddBloodPressureRecord from '@/views/mobile/MedicalRecords/AddBloodPressureRecord.vue'
import AddBloodSugarRecord from '@/views/mobile/MedicalRecords/AddBloodSugarRecord.vue'
import AddBodyWeightRecord from '@/views/mobile/MedicalRecords/AddBodyWeightRecord.vue'
import Illness from '@/views/mobile/MedicalRecords/Illness.vue'
import AddIllnessRecord from '@/views/mobile/MedicalRecords/AddIllnessRecord.vue'
import AddFamilyMember from '@/views/mobile/MedicalRecords/AddFamilyMember.vue'
import PersonalInformation from '@/views/mobile/Profile/PersonalInformation.vue'
import MedicineReminder from '@/views/mobile/MedicalRecords/MedicineReminder.vue'
import AddMedicineReminder from '@/views/mobile/MedicalRecords/AddMedicineReminder.vue'
import MedicineReminderHistory from '@/views/mobile/MedicalRecords/MedicineReminderHistory.vue'
import RecordDetail from '@/views/mobile/MedicalRecords/RecordDetail.vue'
import WebRecordDetail from '@/views/web/MedicalRecords/RecordDetail.vue'
import WebMedicineReminderCalendar from '@/views/web/MedicalRecords/MedicineReminderCalendar.vue'
import BloodPressureWeb from '@/views/web/MedicalRecords/BloodPressureDetail.vue'
import BloodSugarWeb from '@/views/web/MedicalRecords/BloodSugarDetail.vue'
import BodyWeightWeb from '@/views/web/MedicalRecords/BodyWeightDetail.vue'
import IllnessWeb from '@/views/web/MedicalRecords/IllnessDetail.vue'
import IllnessFormWeb from '@/views/web/MedicalRecords/IllnessForm.vue'
// Mobile Car Maintenance
import CarMaintenance from '@/views/LandingPage/CarMaintenance.vue'
import CarMaintenanceSchedules from '@/views/mobile/CarMaintenance/Schedules.vue'
import CarMaintenanceVehicles from '@/views/mobile/CarMaintenance/Vehicles.vue'
import CarMaintenanceSettings from '@/views/mobile/CarMaintenance/Settings.vue'
import CarMaintenanceAddVehicle from '@/views/mobile/CarMaintenance/AddVehicle.vue'
import CarMaintenanceAddMaintenance from '@/views/mobile/CarMaintenance/AddMaintenance.vue'
import CarMaintenanceReport from '@/views/mobile/CarMaintenance/Report.vue'
import CarMaintenanceMaintenanceDetail from '@/views/mobile/CarMaintenance/MaintenanceDetail.vue'
import CarMaintenanceAddSchedule from '@/views/mobile/CarMaintenance/AddSchedule.vue'
// Web Car Maintenance
import CarMaintenanceWeb from '@/views/web/CarMaintenance/Index.vue'
import CarMaintenanceSchedulesWeb from '@/views/web/CarMaintenance/Schedules.vue'
import CarMaintenanceVehiclesWeb from '@/views/web/CarMaintenance/Vehicles.vue'
import CarMaintenanceSettingsWeb from '@/views/web/CarMaintenance/Settings.vue'
import CarMaintenanceAddVehicleWeb from '@/views/web/CarMaintenance/AddVehicle.vue'
import CarMaintenanceAddMaintenanceWeb from '@/views/web/CarMaintenance/AddMaintenance.vue'
import CarMaintenanceReportWeb from '@/views/web/CarMaintenance/Report.vue'
import CarMaintenanceMaintenanceDetailWeb from '@/views/web/CarMaintenance/MaintenanceDetail.vue'
import CarMaintenanceAddScheduleWeb from '@/views/web/CarMaintenance/AddSchedule.vue'
import CarMaintenanceVehicleDetailWeb from '@/views/web/CarMaintenance/VehicleDetail.vue'
import CarMaintenanceVehicleDetail from '@/views/mobile/CarMaintenance/VehicleDetail.vue'
import ExpenseTracking from '@/views/LandingPage/ExpenseTracking.vue'
import ExpenseAccountsMobile from '@/views/mobile/ExpenseTracking/ManageAccounts.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/profile/add',
    name: 'add-family-member',
    component: AddFamilyMember,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/profile/personal-information',
    name: 'personal-information',
    component: PersonalInformation,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/medical-records',
    name: 'medical-records',
    component: MedicalRecords,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/add-record',
    name: 'add-record',
    component: AddRecord,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/records/:id',
    name: 'medical-record-detail',
    component: RecordDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/web/records/:id',
    name: 'medical-record-detail-web',
    component: WebRecordDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/web/blood-pressure',
    name: 'blood-pressure-web',
    component: BloodPressureWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/web/blood-sugar',
    name: 'blood-sugar-web',
    component: BloodSugarWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/web/body-weight',
    name: 'body-weight-web',
    component: BodyWeightWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/web/illness',
    name: 'illness-web',
    component: IllnessWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/web/illness/add',
    name: 'illness-web-add',
    component: IllnessFormWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/web/illness/:id',
    name: 'illness-web-entry',
    component: IllnessFormWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/blood-pressure',
    name: 'blood-pressure',
    component: BloodPressure,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/blood-pressure/:id',
    name: 'blood-pressure-entry',
    component: BloodPressureEntry,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/blood-pressure/add',
    name: 'blood-pressure-add',
    component: AddBloodPressureRecord,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/medicine-reminders',
    name: 'medicine-reminders',
    component: MedicineReminder,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/web/medicine-reminders/week',
    name: 'medicine-reminders-web-week',
    component: WebMedicineReminderCalendar,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/medicine-reminders/add',
    name: 'medicine-reminders-add',
    component: AddMedicineReminder,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/medicine-reminders/:id/edit',
    name: 'medicine-reminders-edit',
    component: AddMedicineReminder,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/medicine-reminders/history',
    name: 'medicine-reminders-history',
    component: MedicineReminderHistory,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/blood-sugar',
    name: 'blood-sugar',
    component: BloodSugar,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/blood-sugar/:id',
    name: 'blood-sugar-entry',
    component: BloodSugarEntry,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/blood-sugar/add',
    name: 'blood-sugar-add',
    component: AddBloodSugarRecord,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/body-weight',
    name: 'body-weight',
    component: BodyWeight,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/body-weight/:id',
    name: 'body-weight-entry',
    component: BodyWeightEntry,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/body-weight/add',
    name: 'body-weight-add',
    component: AddBodyWeightRecord,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/illness/add',
    name: 'illness-add',
    component: AddIllnessRecord,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/illness',
    name: 'illness',
    component: Illness,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/illness/:id',
    name: 'illness-entry',
    component: AddIllnessRecord,
    meta: { requiresAuth: true }
  },
  {
    path: '/car-maintenance',
    name: 'car-maintenance',
    component: CarMaintenance,
    meta: { requiresAuth: true }
  },
  {
    path: '/car-maintenance/schedules',
    name: 'car-maintenance-schedules',
    component: CarMaintenanceSchedules,
    meta: { requiresAuth: true }
  },
  {
    path: '/car-maintenance/schedules/add',
    name: 'car-maintenance-schedules-add',
    component: CarMaintenanceAddSchedule,
    meta: { requiresAuth: true }
  },
  {
    path: '/car-maintenance/vehicles',
    name: 'car-maintenance-vehicles',
    component: CarMaintenanceVehicles,
    meta: { requiresAuth: true }
  },
  {
    path: '/car-maintenance/vehicles/:id',
    name: 'car-maintenance-vehicles-detail',
    component: CarMaintenanceVehicleDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/car-maintenance/vehicles/add',
    name: 'car-maintenance-vehicles-add',
    component: CarMaintenanceAddVehicle,
    meta: { requiresAuth: true }
  },
  {
    path: '/car-maintenance/vehicles/:id/edit',
    name: 'car-maintenance-vehicles-edit',
    component: CarMaintenanceAddVehicle,
    meta: { requiresAuth: true }
  },
  {
    path: '/car-maintenance/maintenance/add',
    name: 'car-maintenance-add',
    component: CarMaintenanceAddMaintenance,
    meta: { requiresAuth: true }
  },
  {
    path: '/car-maintenance/maintenance/:id',
    name: 'car-maintenance-detail',
    component: CarMaintenanceMaintenanceDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/car-maintenance/report',
    name: 'car-maintenance-report',
    component: CarMaintenanceReport,
    meta: { requiresAuth: true }
  },
  {
    path: '/car-maintenance/settings',
    name: 'car-maintenance-settings',
    component: CarMaintenanceSettings,
    meta: { requiresAuth: true }
  },
  // Web car maintenance routes
  {
    path: '/web/car-maintenance',
    name: 'car-maintenance-web',
    component: CarMaintenanceWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/web/car-maintenance/schedules',
    name: 'car-maintenance-schedules-web',
    component: CarMaintenanceSchedulesWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/web/car-maintenance/schedules/add',
    name: 'car-maintenance-schedules-add-web',
    component: CarMaintenanceAddScheduleWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/web/car-maintenance/schedules/:id',
    name: 'car-maintenance-schedules-detail-web',
    component: () => import('@/views/web/CarMaintenance/ScheduleDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/web/car-maintenance/vehicles',
    name: 'car-maintenance-vehicles-web',
    component: CarMaintenanceVehiclesWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/web/car-maintenance/vehicles/:id',
    name: 'car-maintenance-vehicles-detail-web',
    component: CarMaintenanceVehicleDetailWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/web/car-maintenance/vehicles/add',
    name: 'car-maintenance-vehicles-add-web',
    component: CarMaintenanceAddVehicleWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/web/car-maintenance/vehicles/:id/edit',
    name: 'car-maintenance-vehicles-edit-web',
    component: CarMaintenanceAddVehicleWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/web/car-maintenance/maintenance/add',
    name: 'car-maintenance-add-web',
    component: CarMaintenanceAddMaintenanceWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/web/car-maintenance/maintenance/:id',
    name: 'car-maintenance-detail-web',
    component: CarMaintenanceMaintenanceDetailWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/web/car-maintenance/report',
    name: 'car-maintenance-report-web',
    component: CarMaintenanceReportWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/web/car-maintenance/settings',
    name: 'car-maintenance-settings-web',
    component: CarMaintenanceSettingsWeb,
    meta: { requiresAuth: true }
  },
  {
    path: '/expense-tracking',
    name: 'expense-tracking',
    component: ExpenseTracking,
    meta: { requiresAuth: true }
  },
  {
    path: '/expense-tracking/accounts',
    name: 'expense-accounts',
    component: ExpenseAccountsMobile,
    meta: { requiresAuth: true }
  },

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }
  next()
})

export default router
