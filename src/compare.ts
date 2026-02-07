import { calculateMonthlyPayment, formatCurrency } from "./store.js";

interface ScenarioData {
    homePrice: number;
    interestRate: number;
    loanTerm: number;
    hoaFees: number;
    monthlyPayment: number;
    totalCost: number;
    totalInterest: number;
    totalHoa: number;
    principal: number;
    downPayment: number;
    requiredIncome: number;
}

const scenarioA: ScenarioData = {
    homePrice: 300000,
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
};

const scenarioB: ScenarioData = {
    homePrice: 350000,
    interestRate: 5.5,
    loanTerm: 30,
    hoaFees: 0,
    monthlyPayment: 0,
    totalCost: 0,
    totalInterest: 0,
    totalHoa: 0,
    principal: 0,
    downPayment: 0,
    requiredIncome: 0,
};

const monthlyPaymentA = document.getElementById("monthlyPaymentA") ?? (() => { throw new Error("monthlyPaymentA cannot be null"); })();
const monthlyPaymentB = document.getElementById("monthlyPaymentB") ?? (() => { throw new Error("monthlyPaymentB cannot be null"); })();

const downPaymentA = document.getElementById("downPaymentA") ?? (() => { throw new Error("downPaymentA cannot be null"); })();
const downPaymentB = document.getElementById("downPaymentB") ?? (() => { throw new Error("downPaymentB cannot be null"); })();

const barPrincipalA = document.getElementById("barPrincipalA") ?? (() => { throw new Error("barPrincipalA cannot be null"); })();
const barInterestA = document.getElementById("barInterestA") ?? (() => { throw new Error("barInterestA cannot be null"); })();
const barHoaA = document.getElementById("barHoaA") ?? (() => { throw new Error("barHoaA cannot be null"); })();
const barPrincipalB = document.getElementById("barPrincipalB") ?? (() => { throw new Error("barPrincipalB cannot be null"); })();
const barInterestB = document.getElementById("barInterestB") ?? (() => { throw new Error("barInterestB cannot be null"); })();
const barHoaB = document.getElementById("barHoaB") ?? (() => { throw new Error("barHoaB cannot be null"); })();

const legendPrincipalA = document.getElementById("legendPrincipalA") ?? (() => { throw new Error("legendPrincipalA cannot be null"); })();
const legendInterestA = document.getElementById("legendInterestA") ?? (() => { throw new Error("legendInterestA cannot be null"); })();
const legendHoaA = document.getElementById("legendHoaA") ?? (() => { throw new Error("legendHoaA cannot be null"); })();
const legendPrincipalB = document.getElementById("legendPrincipalB") ?? (() => { throw new Error("legendPrincipalB cannot be null"); })();
const legendInterestB = document.getElementById("legendInterestB") ?? (() => { throw new Error("legendInterestB cannot be null"); })();
const legendHoaB = document.getElementById("legendHoaB") ?? (() => { throw new Error("legendHoaB cannot be null"); })();

const totalCostA = document.getElementById("totalCostA") ?? (() => { throw new Error("totalCostA cannot be null"); })();
const totalCostB = document.getElementById("totalCostB") ?? (() => { throw new Error("totalCostB cannot be null"); })();

const monthlyDifference = document.getElementById("monthlyDifference") ?? (() => { throw new Error("monthlyDifference cannot be null"); })();
const totalDifference = document.getElementById("totalDifference") ?? (() => { throw new Error("totalDifference cannot be null"); })();
const interestDifference = document.getElementById("interestDifference") ?? (() => { throw new Error("interestDifference cannot be null"); })();
const incomeDifference = document.getElementById("incomeDifference") ?? (() => { throw new Error("incomeDifference cannot be null"); })();
const comparisonWinner = document.getElementById("comparisonWinner") ?? (() => { throw new Error("comparisonWinner cannot be null"); })();

function calculateScenario(scenario: ScenarioData): void {
    const downPayment = scenario.homePrice * 0.2;
    const loanAmount = scenario.homePrice - downPayment;

    const baseMonthlyPayment = calculateMonthlyPayment(loanAmount, scenario.interestRate, scenario.loanTerm);
    scenario.monthlyPayment = baseMonthlyPayment + scenario.hoaFees;
    scenario.totalCost = (baseMonthlyPayment * 12 * scenario.loanTerm) + downPayment + (scenario.hoaFees * 12 * scenario.loanTerm);
    scenario.totalInterest = (baseMonthlyPayment * 12 * scenario.loanTerm) - loanAmount;
    scenario.totalHoa = scenario.hoaFees * 12 * scenario.loanTerm;
    scenario.principal = downPayment + loanAmount;
    scenario.downPayment = downPayment;
    scenario.requiredIncome = scenario.monthlyPayment * 12 * 3;
}

function determineWinner(): string {
    const aScore = scenarioA.monthlyPayment + scenarioA.totalInterest + scenarioA.requiredIncome;
    const bScore = scenarioB.monthlyPayment + scenarioB.totalInterest + scenarioB.requiredIncome;
    
    if (aScore < bScore) return "Scenario A";
    if (bScore < aScore) return "Scenario B";
    return "Tie - Both equal";
}

