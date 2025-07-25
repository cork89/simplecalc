import { CustomSliderEventDetail } from "./global"
import { unifiedStore, updateStore, formatCurrency } from "./store.js"

const monthlyIncome: HTMLElement = document.getElementById("monthlyIncome") ?? (() => { throw new Error("monthlyIncome cannot be null") })()
const maxPayment: HTMLElement = document.getElementById("maxPayment") ?? (() => { throw new Error("maxPayment cannot be null") })()
const interestDisplayRate: HTMLElement = document.getElementById("displayRate") ?? (() => { throw new Error("displayRate cannot be null") })()
const maxLoanAmount: HTMLElement = document.getElementById("maxLoanAmount") ?? (() => { throw new Error("maxLoanAmount cannot be null") })()

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
    unifiedStore.monthlyIncomeAmount = unifiedStore.annualIncome / 12
    unifiedStore.maxMonthlyPayment = unifiedStore.monthlyIncomeAmount * 0.28
    maxPayment.textContent = formatCurrency(unifiedStore.maxMonthlyPayment)
    monthlyIncome.textContent = formatCurrency(unifiedStore.monthlyIncomeAmount)
    updateCalculations()
}

function updateCalculations(): void {
    const maxLoan = calculateLoanAmount(unifiedStore.maxMonthlyPayment, unifiedStore.interestRate, unifiedStore.loanTerm ?? 30)
    maxLoanAmount.textContent = formatCurrency(maxLoan);
    interestDisplayRate.textContent = unifiedStore.interestRate + "%"

    updateStore(unifiedStore)
}

document.body.addEventListener("slider-change", (event: CustomEvent<CustomSliderEventDetail>) => {
    if (event.detail.id == "grossIncome") {
        unifiedStore.annualIncome = parseInt(event.detail.value)
        updateIncomeCalculations()
    } else if (event.detail.id == "interestRate") {
        unifiedStore.interestRate = parseFloat(event.detail.value)
        interestDisplayRate.textContent = unifiedStore.interestRate + "%";
        updateCalculations()
    }
})

const loanTermRadioButtons: NodeListOf<Element> = document.querySelectorAll('input[name="loanTerm"]')
loanTermRadioButtons.forEach((button: Element) => {
    button.addEventListener("change", (event: Event) => {
        const target = event.target as HTMLInputElement
        unifiedStore.loanTerm = parseInt(target.value)
        updateCalculations()
    })
})

document.addEventListener("DOMContentLoaded", () => {
    const grossIncome: HTMLElement = document.getElementById("grossIncome") ?? (() => { throw new Error("grossIncome cannot be null") })()
    const interestRate: HTMLElement = document.getElementById("interestRate") ?? (() => { throw new Error("interestRate cannot be null") })()
    grossIncome.setAttribute("value", `${unifiedStore.annualIncome}`)
    interestRate.setAttribute("value", `${unifiedStore.interestRate}`)

    loanTermRadioButtons.forEach((button) => {
        const btn = button as HTMLInputElement
        if (parseInt(btn.value) == unifiedStore.loanTerm) btn.checked = true
    })
})
updateIncomeCalculations()
