import { compareStore, formatCurrency, initializeStores, updateCompareStore, updateStore } from "./store.js";
import { calculateHomePriceForTargetTotalCost, calculateScenario } from "./compare-calculations.js";
import { type ScenarioData } from "./types.js";

const scenarioA: ScenarioData = {
    homePrice: compareStore.homePriceA,
    downPaymentPercent: compareStore.downPaymentPercentA ?? 20,
    interestRate: compareStore.interestRate,
    loanTerm: compareStore.loanTermA,
    hoaFees: compareStore.hoaFeesA,
    monthlyPayment: 0,
    totalCost: 0,
    totalInterest: 0,
    totalHoa: 0,
    principal: 0,
    downPayment: 0,
    requiredIncome: 0,
};

const scenarioB: ScenarioData = {
    homePrice: compareStore.homePriceB,
    downPaymentPercent: compareStore.downPaymentPercentB ?? 20,
    interestRate: compareStore.interestRate,
    loanTerm: compareStore.loanTermB,
    hoaFees: compareStore.hoaFeesB,
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
const downPaymentLabelA = document.getElementById("downPaymentLabelA") ?? (() => { throw new Error("downPaymentLabelA cannot be null"); })();
const downPaymentLabelB = document.getElementById("downPaymentLabelB") ?? (() => { throw new Error("downPaymentLabelB cannot be null"); })();

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
const matchScenarioBButton = document.getElementById("matchScenarioBButton") ?? (() => { throw new Error("matchScenarioBButton cannot be null"); })();

const homePriceASlider = document.getElementById("homePriceA") ?? (() => { throw new Error("homePriceA cannot be null"); })();
const downPaymentPercentASlider = document.getElementById("downPaymentPercentA") ?? (() => { throw new Error("downPaymentPercentA cannot be null"); })();
const interestRateSlider = document.getElementById("interestRate") ?? (() => { throw new Error("interestRate cannot be null"); })();
const hoaFeesASlider = document.getElementById("hoaFeesA") ?? (() => { throw new Error("hoaFeesA cannot be null"); })();
const homePriceBSlider = document.getElementById("homePriceB") ?? (() => { throw new Error("homePriceB cannot be null"); })();
const downPaymentPercentBSlider = document.getElementById("downPaymentPercentB") ?? (() => { throw new Error("downPaymentPercentB cannot be null"); })();
const hoaFeesBSlider = document.getElementById("hoaFeesB") ?? (() => { throw new Error("hoaFeesB cannot be null"); })();

function syncScenarioControls(): void {
    homePriceASlider.setAttribute("value", `${scenarioA.homePrice}`);
    downPaymentPercentASlider.setAttribute("value", `${scenarioA.downPaymentPercent}`);
    interestRateSlider.setAttribute("value", `${scenarioA.interestRate}`);
    hoaFeesASlider.setAttribute("value", `${scenarioA.hoaFees}`);
    homePriceBSlider.setAttribute("value", `${scenarioB.homePrice}`);
    downPaymentPercentBSlider.setAttribute("value", `${scenarioB.downPaymentPercent}`);
    hoaFeesBSlider.setAttribute("value", `${scenarioB.hoaFees}`);
}

function clampHomePriceToSliderRange(homePrice: number): number {
    const min = parseInt(homePriceBSlider.getAttribute("min") ?? "100000");
    const max = parseInt(homePriceBSlider.getAttribute("max") ?? "800000");

    return Math.min(Math.max(homePrice, min), max);
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

    downPaymentLabelA.textContent = `Down Payment (${scenarioA.downPaymentPercent}%):`;
    downPaymentLabelB.textContent = `Down Payment (${scenarioB.downPaymentPercent}%):`;
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

matchScenarioBButton.addEventListener("click", () => {
    scenarioB.hoaFees = 20;

    const matchingHomePrice = calculateHomePriceForTargetTotalCost(
        scenarioA.totalCost,
        scenarioB.interestRate,
        scenarioB.loanTerm,
        scenarioB.hoaFees,
        scenarioB.downPaymentPercent
    );

    scenarioB.homePrice = clampHomePriceToSliderRange(Math.round(matchingHomePrice / 10000) * 10000);

    updateCompareStore({
        hoaFeesB: scenarioB.hoaFees,
        homePriceB: scenarioB.homePrice,
    });

    syncScenarioControls();
    updateComparison();
});

document.body.addEventListener("slider-change", (event) => {
    const customEvent = event as CustomEvent<{ value: string; id: string }>;
    
    if (customEvent.detail.id === "homePriceA") {
        scenarioA.homePrice = parseInt(customEvent.detail.value);
        updateCompareStore({ homePriceA: scenarioA.homePrice });
    } else if (customEvent.detail.id === "downPaymentPercentA") {
        scenarioA.downPaymentPercent = parseFloat(customEvent.detail.value);
        updateCompareStore({ downPaymentPercentA: scenarioA.downPaymentPercent });
    } else if (customEvent.detail.id === "hoaFeesA") {
        scenarioA.hoaFees = parseInt(customEvent.detail.value);
        updateCompareStore({ hoaFeesA: scenarioA.hoaFees });
    } else if (customEvent.detail.id === "homePriceB") {
        scenarioB.homePrice = parseInt(customEvent.detail.value);
        updateCompareStore({ homePriceB: scenarioB.homePrice });
    } else if (customEvent.detail.id === "downPaymentPercentB") {
        scenarioB.downPaymentPercent = parseFloat(customEvent.detail.value);
        updateCompareStore({ downPaymentPercentB: scenarioB.downPaymentPercent });
    } else if (customEvent.detail.id === "hoaFeesB") {
        scenarioB.hoaFees = parseInt(customEvent.detail.value);
        updateCompareStore({ hoaFeesB: scenarioB.hoaFees });
    } else if (customEvent.detail.id === "interestRate") {
        const interestRate = parseFloat(customEvent.detail.value);
        scenarioA.interestRate = interestRate;
        scenarioB.interestRate = interestRate;
        updateCompareStore({ interestRate });
        updateStore({ interestRate });
    }
    
    updateComparison();
});

const loanTermRadioButtonsA = document.querySelectorAll('input[name="loanTermA"]');
loanTermRadioButtonsA.forEach((button) => {
    button.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        scenarioA.loanTerm = parseInt(target.value);
        updateCompareStore({ loanTermA: scenarioA.loanTerm });
        updateComparison();
    });
});

