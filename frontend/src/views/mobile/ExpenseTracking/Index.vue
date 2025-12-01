<template>
<div class="page">
    <header class="top-nav">
        <button class="icon-btn" @click="router.push('/')">
            <mdicon name="chevron-left" size="24" />
        </button>
        <div class="title-group">
            <p class="eyebrow">My wallet</p>
            <h3>Expense Tracking</h3>
        </div>
        <button class="icon-btn ghost">
            <mdicon name="plus-circle-outline" size="24" />
        </button>
    </header>

    <main class="content" v-if="activeTab === 'home'">
        <section class="summary-grid">
            <div class="card primary">
                <p class="label">This month</p>
                <h2>$1,240</h2>
                <p class="sub">-12% vs last month</p>
            </div>
            <div class="card">
                <div class="row">
                    <div>
                        <p class="label">Budget</p>
                        <h4>$1,800</h4>
                    </div>
                    <span class="pill safe">On track</span>
                </div>
                <div class="progress">
                    <div class="bar" style="width: 62%;"></div>
                </div>
                <p class="sub">$560 remaining • resets Aug 30</p>
            </div>
            <div class="card">
                <div class="row">
                    <div>
                        <p class="label">Subscriptions</p>
                        <h4>$220</h4>
                    </div>
                    <button class="icon-btn ghost">
                        <mdicon name="calendar-check" size="20" />
                    </button>
                </div>
                <ul class="mini-list">
                    <li><span class="dot blue"></span>Spotify • $12</li>
                    <li><span class="dot amber"></span>iCloud • $10</li>
                    <li><span class="dot teal"></span>Netflix • $18</li>
                </ul>
            </div>
        </section>

        <section class="section">
            <div class="section-head">
                <h4>Recent activity</h4>
                <button class="text-btn">See all</button>
            </div>
            <div class="list">
                <div class="item">
                    <div class="icon-circle purple">
                        <mdicon name="food-fork-drink" size="20" />
                    </div>
                    <div class="item-main">
                        <p class="item-title">Dinner out</p>
                        <p class="item-sub">Dining • Aug 18</p>
                    </div>
                    <div class="item-amount">- $42</div>
                </div>
                <div class="item">
                    <div class="icon-circle teal">
                        <mdicon name="bus" size="20" />
                    </div>
                    <div class="item-main">
                        <p class="item-title">Commute pass</p>
                        <p class="item-sub">Transport • Aug 17</p>
                    </div>
                    <div class="item-amount">- $120</div>
                </div>
                <div class="item">
                    <div class="icon-circle orange">
                        <mdicon name="cart-outline" size="20" />
                    </div>
                    <div class="item-main">
                        <p class="item-title">Groceries</p>
                        <p class="item-sub">Household • Aug 16</p>
                    </div>
                    <div class="item-amount">- $86</div>
                </div>
            </div>
        </section>
    </main>

    <main class="content" v-else-if="activeTab === 'insights'">
        <section class="hero-insights">
            <div class="glow"></div>
            <div>
                <p class="eyebrow">Spending pulse</p>
                <h2>$1,240</h2>
                <p class="sub">Avg daily spend $62 • Down 12% vs last month</p>
            </div>
            <div class="sparkline">
                <span v-for="(height, i) in [30, 44, 22, 56, 62, 40, 48]" :key="i" :style="{ height: height + 'px' }"></span>
            </div>
        </section>

        <section class="section insights-grid">
            <div class="card">
                <div class="row">
                    <p class="label">Top categories</p>
                    <button class="chip">Aug</button>
                </div>
                <div class="category-row">
                    <div class="category">
                        <div class="circle purple"></div>
                        <div>
                            <p class="item-title">Dining</p>
                            <p class="item-sub">35% • $420</p>
                        </div>
                    </div>
                    <div class="pill ghost">-8% vs last month</div>
                </div>
                <div class="category-row">
                    <div class="category">
                        <div class="circle teal"></div>
                        <div>
                            <p class="item-title">Transport</p>
                            <p class="item-sub">22% • $260</p>
                        </div>
                    </div>
                    <div class="pill ghost">+4% vs last month</div>
                </div>
                <div class="category-row">
                    <div class="category">
                        <div class="circle amber"></div>
                        <div>
                            <p class="item-title">Groceries</p>
                            <p class="item-sub">18% • $210</p>
                        </div>
                    </div>
                    <div class="pill ghost">-2% vs last month</div>
                </div>
            </div>

            <div class="card">
                <div class="row">
                    <p class="label">Weekly rhythm</p>
                    <button class="text-btn">See trend</button>
                </div>
                <div class="bars">
                    <div class="bar-col" v-for="(h, i) in [34, 62, 40, 76, 52, 44, 28]" :key="i">
                        <div class="bar-pill" :style="{ height: h + 'px' }"></div>
                        <span class="bar-label">{{ barLabels[i] }}</span>
                    </div>
                </div>
                <p class="sub">Thu is your spend spike. Shift groceries to Tue/Wed to smooth cash flow.</p>
            </div>

            <div class="card gradient-card">
                <div class="row">
                    <div>
                        <p class="label">Smart tip</p>
                        <h4>Lock subscriptions</h4>
                        <p class="sub">Set alerts when subs exceed $250/mo and review quarterly.</p>
                    </div>
                    <mdicon name="lightbulb-on-outline" size="26" />
                </div>
                <button class="primary-btn">Create alert</button>
            </div>
        </section>
    </main>

    <main class="content" v-else-if="activeTab === 'schedules'">
        <section class="hero-schedules">
            <div>
                <p class="eyebrow">Upcoming</p>
                <h2>$312</h2>
                <p class="sub">Due this week across 4 bills</p>
            </div>
            <button class="primary-chip">
                <mdicon name="plus-circle-outline" size="18" />
                <span>New schedule</span>
            </button>
        </section>

        <section class="section schedule-toggle">
            <button class="toggle-pill active">Subscriptions</button>
            <button class="toggle-pill">Expenses</button>
        </section>

        <section class="section schedule-list">
            <div class="schedule-card">
                <div class="row">
                    <div class="badge pink">Today</div>
                    <span class="pill ghost">Auto-pay</span>
                </div>
                <div class="schedule-main">
                    <div class="icon-circle pink">
                        <mdicon name="netflix" size="20" />
                    </div>
                    <div>
                        <p class="item-title">Netflix Premium</p>
                        <p class="item-sub">Renews Aug 21 • Monthly</p>
                    </div>
                    <div class="item-amount">- $18</div>
                </div>
            </div>

            <div class="schedule-card">
                <div class="row">
                    <div class="badge blue">Tomorrow</div>
                    <span class="pill ghost">Reminder</span>
                </div>
                <div class="schedule-main">
                    <div class="icon-circle blue">
                        <mdicon name="cloud-outline" size="20" />
                    </div>
                    <div>
                        <p class="item-title">iCloud 2TB</p>
                        <p class="item-sub">Renews Aug 22 • Monthly</p>
                    </div>
                    <div class="item-amount">- $10</div>
                </div>
            </div>

            <div class="schedule-card">
                <div class="row">
                    <div class="badge purple">Fri</div>
                    <span class="pill ghost">Manual</span>
                </div>
                <div class="schedule-main">
                    <div class="icon-circle purple">
                        <mdicon name="lightning-bolt-outline" size="20" />
                    </div>
                    <div>
                        <p class="item-title">Electricity</p>
                        <p class="item-sub">Due Aug 23 • Bi-monthly</p>
                    </div>
                    <div class="item-amount">- $140</div>
                </div>
            </div>

            <div class="schedule-card">
                <div class="row">
                    <div class="badge teal">Sat</div>
                    <span class="pill ghost">Auto-pay</span>
                </div>
                <div class="schedule-main">
                    <div class="icon-circle teal">
                        <mdicon name="cellphone-nfc" size="20" />
                    </div>
                    <div>
                        <p class="item-title">Phone plan</p>
                        <p class="item-sub">Due Aug 24 • Monthly</p>
                    </div>
                    <div class="item-amount">- $44</div>
                </div>
            </div>
        </section>
    </main>

    <main class="content" v-else-if="activeTab === 'profile'">
        <section class="profile-hero">
            <div class="avatar">
                <span>AR</span>
            </div>
            <div class="profile-meta">
                <h3>Alex Rivera</h3>
                <p class="sub">Premium • Since 2023</p>
            </div>
            <button class="icon-btn ghost">
                <mdicon name="pencil-outline" size="20" />
            </button>
        </section>

        <section class="section profile-cards">
            <div class="card profile-card">
                <div class="row">
                    <div>
                        <p class="label">Expense categories</p>
                        <h4>12 categories</h4>
                        <p class="sub">Dining, Transport, Groceries, Utilities...</p>
                    </div>
                    <button class="primary-chip ghost-chip" @click="openAddCategory">
                        <mdicon name="plus-circle-outline" size="18" />
                        <span>Add</span>
                    </button>
                </div>
                <div class="chips">
                    <span class="pill ghost">Dining</span>
                    <span class="pill ghost">Transport</span>
                    <span class="pill ghost">Subscriptions</span>
                    <span class="pill ghost">Health</span>
                </div>
            </div>

            <div class="card profile-card">
                <div class="row">
                    <div>
                        <p class="label">Currency & accounts</p>
                        <h4>USD • 3 cards</h4>
                        <p class="sub">Default card: Sapphire Visa</p>
                    </div>
                    <button class="text-btn">Manage</button>
                </div>
            </div>

            <div class="card profile-card">
                <div class="row">
                    <div>
                        <p class="label">Alerts & reminders</p>
                        <h4>Smart alerts</h4>
                        <p class="sub">Threshold: $1,000/mo • Subscriptions: $250/mo</p>
                    </div>
                    <button class="text-btn">Edit</button>
                </div>
                <div class="toggles">
                    <div class="toggle-row">
                        <div>
                            <p class="item-title">Push notifications</p>
                            <p class="item-sub">Spikes, due bills, budgets</p>
                        </div>
                        <span class="switch on"></span>
                    </div>
                    <div class="toggle-row">
                        <div>
                            <p class="item-title">Email summaries</p>
                            <p class="item-sub">Weekly digest every Monday</p>
                        </div>
                        <span class="switch"></span>
                    </div>
                </div>
            </div>

            <div class="card profile-card danger">
                <div class="row">
                    <div>
                        <p class="label">Data & backup</p>
                        <h4>Export & restore</h4>
                        <p class="sub">Export CSV/JSON • Restore from backup</p>
                    </div>
                    <button class="text-btn danger-text">Export</button>
                </div>
            </div>
        </section>
    </main>

    <div v-if="showAddCategory" class="overlay">
        <div class="sheet">
            <div class="sheet-head">
                <div class="pill ghost">New category</div>
                <button class="icon-btn ghost" @click="closeAddCategory">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <h3 class="sheet-title">Create category</h3>
            <p class="sub">Give it a name, color, and icon so it’s easy to spot in insights.</p>
            <form class="form" @submit.prevent>
                <label class="field">
                    <span>Name</span>
                    <input type="text" placeholder="e.g. Dining" />
                </label>
                <label class="field inline">
                    <span>Color</span>
                    <div class="color-row">
                        <button
                            v-for="color in colorPalette"
                            :key="color"
                            class="color-chip"
                            :style="{ background: color }"
                            :class="{ active: selectedColor === color }"
                            type="button"
                            @click="selectColor(color)"
                        ></button>
                        <label class="color-chip picker">
                            <input type="color" v-model="selectedColor" />
                        </label>
                    </div>
                    <p class="micro">Selected: {{ selectedColor }}</p>
                </label>
                <label class="field">
                    <span>Icon</span>
                    <div class="icon-grid">
                        <button
                            v-for="icon in iconOptions"
                            :key="icon"
                            class="icon-bubble"
                            :class="{ active: selectedIcon === icon }"
                            type="button"
                            @click="selectIcon(icon)"
                        >
                            <mdicon :name="icon" size="20" />
                        </button>
                    </div>
                </label>
                <label class="checkbox">
                    <input type="checkbox" />
                    <span>Make this the default category</span>
                </label>
                <div class="actions">
                    <button type="button" class="text-btn" @click="closeAddCategory">Cancel</button>
                    <button type="button" class="primary-btn solid">Save category</button>
                </div>
            </form>
        </div>
    </div>

    <nav class="bottom-nav">
        <button class="nav-btn" :class="{ active: activeTab === 'home' }" @click="setTab('home')">
            <mdicon name="home-outline" size="22" />
            <span>Home</span>
        </button>
        <button class="nav-btn" :class="{ active: activeTab === 'insights' }" @click="setTab('insights')">
            <mdicon name="chart-donut" size="22" />
            <span>Insights</span>
        </button>
        <button class="nav-btn" :class="{ active: activeTab === 'schedules' }" @click="setTab('schedules')">
            <mdicon name="calendar-refresh" size="22" />
            <span>Schedules</span>
        </button>
        <button class="nav-btn" :class="{ active: activeTab === 'profile' }" @click="setTab('profile')">
            <mdicon name="account-circle-outline" size="22" />
            <span>Profile</span>
        </button>
    </nav>
