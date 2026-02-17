import { CustomSliderEventDetail } from "./global"
import {
    calculateMonthlyPayment,
    formatCurrency,
    studentCompareStore,
    studentLoanStore,
    updateStudentCompareStore,
    updateStudentLoanStore,
} from "./store.js"

const assumedAnnualReturnRate = 8.4

const loanAmount: HTMLElement = document.getElementById("loanAmount") ?? (() => { throw new Error("loanAmount cannot be null") })()
const loanTerm: HTMLElement = document.getElementById("loanTerm") ?? (() => { throw new Error("loanTerm cannot be null") })()
const interestRate: HTMLElement = document.getElementById("interestRate") ?? (() => { throw new Error("interestRate cannot be null") })()

const annualSalary: HTMLElement = document.getElementById("annualSalary") ?? (() => { throw new Error("annualSalary cannot be null") })()
const employerMatchRate: HTMLElement = document.getElementById("employerMatchRate") ?? (() => { throw new Error("employerMatchRate cannot be null") })()

const interestAccrued: HTMLElement = document.getElementById("interestAccrued") ?? (() => { throw new Error("interestAccrued cannot be null") })()
const monthlyPayment: HTMLElement = document.getElementById("monthlyPayment") ?? (() => { throw new Error("monthlyPayment cannot be null") })()

const monthlyMatchValue: HTMLElement = document.getElementById("monthlyMatchValue") ?? (() => { throw new Error("monthlyMatchValue cannot be null") })()
const employerMatchBalance: HTMLElement = document.getElementById("employerMatchBalance") ?? (() => { throw new Error("employerMatchBalance cannot be null") })()
const payoffYearsLabel: HTMLElement = document.getElementById("payoffYearsLabel") ?? (() => { throw new Error("payoffYearsLabel cannot be null") })()
const interestMinusMatch: HTMLElement = document.getElementById("interestMinusMatch") ?? (() => { throw new Error("interestMinusMatch cannot be null") })()

function simulateEmployerMatchBalance(monthlyMatch: number, months: number): number {
    let balance: number = 0
    const monthlyRate: number = assumedAnnualReturnRate / 100 / 12

    for (let month = 0; month < months; month += 1) {
        balance = balance * (1 + monthlyRate) + monthlyMatch
    }

    return balance
}

function updateCalculations(): void {
    const payment = calculateMonthlyPayment(studentLoanStore.loanAmount, studentLoanStore.interestRate, studentLoanStore.loanTerm)
    monthlyPayment.textContent = formatCurrency(payment)
    interestAccrued.textContent = formatCurrency(payment * 12 * studentLoanStore.loanTerm - studentLoanStore.loanAmount)

    const monthlyMatch = (studentCompareStore.annualSalary * (studentCompareStore.employerMatchRate / 100) * 2) / 12
    const payoffMonths = studentLoanStore.loanTerm * 12
    const matchBalance = simulateEmployerMatchBalance(monthlyMatch, payoffMonths)
    const interestMinusMatchValue = matchBalance - (payment * 12 * studentLoanStore.loanTerm - studentLoanStore.loanAmount)

    monthlyMatchValue.textContent = formatCurrency(monthlyMatch)
    employerMatchBalance.textContent = formatCurrency(matchBalance)
    payoffYearsLabel.textContent = `${studentLoanStore.loanTerm}`
    interestMinusMatch.textContent = formatCurrency(interestMinusMatchValue)

    updateStudentLoanStore(studentLoanStore)
    updateStudentCompareStore(studentCompareStore)
}

document.body.addEventListener("slider-change", (event: CustomEvent<CustomSliderEventDetail>) => {
    if (event.detail.id == "loanAmount") {
        studentLoanStore.loanAmount = parseInt(event.detail.value)
    } else if (event.detail.id == "interestRate") {
        studentLoanStore.interestRate = parseFloat(event.detail.value)
    } else if (event.detail.id == "loanTerm") {
        studentLoanStore.loanTerm = parseInt(event.detail.value)
    } else if (event.detail.id == "annualSalary") {
        studentCompareStore.annualSalary = parseInt(event.detail.value)
    } else if (event.detail.id == "employerMatchRate") {
        studentCompareStore.employerMatchRate = parseFloat(event.detail.value)
    }

    updateCalculations()
})

document.addEventListener("DOMContentLoaded", () => {
    loanAmount.setAttribute("value", `${studentLoanStore.loanAmount}`)
    interestRate.setAttribute("value", `${studentLoanStore.interestRate}`)
    loanTerm.setAttribute("value", `${studentLoanStore.loanTerm}`)
    annualSalary.setAttribute("value", `${studentCompareStore.annualSalary}`)
    employerMatchRate.setAttribute("value", `${studentCompareStore.employerMatchRate}`)
})

updateCalculations()
