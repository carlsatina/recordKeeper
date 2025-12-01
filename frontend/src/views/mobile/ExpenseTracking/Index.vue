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

    <main class="content">
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

    <nav class="bottom-nav">
        <button class="nav-btn active">
            <mdicon name="home-outline" size="22" />
            <span>Home</span>
        </button>
        <button class="nav-btn">
            <mdicon name="chart-donut" size="22" />
            <span>Insights</span>
        </button>
        <button class="nav-btn">
            <mdicon name="calendar-refresh" size="22" />
            <span>Schedules</span>
        </button>
        <button class="nav-btn">
            <mdicon name="account-circle-outline" size="22" />
            <span>Profile</span>
        </button>
    </nav>
</div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
    name: "ExpenseTrackingMobile",
    setup() {
        const router = useRouter()
        return { router }
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