</div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    name: "ExpenseTrackingMobile",
    setup() {
        const router = useRouter()
        const activeTab = ref('home')
        const setTab = (tab) => { activeTab.value = tab }
        const barLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        const showAddCategory = ref(false)
        const openAddCategory = () => { showAddCategory.value = true }
        const closeAddCategory = () => { showAddCategory.value = false }
        const colorPalette = ref([
            '#ef4444', '#f97316', '#f59e0b', '#84cc16',
            '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
            '#ec4899', '#f472b6', '#94a3b8', '#475569',
            '#000000', '#ffffff'
        ])
        const selectedColor = ref(colorPalette.value[9])
        const iconOptions = ref([
            'food-fork-drink',
            'silverware-fork-knife',
            'cupcake',
            'cart-outline',
            'basket-outline',
            'bag-personal-outline',
            'bus',
            'train',
            'car-wash',
            'gas-station',
            'home-outline',
            'lightbulb-on-outline',
            'water',
            'phone-outline',
            'wifi',
            'cellphone-nfc',
            'netflix',
            'spotify',
            'video-outline',
            'cash-multiple',
            'credit-card-outline',
            'bank',
            'piggy-bank',
            'wallet-outline',
            'dumbbell',
            'heart-pulse',
            'hospital-building',
            'medical-bag',
            'laptop',
            'headphones',
            'gamepad-variant-outline',
            'briefcase',
            'airplane',
            'pine-tree',
            'party-popper',
            'gift-outline',
            'tshirt-crew-outline'
        ])
        const selectedIcon = ref(iconOptions.value[0])
        const selectColor = (color) => { selectedColor.value = color }
        const selectIcon = (icon) => { selectedIcon.value = icon }

        return {
            router,
            activeTab,
            setTab,
            barLabels,
            showAddCategory,
            openAddCategory,
            closeAddCategory,
            colorPalette,
            selectedColor,
            selectColor,
            iconOptions,
            selectedIcon,
            selectIcon
        }
    }
}
</script>

