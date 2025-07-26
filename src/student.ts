import { CustomSliderEventDetail } from "./global"
import { studentLoanStore, updateStudentLoanStore, calculateMonthlyPayment, formatCurrency } from "./store.js"

const loanAmount: HTMLElement = document.getElementById("loanAmount") ?? (() => { throw new Error("loanAmount cannot be null") })()
const loanTerm: HTMLElement = document.getElementById("loanTerm") ?? (() => { throw new Error("loanTerm cannot be null") })()
const interestDisplayRate: HTMLElement = document.getElementById("interestRate") ?? (() => { throw new Error("interestRate cannot be null") })()
const interestAccrued: HTMLElement = document.getElementById("interestAccrued") ?? (() => { throw new Error("interestAccrued cannot be null") })()
const monthlyPayment: HTMLElement = document.getElementById("monthlyPayment") ?? (() => { throw new Error("monthlyPayment cannot be null") })()

function updateCalculations(): void {
    const payment = calculateMonthlyPayment(studentLoanStore.loanAmount, studentLoanStore.interestRate, studentLoanStore.loanTerm)
    monthlyPayment.textContent = formatCurrency(payment);
    interestAccrued.textContent = formatCurrency(payment * 12 * studentLoanStore.loanTerm - studentLoanStore.loanAmount)

    updateStudentLoanStore(studentLoanStore)
}

document.body.addEventListener("slider-change", (event: CustomEvent<CustomSliderEventDetail>) => {
    if (event.detail.id == "loanAmount") {
        studentLoanStore.loanAmount = parseInt(event.detail.value)
    } else if (event.detail.id == "interestRate") {
        studentLoanStore.interestRate = parseFloat(event.detail.value)
    } else if (event.detail.id == "loanTerm") {
        studentLoanStore.loanTerm = parseInt(event.detail.value)
    }
    updateCalculations()

})

const loanTermRadioButtons: NodeListOf<Element> = document.querySelectorAll('input[name="loanTerm"]')
loanTermRadioButtons.forEach((button: Element) => {
    button.addEventListener("change", (event: Event) => {
        const target = event.target as HTMLInputElement
        studentLoanStore.loanTerm = parseInt(target.value)
        updateCalculations()
    })
})

document.addEventListener("DOMContentLoaded", () => {
    loanAmount.setAttribute("value", `${studentLoanStore.loanAmount}`)
    interestDisplayRate.setAttribute("value", `${studentLoanStore.interestRate}`)
    loanTerm.setAttribute("value", `${studentLoanStore.loanTerm}`)
})
updateCalculations()
