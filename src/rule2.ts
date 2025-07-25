import { CustomSliderEventDetail } from "./global"
import { unifiedStore, updateStore, formatCurrency } from "./store.js"

const displayHomePrice: HTMLElement = document.getElementById("displayHomePrice") ?? (() => { throw new Error("displayHomePrice cannot be null") })()
const monthlyPayment: HTMLElement = document.getElementById("monthlyPayment") ?? (() => { throw new Error("monthlyPayment cannot be null") })()
const interestDisplayRate: HTMLElement = document.getElementById("displayRate") ?? (() => { throw new Error("displayRate cannot be null") })()
const requiredIncome: HTMLElement = document.getElementById("requiredIncome") ?? (() => { throw new Error("requiredIncome cannot be null") })()
const downPaymentAmount: HTMLElement = document.getElementById("downPaymentAmount") ?? (() => { throw new Error("downPaymentAmount cannot be null") })()
const repairFundAmount: HTMLElement = document.getElementById("repairFundAmount") ?? (() => { throw new Error("repairFundAmount cannot be null") })()
const totalCashNeeded: HTMLElement = document.getElementById("totalCashNeeded") ?? (() => { throw new Error("totalCashNeeded cannot be null") })()

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

function updateHomePriceCalculations(): void {
    displayHomePrice.textContent = formatCurrency(unifiedStore.homePrice)

    unifiedStore.repairFund = unifiedStore.homePrice * 0.1
    unifiedStore.downPayment = unifiedStore.repairFund + unifiedStore.repairFund
    unifiedStore.loanAmount = unifiedStore.homePrice - unifiedStore.downPayment
    const monthlyPmt: number = calculateMonthlyPayment(unifiedStore.loanAmount, unifiedStore.interestRate, unifiedStore.loanTerm ?? 30)

    const requiredAnnualIncome: number = monthlyPmt * 3 * 12

    monthlyPayment.textContent = formatCurrency(monthlyPmt)
    requiredIncome.textContent = formatCurrency(requiredAnnualIncome)
    downPaymentAmount.textContent = formatCurrency(unifiedStore.downPayment)
    repairFundAmount.textContent = formatCurrency(unifiedStore.repairFund)
    totalCashNeeded.textContent = formatCurrency(unifiedStore.downPayment + unifiedStore.repairFund)
    updateStore(unifiedStore)
}

function updateInterestCalculations(): void {
    interestDisplayRate.textContent = unifiedStore.interestRate + "%"
    const monthlyPmt: number = calculateMonthlyPayment(unifiedStore.loanAmount, unifiedStore.interestRate, unifiedStore.loanTerm ?? 30)
    monthlyPayment.textContent = formatCurrency(monthlyPmt)
}

document.body.addEventListener("slider-change", (event: CustomEvent<CustomSliderEventDetail>) => {
    if (event.detail.id == "homePrice") {
        unifiedStore.homePrice = parseInt(event.detail.value)
    } else if (event.detail.id == "interestRate") {
        unifiedStore.interestRate = parseFloat(event.detail.value)
    }
    updateHomePriceCalculations()
    updateInterestCalculations()
})

const loanTermRadioButtons: NodeListOf<Element> = document.querySelectorAll('input[name="loanTerm"]')
loanTermRadioButtons.forEach((button: Element) => {
    button.addEventListener("change", (event: Event) => {
        const target = event.target as HTMLInputElement
        unifiedStore.loanTerm = parseInt(target.value)
        updateHomePriceCalculations()
    })
})

document.addEventListener("DOMContentLoaded", () => {
    const homePrice: HTMLElement = document.getElementById("homePrice") ?? (() => { throw new Error("homePrice cannot be null") })()
    const interestRate: HTMLElement = document.getElementById("interestRate") ?? (() => { throw new Error("interestRate cannot be null") })()
    homePrice.setAttribute("value", `${unifiedStore.homePrice}`)
    interestRate.setAttribute("value", `${unifiedStore.interestRate}`)

    loanTermRadioButtons.forEach((button) => {
        const btn = button as HTMLInputElement
        if (parseInt(btn.value) == unifiedStore.loanTerm) btn.checked = true
    })
})
updateHomePriceCalculations()
updateInterestCalculations()