<style scoped>
.page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #f7f9fb 0%, #eef2f7 100%);
    color: #0f172a;
}

.top-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px 10px;
    backdrop-filter: blur(8px);
}

.icon-btn {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    border: none;
    background: #e7ecf3;
    color: #0f172a;
}

.icon-btn.ghost {
    background: transparent;
}

.title-group h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
}

.title-group .eyebrow {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #64748b;
}

.content {
    flex: 1;
    padding: 6px 14px 80px;
}

.summary-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
}

.card {
    background: #fff;
    border-radius: 18px;
    padding: 14px;
    box-shadow: 0 6px 24px rgba(15, 23, 42, 0.06);
}

.card.primary {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
}

.card.primary .label,
.card.primary .sub {
    color: #e8e9ff;
}

.card .label {
    margin: 0 0 6px;
    font-size: 13px;
    color: #64748b;
}

.card h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
}

.card h4 {
    margin: 2px 0 0;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
}

.card .sub {
    margin: 4px 0 0;
    font-size: 13px;
    color: #475569;
}

.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.pill {
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
}

.pill.safe {
    background: #ecfdf3;
    color: #15803d;
}

.pill.ghost {
    background: #f1f5f9;
    color: #0f172a;
}

.progress {
    width: 100%;
    height: 8px;
    border-radius: 8px;
    background: #e2e8f0;
    margin: 10px 0 6px;
    overflow: hidden;
}

