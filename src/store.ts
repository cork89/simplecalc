type UnifiedStore = {
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

type StudentLoanStore = {
    loanAmount: number
    loanTerm: number
    interestRate: number
}

type StudentCompareStore = {
    annualSalary: number
    employerMatchRate: number
}

type CompareStore = {
    homePriceA: number
    homePriceB: number
    downPaymentPercentA: number
    downPaymentPercentB: number
    interestRate: number
    hoaFeesA: number
    hoaFeesB: number
    loanTermA: number
    loanTermB: number
}

type AgeStore = {
    age: number
    year: number
}

type RetirementStore = {
    age: number
    nestEgg: number
    returnRate: number
    budget: number
}

const unifiedStorageKey = "unifiedStore"
const studentLoanStorageKey = "studentLoanStore"
const studentCompareStorageKey = "studentCompareStore"
const compareStorageKey = "compareStore"
const ageStorageKey = "ageStore"
const retirementStorageKey = "retirementStore"

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatCurrencyShort(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        compactDisplay: "short",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
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

function initializeStore(): UnifiedStore {
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

function initializeStoreX<T>(getDefaultStore: () => T, storageKey: string): T {
    const existingStorage = localStorage.getItem(storageKey)

    if (existingStorage) {
        try {
            const parsedStore = JSON.parse(existingStorage) as T

            if (storageKey === compareStorageKey) {
                const migratedCompareStore = migrateCompareStore(parsedStore as CompareStore)
                localStorage.setItem(storageKey, JSON.stringify(migratedCompareStore))
                return migratedCompareStore as T
            }

            const mergedStore = { ...getDefaultStore(), ...parsedStore }
            localStorage.setItem(storageKey, JSON.stringify(mergedStore))
            return mergedStore as T
        } catch (e) {
            console.error("Failed to parse unified store, using defaults:", e)
        }
    }

    const defaultStore = getDefaultStore()
    localStorage.setItem(storageKey, JSON.stringify(defaultStore))
    return defaultStore

}

function calculateMonthlyPayment(
    loanAmount: number,
    annualRate: number,
    years: number,
): number {
    const monthlyRate: number = annualRate / 100 / 12
    const numPayments: number = years * 12

    if (monthlyRate === 0) {
        return loanAmount / numPayments
    }

    let amortizedRate: number = 1
    const monthlyRatePlus1 = 1 + monthlyRate
    for (let i = 0; i < numPayments; ++i) {
        amortizedRate *= monthlyRatePlus1
    }

    return (loanAmount * (monthlyRate * amortizedRate)) / (amortizedRate - 1)
}


function migrateCompareStore(compareStoreData: CompareStore | { scenarioA?: { homePrice?: number; interestRate?: number; loanTerm?: number; hoaFees?: number }; scenarioB?: { homePrice?: number; interestRate?: number; loanTerm?: number; hoaFees?: number } }): CompareStore {
    const defaultStore = getDefaultCompareStore()

    if ("scenarioA" in compareStoreData || "scenarioB" in compareStoreData) {
        return {
            homePriceA: compareStoreData.scenarioA?.homePrice ?? defaultStore.homePriceA,
            homePriceB: compareStoreData.scenarioB?.homePrice ?? defaultStore.homePriceB,
            downPaymentPercentA: defaultStore.downPaymentPercentA,
            downPaymentPercentB: defaultStore.downPaymentPercentB,
            interestRate: compareStoreData.scenarioA?.interestRate ?? compareStoreData.scenarioB?.interestRate ?? defaultStore.interestRate,
            hoaFeesA: compareStoreData.scenarioA?.hoaFees ?? defaultStore.hoaFeesA,
            hoaFeesB: compareStoreData.scenarioB?.hoaFees ?? defaultStore.hoaFeesB,
            loanTermA: compareStoreData.scenarioA?.loanTerm ?? defaultStore.loanTermA,
            loanTermB: compareStoreData.scenarioB?.loanTerm ?? defaultStore.loanTermB,
        }
    }

    return { ...defaultStore, ...compareStoreData }
}

function getDefaultStudentLoanStore(): StudentLoanStore {
    return {
        loanAmount: 40000,
        loanTerm: 10,
        interestRate: 6.5,
    }
}

function getDefaultStudentCompareStore(): StudentCompareStore {
    return {
        annualSalary: 70000,
        employerMatchRate: 4,
    }
}

function getDefaultCompareStore(): CompareStore {
    return {
        homePriceA: 300000,
        homePriceB: 350000,
        downPaymentPercentA: 20,
        downPaymentPercentB: 20,
        interestRate: 6.5,
        hoaFeesA: 0,
        hoaFeesB: 0,
        loanTermA: 30,
        loanTermB: 30,
    }
}

function getDefaultAgeStore(): AgeStore {
    return {
        age: 25,
        year: 2025,
    }
}

function getDefaultRetirementStore(): RetirementStore {
    return {
        age: 50,
        nestEgg: 1000000,
        returnRate: 8,
        budget: 3000,
    }
}

function saveStore<T>(store: T, storageKey: string): void {
    localStorage.setItem(storageKey, JSON.stringify(store))
}

let unifiedStore: UnifiedStore = initializeStore()

function updateStore(updates: Partial<UnifiedStore>): void {
    unifiedStore = { ...unifiedStore, ...updates }
    saveStore(unifiedStore, unifiedStorageKey)
}

let studentLoanStore: StudentLoanStore = initializeStoreX(getDefaultStudentLoanStore, studentLoanStorageKey) as StudentLoanStore

function updateStudentLoanStore(updates: Partial<StudentLoanStore>): void {
    studentLoanStore = { ...studentLoanStore, ...updates }
    saveStore(studentLoanStore, studentLoanStorageKey)
}

let studentCompareStore: StudentCompareStore = initializeStoreX(getDefaultStudentCompareStore, studentCompareStorageKey) as StudentCompareStore

function updateStudentCompareStore(updates: Partial<StudentCompareStore>): void {
    studentCompareStore = { ...studentCompareStore, ...updates }
    saveStore(studentCompareStore, studentCompareStorageKey)
}

let compareStore: CompareStore = initializeStoreX(getDefaultCompareStore, compareStorageKey) as CompareStore

function updateCompareStore(updates: Partial<CompareStore>): void {
    compareStore = { ...compareStore, ...updates }
    saveStore(compareStore, compareStorageKey)
}

let ageStore: AgeStore = initializeStoreX(getDefaultAgeStore, ageStorageKey) as AgeStore

let retirementStore: RetirementStore = initializeStoreX(getDefaultRetirementStore, retirementStorageKey) as RetirementStore

export {
    ageStorageKey,
    formatCurrency,
    formatCurrencyShort,
    calculateMonthlyPayment,
    saveStore,
    unifiedStore,
    updateStore,
    studentLoanStore,
    updateStudentLoanStore,
    studentCompareStore,
    updateStudentCompareStore,
    compareStore,
    updateCompareStore,
    ageStore,
}

export type {
    UnifiedStore,
    StudentLoanStore,
    StudentCompareStore,
    CompareStore,
    AgeStore,
}
