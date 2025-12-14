<template>
<div class="page expense-theme stagger-page" :class="{ 'stagger-ready': pageReady }">
    <header class="top-nav">
        <button class="icon-btn" @click="router.push('/')">
            <mdicon name="home-outline" size="24" />
        </button>
        <div class="title-group">
            <p class="eyebrow">My wallet</p>
            <h3>Expense Tracking</h3>
        </div>
        <button class="quick-pill" @click="openExpenseSheet">
            <mdicon name="magic-staff" size="18" />
            <span>Quick add</span>
        </button>
    </header>

    <!-- HOME TAB -->
    <main class="content" v-if="activeTab === 'home'">
        <section class="summary-grid stagger-seq">
            <div class="card primary slide-up">
                <p class="label">This month</p>
                <h2>{{ formatMoney(defaultCurrency, currentMonthTotal) }}</h2>
                <p class="sub">{{ monthChangeLabel }}</p>
            </div>
            <div class="card budget-card slide-up">
                <div class="budget-head">
                    <div class="label-row">
                        <p class="label">Budgets</p>
                        <button class="inline-pill" @click="openBudgetSheet">
                            <mdicon name="plus-circle" size="18" />
                            <span>New budget</span>
                        </button>
                    </div>
                    <h4 class="budget-amount">{{ activeBudgetAmount }}</h4>
                    <p class="sub">{{ budgets.length }} active budgets</p>
                </div>

                <div v-if="budgets.length" class="budget-carousel-wrapper">
                    <div
                        class="budget-carousel"
                        ref="budgetCarousel"
                        @scroll.passive="onBudgetScroll"
                    >
                        <div
                            class="budget-slide"
                            v-for="(item, idx) in budgets"
                            :key="item.id || idx"
                        >
                            <div class="row">
                                <div>
                                    <p class="item-title">{{ item.name }}</p>
                                    <p class="item-sub">
                                        {{ item.currency || defaultCurrency }} {{ item.amount }} •
                                        {{ formatDate(item.startDate) }} - {{ formatDate(item.endDate) }}
                                    </p>
                                </div>
                                <span class="pill ghost">{{ item.categoryId ? 'Category' : 'General' }}</span>
                            </div>
                            <div class="progress big">
                                <div class="bar gradient" :style="{ width: budgetProgress(item) }"></div>
                            </div>
                            <div class="row">
                                <p class="sub">Spent: {{ formatMoney(item.currency, item.spent) }}</p>
                                <p class="sub">Left: {{ formatMoney(item.currency, Math.max(0, item.amount - item.spent)) }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="budget-controls" v-if="budgets.length > 1">
                        <div class="dots">
                            <span
                                v-for="(item, idx) in budgets"
                                :key="item.id || idx"
                                :class="{ active: budgetActiveIndex === idx }"
                                class="dot"
                            ></span>
                        </div>
                        <div class="arrows">
                            <button class="icon-btn ghost" @click="scrollBudget(-1)">
                                <mdicon name="chevron-left" size="20" />
                            </button>
                            <button class="icon-btn ghost" @click="scrollBudget(1)">
                                <mdicon name="chevron-right" size="20" />
                            </button>
                        </div>
                    </div>
                </div>
                <p v-else class="sub">No budgets yet. Create one to stay on track.</p>
            </div>
            <div class="card slide-up" @click="setTab('schedules')">
                <div class="row">
                    <div class="d-flex flex-row justify-content-between">
                        <p class="label">Subscriptions</p>
                        <h4>{{ formatMoney(defaultCurrency, subscriptionTotal) }}</h4>
                        <!-- <span class="sub">{{ schedules.length }} active</span> -->
                    </div>
                </div>
                <ul class="mini-list" v-if="schedules.length">
                    <li v-for="(item, idx) in schedules.slice(0,3)" :key="item.id" class="mini-pill">
                        <span class="dot" :class="subscriptionDot(idx)"></span>
                        <span class="mini-title">{{ item.title }} - </span>
                        <span class="mini-amount">{{ item.amount }}</span>
                    </li>
                </ul>
                <p v-else class="sub">No subscriptions yet.</p>
            </div>
        </section>

        <section class="section">
            <div class="section-head">
                <h4>Recent activity</h4>
                <button class="text-btn" @click="setTab('home'); loadExpenses()">Refresh</button>
            </div>
            <div class="list" v-if="expenses.length">
                <div class="item" v-for="exp in expenses.slice(0,5)" :key="exp.id">
                    <div class="icon-circle"
                        :style="{
                            background: exp.categoryColor || 'var(--text-primary)',
                            color: exp.categoryColor ? '#fff' : '#0f172a'
                        }"
                    >
                        <mdicon :name="exp.categoryIcon || 'cash-multiple'" size="20" />
                    </div>
                    <div class="item-main">
                        <p class="item-title">{{ exp.title }}</p>
                        <p class="item-sub">
                            {{ formatDate(exp.expenseDate) }}
                        </p>
                    </div>
                    <div class="item-amount"> {{ formatMoney(defaultCurrency,exp.amount) }}</div>
                </div>
            </div>
            <p v-else class="sub">No expenses yet.</p>

            <div class="insights-cta">
                <div>
                    <p class="label">Insights</p>
                    <h4>See trends & tips</h4>
                    <p class="sub">Spending pulse, categories, and smart alerts.</p>
                </div>
                <button class="inline-pill" @click="setTab('insights')">
                    <mdicon name="chart-line" size="18" />
                    <span>View insights</span>
                </button>
            </div>
        </section>
    </main>


    <!-- SCHEDULES TAB -->
    <main class="content" v-else-if="activeTab === 'schedules'">
        <section class="hero-schedules slide-up">
            <div>
                <p class="eyebrow">Upcoming</p>
                <h2>{{ formatMoney(defaultCurrency, scheduleTotal) }}</h2>
                <p class="sub">Across {{ filteredSchedules.length }} items</p>
            </div>
            <button class="primary-chip" @click="openScheduleSheet">
                <mdicon name="plus-circle-outline" size="18" />
                <span>New schedule</span>
            </button>
        </section>

        <section class="section schedule-toggle slide-up">
            <button
                class="toggle-pill"
                :class="{ active: scheduleFilter === 'subscriptions' }"
                @click="scheduleFilter = 'subscriptions'"
            >
                Subscriptions
            </button>
            <button
                class="toggle-pill"
                :class="{ active: scheduleFilter === 'expenses' }"
                @click="scheduleFilter = 'expenses'"
            >
                Expenses
            </button>
        </section>

        <section class="section schedule-list stagger-seq">
            <div class="schedule-card slide-up" v-for="item in filteredSchedules" :key="item.id">
                <div class="row schedule-row">
                    <div class="badge" :class="item.badgeClass">{{ item.when }}</div>
                    <div class="schedule-right">
                        <div class="schedule-actions">
                            <button class="icon-btn ghost small" @click="startEditSchedule(item)">
                                <mdicon name="pencil-outline" size="18" />
                            </button>
                            <button class="icon-btn ghost small danger" @click="removeSchedule(item)">
                                <mdicon name="trash-can-outline" size="18" />
                            </button>
                            <button
                                v-if="scheduleFilter === 'subscriptions'"
                                class="pill tiny-pill pay-pill"
                                :class="{ success: item.paid }"
                                @click="startPaySubscription(item)"
                            >
                                <mdicon :name="item.paid ? 'check-circle' : 'cash-check'" size="16" />
                                <span>{{ item.paid ? 'Paid' : 'Pay' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="schedule-main">
                    <div
                        class="icon-circle"
                        :style="{
                            background: item.iconBg || 'var(--text-primary)',
                            color: item.iconColor || '#0f172a'
                        }"
                    >
                        <mdicon :name="item.icon" size="20" />
                    </div>
                    <div>
                        <p class="item-title">{{ item.title }}</p>
                        <p class="item-sub">{{ item.subtitle }}</p>
                    </div>
                    <div class="item-amount">- {{ item.amount }}</div>
                </div>
            </div>
        </section>
    </main>

    <!-- TRANSACTIONS TAB -->
    <main class="content" v-else-if="activeTab === 'transactions'">
        <section class="transactions-header slide-up">
            <transition name="month-slide-nav" mode="out-in">
                <div class="months" :key="viewMonthKey" @touchstart="onMonthTouchStart" @touchend="onMonthTouchEnd">
                    <span class="month muted" @click="changeMonth(-1)">{{ monthLabel(-1) }}</span>
                    <span class="month current">{{ monthLabel(0) }}</span>
                    <span class="month muted" @click="changeMonth(1)">{{ monthLabel(1) }}</span>
                </div>
            </transition>
            <div class="filter-row pill-row slide-up">
                <button
                    type="button"
                    class="pill-option compact"
                    :class="{ active: !budgetFilterId }"
                    @click="budgetFilterId = ''"
                >
                    <mdicon name="filter-outline" size="16" />
                    <span>All budgets</span>
                </button>
                <button
                    v-for="b in budgets"
                    :key="b.id"
                    type="button"
                    class="pill-option compact"
                    :class="{ active: budgetFilterId === b.id }"
                    @click="budgetFilterId = b.id"
                >
                    <mdicon name="wallet-outline" size="16" />
                    <span>{{ b.name }}</span>
                </button>
            </div>
        </section>
        <transition name="month-slide" mode="out-in">
            <div class="transactions-pane slide-up" :key="viewMonthKey">
                <div v-if="budgetSummaryPill" class="budget-pill slide-up" @click="setTab('home')">
                    <div>
                        <p class="micro muted">Budget status</p>
                        <p class="item-title">
                            {{ budgetSummaryPill.label }}
                        </p>
                    </div>
                    <div class="budget-pill-progress">
                        <div class="bar" :style="{ width: budgetSummaryPill.percent }"></div>
                    </div>
                </div>

                <section class="transactions-list section stagger-seq" v-if="transactionsForMonth.length > 0">
                    <transition-group name="list-fade" tag="div">
                        <div class="item compact-item mt-1 swipeable slide-up" v-for="exp in transactionsForMonth" :key="exp.id">
                            <div class="icon-circle"
                                :style="{
                                    background: exp.categoryColor || 'var(--text-primary)',
                                    color: exp.categoryColor ? '#fff' : '#0f172a'
                                }"
                            >
                                <mdicon :name="exp.categoryIcon || 'cash-multiple'" size="20" />
                            </div>
                            <div class="item-main">
                                <p class="item-title">{{ exp.title }}</p>
                                <p class="item-sub light">
                                    {{ formatDate(exp.expenseDate) }}
                                    <span v-if="exp.planned" class="pill tiny-pill ghost planned-pill muted">Upcoming</span>
                                    <span class="inline-actions">
                                        <button
                                            v-if="exp.planned"
                                            class="pill tiny-pill success"
                                            @click="handlePayPlanned(exp)"
                                        >
                                            <mdicon name="cash-check" size="16" />
                                            <span>Pay</span>
                                        </button>
                                        <button
                                            v-if="!exp.planned"
                                            class="pill tiny-pill"
                                            @click="startEditExpense(exp)"
                                        >
                                            <mdicon name="pencil-outline" size="16" />
                                        </button>
                                        <button
                                            v-if="!exp.planned"
                                            class="pill tiny-pill danger"
                                            @click="startDeleteExpense(exp)"
                                        >
                                            <mdicon name="trash-can-outline" size="16" />
                                        </button>
                                    </span>
                                </p>
                            </div>
                            <div class="item-amount" :class="{ planned: exp.planned }">
                                <span>- {{ formatMoney(exp.currency || defaultCurrency, exp.amount) }}</span>
                            </div>
                        </div>
                    </transition-group>
                    <div class="transaction-footer">
                        <p class="sub">Total cash flow: {{ defaultCurrency }} {{ transactionNet }}</p>
                        <p class="sub">{{ transactionsForMonth.length }} items</p>
                    </div>
                </section>
                <div v-else class="empty-state slide-up">
                    <div class="icon-circle purple">
                        <mdicon name="file-document-outline" size="20" />
                    </div>
                    <p class="item-title">No transactions yet</p>
                    <p class="sub">Log an expense to see it here.</p>
                </div>
           </div>
        </transition>
        <button class="fab" @click="openExpenseSheet">
            <mdicon name="plus" size="24" />
        </button>
    </main>

    <main class="content insights-page mt-3" v-else-if="activeTab === 'insights'">

        <section class="insights-grid stagger-seq">
            <div class="insight-card glow slide-up">
                <p class="label">Total spent</p>
                <h3>{{ formatMoney(defaultCurrency, insightsTotal) }}</h3>
                <p class="sub">{{ insightsCount }} transactions</p>
            </div>
            <div class="insight-card glow purple slide-up">
                <p class="label">Avg per day</p>
                <h3>{{ formatMoney(defaultCurrency, insightsAvgPerDay) }}</h3>
                <p class="sub">So far this month</p>
            </div>
        </section>

        <section class="section insight-block top-category-block slide-up" v-if="topCategory">
            <div class="section-head">
                <h4>Top category</h4>
                <span class="micro muted">Highest spend</span>
            </div>
            <div class="cat-row">
                <div class="icon-circle" :style="{ background: topCategory.color || 'var(--text-primary)', color: topCategory.color ? '#fff' : '#0f172a' }">
                    <mdicon :name="topCategory.icon || 'star'" size="20" />
                </div>
                <div class="cat-main">
                    <p class="item-title">{{ topCategory.name }}</p>
                    <p class="item-sub">{{ formatMoney(defaultCurrency, topCategory.total) }}</p>
                    <div class="progress slim">
                        <div class="bar" :style="{ width: topCategory.percentLabel, background: topCategory.color || '#4f46e5' }"></div>
                    </div>
                </div>
                <div class="cat-percent">{{ topCategory.percentLabel }}</div>
            </div>
        </section>

        <section class="section insight-block slide-up" v-if="categoryBreakdown.length">
            <div class="section-head">
                <h4>By category</h4>
                <span class="micro muted">{{ categoryBreakdown.length }} categories</span>
            </div>
            <transition-group name="list-fade" tag="div" class="category-list stagger-seq">
                <div class="cat-row slide-up" v-for="cat in categoryBreakdown" :key="cat.id || cat.name">
                    <div class="icon-circle" :style="{ background: cat.color || 'var(--text-primary)', color: cat.color ? '#fff' : '#0f172a' }">
                        <mdicon :name="cat.icon || 'label-outline'" size="18" />
                    </div>
                    <div class="cat-main">
                        <p class="item-title">{{ cat.name }}</p>
                        <p class="item-sub">{{ formatMoney(defaultCurrency, cat.total) }}</p>
                        <div class="progress slim">
                            <div class="bar" :style="{ width: cat.percentLabel, background: cat.color || '#4f46e5' }"></div>
                        </div>
                    </div>
                    <div class="cat-percent">{{ cat.percentLabel }}</div>
                </div>
            </transition-group>
        </section>

        <section class="section insight-block slide-up">
            <div class="section-head">
                <h4>Weekly spend</h4>
                <span class="micro muted">Last 7 days</span>
            </div>
            <div class="week-bars stagger-seq">
                <div
                    v-for="(day, idx) in weeklySeries"
                    :key="idx"
                    class="week-bar slide-up"
                >
                    <div class="bar-track">
                        <div class="bar-fill" :style="{ height: day.percent, background: '#4f46e5' }"></div>
                    </div>
                    <p class="micro muted">{{ day.label }}</p>
                    <p class="micro">{{ formatMoney(defaultCurrency, day.total) }}</p>
                </div>
            </div>
        </section>
    </main>

    <main class="content" v-else-if="activeTab === 'profile'">
        <section class="profile-hero slide-up">
            <div class="avatar pill pop-in">
                <span>{{ userInitials }}</span>
            </div>
            <div class="profile-meta">
                <p class="eyebrow muted">Profile</p>
                <h3 class="profile-name">{{ userName || 'User' }}</h3>
                <p class="sub">{{ userEmail || 'Welcome back' }}</p>
            </div>
            <button class="icon-btn ghost" aria-label="Edit profile">
                <mdicon name="pencil-outline" size="20" />
            </button>
        </section>

        <section class="section profile-cards stagger-seq">
            <div class="card profile-card slide-up">
                <div class="row">
                    <div>
                        <p class="label">Expense categories</p>
                        <h4>{{ categories.length }} categories</h4>
                        <p class="sub" v-if="categories.length">Tap to add or edit categories</p>
                        <p class="sub" v-else>No categories yet</p>
                    </div>
                    <button class="primary-chip ghost-chip" @click="openAddCategory">
                        <mdicon name="plus-circle-outline" size="18" />
                        <span>Add</span>
                    </button>
                </div>
                <div class="chips">
                    <span
                        v-for="cat in categories"
                        :key="cat.id || cat.name"
                        class="pill ghost chip-with-icon"
                        :style="{ borderColor: cat.color || 'var(--text-primary)' }"
                    >
                        <mdicon
                            :name="cat.icon || 'label-outline'"
                            size="16"
                            :style="{ color: cat.color || '#475569' }"
                        />
                        {{ cat.name }}
                    </span>
                </div>
            </div>

            <div class="card profile-card slide-up">
                <div class="row">
                    <div>
                        <p class="label">Currency & accounts</p>
                        <h4>{{ defaultCurrency }} • {{ accounts.length }} accounts</h4>
                        <p class="sub">
                            Default account: {{ defaultAccountName || 'None' }}
                        </p>
                    </div>
                    <button class="text-btn" @click="router.push('/expense-tracking/accounts')">Manage</button>
                </div>
                <div class="chips">
                    <span
                        v-for="cur in currencies"
                        :key="cur.id || cur.code"
                        class="pill ghost chip-with-icon"
                        :style="{ borderColor: cur.isDefault ? '#4f46e5' : 'var(--text-primary)', color: '#0f172a' }"
                    >
                        <mdicon :name="cur.isDefault ? 'star' : 'cash-multiple'" size="16" :style="{ color: cur.isDefault ? '#4f46e5' : '#475569' }" />
                        {{ cur.code }}
                    </span>
                    <span
                        v-for="acct in accounts"
                        :key="acct.id || acct.name"
                        class="pill ghost chip-with-icon"
                        :style="{ borderColor: acct.isDefault ? '#22c55e' : 'var(--text-primary)', color: '#0f172a' }"
                    >
                        <mdicon :name="acct.isDefault ? 'star' : 'credit-card-outline'" size="16" :style="{ color: acct.isDefault ? '#22c55e' : '#475569' }" />
                        {{ acct.name }}
                    </span>
                </div>
            </div>

            <div class="card profile-card slide-up">
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

            <div class="card profile-card slide-up">
                <div class="row">
                    <div>
                        <p class="label">Manage budgets</p>
                        <h4>Budgets</h4>
                        <p class="sub">{{ budgets.length ? `${budgets.length} active` : 'No budgets yet' }}</p>
                    </div>
                    <button class="inline-pill" @click="openBudgetSheet">
                        <mdicon name="plus-circle-outline" size="16" />
                        <span>New</span>
                    </button>
                </div>
                <div v-if="budgets.length" class="budget-manage-list">
                    <div class="manage-row" v-for="b in budgets" :key="b.id">
                        <div>
                            <p class="item-title">{{ b.name }}</p>
                            <p class="item-sub">{{ formatDate(b.startDate) }} - {{ formatDate(b.endDate) }}</p>
                            <p class="sub">{{ formatMoney(b.currency || defaultCurrency, b.spent || 0) }} / {{ formatMoney(b.currency || defaultCurrency, b.amount || 0) }}</p>
                        </div>
                        <div class="row manage-actions">
                            <button class="icon-btn ghost" @click="startEditBudget(b)">
                                <mdicon name="pencil-outline" size="18" />
                            </button>
                            <button class="icon-btn ghost danger" @click="handleDeleteBudget(b)">
                                <mdicon name="trash-can-outline" size="18" />
                            </button>
                        </div>
                    </div>
                </div>
                <p v-else class="sub">Create a budget to get started.</p>
            </div>

            <div class="card profile-card danger slide-up">
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

    <div v-if="showExpenseSheet" class="overlay">
        <div class="sheet" ref="expenseSheetRef">
            <div class="sheet-head">
                <div class="pill ghost">Add expense</div>
                <button class="icon-btn ghost" @click="closeExpenseSheet">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <h3 class="sheet-title">New expense</h3>
            <form class="form" @submit.prevent>
                <label class="field">
                    <span>Type</span>
                    <div class="pill-row">
                        <button
                            type="button"
                            class="pill-option"
                            :class="{ active: expenseForm.type === 'DEFAULT' }"
                            @click="selectExpenseType('DEFAULT')"
                        >
                            <mdicon name="checkbox-blank-circle-outline" size="18" />
                            <span>Default</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option"
                            :class="{ active: expenseForm.type === 'SUBSCRIPTION' }"
                            @click="selectExpenseType('SUBSCRIPTION')"
                        >
                            <mdicon name="reload" size="18" />
                            <span>Subscription</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option"
                            :class="{ active: expenseForm.type === 'UPCOMING' }"
                            @click="selectExpenseType('UPCOMING')"
                        >
                            <mdicon name="calendar-clock" size="18" />
                            <span>Upcoming</span>
                        </button>
                    </div>
                </label>
                <label class="field">
                    <span>Title</span>
                    <input type="text" v-model="expenseForm.title" placeholder="e.g. Groceries" />
                </label>
                <label class="field inline">
                    <span>Amount</span>
                    <input type="number" step="0.01" v-model.number="expenseForm.amount" placeholder="0.00" />
                </label>
                <label class="field inline">
                    <span>Currency</span>
                    <input type="text" v-model="expenseForm.currency" />
                </label>
                <label class="field">
                    <span>Budget (optional)</span>
                    <select v-model="expenseForm.budgetId">
                        <option value="">Auto-apply to matching budgets</option>
                        <option
                            v-for="b in activeBudgetsForExpense"
                            :key="b.id"
                            :value="b.id"
                        >
                            {{ b.name }} • {{ formatMoney(b.currency || defaultCurrency, b.amount) }}
                        </option>
                    </select>
                    <p class="micro">Showing active budgets that overlap the expense date.</p>
                </label>
                <label class="field">
                    <span>Category</span>
                    <div class="pill-row inline-cats" ref="expenseCategoryRow">
                        <button
                            v-for="cat in categories"
                            :key="cat.id"
                            type="button"
                            class="pill-option compact"
                            :class="{ active: expenseForm.categoryId === cat.id }"
                            @click="expenseForm.categoryId = cat.id"
                            :style="{ borderColor: cat.color || 'var(--text-primary)', color: '#0f172a' }"
                        >
                            <mdicon :name="cat.icon || 'label-outline'" size="18" :style="{ color: cat.color || '#4f46e5' }" />
                            <span>{{ cat.name }}</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option compact"
                            :class="{ active: !expenseForm.categoryId }"
                            @click="expenseForm.categoryId = ''"
                        >
                            <mdicon name="shape-outline" size="18" />
                            <span>Uncategorized</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option add-pill compact"
                            @click="goToAddCategory"
                        >
                            <mdicon name="plus" size="20" />
                        </button>
                    </div>
                </label>
                <label class="field inline">
                    <span>Date</span>
                    <input type="date" v-model="expenseForm.expenseDate" />
                </label>
                <p v-if="expenseError" class="error-text">{{ expenseError }}</p>
                <div ref="expenseActionsSentinel" class="actions-sentinel"></div>
                <div class="actions gated" :class="{ visible: expenseActionsVisible }">
                    <button type="button" class="text-btn" @click="closeExpenseSheet">Cancel</button>
                    <button type="button" class="primary-btn solid" :disabled="expenseSaving" @click="handleSaveExpense">
                        {{ expenseSaving ? 'Saving...' : 'Save expense' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
        <div v-if="showAddCategory" class="overlay">
            <div class="sheet" ref="categorySheetRef">
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
                    <input type="text" placeholder="e.g. Dining" v-model="categoryName" />
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
                    <input type="checkbox" v-model="makeDefault" />
                    <span>Make this the default category</span>
                </label>
                <p v-if="saveError" class="error-text">{{ saveError }}</p>
                <p v-if="saveMessage" class="success-text">{{ saveMessage }}</p>
                <div ref="categoryActionsSentinel" class="actions-sentinel"></div>
                <div class="actions gated" :class="{ visible: categoryActionsVisible }">
                    <button type="button" class="text-btn" @click="closeAddCategory">Cancel</button>
                    <button type="button" class="primary-btn solid" :disabled="saving" @click="handleSaveCategory">
                        {{ saving ? 'Saving...' : 'Save category' }}
                    </button>
                </div>
            </form>
        </div>

            </div>

    <div v-if="showQuickActions" class="overlay quick-overlay">
        <div class="sheet">
            <div class="sheet-head">
                <div class="pill ghost">Quick actions</div>
                <button class="icon-btn ghost" @click="closeQuickActions">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <div class="action-list">
                <button class="action-row" @click="openExpenseSheet">
                    <div class="icon-circle teal">
                        <mdicon name="cash-plus" size="20" />
                    </div>
                    <div>
                        <p class="item-title">Add expense</p>
                        <p class="item-sub">Log a one-time or recurring expense</p>
                    </div>
                </button>
            </div>
        </div>
    </div>
    <div v-if="showBudgetSheet" class="overlay">
        <div class="sheet">
            <div class="sheet-head">
                <div class="pill ghost">New budget</div>
                    <button class="icon-btn ghost" @click="closeBudgetSheet">
                        <mdicon name="close" size="22" />
                    </button>
                </div>
            <h3 class="sheet-title">{{ editingBudgetId ? 'Edit budget' : 'Create budget' }}</h3>
            <form class="form" @submit.prevent>
                <label class="field">
                    <span>Name</span>
                    <input type="text" placeholder="e.g. August Groceries" v-model="budgetForm.name" />
                </label>
                <label class="field inline">
                    <span>Amount</span>
                    <input type="number" step="0.01" v-model.number="budgetForm.amount" placeholder="0.00" />
                </label>
                <label class="field inline">
                    <span>Start date</span>
                    <input type="date" v-model="budgetForm.startDate" />
                </label>
                <label class="field inline">
                    <span>End date</span>
                    <input type="date" v-model="budgetForm.endDate" />
                </label>
                <label class="checkbox">
                    <input type="checkbox" v-model="budgetForm.alertEnabled" />
                    <span>Enable alerts</span>
                </label>
                <label class="field inline">
                    <span>Alert threshold</span>
                    <input type="number" step="0.01" v-model.number="budgetForm.alertThreshold" placeholder="e.g. 1500" />
                </label>
                <p v-if="budgetError" class="error-text">{{ budgetError }}</p>
                <div class="actions">
                    <button type="button" class="text-btn" @click="closeBudgetSheet">Cancel</button>
                    <button type="button" class="primary-btn solid" :disabled="budgetSaving" @click="handleSaveBudget">
                        {{ budgetSaving ? 'Saving...' : (editingBudgetId ? 'Update budget' : 'Save budget') }}
                    </button>
                </div>
            </form>
        </div>
    </div>

        <div v-if="showScheduleSheet" class="overlay">
            <div class="sheet">
            <div class="sheet-head">
                <div class="pill ghost">New schedule</div>
                <button class="icon-btn ghost" @click="closeScheduleSheet">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <h3 class="sheet-title">Add upcoming bill</h3>
            <p class="sub">Track subscriptions or planned expenses with reminders.</p>
            <form class="form" @submit.prevent>
                <label class="field">
                    <span>Name</span>
                    <input type="text" placeholder="e.g. Spotify Family" v-model="scheduleForm.title" />
                </label>
                <label class="field inline">
                    <span>Amount</span>
                    <input type="number" step="0.01" v-model.number="scheduleForm.amount" placeholder="0.00" />
                </label>
                <label class="field inline">
                    <span>Type</span>
                    <div class="pill-row">
                        <button
                            type="button"
                            class="pill-option"
                            :class="{ active: scheduleForm.type === 'subscription' }"
                            @click="scheduleForm.type = 'subscription'"
                        >
                            <mdicon name="reload" size="18" />
                            <span>Subscription</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option"
                            :class="{ active: scheduleForm.type === 'expense' }"
                            @click="scheduleForm.type = 'expense'"
                        >
                            <mdicon name="calendar-clock" size="18" />
                            <span>Expense</span>
                        </button>
                    </div>
                </label>
                <label class="field inline">
                    <span>Frequency</span>
                    <select v-model="scheduleForm.frequency">
                        <option value="MONTHLY">Monthly</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="YEARLY">Yearly</option>
                        <option value="ONE_TIME">One time</option>
                    </select>
                </label>
                <label class="field">
                    <span>Category</span>
                    <div class="pill-row inline-cats" ref="scheduleCategoryRow">
                        <button
                            v-for="cat in categories"
                            :key="cat.id"
                            type="button"
                            class="pill-option compact"
                            :class="{ active: scheduleForm.categoryId === cat.id }"
                            @click="scheduleForm.categoryId = cat.id"
                            :style="{ borderColor: cat.color || 'var(--text-primary)', color: '#0f172a' }"
                        >
                            <mdicon :name="cat.icon || 'label-outline'" size="18" :style="{ color: cat.color || '#4f46e5' }" />
                            <span>{{ cat.name }}</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option compact"
                            :class="{ active: !scheduleForm.categoryId }"
                            @click="scheduleForm.categoryId = ''"
                        >
                            <mdicon name="shape-outline" size="18" />
                            <span>Uncategorized</span>
                        </button>
                        <button
                            type="button"
                            class="pill-option add-pill compact"
                            @click="goToAddCategory"
                        >
                            <mdicon name="plus" size="18" />
                        </button>
                    </div>
                </label>
                <label class="field inline">
                    <span>Next charge date</span>
                    <input type="date" v-model="scheduleForm.nextDate" />
                </label>
                <label class="checkbox" v-if="scheduleForm.type === 'subscription'">
                    <input type="checkbox" v-model="scheduleForm.autoPay" />
                    <span>Auto-pay enabled</span>
                </label>
                <p v-if="scheduleError" class="error-text">{{ scheduleError }}</p>
                <div class="actions">
                    <button type="button" class="text-btn" @click="closeScheduleSheet">Cancel</button>
                    <button type="button" class="primary-btn solid" :disabled="scheduleSaving" @click="handleSaveSchedule">
                        {{ scheduleSaving ? 'Saving...' : 'Save schedule' }}
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div v-if="showPayConfirm" class="overlay">
        <div class="sheet confirm-sheet">
            <div class="sheet-head">
                <div class="pill ghost">Confirm payment</div>
                <button class="icon-btn ghost" @click="closePayConfirm">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <h3 class="sheet-title">Pay this subscription?</h3>
            <div class="confirm-card">
                <div class="icon-circle green">
                    <mdicon name="cash-check" size="20" />
                </div>
                <div>
                    <p class="item-title">{{ payTarget?.title || 'Subscription' }}</p>
                    <p class="item-sub">{{ payTarget?.when }}</p>
                </div>
                <div class="item-amount">- {{ formatMoney(defaultCurrency, payTarget?.rawAmount || payTarget?.amount || 0) }}</div>
            </div>
            <p class="sub">This will log the payment as an expense and schedule the next billing date.</p>
            <p v-if="payError" class="error-text">{{ payError }}</p>
            <div class="actions">
                <button type="button" class="text-btn" @click="closePayConfirm">Cancel</button>
                <button type="button" class="primary-btn solid" :disabled="paying" @click="paySubscription">
                    {{ paying ? 'Processing...' : 'Confirm & pay' }}
                </button>
            </div>
        </div>
    </div>

    <div v-if="showBudgetDeleteConfirm" class="overlay">
        <div class="sheet confirm-sheet">
            <div class="sheet-head">
                <div class="pill ghost">Confirm delete</div>
                <button class="icon-btn ghost" @click="closeBudgetDeleteConfirm">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <h3 class="sheet-title">Delete this budget?</h3>
            <div class="confirm-card">
                <div class="icon-circle red-bg">
                    <mdicon name="trash-can-outline" size="20" />
                </div>
                <div>
                    <p class="item-title">{{ deleteTarget?.name || 'Budget' }}</p>
                    <p class="item-sub">{{ deleteTarget ? formatDate(deleteTarget.startDate) + ' - ' + formatDate(deleteTarget.endDate) : '' }}</p>
                </div>
                <div class="item-amount">{{ formatMoney(deleteTarget?.currency || defaultCurrency, deleteTarget?.amount || 0) }}</div>
            </div>
            <p class="sub">This cannot be undone.</p>
            <p v-if="deleteError" class="error-text">{{ deleteError }}</p>
            <div class="actions">
                <button type="button" class="text-btn" @click="closeBudgetDeleteConfirm">Cancel</button>
                <button type="button" class="primary-btn solid danger" :disabled="deleting" @click="confirmDeleteBudget">
                    {{ deleting ? 'Deleting...' : 'Delete' }}
                </button>
            </div>
        </div>
    </div>

    <div v-if="showDeleteConfirm" class="overlay">
        <div class="sheet confirm-sheet">
            <div class="sheet-head">
                <div class="pill ghost">Confirm delete</div>
                <button class="icon-btn ghost" @click="closeDeleteConfirm">
                    <mdicon name="close" size="22" />
                </button>
            </div>
            <h3 class="sheet-title">Delete this expense?</h3>
            <div class="confirm-card">
                <div class="icon-circle red-bg">
                    <mdicon name="trash-can-outline" size="20" />
                </div>
                <div>
                    <p class="item-title">{{ deleteTarget?.title || 'Expense' }}</p>
                    <p class="item-sub">{{ deleteTarget ? formatDate(deleteTarget.expenseDate) : '' }}</p>
                </div>
                <div class="item-amount">- {{ formatMoney(deleteTarget?.currency || defaultCurrency, deleteTarget?.amount || 0) }}</div>
            </div>
            <p class="sub">This will remove the entry from your ledger and budgets.</p>
            <p v-if="deleteError" class="error-text">{{ deleteError }}</p>
            <div class="actions">
                <button type="button" class="text-btn" @click="closeDeleteConfirm">Cancel</button>
                <button type="button" class="primary-btn solid danger" :disabled="deleting" @click="confirmDeleteExpense">
                    {{ deleting ? 'Deleting...' : 'Delete' }}
                </button>
            </div>
        </div>
    </div>

    <nav class="bottom-nav">
        <button class="nav-btn" :class="{ active: activeTab === 'home' }" @click="setTab('home')">
            <mdicon name="view-dashboard-outline" size="22" />
            <span>Dashboard</span>
        </button>
        <button class="nav-btn" :class="{ active: activeTab === 'transactions' }" @click="setTab('transactions')">
            <mdicon name="swap-horizontal" size="22" />
            <span>Transactions</span>
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
import { ref, watch, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import store from '@/store'
import { useRouter, useRoute } from 'vue-router'
import { useExpenses } from '@/composables/expenses'
import { useAccounts } from '@/composables/accounts'
import { useCurrencies } from '@/composables/currencies'
import { useBudgets } from '@/composables/budgets'
import { useSubscriptions } from '@/composables/subscriptions'
import { useExpenseSchedules } from '@/composables/expenseSchedules'
import getProfile from '@/composables/getProfile'
import { Role } from '@/constants/enums'

export default {
    name: "ExpenseTrackingMobile",
    setup() {
        const router = useRouter()
        const route = useRoute()
        const { listExpenses, createExpense, deleteExpense, createCategory, listCategories, updateExpense } = useExpenses()
        const { listAccounts } = useAccounts()
        const { listCurrencies } = useCurrencies()
        const { listBudgetSummary, listBudgets, createBudget, updateBudget, deleteBudget } = useBudgets()
        const { listSubscriptions, createSubscription, updateSubscription, deleteSubscription, markSubscriptionPaid } = useSubscriptions()
        const {
            listExpenseSchedules,
            createExpenseSchedule,
            updateExpenseSchedule,
            deleteExpenseSchedule,
            markExpenseSchedulePaid
        } = useExpenseSchedules()
        const initialTab = route.query?.tab ? String(route.query.tab) : 'home'
        const activeTab = ref(['home', 'transactions', 'schedules', 'profile', 'insights'].includes(initialTab) ? initialTab : 'home')
        const setTab = (tab) => { activeTab.value = tab }
        const barLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        const showAddCategory = ref(false)
        const categorySheetRef = ref(null)
        const categoryActionsSentinel = ref(null)
        const categoryActionsVisible = ref(false)
        const pageReady = ref(false)
        const openAddCategory = () => { showAddCategory.value = true }
        const closeAddCategory = () => {
            showAddCategory.value = false
            resetCategoryForm()
        }

        const goToAddCategory = () => {
            showQuickActions.value = false
            showExpenseSheet.value = false
            showScheduleSheet.value = false
            showBudgetSheet.value = false
            showAddCategory.value = true
        }
        const categories = ref([])
        const categoriesLoaded = ref(false)
        const accounts = ref([])
        const accountsLoaded = ref(false)
        const currencies = ref([])
        const currenciesLoaded = ref(false)
        const defaultCurrency = ref('PHP')
        const defaultAccountName = ref('')
        const userEmail = ref('')
        const userInitials = computed(() => {
            if (userName.value) {
                return userName.value.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            }
            return 'U'
        })
        const logout = () => {
            store.methods.logoutUser()
            router.push('/login')
        }
        const budgets = ref([])
        const budgetsLoaded = ref(false)
        const showBudgetSheet = ref(false)
        const todayStr = () => new Date().toISOString().slice(0, 10)
        const expenses = ref([])
        const budgetForm = ref({
            name: '',
            amount: '',
            startDate: todayStr(),
            endDate: todayStr(),
            alertEnabled: true,
            alertThreshold: ''
        })
        const budgetError = ref('')
        const budgetSaving = ref(false)
        const showScheduleSheet = ref(false)
        const showPayConfirm = ref(false)
        const payTarget = ref(null)
        const payError = ref('')
        const paying = ref(false)
        const scheduleSaving = ref(false)
        const scheduleError = ref('')
        const showQuickActions = ref(false)
        const showExpenseSheet = ref(false)
        const expenseSheetRef = ref(null)
        const expenseActionsSentinel = ref(null)
        const expenseActionsVisible = ref(false)
        const expenseSaving = ref(false)
        const expenseError = ref('')
        const expenseForm = ref({
            title: '',
            amount: '',
            currency: 'PHP',
            categoryId: '',
            expenseDate: todayStr(),
            type: 'DEFAULT',
            budgetId: ''
        })
        const editingExpenseId = ref(null)
        const schedules = ref([])
        const scheduleForm = ref({
            title: '',
            amount: '',
            type: 'subscription',
            frequency: 'MONTHLY',
            nextDate: todayStr(),
            autoPay: true,
            categoryId: ''
        })
        const expenseSchedules = ref([])
        const scheduleFilter = ref('subscriptions')
        const editingBudgetId = ref(null)
        const filteredSchedules = computed(() => {
            return scheduleFilter.value === 'subscriptions' ? schedules.value : expenseSchedules.value
        })
        const scheduleTotal = computed(() => {
            return filteredSchedules.value.reduce((sum, s) => sum + Number(s.rawAmount || 0), 0)
        })
        const subscriptionTotal = computed(() => {
            return schedules.value.reduce((sum, s) => sum + Number(s.rawAmount || 0), 0)
        })

        const observerMap = new Map()
        const setupGatedActions = (openRef, sheetRef, sentinelRef, visibleRef) => {
            watch(openRef, async (open) => {
                const existing = observerMap.get(visibleRef)
                if (existing) {
                    existing.disconnect()
                    observerMap.delete(visibleRef)
                }
                visibleRef.value = false
                if (!open) return
                await nextTick()
                const root = sheetRef.value
                const target = sentinelRef.value
                if (!root || !target) return
                const observer = new IntersectionObserver(
                    (entries) => {
                        visibleRef.value = entries.some(entry => entry.isIntersecting)
                    },
                    { root, threshold: 1.0 }
                )
                observer.observe(target)
                observerMap.set(visibleRef, observer)
            })
        }

        setupGatedActions(showExpenseSheet, expenseSheetRef, expenseActionsSentinel, expenseActionsVisible)
        setupGatedActions(showAddCategory, categorySheetRef, categoryActionsSentinel, categoryActionsVisible)

        onBeforeUnmount(() => {
            observerMap.forEach((obs) => obs.disconnect())
            observerMap.clear()
        })
        const monthOffset = ref(0)
        const viewMonthStart = computed(() => {
            const base = new Date()
            return new Date(base.getFullYear(), base.getMonth() + monthOffset.value, 1)
        })
        const insightsMonthStart = computed(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
        const insightsMonthEnd = computed(() => new Date(insightsMonthStart.value.getFullYear(), insightsMonthStart.value.getMonth() + 1, 0))
        const insightsExpenses = computed(() => {
            return expenses.value.filter(exp => {
                if (!exp.expenseDate) return false
                const d = new Date(exp.expenseDate)
                return d >= insightsMonthStart.value && d <= insightsMonthEnd.value
            })
        })
        const insightsTotal = computed(() => insightsExpenses.value.reduce((sum, e) => sum + Number(e.amount || 0), 0))
        const insightsCount = computed(() => insightsExpenses.value.length)
        const insightsAvgPerDay = computed(() => {
            const todayDay = Math.min(new Date().getDate(), insightsMonthEnd.value.getDate())
            if (!todayDay) return 0
            return insightsTotal.value / todayDay
        })
        const weeklySeries = computed(() => {
            const today = new Date()
            const series = []
            for (let i = 6; i >= 0; i--) {
                const day = new Date(today)
                day.setDate(today.getDate() - i)
                const total = insightsExpenses.value
                    .filter(exp => {
                        const d = new Date(exp.expenseDate)
                        return d.toDateString() === day.toDateString()
                    })
                    .reduce((sum, e) => sum + Number(e.amount || 0), 0)
                series.push({ label: day.toLocaleDateString(undefined, { weekday: 'short' }), total })
            }
            const max = Math.max(...series.map(s => s.total), 1)
            return series.map(s => ({
                ...s,
                percent: `${Math.round((s.total / max) * 100)}%`
            }))
        })
        const categoryBreakdown = computed(() => {
            const total = insightsTotal.value || 1
            const map = new Map()
            insightsExpenses.value.forEach(exp => {
                const key = exp.categoryId || 'uncategorized'
                const existing = map.get(key) || { total: 0, name: 'Uncategorized', icon: 'shape-outline', color: 'var(--text-primary)', id: key }
                existing.total += Number(exp.amount || 0)
                const cat = categories.value.find(c => c.id === exp.categoryId)
                existing.name = cat?.name || existing.name
                existing.icon = cat?.icon || existing.icon
                existing.color = cat?.color || existing.color
                map.set(key, existing)
            })
            return Array.from(map.values())
                .map(c => ({ ...c, percent: (c.total / total) * 100, percentLabel: `${Math.round((c.total / total) * 100)}%` }))
                .sort((a, b) => b.total - a.total)
        })
        const topCategory = computed(() => categoryBreakdown.value[0] || null)
        const insightsRangeLabel = computed(() => {
            const start = insightsMonthStart.value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            const end = insightsMonthEnd.value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            return `${start} - ${end}`
        })
        const viewMonthKey = computed(() => `${viewMonthStart.value.getFullYear()}-${viewMonthStart.value.getMonth()}`)
        const monthLabel = (offset = 0) => {
            const d = new Date(viewMonthStart.value.getFullYear(), viewMonthStart.value.getMonth() + offset, 1)
            return d.toLocaleString('default', { month: 'long' })
        }
        const displayedExpenses = computed(() => {
            const target = viewMonthStart.value
            return expenses.value.filter(exp => {
                if (!exp.expenseDate) return false
                const d = new Date(exp.expenseDate)
                const inMonth = d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth()
                if (!inMonth) return false
                const b = selectedBudget.value
                if (b) {
                    const start = new Date(b.startDate)
                    const end = new Date(b.endDate)
                    if (d < start || d > end) return false
                    if (exp.budgetId && exp.budgetId !== b.id) return false
                    if (b.categoryId && exp.categoryId !== b.categoryId) return false
                }
                return true
            })
        })
        const plannedTransactions = computed(() => {
            const target = viewMonthStart.value
            const items = []
            const pushItem = (src, type) => {
                const when = src.rawNextDate || src.nextBillingDate || src.nextRunAt || src.startDate
                if (!when) return
                const d = new Date(when)
                if (d.getFullYear() !== target.getFullYear() || d.getMonth() !== target.getMonth()) return
                const b = selectedBudget.value
                if (b) {
                    const start = new Date(b.startDate)
                    const end = new Date(b.endDate)
                    if (d < start || d > end) return
                    if (b.categoryId && src.categoryId !== b.categoryId) return
                }
                const cat = categories.value.find(c => c.id === src.categoryId)
                items.push({
                    id: `${type}-${src.id}`,
                    title: src.title,
                    amount: src.rawAmount || src.amount,
                    currency: src.currency || defaultCurrency.value,
                    expenseDate: when,
                    planned: true,
                    type,
                    categoryIcon: src.categoryIcon || src.icon || cat?.icon || 'calendar-clock',
                    categoryColor: src.categoryColor || src.iconBg || cat?.color || 'var(--text-primary)',
                    categoryId: src.categoryId || ''
                })
            }
            schedules.value.forEach(sub => pushItem(sub, 'subscription'))
            expenseSchedules.value.forEach(exp => pushItem(exp, 'planned'))
            return items
        })
        const transactionsForMonth = computed(() => {
            const all = [
                ...displayedExpenses.value.map(exp => ({ ...exp, planned: false })),
                ...plannedTransactions.value
            ]
            return all.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate))
        })
        const currencySymbol = (cur) => {
            const map = { PHP: '₱', USD: '$', EUR: '€', GBP: '£', JPY: '¥' }
            return map[cur] || map[defaultCurrency.value] || ''
        }
        const formatMoney = (cur, amt) => {
            const value = Number(amt ?? 0)
            const fixed = Number.isFinite(value) ? value.toFixed(2) : '0.00'
            return `${currencySymbol(cur)} ${fixed}`
        }
        const transactionOut = computed(() => {
            return displayedExpenses.value.reduce((sum, e) => sum + Number(e.amount || 0), 0)
        })
        const transactionIn = computed(() => 0)
        const transactionNet = computed(() => transactionIn.value - transactionOut.value)
        const todayLabel = computed(() => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))
        const changeMonth = (step) => {
            monthOffset.value += step
        }
        const budgetProgress = (budget) => {
            const total = Number(budget?.amount || 0)
            const spent = Number(budget?.spent || 0)
            if (!total) return '0%'
            const pct = Math.min(Math.max((spent / total) * 100, 0), 100)
            return `${pct}%`
        }
        const budgetSummaryPill = computed(() => {
            if (selectedBudget.value) {
                const b = selectedBudget.value
                const remaining = Math.max(0, Number(b.amount || 0) - Number(b.spent || 0))
                return {
                    label: `${formatMoney(b.currency || defaultCurrency.value, remaining)} left · ${b.name}`,
                    percent: budgetProgress(b)
                }
            }
            if (!budgets.value.length) return null
            const now = viewMonthStart.value
            const active = budgets.value.find(b => {
                const start = new Date(b.startDate)
                const end = new Date(b.endDate)
                return start <= now && end >= now
            }) || budgets.value[0]
            const total = Number(active.amount || 0)
            const spent = Number(active.spent || 0)
            const remaining = Math.max(0, total - spent)
            const percent = `${Math.min(Math.max((spent / total) * 100, 0), 100)}%`
            return {
                label: `${formatMoney(active.currency || defaultCurrency.value, remaining)} left · ${active.name}`,
                percent
            }
        })
        const activeBudgetsForExpense = computed(() => {
            if (!budgets.value.length) return []
            const dateStr = expenseForm.value.expenseDate || todayStr()
            const dateObj = new Date(dateStr)
            const list = budgets.value.filter(b => {
                const start = new Date(b.startDate)
                const end = new Date(b.endDate)
                return start <= dateObj && end >= dateObj
            })
            return list
        })
        const startEditBudget = (budget) => {
            editingBudgetId.value = budget.id
            budgetForm.value = {
                name: budget.name || '',
                amount: budget.amount || '',
                currency: budget.currency || defaultCurrency.value || 'PHP',
                startDate: budget.startDate ? budget.startDate.slice(0, 10) : todayStr(),
                endDate: budget.endDate ? budget.endDate.slice(0, 10) : todayStr(),
                categoryId: '',
                alertEnabled: budget.alertEnabled ?? true,
                alertThreshold: budget.alertThreshold ?? ''
            }
            showBudgetSheet.value = true
        }

        const handleDeleteBudget = async(budget) => {
            const token = localStorage.getItem('token')
            if (!token || !budget?.id) return
            deleteTarget.value = budget
            deleteError.value = ''
            showBudgetDeleteConfirm.value = true
        }
        const touchStartX = ref(0)
        const onMonthTouchStart = (e) => {
            touchStartX.value = e.changedTouches?.[0]?.clientX || 0
        }
        const onMonthTouchEnd = (e) => {
            const endX = e.changedTouches?.[0]?.clientX || 0
            const diff = endX - touchStartX.value
            if (Math.abs(diff) > 30) {
                changeMonth(diff < 0 ? 1 : -1)
            }
        }
        const openQuickActions = () => {
            showQuickActions.value = true
        }
        const closeQuickActions = () => {
            showQuickActions.value = false
        }
        const resetExpenseForm = () => {
            expenseForm.value = {
                title: '',
                amount: '',
                currency: defaultCurrency.value || 'PHP',
                categoryId: '',
                expenseDate: todayStr(),
                type: 'DEFAULT'
            }
            expenseError.value = ''
            editingExpenseId.value = null
        }

        const openExpenseSheet = () => {
            if (!categoriesLoaded.value) loadCategories()
            if (!budgetsLoaded.value) loadBudgets()
            resetExpenseForm()
            showQuickActions.value = false
            showExpenseSheet.value = true
            // Precompute budgets for default date
            activeBudgetsForExpense.value
        }

        const closeExpenseSheet = () => {
            showExpenseSheet.value = false
        }

        const selectExpenseType = (type) => {
            expenseForm.value.type = type
            console.log('Selected expense type:', type)
            if (type === 'SUBSCRIPTION' || type === 'UPCOMING') {
                const scheduleType = type === 'SUBSCRIPTION' ? 'subscription' : 'expense'
                closeExpenseSheet()
                showQuickActions.value = false
                setTab('schedules')
                scheduleFilter.value = type === 'SUBSCRIPTION' ? 'subscriptions' : 'expenses'
                openScheduleSheet(scheduleType)
            }
        }

        const handleSaveExpense = async() => {
            expenseError.value = ''
            if (!expenseForm.value.title.trim() || !expenseForm.value.amount) {
                expenseError.value = 'Title and amount are required.'
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                expenseError.value = 'You are not logged in.'
                return
            }
            expenseSaving.value = true
            try {
                if (editingExpenseId.value) {
                    await updateExpense(token, editingExpenseId.value, {
                        title: expenseForm.value.title.trim(),
                        amount: Number(expenseForm.value.amount),
                        currency: expenseForm.value.currency || defaultCurrency.value || 'PHP',
                        categoryId: expenseForm.value.categoryId || null,
                        expenseDate: expenseForm.value.expenseDate || new Date().toISOString(),
                        paymentMethod: 'CASH',
                        isRecurring: expenseForm.value.type === 'SUBSCRIPTION',
                        frequency: expenseForm.value.type === 'SUBSCRIPTION' ? 'MONTHLY' : 'ONE_TIME',
                        budgetId: expenseForm.value.budgetId || null
                    })
                } else {
                    await createExpense(token, {
                        title: expenseForm.value.title.trim(),
                        amount: Number(expenseForm.value.amount),
                        currency: expenseForm.value.currency || defaultCurrency.value || 'PHP',
                        categoryId: expenseForm.value.categoryId || null,
                        expenseDate: expenseForm.value.expenseDate || new Date().toISOString(),
                        paymentMethod: 'CASH',
                        isRecurring: expenseForm.value.type === 'SUBSCRIPTION',
                        frequency: expenseForm.value.type === 'SUBSCRIPTION' ? 'MONTHLY' : 'ONE_TIME',
                        budgetId: expenseForm.value.budgetId || null
                    })
                }
                await loadExpenses()
                await loadBudgets()
                closeExpenseSheet()
            } catch (err) {
                expenseError.value = err?.message || 'Unable to save expense.'
            } finally {
                expenseSaving.value = false
            }
        }
        const editingSubscriptionId = ref(null)
        const budgetCarousel = ref(null)
        const budgetActiveIndex = ref(0)
        const activeBudgetAmount = computed(() => {
            if (!budgets.value.length) return `${currencySymbol(defaultCurrency.value)} 0`
            const active = budgets.value[budgetActiveIndex.value] || budgets.value[0]
            const currency = active?.currency || defaultCurrency.value || 'PHP'
            return `${currencySymbol(currency)} ${active?.amount ?? 0}`
        })
        const budgetFilterId = ref('')
        const selectedBudget = computed(() => budgets.value.find(b => b.id === budgetFilterId.value) || null)
        const showDeleteConfirm = ref(false)
        const deleteTarget = ref(null)
        const deleteError = ref('')
        const deleting = ref(false)
        const showBudgetDeleteConfirm = ref(false)
        const colorPalette = ref([
            '#ef4444', '#f97316', '#f59e0b', '#84cc16',
            '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
            '#ec4899', '#f472b6', 'var(--text-muted)', '#475569',
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
        const categoryName = ref('')
        const makeDefault = ref(false)
        const saving = ref(false)
        const saveError = ref('')
        const saveMessage = ref('')

        const resetCategoryForm = () => {
            categoryName.value = ''
            makeDefault.value = false
            saving.value = false
            saveError.value = ''
            saveMessage.value = ''
            selectedColor.value = colorPalette.value[9]
            selectedIcon.value = iconOptions.value[0]
        }

        const loadCategories = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const list = await listCategories(token)
                categories.value = Array.isArray(list) ? list : []
                categoriesLoaded.value = true
            } catch (err) {
                // keep silent to avoid blocking UI; could surface a message if needed
            }
        }

        const loadAccounts = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const list = await listAccounts(token)
                accounts.value = Array.isArray(list) ? list : []
                const def = accounts.value.find(a => a.isDefault)
                defaultAccountName.value = def?.name || accounts.value[0]?.name || ''
                accountsLoaded.value = true
            } catch (err) {
                console.error(err)
            }
        }

        const loadCurrencies = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const list = await listCurrencies(token)
                currencies.value = Array.isArray(list) ? list : []
                const def = currencies.value.find(c => c.isDefault)
                defaultCurrency.value = def?.code || defaultCurrency.value
                currenciesLoaded.value = true
            } catch (err) {
                console.error(err)
            }
        }

        const loadBudgets = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                let list = []
                try {
                    list = await listBudgetSummary(token)
                } catch {
                    list = await listBudgets(token)
                }
                budgets.value = Array.isArray(list)
                    ? list.map(b => ({
                        ...b,
                        spent: Number(b.spent || 0),
                        amount: Number(b.amount || 0),
                        currency: b.currency || defaultCurrency.value || 'PHP'
                    }))
                    : []
                budgetsLoaded.value = true
            } catch (err) {
                console.error(err)
            }
        }

        const decorateExpense = (exp) => {
            const cat = categories.value.find(c => c.id === exp.categoryId)
            return {
                ...exp,
                categoryIcon: cat?.icon || exp.categoryIcon || null,
                categoryColor: cat?.color || exp.categoryColor || null
            }
        }

        const loadExpenses = async() => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const list = await listExpenses(token)
                expenses.value = Array.isArray(list) ? list.map(decorateExpense) : []
            } catch (err) {
                console.error(err)
            }
        }

        const handleSaveCategory = async() => {
            saveError.value = ''
            saveMessage.value = ''
            if (!categoryName.value.trim()) {
                saveError.value = 'Category name is required.'
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                saveError.value = 'You are not logged in.'
                return
            }
            saving.value = true
            try {
                const category = await createCategory(token, {
                    name: categoryName.value.trim(),
                    color: selectedColor.value,
                    icon: selectedIcon.value,
                    isDefault: makeDefault.value
                })
                categories.value = [category, ...categories.value]
                saveMessage.value = 'Category saved.'
                setTimeout(() => {
                    closeAddCategory()
                }, 700)
            } catch (err) {
                saveError.value = err?.message || 'Unable to save category.'
            } finally {
                saving.value = false
            }
        }

        const totalBudget = computed(() => {
            return budgets.value.reduce((sum, b) => sum + Number(b.amount || 0), 0)
        })

        const currentMonthStart = computed(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
        const currentMonthEnd = computed(() => new Date(currentMonthStart.value.getFullYear(), currentMonthStart.value.getMonth() + 1, 0))
        const previousMonthStart = computed(() => new Date(currentMonthStart.value.getFullYear(), currentMonthStart.value.getMonth() - 1, 1))
        const previousMonthEnd = computed(() => new Date(currentMonthStart.value.getFullYear(), currentMonthStart.value.getMonth(), 0))
        const currentMonthTotal = computed(() => {
            return expenses.value.reduce((sum, exp) => {
                if (!exp.expenseDate) return sum
                const d = new Date(exp.expenseDate)
                if (d >= currentMonthStart.value && d <= currentMonthEnd.value) {
                    return sum + Number(exp.amount || 0)
                }
                return sum
            }, 0)
        })
        const prevMonthTotal = computed(() => {
            return expenses.value.reduce((sum, exp) => {
                if (!exp.expenseDate) return sum
                const d = new Date(exp.expenseDate)
                if (d >= previousMonthStart.value && d <= previousMonthEnd.value) {
                    return sum + Number(exp.amount || 0)
                }
                return sum
            }, 0)
        })
        const monthChangeLabel = computed(() => {
            const prev = prevMonthTotal.value
            if (!prev) return 'vs last month: —'
            const diff = ((currentMonthTotal.value - prev) / prev) * 100
            const sign = diff > 0 ? '+' : ''
            return `${sign}${diff.toFixed(1)}% vs last month`
        })

        const openBudgetSheet = () => {
            resetBudgetForm()
            showBudgetSheet.value = true
        }

        const closeBudgetSheet = () => {
            showBudgetSheet.value = false
        }

        const resetBudgetForm = () => {
            budgetForm.value = {
                name: '',
                amount: '',
                currency: defaultCurrency.value || 'PHP',
                startDate: todayStr(),
                endDate: todayStr(),
                categoryId: '',
                alertEnabled: true,
                alertThreshold: ''
            }
            budgetError.value = ''
            editingBudgetId.value = null
        }

        const handleSaveBudget = async() => {
            budgetError.value = ''
            if (!budgetForm.value.name.trim() || !budgetForm.value.amount) {
                budgetError.value = 'Name and amount are required.'
                return
            }
            if (!budgetForm.value.startDate || !budgetForm.value.endDate) {
                budgetError.value = 'Start and end dates are required.'
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                budgetError.value = 'You are not logged in.'
                return
            }
            budgetSaving.value = true
            try {
                const payload = {
                    name: budgetForm.value.name.trim(),
                    amount: Number(budgetForm.value.amount),
                    currency: defaultCurrency.value || 'PHP',
                    startDate: budgetForm.value.startDate,
                    endDate: budgetForm.value.endDate,
                    categoryId: null,
                    alertThreshold: budgetForm.value.alertThreshold ? Number(budgetForm.value.alertThreshold) : null,
                    alertEnabled: budgetForm.value.alertEnabled
                }
                if (editingBudgetId.value) {
                    const updated = await updateBudget(token, editingBudgetId.value, payload)
                    budgets.value = budgets.value.map(b => b.id === updated.id ? updated : b)
                } else {
                    const budget = await createBudget(token, payload)
                    budgets.value = [budget, ...budgets.value]
                }
                closeBudgetSheet()
            } catch (err) {
                budgetError.value = err?.message || 'Unable to save budget.'
            } finally {
                budgetSaving.value = false
            }
        }

        const openScheduleSheet = (typeOverride) => {
            if (!categoriesLoaded.value) loadCategories()
            resetScheduleForm(typeOverride)
            showScheduleSheet.value = true
            showQuickActions.value = false
        }

        const closeScheduleSheet = () => {
            showScheduleSheet.value = false
        }

        const resetScheduleForm = (typeOverride) => {
            scheduleForm.value = {
                title: '',
                amount: '',
                type: typeOverride || 'subscription',
                frequency: 'MONTHLY',
                nextDate: todayStr(),
                autoPay: true,
                categoryId: ''
            }
            scheduleError.value = ''
            editingSubscriptionId.value = null
        }

        const mapSubscriptionToCard = (sub) => {
            const next = sub.nextBillingDate || sub.nextBilling || sub.nextDate
            const autoPay = Boolean(sub.autoPay)
            const cat = categories.value.find(c => c.id === sub.categoryId)
            const iconBg = cat?.color || (autoPay ? '#d1fae5' : '#e0f2fe')
            const iconColor = cat?.color ? '#fff' : (autoPay ? '#15803d' : '#0f172a')
            return {
                id: sub.id,
                when: next ? formatDate(next) : 'Upcoming',
                tag: autoPay ? 'Auto-pay' : 'Reminder',
                icon: cat?.icon || 'calendar-refresh',
                iconBg,
                iconColor,
                badgeClass: autoPay ? 'green' : 'blue',
                title: sub.title,
                subtitle: `${sub.billingCycle || 'MONTHLY'} • ${(sub.currency || defaultCurrency.value)} ${sub.amount}`,
                amount: `${sub.currency || defaultCurrency.value} ${sub.amount}`,
                rawAmount: sub.amount,
                rawNextDate: sub.nextBillingDate || null,
                frequency: sub.billingCycle || 'MONTHLY',
                autoPay,
                categoryId: sub.categoryId || '',
                categoryIcon: cat?.icon,
                categoryColor: cat?.color,
                dotClass: null
            }
        }

        const loadSubscriptions = async() => {
            const token = localStorage.getItem('token')
            if (!token) return
            try {
                if (!categoriesLoaded.value) {
                    await loadCategories()
                }
                const list = await listSubscriptions(token)
                schedules.value = Array.isArray(list) ? list.map(mapSubscriptionToCard) : []
            } catch (err) {
                console.error(err)
            }
        }

        const mapExpenseScheduleToCard = (sch) => {
            const when = sch.nextRunAt || sch.startDate
            const cat = categories.value.find(c => c.id === sch.categoryId)
            const iconBg = cat?.color || '#e0f2fe'
            const iconColor = cat?.color ? '#fff' : '#0f172a'
            return {
                id: sch.id,
                when: when ? formatDate(when) : 'Planned',
                tag: 'Reminder',
                icon: cat?.icon || 'cash-multiple',
                badgeClass: 'blue',
                title: sch.title,
                subtitle: `${sch.frequency || 'ONE_TIME'} • ${(sch.currency || defaultCurrency.value)} ${sch.amount}`,
                amount: `${sch.currency || defaultCurrency.value} ${sch.amount}`,
                rawAmount: sch.amount,
                rawNextDate: sch.nextRunAt || sch.startDate,
                frequency: sch.frequency || 'ONE_TIME',
                autoPay: false,
                categoryId: sch.categoryId || '',
                categoryIcon: cat?.icon,
                categoryColor: cat?.color,
                iconBg,
                iconColor
            }
        }

        const loadExpenseSchedules = async() => {
            const token = localStorage.getItem('token')
            if (!token) return
            try {
                if (!categoriesLoaded.value) {
                    await loadCategories()
                }
                const list = await listExpenseSchedules(token)
                expenseSchedules.value = Array.isArray(list) ? list.map(mapExpenseScheduleToCard) : []
            } catch (err) {
                console.error(err)
            }
        }

        const handleSaveSchedule = async() => {
            scheduleError.value = ''
            if (!scheduleForm.value.title.trim() || !scheduleForm.value.amount || !scheduleForm.value.nextDate) {
                scheduleError.value = 'Title, amount, and next date are required.'
                return
            }
            const token = localStorage.getItem('token')
            if (!token) {
                scheduleError.value = 'You are not logged in.'
                return
            }
            scheduleSaving.value = true
            try {
                const isSubscription = scheduleForm.value.type === 'subscription'
                if (isSubscription) {
                    const payload = {
                        title: scheduleForm.value.title.trim(),
                        amount: Number(scheduleForm.value.amount),
                        currency: defaultCurrency.value || 'PHP',
                        billingCycle: scheduleForm.value.frequency,
                        nextBillingDate: scheduleForm.value.nextDate,
                        active: true,
                        autoPay: scheduleForm.value.autoPay,
                        categoryId: scheduleForm.value.categoryId || null,
                        notes: null
                    }
                    if (editingSubscriptionId.value) {
                        const subscription = await updateSubscription(token, editingSubscriptionId.value, payload)
                        schedules.value = schedules.value.map(s => s.id === subscription.id ? mapSubscriptionToCard(subscription) : s)
                    } else {
                        const subscription = await createSubscription(token, payload)
                        schedules.value = [mapSubscriptionToCard(subscription), ...schedules.value]
                    }
                } else {
                    const payload = {
                        title: scheduleForm.value.title.trim(),
                        amount: Number(scheduleForm.value.amount),
                        currency: defaultCurrency.value || 'PHP',
                        startDate: scheduleForm.value.nextDate,
                        frequency: scheduleForm.value.frequency || 'ONE_TIME',
                        nextRunAt: scheduleForm.value.nextDate,
                        active: true,
                        categoryId: scheduleForm.value.categoryId || null
                    }
                    if (editingSubscriptionId.value) {
                        const updated = await updateExpenseSchedule(token, editingSubscriptionId.value, payload)
                        expenseSchedules.value = expenseSchedules.value.map(e => e.id === updated.id ? mapExpenseScheduleToCard(updated) : e)
                    } else {
                        const schedule = await createExpenseSchedule(token, payload)
                        expenseSchedules.value = [mapExpenseScheduleToCard(schedule), ...expenseSchedules.value]
                    }
                }
                closeScheduleSheet()
            } catch (err) {
                scheduleError.value = err?.message || 'Unable to save schedule.'
            } finally {
                scheduleSaving.value = false
            }
        }

        const startEditSchedule = (item) => {
            editingSubscriptionId.value = item.id
            scheduleForm.value = {
                title: item.title,
                amount: item.rawAmount || item.amount,
                type: scheduleFilter.value === 'subscriptions' ? 'subscription' : 'expense',
                frequency: item.frequency || (scheduleFilter.value === 'subscriptions' ? 'MONTHLY' : 'ONE_TIME'),
                nextDate: item.rawNextDate || '',
                autoPay: item.autoPay,
                categoryId: item.categoryId || ''
            }
            showScheduleSheet.value = true
        }

        const startEditExpense = (exp) => {
            editingExpenseId.value = exp.id
            expenseForm.value = {
                title: exp.title || '',
                amount: exp.amount || '',
                currency: exp.currency || defaultCurrency.value || 'PHP',
                categoryId: exp.categoryId || '',
                expenseDate: exp.expenseDate ? exp.expenseDate.slice(0, 10) : todayStr(),
                type: exp.isRecurring ? 'SUBSCRIPTION' : 'DEFAULT',
                budgetId: exp.budgetId || ''
            }
            expenseError.value = ''
            showExpenseSheet.value = true
        }

        const removeSchedule = async(item) => {
            const token = localStorage.getItem('token')
            if (!token || !item.id) return
            try {
                if (scheduleFilter.value === 'subscriptions') {
                    await deleteSubscription(token, item.id)
                    schedules.value = schedules.value.filter(s => s.id !== item.id)
                } else {
                    await deleteExpenseSchedule(token, item.id)
                    expenseSchedules.value = expenseSchedules.value.filter(s => s.id !== item.id)
                }
            } catch (err) {
                console.error(err)
            }
        }

        const startPaySubscription = (item) => {
            payTarget.value = item
            payError.value = ''
            showPayConfirm.value = true
        }

        const closePayConfirm = () => {
            showPayConfirm.value = false
            payTarget.value = null
            paying.value = false
            payError.value = ''
        }

        const paySubscription = async() => {
            const item = payTarget.value
            const token = localStorage.getItem('token')
            if (!token || !item?.id) return
            payError.value = ''
            paying.value = true
            try {
                if (!categoriesLoaded.value) {
                    await loadCategories()
                }
                const { expense, subscription } = await markSubscriptionPaid(token, item.id)
                if (expense) expenses.value = [decorateExpense(expense), ...expenses.value]
                schedules.value = schedules.value.filter(s => s.id !== item.id)
                if (subscription) schedules.value = [mapSubscriptionToCard(subscription), ...schedules.value]
                await loadExpenses()
                await loadBudgets()
                closePayConfirm()
            } catch (err) {
                console.error(err)
                payError.value = err?.message || 'Unable to mark as paid.'
            } finally {
                paying.value = false
            }
        }

        const handleDeleteExpense = async(exp) => {
            const token = localStorage.getItem('token')
            if (!token || !exp.id || exp.planned) return
            try {
                await deleteExpense(token, exp.id)
                expenses.value = expenses.value.filter(e => e.id !== exp.id)
                await loadBudgets()
            } catch (err) {
                console.error(err)
            }
        }

        const startDeleteExpense = (exp) => {
            deleteTarget.value = exp
            deleteError.value = ''
            showDeleteConfirm.value = true
        }

        const closeDeleteConfirm = () => {
            showDeleteConfirm.value = false
            deleteTarget.value = null
            deleteError.value = ''
            deleting.value = false
        }

        const confirmDeleteExpense = async() => {
            const exp = deleteTarget.value
            const token = localStorage.getItem('token')
            if (!token || !exp?.id) return
            deleteError.value = ''
            deleting.value = true
            try {
                await deleteExpense(token, exp.id)
                expenses.value = expenses.value.filter(e => e.id !== exp.id)
                await loadBudgets()
                closeDeleteConfirm()
            } catch (err) {
                console.error(err)
                deleteError.value = err?.message || 'Unable to delete expense.'
            } finally {
                deleting.value = false
            }
        }

        const handlePayPlanned = async(item) => {
            if (item.type === 'subscription') {
                const match = schedules.value.find(s => s.id === item.id.replace('subscription-', ''))
                if (match) {
                    startPaySubscription(match)
                }
                return
            }
            if (item.type === 'planned') {
                const schedule = expenseSchedules.value.find(s => s.id === item.id.replace('planned-', ''))
                if (!schedule) return
                const token = localStorage.getItem('token')
                if (!token) return
                try {
                    const result = await markExpenseSchedulePaid(token, schedule.id)
                    if (result?.expense) expenses.value = [decorateExpense(result.expense), ...expenses.value]
                    expenseSchedules.value = expenseSchedules.value.filter(s => s.id !== schedule.id)
                    if (result?.schedule) expenseSchedules.value = [mapExpenseScheduleToCard(result.schedule), ...expenseSchedules.value]
                    await loadBudgets()
                } catch (err) {
                    console.error(err)
                }
            }
        }

        const openAddExpense = () => {
            // For now, route to schedules tab with expense filter and sheet
            setTab('schedules')
            scheduleFilter.value = 'expenses'
            resetScheduleForm()
            showScheduleSheet.value = true
            showQuickActions.value = false
        }

        const toggleAutoPay = async(item) => {
            const token = localStorage.getItem('token')
            if (!token || !item.id) return
            try {
                const updated = await updateSubscription(token, item.id, { autoPay: !item.autoPay })
                const mapped = mapSubscriptionToCard(updated)
                schedules.value = schedules.value.map(s => s.id === item.id ? mapped : s)
            } catch (err) {
                console.error(err)
            }
        }

        const onBudgetScroll = () => {
            const el = budgetCarousel.value
            if (!el) return
            const slideWidth = el.clientWidth
            const idx = Math.round(el.scrollLeft / slideWidth)
            budgetActiveIndex.value = Math.min(Math.max(idx, 0), budgets.value.length - 1)
        }

        const scrollBudget = (direction) => {
            const el = budgetCarousel.value
            if (!el) return
            const slideWidth = el.clientWidth
            const nextIndex = Math.min(
                Math.max(budgetActiveIndex.value + direction, 0),
                budgets.value.length - 1
            )
            el.scrollTo({ left: nextIndex * slideWidth, behavior: 'smooth' })
            budgetActiveIndex.value = nextIndex
        }

        const formatDate = (value) => value ? new Date(value).toLocaleDateString() : ''

        const subscriptionPalette = ['blue', 'amber', 'teal', 'purple', 'pink', 'green']
        const subscriptionDot = (idx) => subscriptionPalette[idx % subscriptionPalette.length]

        watch(activeTab, (tab) => {
            if (tab === 'profile' && !categoriesLoaded.value) {
                loadCategories()
            }
            if (tab === 'profile' && !accountsLoaded.value) {
                loadAccounts()
            }
            if (tab === 'profile' && !currenciesLoaded.value) {
                loadCurrencies()
            }
            if (tab === 'home' && !budgetsLoaded.value) {
                loadBudgets()
                if (!categoriesLoaded.value) loadCategories()
                if (schedules.value.length === 0) loadSubscriptions()
            }
            if (tab === 'schedules' && schedules.value.length === 0) {
                loadSubscriptions()
                loadExpenseSchedules()
            }
            if (tab === 'profile' && !budgetsLoaded.value) {
                loadBudgets()
            }
            if (tab === 'insights' && expenses.value.length === 0) {
                loadExpenses()
            }
            if (tab === 'transactions' && !budgetsLoaded.value) {
                loadBudgets()
            }
        }, { immediate: true })

        watch(categories, (newCats) => {
            if (!Array.isArray(expenses.value)) return
            expenses.value = expenses.value.map(exp => {
                const cat = newCats.find(c => c.id === exp.categoryId)
                return {
                    ...exp,
                    categoryIcon: cat?.icon || exp.categoryIcon || null,
                    categoryColor: cat?.color || exp.categoryColor || null
                }
            })
        })

        const ensureProfile = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                logout()
                return
            }
            store.methods.loginUser(token)
            if (!store.state.userProfile) {
                const { response, error } = await getProfile(token)
                if (error.value === null && response.value?.userInfo) {
                    const profile = response.value.userInfo
                    store.methods.setUserAdmin(profile.role === Role.ADMIN)
                    store.methods.setUserProfile(profile)
                    if (profile.role === Role.GUEST) {
                        router.push('/pending-approval')
                    }
                } else {
                    logout()
                }
            }
        }


        const userName = computed(() => store.state.userProfile?.fullName || 'User')

        onMounted(() => {
            requestAnimationFrame(() => { pageReady.value = true })
            ensureProfile()
            if (activeTab.value === 'profile') {
                loadCategories()
                loadAccounts()
                loadCurrencies()
                loadBudgets()
            }
            if (activeTab.value === 'home') {
                loadBudgets()
                loadCategories()
                loadExpenses()
                loadSubscriptions()
            }
            if (activeTab.value === 'schedules') {
                loadSubscriptions()
                loadExpenseSchedules()
            }
            if (activeTab.value === 'transactions') {
                loadExpenses()
                loadBudgets()
            }
        })

        const confirmDeleteBudget = async() => {
            const budget = deleteTarget.value
            const token = localStorage.getItem('token')
            if (!token || !budget?.id) return
            deleteError.value = ''
            deleting.value = true
            try {
                await deleteBudget(token, budget.id)
                budgets.value = budgets.value.filter(b => b.id !== budget.id)
                showBudgetDeleteConfirm.value = false
                deleteTarget.value = null
            } catch (err) {
                console.error(err)
                deleteError.value = err?.message || 'Unable to delete budget.'
            } finally {
                deleting.value = false
            }
        }

        const closeBudgetDeleteConfirm = () => {
            showBudgetDeleteConfirm.value = false
            deleteTarget.value = null
            deleteError.value = ''
            deleting.value = false
        }

        return {
            router,
            activeTab,
            setTab,
            barLabels,
            showAddCategory,
            openAddCategory,
            closeAddCategory,
            pageReady,
            categories,
            accounts,
            currencies,
            defaultCurrency,
            defaultAccountName,
            colorPalette,
            selectedColor,
            selectColor,
            iconOptions,
            selectedIcon,
            selectIcon,
            categoryName,
            makeDefault,
            saving,
            saveError,
            saveMessage,
            handleSaveCategory,
            budgets,
            totalBudget,
            currentMonthTotal,
            monthChangeLabel,
            budgetFilterId,
            activeBudgetAmount,
            startEditBudget,
            handleDeleteBudget,
            budgetCarousel,
            budgetActiveIndex,
            showBudgetSheet,
            editingBudgetId,
            budgetForm,
            budgetError,
            budgetSaving,
            openBudgetSheet,
            closeBudgetSheet,
            handleSaveBudget,
            onBudgetScroll,
            scrollBudget,
            formatDate,
            budgetProgress,
            showScheduleSheet,
            scheduleForm,
            scheduleError,
            scheduleSaving,
            schedules,
            expenseSchedules,
            scheduleFilter,
            filteredSchedules,
            openScheduleSheet,
            closeScheduleSheet,
            handleSaveSchedule,
            toggleAutoPay,
            scheduleTotal,
            subscriptionTotal,
            transactionOut,
            transactionIn,
            transactionNet,
            transactionsForMonth,
            insightsTotal,
            insightsCount,
            insightsAvgPerDay,
            insightsRangeLabel,
            categoryBreakdown,
            topCategory,
            weeklySeries,
            showDeleteConfirm,
            deleteTarget,
            deleteError,
            deleting,
            startDeleteExpense,
            closeDeleteConfirm,
            confirmDeleteExpense,
            monthLabel,
            todayLabel,
            startEditSchedule,
            removeSchedule,
            subscriptionDot,
            showQuickActions,
            openQuickActions,
            closeQuickActions,
            expenses,
            loadExpenses,
            activeBudgetsForExpense,
            showExpenseSheet,
            expenseSheetRef,
            expenseActionsSentinel,
            expenseActionsVisible,
            expenseForm,
            expenseSaving,
            expenseError,
            openExpenseSheet,
            closeExpenseSheet,
            selectExpenseType,
            handleSaveExpense,
            goToAddCategory,
            changeMonth,
            onMonthTouchStart,
            onMonthTouchEnd,
            displayedExpenses,
            monthOffset,
            viewMonthKey,
            budgetSummaryPill,
            showPayConfirm,
            payTarget,
            payError,
            paying,
            startPaySubscription,
            closePayConfirm,
            paySubscription,
            handleDeleteExpense,
            startEditExpense,
            handlePayPlanned,
            showBudgetDeleteConfirm,
            confirmDeleteBudget,
            closeBudgetDeleteConfirm,
            formatMoney,
            currencySymbol,
            userName,
            userEmail,
            userInitials,
            categorySheetRef,
            categoryActionsSentinel,
            categoryActionsVisible
        }
    }
}
</script>