.progress .bar {
    height: 100%;
    border-radius: 8px;
    background: linear-gradient(90deg, #22c55e, #16a34a);
}

.mini-list {
    list-style: none;
    padding: 0;
    margin: 10px 0 0;
    display: grid;
    gap: 6px;
    color: #0f172a;
}

.mini-list .dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    display: inline-block;
    margin-right: 8px;
}

.dot.blue { background: #3b82f6; }
.dot.amber { background: #f59e0b; }
.dot.teal { background: #14b8a6; }

.section {
    margin-top: 16px;
}

.section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.section-head h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
}

.text-btn {
    background: none;
    border: none;
    color: #6366f1;
    font-weight: 700;
    font-size: 13px;
}

.list {
    display: grid;
    gap: 10px;
}

.item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 4px 18px rgba(15, 23, 42, 0.05);
}

.icon-circle {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: #fff;
}

.icon-circle.purple { background: #7c3aed; }
.icon-circle.teal { background: #14b8a6; }
.icon-circle.orange { background: #f97316; }

.item-title {
    margin: 0;
    font-weight: 700;
    color: #0f172a;
}

.item-sub {
    margin: 2px 0 0;
    font-size: 12px;
    color: #64748b;
}

.item-amount {
    font-weight: 800;
    color: #ef4444;
}

.hero-insights {
    position: relative;
    background: radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.22), transparent 50%),
        radial-gradient(circle at 80% 0%, rgba(236, 72, 153, 0.18), transparent 50%),
        #0f172a;
    color: #e2e8f0;
    border-radius: 18px;
    padding: 16px;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(15, 23, 42, 0.35);
}

.hero-insights .glow {
    position: absolute;
    inset: -20px;
    background: radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.08), transparent 50%);
    pointer-events: none;
}

