import { CustomSliderEventDetail } from "./global"

const displayHomePrice: HTMLElement = document.getElementById("displayHomePrice") ?? (() => { throw new Error("displayHomePrice cannot be null") })()
const monthlyPayment: HTMLElement = document.getElementById("monthlyPayment") ?? (() => { throw new Error("monthlyPayment cannot be null") })()
const rule2DisplayRate: HTMLElement = document.getElementById("displayRate") ?? (() => { throw new Error("displayRate cannot be null") })()
const requiredIncome: HTMLElement = document.getElementById("requiredIncome") ?? (() => { throw new Error("requiredIncome cannot be null") })()
const downPaymentAmount: HTMLElement = document.getElementById("downPaymentAmount") ?? (() => { throw new Error("downPaymentAmount cannot be null") })()
const repairFundAmount: HTMLElement = document.getElementById("repairFundAmount") ?? (() => { throw new Error("repairFundAmount cannot be null") })()
const totalCashNeeded: HTMLElement = document.getElementById("totalCashNeeded") ?? (() => { throw new Error("totalCashNeeded cannot be null") })()

type Rule2Store = {
    homePrice: number
    repairFund: number
    downPayment: number
    loanAmount: number
    interestRate: number
    loanTerm: number
}

const rule2StorageKey: string = "rule2Store"
const rule2LocationStorage: string | null = localStorage.getItem(rule2StorageKey)
let rule2Store: Rule2Store
if (rule2LocationStorage) {
    rule2Store = JSON.parse(rule2LocationStorage)
} else {
    rule2Store = {
        homePrice: 300000,
        repairFund: 300000 * 0.1,
        downPayment: 300000 * 0.2,
        loanAmount: 300000 - 300000 * 0.2,
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
    displayHomePrice.textContent = formatCurrency(rule2Store.homePrice)

    rule2Store.repairFund = rule2Store.homePrice * 0.1
    rule2Store.downPayment = rule2Store.repairFund + rule2Store.repairFund
    rule2Store.loanAmount = rule2Store.homePrice - rule2Store.downPayment
    const monthlyPmt: number = calculateMonthlyPayment(rule2Store.loanAmount, rule2Store.interestRate, rule2Store.loanTerm ?? 30)

    const requiredAnnualIncome: number = monthlyPmt * 3 * 12
    // rule2Store.homePrice / 3

    monthlyPayment.textContent = formatCurrency(monthlyPmt)
    requiredIncome.textContent = formatCurrency(requiredAnnualIncome)
    downPaymentAmount.textContent = formatCurrency(rule2Store.downPayment)
    repairFundAmount.textContent = formatCurrency(rule2Store.repairFund)
    totalCashNeeded.textContent = formatCurrency(rule2Store.downPayment + rule2Store.repairFund)
}

function updateInterestCalculations(): void {
    rule2DisplayRate.textContent = rule2Store.interestRate + "%"
    const monthlyPmt: number = calculateMonthlyPayment(rule2Store.loanAmount, rule2Store.interestRate, rule2Store.loanTerm ?? 30)
    monthlyPayment.textContent = formatCurrency(monthlyPmt)
}

document.body.addEventListener("slider-change", (event: CustomEvent<CustomSliderEventDetail>) => {
    if (event.detail.id == "homePrice") {
        rule2Store.homePrice = parseInt(event.detail.value)
    } else if (event.detail.id == "interestRate") {
        rule2Store.interestRate = parseFloat(event.detail.value)
    }
    updateHomePriceCalculations()
    updateInterestCalculations()
    localStorage.setItem(rule2StorageKey, JSON.stringify(rule2Store))
})

const loanTermRadioButtons: NodeListOf<Element> = document.querySelectorAll('input[name="loanTerm"]')
loanTermRadioButtons.forEach((button: Element) => {
    button.addEventListener("change", (event: Event) => {
        const target = event.target as HTMLInputElement
        rule2Store.loanTerm = parseInt(target.value)
        updateHomePriceCalculations()
        localStorage.setItem(rule2StorageKey, JSON.stringify(rule2Store))
    })
})

document.addEventListener("DOMContentLoaded", () => {
    const homePrice: HTMLElement = document.getElementById("homePrice") ?? (() => { throw new Error("homePrice cannot be null") })()
    const interestRate: HTMLElement = document.getElementById("interestRate") ?? (() => { throw new Error("interestRate cannot be null") })()
    homePrice.setAttribute("value", `${rule2Store.homePrice}`)
    interestRate.setAttribute("value", `${rule2Store.interestRate}`)

    loanTermRadioButtons.forEach((button) => {
        const btn = button as HTMLInputElement
        if (parseInt(btn.value) == rule2Store.loanTerm) btn.checked = true
    })
})
updateHomePriceCalculations()
updateInterestCalculations()