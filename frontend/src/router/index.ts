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
import AddFamilyMember from '@/views/mobile/MedicalRecords/AddFamilyMember.vue'
import PersonalInformation from '@/views/mobile/Profile/PersonalInformation.vue'
import MedicineReminder from '@/views/mobile/MedicalRecords/MedicineReminder.vue'
import AddMedicineReminder from '@/views/mobile/MedicalRecords/AddMedicineReminder.vue'
import MedicineReminderHistory from '@/views/mobile/MedicalRecords/MedicineReminderHistory.vue'
import RecordDetail from '@/views/mobile/MedicalRecords/RecordDetail.vue'
import CarMaintenance from '@/views/LandingPage/CarMaintenance.vue'
import ExpenseTracking from '@/views/LandingPage/ExpenseTracking.vue'


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
    path: '/car-maintenance',
    name: 'car-maintenance',
    component: CarMaintenance,
    meta: { requiresAuth: true }
  },
  {
    path: '/expense-tracking',
    name: 'expense-tracking',
    component: ExpenseTracking,
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
