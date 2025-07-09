import { CustomSliderEventDetail } from "./global"

// const monthlyIncome: HTMLElement = document.getElementById("monthlyIncome") ?? (() => { throw new Error("monthlyIncome cannot be null") })()
// const maxPayment: HTMLElement = document.getElementById("maxPayment") ?? (() => { throw new Error("maxPayment cannot be null") })()
// const rule1displayRate: HTMLElement = document.getElementById("displayRate") ?? (() => { throw new Error("displayRate cannot be null") })()

const standardDeduction: HTMLElement = document.getElementById("standardDeduction") ?? (() => { throw new Error("standardDeduction cannot be null") })()
const taxableIncome: HTMLElement = document.getElementById("taxableIncome") ?? (() => { throw new Error("taxableIncome cannot be null") })()
const bracket10: HTMLElement = document.getElementById("bracket10") ?? (() => { throw new Error("bracket10 cannot be null") })()
const bracket12: HTMLElement = document.getElementById("bracket12") ?? (() => { throw new Error("bracket12 cannot be null") })()
const bracket22: HTMLElement = document.getElementById("bracket22") ?? (() => { throw new Error("bracket22 cannot be null") })()
const bracket24: HTMLElement = document.getElementById("bracket24") ?? (() => { throw new Error("bracket24 cannot be null") })()
const bracket32: HTMLElement = document.getElementById("bracket32") ?? (() => { throw new Error("bracket32 cannot be null") })()
const bracket35: HTMLElement = document.getElementById("bracket35") ?? (() => { throw new Error("bracket35 cannot be null") })()
const bracket37: HTMLElement = document.getElementById("bracket37") ?? (() => { throw new Error("bracket37 cannot be null") })()
const totalTaxes: HTMLElement = document.getElementById("totalTaxes") ?? (() => { throw new Error("totalTaxes cannot be null") })()

const brackets: HTMLElement[] = [bracket10, bracket12, bracket22, bracket24, bracket32, bracket35, bracket37]

enum FilingType {
    SINGLE,
    MARRIED,
    HOH,
    MARRIEDSEP,
}

type BracketDetail = {
    min: number,
    max: number,
    rate: number,
    taxes: number,
}

type FilingTypeInfo = {
    standardDeduction: number,
    details: BracketDetail[],
}

type BracketInfo = Record<FilingType, FilingTypeInfo>;

const bracketInfo: BracketInfo = {
    [FilingType.SINGLE]: {
        standardDeduction: 15750,
        details: [
            {
                min: 0,
                max: 11925,
                rate: 0.1,
                taxes: 11925 * 0.1,
            },
            {
                min: 11926,
                max: 48475,
                rate: 0.12,
                taxes: (48475 - 11926) * 0.12,
            },
            {
                min: 48476,
                max: 103350,
                rate: 0.22,
                taxes: (103350 - 48476) * 0.22,
            },
            {
                min: 103351,
                max: 197300,
                rate: 0.24,
                taxes: (197300 - 103351) * 0.24
            },
            {
                min: 197301,
                max: 250525,
                rate: 0.32,
                taxes: (250525 - 197301) * 0.32,
            },
            {
                min: 250526,
                max: 626350,
                rate: 0.35,
                taxes: (626350 - 250526) * 0.35,
            },
            {
                min: 626350,
                max: 1000001,
                rate: 0.37,
                taxes: (1000000 - 626350) * 0.37,
            }
        ]
    },
    [FilingType.MARRIED]: {
        standardDeduction: 31500,
        details: [
            {
                min: 0,
                max: 23850,
                rate: 0.1,
                taxes: (23850 - 0) * 0.1,
            },
            {
                min: 23851,
                max: 96950,
                rate: 0.12,
                taxes: (96950 - 23851) * 0.12,
            },
            {
                min: 96951,
                max: 206700,
                rate: 0.22,
                taxes: (206700 - 96951) * 0.22,
            },
            {
                min: 206701,
                max: 394600,
                rate: 0.24,
                taxes: (394600 - 206701) * 0.24,
            },
            {
                min: 394601,
                max: 501050,
                rate: 0.32,
                taxes: (501050 - 394601) * 0.32,
            },
            {
                min: 501051,
                max: 751600,
                rate: 0.35,
                taxes: (751600 - 501051) * 0.35,
            },
            {
                min: 751601,
                max: 1000000,
                rate: 0.37,
                taxes: (1000000 - 751601) * 0.37,
            }
        ]
    },
    [FilingType.HOH]: {
        standardDeduction: 23625,
        details: [
            {
                min: 0,
                max: 17000,
                rate: 0.1,
                taxes: (17000 - 0) * 0.1,
            },
            {
                min: 17001,
                max: 64850,
                rate: 0.12,
                taxes: (64850 - 17001) * 0.12,
            },
            {
                min: 64851,
                max: 103350,
                rate: 0.22,
                taxes: (103350 - 64851) * 0.22,
            },
            {
                min: 103351,
                max: 197300,
                rate: 0.24,
                taxes: (197300 - 103351) * 0.24,
            },
            {
                min: 197301,
                max: 250500,
                rate: 0.32,
                taxes: (250500 - 197301) * 0.32,
            },
            {
                min: 250501,
                max: 626350,
                rate: 0.35,
                taxes: (626350 - 250501) * 0.35,
            },
            {
                min: 626351,
                max: 1000000,
                rate: 0.37,
                taxes: (1000000 - 626351) * 0.37,
            }

        ]
    },
    [FilingType.MARRIEDSEP]: {
        standardDeduction: 15750,
        details: [
            {
                min: 0,
                max: 11925,
                rate: 0.1,
                taxes: (11925 - 0) * 0.1,
            },
            {
                min: 11926,
                max: 48475,
                rate: 0.12,
                taxes: (48475 - 11926) * 0.12,
            },
            {
                min: 48476,
                max: 103350,
                rate: 0.22,
                taxes: (103350 - 48476) * 0.22,
            },
            {
                min: 103351,
                max: 197300,
                rate: 0.24,
                taxes: (197300 - 103351) * 0.24,
            },
            {
                min: 197301,
                max: 250525,
                rate: 0.32,
                taxes: (250525 - 197301) * 0.32,
            },
            {
                min: 250526,
                max: 375800,
                rate: 0.35,
                taxes: (375800 - 250526) * 0.35,
            },
            {
                min: 375801,
                max: 1000000,
                rate: 0.37,
                taxes: (1000000 - 375801) * 0.37,
            }
        ]
    },
}


