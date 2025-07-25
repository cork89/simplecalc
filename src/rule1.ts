import { CustomSliderEventDetail } from "./global"

const monthlyIncome: HTMLElement = document.getElementById("monthlyIncome") ?? (() => { throw new Error("monthlyIncome cannot be null") })()
const maxPayment: HTMLElement = document.getElementById("maxPayment") ?? (() => { throw new Error("maxPayment cannot be null") })()
const rule1displayRate: HTMLElement = document.getElementById("displayRate") ?? (() => { throw new Error("displayRate cannot be null") })()
const maxLoanAmount: HTMLElement = document.getElementById("maxLoanAmount") ?? (() => { throw new Error("maxLoanAmount cannot be null") })()

type Rule1Store = {
    annualIncome: number
    monthlyIncomeAmount: number
    maxMonthlyPayment: number
    interestRate: number
    loanTerm: number
}


const rule1StorageKey: string = "rule1Store"
const rule1LocationStorage: string | null = localStorage.getItem(rule1StorageKey)
let rule1Store: Rule1Store
if (rule1LocationStorage) {
    rule1Store = JSON.parse(rule1LocationStorage)
} else {
    rule1Store = {
        annualIncome: 75000,
        monthlyIncomeAmount: 75000 / 12,
        maxMonthlyPayment: 75000 / 12 * 0.28,
        interestRate: 6.5,
        loanTerm: 30,
    }
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function calculateLoanAmount(monthlyPayment: number, annualRate: number, years: number): number {
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
    rule1Store.monthlyIncomeAmount = rule1Store.annualIncome / 12
    rule1Store.maxMonthlyPayment = rule1Store.monthlyIncomeAmount * 0.28
    maxPayment.textContent = formatCurrency(rule1Store.maxMonthlyPayment)
    monthlyIncome.textContent = formatCurrency(rule1Store.monthlyIncomeAmount)
    updateCalculations()
}

function updateCalculations(): void {
    const maxLoan = calculateLoanAmount(rule1Store.maxMonthlyPayment, rule1Store.interestRate, rule1Store.loanTerm)
    maxLoanAmount.textContent = formatCurrency(maxLoan);
}

document.body.addEventListener("slider-change", (event: CustomEvent<CustomSliderEventDetail>) => {
    if (event.detail.id == "grossIncome") {
        rule1Store.annualIncome = parseInt(event.detail.value)
        updateIncomeCalculations()
    } else if (event.detail.id == "interestRate") {
        rule1Store.interestRate = parseFloat(event.detail.value)
        rule1displayRate.textContent = rule1Store.interestRate + "%";
        updateCalculations()
    }
    localStorage.setItem(rule1StorageKey, JSON.stringify(rule1Store))
})

const loanTermRadioButtons: NodeListOf<Element> = document.querySelectorAll('input[name="loanTerm"]')
loanTermRadioButtons.forEach((button: Element) => {
    button.addEventListener("change", (event: Event) => {
        const target = event.target as HTMLInputElement
        rule1Store.loanTerm = parseInt(target.value)
        updateCalculations()
        localStorage.setItem(rule1StorageKey, JSON.stringify(rule1Store))
    })
})

document.addEventListener("DOMContentLoaded", () => {
    const grossIncome: HTMLElement = document.getElementById("grossIncome") ?? (() => { throw new Error("grossIncome cannot be null") })()
    const interestRate: HTMLElement = document.getElementById("interestRate") ?? (() => { throw new Error("interestRate cannot be null") })()
    grossIncome.setAttribute("value", `${rule1Store.annualIncome}`)
    interestRate.setAttribute("value", `${rule1Store.interestRate}`)

    loanTermRadioButtons.forEach((button) => {
        const btn = button as HTMLInputElement
        if (parseInt(btn.value) == rule1Store.loanTerm) btn.checked = true
    })
})
updateIncomeCalculations()
