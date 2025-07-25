export type UnifiedStore = {
    // From Rule1Store
    annualIncome: number
    monthlyIncomeAmount: number
    maxMonthlyPayment: number

    // From Rule2Store
    homePrice: number
    repairFund: number
    downPayment: number
    loanAmount: number

    // Common fields
    interestRate: number
    loanTerm: number
}

const unifiedStorageKey = "unifiedStore"

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function migrateLegacyStores(): Partial<UnifiedStore> | null {
    const rule1Storage = localStorage.getItem("rule1Store")
    const rule2Storage = localStorage.getItem("rule2Store")

    let migratedData: Partial<UnifiedStore> = {}
    let hasLegacyData = false

    if (rule1Storage) {
        try {
            const rule1Data = JSON.parse(rule1Storage)
            migratedData = {
                ...migratedData,
                annualIncome: rule1Data.annualIncome,
                monthlyIncomeAmount: rule1Data.monthlyIncomeAmount,
                maxMonthlyPayment: rule1Data.maxMonthlyPayment,
                interestRate: rule1Data.interestRate,
                loanTerm: rule1Data.loanTerm,
            }
            hasLegacyData = true
            localStorage.removeItem("rule1Store")
        } catch (e) {
            console.error("Failed to migrate rule1Store:", e)
        }
    }

    if (rule2Storage) {
        try {
            const rule2Data = JSON.parse(rule2Storage)
            migratedData = {
                ...migratedData,
                homePrice: rule2Data.homePrice,
                repairFund: rule2Data.repairFund,
                downPayment: rule2Data.downPayment,
                loanAmount: rule2Data.loanAmount,
                interestRate: rule2Data.interestRate ?? migratedData.interestRate,
                loanTerm: rule2Data.loanTerm ?? migratedData.loanTerm,
            }
            hasLegacyData = true
            localStorage.removeItem("rule2Store")
        } catch (e) {
            console.error("Failed to migrate rule2Store:", e)
        }
    }

    return hasLegacyData ? migratedData : null
}

export function initializeStore(): UnifiedStore {
    const existingStorage = localStorage.getItem(unifiedStorageKey)
    const migratedData = migrateLegacyStores()

    if (existingStorage) {
        try {
            return JSON.parse(existingStorage)
        } catch (e) {
            console.error("Failed to parse unified store, using defaults:", e)
        }
    }

    if (migratedData) {
        const mergedStore = { ...getDefaultStore(), ...migratedData }
        localStorage.setItem(unifiedStorageKey, JSON.stringify(mergedStore))
        return mergedStore
    }

    const defaultStore = getDefaultStore()
    localStorage.setItem(unifiedStorageKey, JSON.stringify(defaultStore))
    return defaultStore
}

function getDefaultStore(): UnifiedStore {
    const defaultHomePrice = 300000
    const defaultAnnualIncome = 75000

    return {
        // Rule1 defaults
        annualIncome: defaultAnnualIncome,
        monthlyIncomeAmount: defaultAnnualIncome / 12,
        maxMonthlyPayment: (defaultAnnualIncome / 12) * 0.28,

        // Rule2 defaults
        homePrice: defaultHomePrice,
        repairFund: defaultHomePrice * 0.1,
        downPayment: defaultHomePrice * 0.2,
        loanAmount: defaultHomePrice - (defaultHomePrice * 0.2),

        // Common defaults
        interestRate: 6.5,
        loanTerm: 30,
    }
}

export function saveStore(store: UnifiedStore): void {
    localStorage.setItem(unifiedStorageKey, JSON.stringify(store))
}

export let unifiedStore: UnifiedStore = initializeStore()

export function updateStore(updates: Partial<UnifiedStore>): void {
    unifiedStore = { ...unifiedStore, ...updates }
    saveStore(unifiedStore)
}