const loanTermRadioButtonsB = document.querySelectorAll('input[name="loanTermB"]');
loanTermRadioButtonsB.forEach((button) => {
    button.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        scenarioB.loanTerm = parseInt(target.value);
        updateCompareStore({ loanTermB: scenarioB.loanTerm });
        updateComparison();
    });
});

document.addEventListener("DOMContentLoaded", () => {
    void initializeStores().then(initializePage);
});

function initializePage(): void {
    scenarioA.homePrice = compareStore.homePriceA;
    scenarioA.downPaymentPercent = compareStore.downPaymentPercentA ?? 20;
    scenarioA.interestRate = compareStore.interestRate;
    scenarioA.loanTerm = compareStore.loanTermA;
    scenarioA.hoaFees = compareStore.hoaFeesA;

    scenarioB.homePrice = compareStore.homePriceB;
    scenarioB.downPaymentPercent = compareStore.downPaymentPercentB ?? 20;
    scenarioB.interestRate = compareStore.interestRate;
    scenarioB.loanTerm = compareStore.loanTermB;
    scenarioB.hoaFees = compareStore.hoaFeesB;

    updateCompareStore({
        downPaymentPercentA: scenarioA.downPaymentPercent,
        downPaymentPercentB: scenarioB.downPaymentPercent,
    });

    syncScenarioControls();

    loanTermRadioButtonsA.forEach((button) => {
        const btn = button as HTMLInputElement;
        if (parseInt(btn.value) === scenarioA.loanTerm) btn.checked = true;
    });

    loanTermRadioButtonsB.forEach((button) => {
        const btn = button as HTMLInputElement;
        if (parseInt(btn.value) === scenarioB.loanTerm) btn.checked = true;
    });

    updateComparison();
}