.hero-insights h2 {
    margin: 6px 0 2px;
    font-size: 32px;
    font-weight: 800;
}

.sparkline {
    display: grid;
    grid-auto-flow: column;
    align-items: end;
    gap: 6px;
    margin-top: 10px;
}

.sparkline span {
    width: 6px;
    border-radius: 999px;
    background: linear-gradient(180deg, #38bdf8, #6366f1);
}

.insights-grid {
    display: grid;
    gap: 12px;
}

.category-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #e2e8f0;
}

.category-row:last-child {
    border-bottom: none;
}

.category {
    display: flex;
    gap: 10px;
    align-items: center;
}

.circle {
    width: 12px;
    height: 12px;
    border-radius: 999px;
}

.circle.purple { background: #7c3aed; }
.circle.teal { background: #14b8a6; }
.circle.amber { background: #f59e0b; }

.chip {
    border: 1px solid #e2e8f0;
    background: #fff;
    padding: 6px 10px;
    border-radius: 999px;
    font-weight: 700;
    color: #0f172a;
}

.bars {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    align-items: end;
    padding: 6px 0 0;
}

.bar-col {
    display: grid;
    gap: 6px;
    justify-items: center;
}

.bar-pill {
    width: 14px;
    border-radius: 12px;
    background: linear-gradient(180deg, #22c55e, #16a34a);
}

.bar-label {
    font-size: 10px;
    color: #94a3b8;
    letter-spacing: 0.2px;
}

.gradient-card {
    background: linear-gradient(135deg, #eef2ff, #e0f2fe);
}

.primary-btn {
    margin-top: 12px;
    width: 100%;
    border: none;
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #fff;
    padding: 12px;
    border-radius: 12px;
    font-weight: 800;
    box-shadow: 0 10px 30px rgba(79, 70, 229, 0.35);
}

.hero-schedules {
    background: #0f172a;
    color: #e2e8f0;
    border-radius: 18px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 12px 36px rgba(15, 23, 42, 0.3);
}

.hero-schedules h2 {
    margin: 6px 0 2px;
    font-size: 30px;
    font-weight: 800;
}

.primary-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: none;
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #fff;
    padding: 10px 14px;
    border-radius: 12px;
    font-weight: 700;
    box-shadow: 0 10px 24px rgba(99, 102, 241, 0.35);
}

.schedule-toggle {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.toggle-pill {
    border: 1px solid #e2e8f0;
    background: #fff;
    padding: 10px 12px;
    border-radius: 12px;
    font-weight: 700;
    color: #0f172a;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.toggle-pill.active {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
    border: none;
}

.schedule-list {
    display: grid;
    gap: 12px;
}

.schedule-card {
    background: #fff;
    border-radius: 16px;
    padding: 12px;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}

.schedule-main {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
    margin-top: 8px;
}

.badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 10px;
    font-weight: 800;
    color: #0f172a;
    background: #e2e8f0;
}

.badge.pink { background: #fce7f3; color: #be185d; }
.badge.blue { background: #e0f2fe; color: #0369a1; }
.badge.purple { background: #ede9fe; color: #5b21b6; }
.badge.teal { background: #ccfbf1; color: #0f766e; }

.profile-hero {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 12px;
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #fff;
    border-radius: 18px;
    box-shadow: 0 12px 32px rgba(79, 70, 229, 0.35);
}

.avatar {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.18);
    display: grid;
    place-items: center;
    font-weight: 800;
    letter-spacing: 0.5px;
}

.profile-meta h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
}

.profile-cards {
    display: grid;
    gap: 12px;
}

.profile-card {
    border: 1px solid #e2e8f0;
}

.profile-card.danger {
    background: linear-gradient(135deg, #fff1f2, #ffe4e6);
    border: none;
}

.chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}

.ghost-chip {
    background: #f8fafc;
    color: #0f172a;
    border: 1px solid #e2e8f0;
    box-shadow: none;
}

.toggles {
    display: grid;
    gap: 10px;
    margin-top: 12px;
}

.toggle-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
}

.switch {
    width: 42px;
    height: 24px;
    border-radius: 999px;
    background: #e2e8f0;
    position: relative;
}

.switch::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transition: transform 0.2s ease;
}

.switch.on {
    background: linear-gradient(135deg, #4f46e5, #22c55e);
}

.switch.on::after {
    transform: translateX(18px);
}

.text-btn.danger-text {
    color: #e11d48;
}

.overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(10px);
    display: grid;
    place-items: end center;
    padding: 0 12px 16px;
    z-index: 20;
}

.sheet {
    width: 100%;
    max-width: 480px;
    background: #fff;
    border-radius: 18px 18px 0 0;
    padding: 16px;
    box-shadow: 0 -10px 30px rgba(15, 23, 42, 0.25);
    animation: slideUp 0.2s ease;
}

.sheet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.sheet-title {
    margin: 6px 0 4px;
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
}

.form {
    display: grid;
    gap: 12px;
    margin-top: 10px;
}

.field {
    display: grid;
    gap: 6px;
    font-weight: 700;
    color: #0f172a;
}

.field span {
    font-size: 13px;
    color: #475569;
}

.field input {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    font-size: 15px;
    background: #f8fafc;
}

.inline {
    align-items: center;
}

.color-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.color-chip {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: 2px solid transparent;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
}

.color-chip.active {
    border-color: #0f172a;
    box-shadow: 0 6px 14px rgba(0,0,0,0.16);
}

.color-chip.picker {
    padding: 0;
    display: grid;
    place-items: center;
    background: #f8fafc;
}

.color-chip.picker input {
    width: 100%;
    height: 100%;
    border: none;
    padding: 0;
    background: transparent;
}

.icon-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 8px;
}

.icon-bubble {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    display: grid;
    place-items: center;
    background: #f8fafc;
}

.icon-bubble.active {
    background: #eef2ff;
    border-color: #6366f1;
    color: #4f46e5;
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
}

.micro {
    margin: 4px 0 0;
    font-size: 12px;
    color: #475569;
}

.checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #0f172a;
}

.checkbox input {
    width: 18px;
    height: 18px;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 6px;
}

.primary-btn.solid {
    width: auto;
    padding: 12px 16px;
    border-radius: 12px;
}

@keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    background: #fff;
    padding: 8px 10px 12px;
    border-top: 1px solid #e2e8f0;
    box-shadow: 0 -8px 20px rgba(15, 23, 42, 0.08);
}

.nav-btn {
    border: none;
    background: none;
    display: grid;
    justify-items: center;
    gap: 4px;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 700;
}

.nav-btn.active {
    color: #4f46e5;
}
</style>
