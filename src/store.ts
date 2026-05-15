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

const storeDatabaseName = "simpleCalcStore"
const storeDatabaseVersion = 1
const storeObjectStoreName = "stores"

type PersistedStore<T> = {
    key: string
    value: T
}

let storeDatabasePromise: Promise<IDBDatabase> | null = null

function openStoreDatabase(): Promise<IDBDatabase> {
    if (storeDatabasePromise) {
        return storeDatabasePromise
    }

    storeDatabasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(storeDatabaseName, storeDatabaseVersion)

        request.onupgradeneeded = () => {
            const database = request.result
            if (!database.objectStoreNames.contains(storeObjectStoreName)) {
                database.createObjectStore(storeObjectStoreName, { keyPath: "key" })
            }
        }

        request.onsuccess = () => {
            request.result.onversionchange = () => {
                request.result.close()
            }
            resolve(request.result)
        }

        request.onerror = () => {
            reject(request.error ?? new Error("Failed to open store database"))
        }
    })

    return storeDatabasePromise
}

async function readStore<T>(storageKey: string): Promise<T | null> {
    const database = await openStoreDatabase()

    return await new Promise((resolve, reject) => {
        const transaction = database.transaction(storeObjectStoreName, "readonly")
        const objectStore = transaction.objectStore(storeObjectStoreName)
        const request = objectStore.get(storageKey)

        request.onsuccess = () => {
            const result = request.result as PersistedStore<T> | undefined
            resolve(result?.value ?? null)
        }

        request.onerror = () => {
            reject(request.error ?? new Error(`Failed to read ${storageKey}`))
        }
    })
}

async function writeStore<T>(store: T, storageKey: string): Promise<void> {
    const database = await openStoreDatabase()

    await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(storeObjectStoreName, "readwrite")
        const objectStore = transaction.objectStore(storeObjectStoreName)
        const request = objectStore.put({ key: storageKey, value: store } satisfies PersistedStore<T>)

        request.onsuccess = () => {
            resolve()
        }

        request.onerror = () => {
            reject(request.error ?? new Error(`Failed to write ${storageKey}`))
        }
    })
}

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

function initializeStore(): UnifiedStore {
    return getDefaultStore()
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

function initializeStoreX<T>(getDefaultStore: () => T, _storageKey: string): T {
    return getDefaultStore()
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
    void writeStore(store, storageKey).catch((e: unknown) => {
        console.error(`Failed to save ${storageKey}:`, e)
    })
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

async function hydrateStore<T extends object>(store: T, getDefaultStore: () => T, storageKey: string): Promise<void> {
    try {
        const storedData = await readStore<T>(storageKey)
        const mergedStore = { ...getDefaultStore(), ...(storedData ?? {}) }
        Object.assign(store, storageKey === compareStorageKey ? migrateCompareStore(mergedStore as CompareStore) : mergedStore)

        if (!storedData) {
            saveStore(store, storageKey)
        }
    } catch (e) {
        console.error(`Failed to initialize ${storageKey}, using defaults:`, e)
    }
}

async function initializeStores(): Promise<void> {
    await Promise.all([
        hydrateStore(unifiedStore, getDefaultStore, unifiedStorageKey),
        hydrateStore(studentLoanStore, getDefaultStudentLoanStore, studentLoanStorageKey),
        hydrateStore(studentCompareStore, getDefaultStudentCompareStore, studentCompareStorageKey),
        hydrateStore(compareStore, getDefaultCompareStore, compareStorageKey),
        hydrateStore(ageStore, getDefaultAgeStore, ageStorageKey),
        hydrateStore(retirementStore, getDefaultRetirementStore, retirementStorageKey),
    ])
}

export {
    ageStorageKey,
    retirementStorageKey,
    formatCurrency,
    formatCurrencyShort,
    calculateMonthlyPayment,
    initializeStores,
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
    retirementStore,
}

export type {
    UnifiedStore,
    StudentLoanStore,
    StudentCompareStore,
    CompareStore,
    AgeStore,
    RetirementStore,
}