type TaxStore = {
    annualIncome: number
    standardDeduction: number
    taxableIncome: number
    brackets: number[]
    // bracket12: number
    // bracket22: number
    // bracket24: number
    // bracket32: number
    // bracket35: number
    // bracket37: number
    totalTaxes: number
}


const taxStorageKey: string = "taxStore"
const taxLocationStorage: string | null = localStorage.getItem(taxStorageKey)
let taxStore: TaxStore
if (taxLocationStorage) {
    taxStore = JSON.parse(taxLocationStorage)
} else {
    taxStore = {
        annualIncome: 75000,
        standardDeduction: 15750,
        taxableIncome: 75000 - 15750,
        brackets: [
            bracketInfo[FilingType.SINGLE].details[0].taxes,
            bracketInfo[FilingType.SINGLE].details[1].taxes,
            (75000 - 15750 - bracketInfo[FilingType.SINGLE].details[2].min) * bracketInfo[FilingType.SINGLE].details[2].rate,
            0,
            0,
            0,
            0,
        ],
        // bracket10: bracketInfo[FilingType.SINGLE].details[0].taxes,
        // bracket12: bracketInfo[FilingType.SINGLE].details[1].taxes,
        // bracket22: (75000 - 15750 - bracketInfo[FilingType.SINGLE].details[2].min) * bracketInfo[FilingType.SINGLE].details[2].rate,
        // bracket24: 0,
        // bracket32: 0,
        // bracket35: 0,
        // bracket37: 0,
        totalTaxes: 7948.78,
    }
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

function calculateLoanAmount(monthlyPayment: number, annualRate: number, years: number = 30): number {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;

    let amortizedRate: number = 1
    const monthlyRatePlus1 = 1 + monthlyRate
    for (let i = 0; i < numPayments; ++i) {
        amortizedRate *= monthlyRatePlus1
    }

    const loanAmount = monthlyPayment * ((1 - 1 / amortizedRate) / monthlyRate);
    return loanAmount;
}

function updateIncomeCalculations(): void {
    // rule1Store.monthlyIncomeAmount = rule1Store.annualIncome / 12
    // rule1Store.maxMonthlyPayment = rule1Store.monthlyIncomeAmount * 0.28
    // maxPayment.textContent = formatCurrency(rule1Store.maxMonthlyPayment)
    // monthlyIncome.textContent = formatCurrency(rule1Store.monthlyIncomeAmount)
    // updateCalculations()
}

function updateCalculations(): void {
    taxStore.totalTaxes = 0
    for (let i = 0; i < bracketInfo[FilingType.SINGLE].details.length; ++i) {
        let bracketTax = 0
        if (taxStore.taxableIncome < bracketInfo[FilingType.SINGLE].details[i].max && taxStore.taxableIncome > bracketInfo[FilingType.SINGLE].details[i].min) {
            bracketTax = (taxStore.taxableIncome - bracketInfo[FilingType.SINGLE].details[i].min) * bracketInfo[FilingType.SINGLE].details[i].rate
        } else if (taxStore.taxableIncome > bracketInfo[FilingType.SINGLE].details[i].max) {
            bracketTax = bracketInfo[FilingType.SINGLE].details[i].taxes
        }
        taxStore.brackets[i] = bracketTax
        brackets[i].textContent = formatCurrency(bracketTax)
        taxStore.totalTaxes += bracketTax
    }
    taxStore.standardDeduction = bracketInfo[FilingType.SINGLE].standardDeduction
    taxStore.taxableIncome = taxStore.annualIncome - taxStore.standardDeduction
    standardDeduction.textContent = formatCurrency(taxStore.standardDeduction)
    taxableIncome.textContent = formatCurrency(taxStore.taxableIncome)
    totalTaxes.textContent = formatCurrency(taxStore.totalTaxes)
}

document.body.addEventListener("slider-change", (event: CustomEvent<CustomSliderEventDetail>) => {
    if (event.detail.id == "grossIncome") {
        taxStore.annualIncome = parseInt(event.detail.value)
        updateCalculations()
    }
    localStorage.setItem(taxStorageKey, JSON.stringify(taxStore))
})

document.addEventListener("DOMContentLoaded", () => {
    const grossIncome: HTMLElement = document.getElementById("grossIncome") ?? (() => { throw new Error("grossIncome cannot be null") })()
    grossIncome.setAttribute("value", `${taxStore.annualIncome}`)
})
updateCalculations()
