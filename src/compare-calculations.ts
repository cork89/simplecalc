import { calculateMonthlyPayment } from "./store.js"
import { type ScenarioData } from "./types.js"

export function calculateHomePriceForTargetTotalCost(targetTotalCost: number, interestRate: number, loanTerm: number, hoaFees: number, downPaymentPercent: number): number {
    const monthlyPaymentPerDollar = calculateMonthlyPayment(1, interestRate, loanTerm)
    const totalMonths = loanTerm * 12
    const downPaymentRatio = downPaymentPercent / 100
    const financedRatio = 1 - downPaymentRatio
    const totalCostPerDollar = (monthlyPaymentPerDollar * financedRatio * totalMonths) + downPaymentRatio
    const totalHoaCost = hoaFees * totalMonths

    return (targetTotalCost - totalHoaCost) / totalCostPerDollar
}

export function calculateScenario(scenario: ScenarioData): void {
    const downPayment = scenario.homePrice * (scenario.downPaymentPercent / 100)
    const loanAmount = scenario.homePrice - downPayment

    const baseMonthlyPayment = calculateMonthlyPayment(loanAmount, scenario.interestRate, scenario.loanTerm)
    scenario.monthlyPayment = baseMonthlyPayment + scenario.hoaFees
    scenario.totalCost = (baseMonthlyPayment * 12 * scenario.loanTerm) + downPayment + (scenario.hoaFees * 12 * scenario.loanTerm)
    scenario.totalInterest = (baseMonthlyPayment * 12 * scenario.loanTerm) - loanAmount
    scenario.totalHoa = scenario.hoaFees * 12 * scenario.loanTerm
    scenario.principal = downPayment + loanAmount
    scenario.downPayment = downPayment
    scenario.requiredIncome = scenario.monthlyPayment * 12 * 3
}