function updateStackedBar(
    scenario: ScenarioData,
    barPrincipal: HTMLElement,
    barInterest: HTMLElement,
    barHoa: HTMLElement,
    legendPrincipal: HTMLElement,
    legendInterest: HTMLElement,
    legendHoa: HTMLElement,
    totalCostElement: HTMLElement
): void {
    const total = scenario.principal + scenario.totalInterest + scenario.totalHoa;
    
    if (total > 0) {
        const principalPercent = (scenario.principal / total) * 100;
        const interestPercent = (scenario.totalInterest / total) * 100;
        const hoaPercent = (scenario.totalHoa / total) * 100;
        
        barPrincipal.style.width = `${principalPercent}%`;
        barInterest.style.width = `${interestPercent}%`;
        barHoa.style.width = `${hoaPercent}%`;
    }
    
    legendPrincipal.textContent = formatCurrency(scenario.principal);
    legendInterest.textContent = formatCurrency(scenario.totalInterest);
    legendHoa.textContent = formatCurrency(scenario.totalHoa);
    totalCostElement.textContent = formatCurrency(total);
}

function updateComparison(): void {
    calculateScenario(scenarioA);
    calculateScenario(scenarioB);

    monthlyPaymentA.textContent = formatCurrency(scenarioA.monthlyPayment);
    monthlyPaymentB.textContent = formatCurrency(scenarioB.monthlyPayment);

    downPaymentA.textContent = formatCurrency(scenarioA.downPayment);
    downPaymentB.textContent = formatCurrency(scenarioB.downPayment);

    const monthlyDiff = Math.abs(scenarioA.monthlyPayment - scenarioB.monthlyPayment);
    const totalDiff = Math.abs(scenarioA.totalCost - scenarioB.totalCost);
    const interestDiff = Math.abs(scenarioA.totalInterest - scenarioB.totalInterest);
    const incomeDiff = Math.abs(scenarioA.requiredIncome - scenarioB.requiredIncome);

    monthlyDifference.textContent = formatCurrency(monthlyDiff);
    totalDifference.textContent = formatCurrency(totalDiff);
    interestDifference.textContent = formatCurrency(interestDiff);
    incomeDifference.textContent = formatCurrency(incomeDiff) + "/year";
    
    comparisonWinner.textContent = determineWinner();

    updateStackedBar(
        scenarioA,
        barPrincipalA,
        barInterestA,
        barHoaA,
        legendPrincipalA,
        legendInterestA,
        legendHoaA,
        totalCostA
    );

    updateStackedBar(
        scenarioB,
        barPrincipalB,
        barInterestB,
        barHoaB,
        legendPrincipalB,
        legendInterestB,
        legendHoaB,
        totalCostB
    );
}

document.body.addEventListener("slider-change", (event) => {
    const customEvent = event as CustomEvent<{ value: string; id: string }>;
    
    if (customEvent.detail.id === "homePriceA") {
        scenarioA.homePrice = parseInt(customEvent.detail.value);
    } else if (customEvent.detail.id === "interestRateA") {
        scenarioA.interestRate = parseFloat(customEvent.detail.value);
    } else if (customEvent.detail.id === "hoaFeesA") {
        scenarioA.hoaFees = parseInt(customEvent.detail.value);
    } else if (customEvent.detail.id === "homePriceB") {
        scenarioB.homePrice = parseInt(customEvent.detail.value);
    } else if (customEvent.detail.id === "interestRateB") {
        scenarioB.interestRate = parseFloat(customEvent.detail.value);
    } else if (customEvent.detail.id === "hoaFeesB") {
        scenarioB.hoaFees = parseInt(customEvent.detail.value);
    }
    
    updateComparison();
});

const loanTermRadioButtonsA = document.querySelectorAll('input[name="loanTermA"]');
loanTermRadioButtonsA.forEach((button) => {
    button.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        scenarioA.loanTerm = parseInt(target.value);
        updateComparison();
    });
});

const loanTermRadioButtonsB = document.querySelectorAll('input[name="loanTermB"]');
loanTermRadioButtonsB.forEach((button) => {
    button.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        scenarioB.loanTerm = parseInt(target.value);
        updateComparison();
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const homePriceA = document.getElementById("homePriceA");
    const interestRateA = document.getElementById("interestRateA");
    const hoaFeesA = document.getElementById("hoaFeesA");
    const homePriceB = document.getElementById("homePriceB");
    const interestRateB = document.getElementById("interestRateB");
    const hoaFeesB = document.getElementById("hoaFeesB");

    if (homePriceA) homePriceA.setAttribute("value", `${scenarioA.homePrice}`);
    if (interestRateA) interestRateA.setAttribute("value", `${scenarioA.interestRate}`);
    if (hoaFeesA) hoaFeesA.setAttribute("value", `${scenarioA.hoaFees}`);
    if (homePriceB) homePriceB.setAttribute("value", `${scenarioB.homePrice}`);
    if (interestRateB) interestRateB.setAttribute("value", `${scenarioB.interestRate}`);
    if (hoaFeesB) hoaFeesB.setAttribute("value", `${scenarioB.hoaFees}`);

    loanTermRadioButtonsA.forEach((button) => {
        const btn = button as HTMLInputElement;
        if (parseInt(btn.value) === scenarioA.loanTerm) btn.checked = true;
    });

    loanTermRadioButtonsB.forEach((button) => {
        const btn = button as HTMLInputElement;
        if (parseInt(btn.value) === scenarioB.loanTerm) btn.checked = true;
    });

    updateComparison();
});

updateComparison();
