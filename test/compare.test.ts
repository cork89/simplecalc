import { describe, expect, it } from "vitest"

import { calculateHomePriceForTargetTotalCost, calculateScenario } from "../src/compare-calculations.js"
import { type ScenarioData } from "../src/types.js"

function createScenario(overrides: Partial<ScenarioData> = {}): ScenarioData {
    return {
        homePrice: 300000,
        downPaymentPercent: 20,
        interestRate: 6.5,
        loanTerm: 30,
        hoaFees: 0,
        monthlyPayment: 0,
        totalCost: 0,
        totalInterest: 0,
        totalHoa: 0,
        principal: 0,
        downPayment: 0,
        requiredIncome: 0,
        ...overrides,
    }
}

describe("compare calculations", () => {
    it("calculates a scenario with down payment and hoa fees", () => {
        const scenario = createScenario({
            homePrice: 300000,
            downPaymentPercent: 20,
            interestRate: 6.5,
            loanTerm: 30,
            hoaFees: 150,
        })

        calculateScenario(scenario)

        expect(scenario.downPayment).toBeCloseTo(60000, 6)
        expect(scenario.principal).toBeCloseTo(300000, 6)
        expect(scenario.totalHoa).toBeCloseTo(54000, 6)
        expect(scenario.monthlyPayment).toBeCloseTo(1666.9632563831167, 6)
        expect(scenario.totalInterest).toBeCloseTo(306106.77229792206, 6)
        expect(scenario.totalCost).toBeCloseTo(660106.772297922, 6)
        expect(scenario.requiredIncome).toBeCloseTo(60010.6772297922, 6)
    })

    it("returns the home price needed to match a target total cost", () => {
        const scenarioA = createScenario({
            homePrice: 300000,
            downPaymentPercent: 20,
            interestRate: 6.5,
            loanTerm: 30,
            hoaFees: 0,
        })
        calculateScenario(scenarioA)

        const matchedHomePrice = calculateHomePriceForTargetTotalCost(
            scenarioA.totalCost,
            6.5,
            30,
            20,
            10
        )

        const scenarioB = createScenario({
            homePrice: matchedHomePrice,
            downPaymentPercent: 10,
            interestRate: 6.5,
            loanTerm: 30,
            hoaFees: 20,
        })
        calculateScenario(scenarioB)

        expect(matchedHomePrice).toBeCloseTo(278833.587153564, 6)
        expect(scenarioB.totalCost).toBeCloseTo(scenarioA.totalCost, 6)
    })
})
