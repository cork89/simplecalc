import { ageStorageKey, ageStore, saveStore } from "./store.js"

const ageSlider: HTMLElement = document.getElementById('ageSlider') ?? (() => { throw new Error("ageSlider cannot be null") })()
const yearSlider: HTMLElement = document.getElementById('yearSlider') ?? (() => { throw new Error("yearSlider cannot be null") })()
const result: HTMLElement = document.getElementById('result') ?? (() => { throw new Error("result cannot be null") })()

const currentYear = 2025;

function calculateAge() {
    if (!ageStore.age || ageStore.age < 0) {
        result.textContent = 'Please enter a valid age';
        result.className = 'result error';
        return;
    }

    const birthYear = currentYear - ageStore.age;
    const ageInSelectedYear = ageStore.year - birthYear;

    result.className = 'result';

    if (ageInSelectedYear < 0) {
        result.textContent = `Not born yet (would be born in ${birthYear})`;
    } else if (ageInSelectedYear === 0) {
        result.textContent = `Birth year!`;
    } else {
        result.textContent = `Age in ${ageStore.year}: ~${ageInSelectedYear} years old`;
    }
    saveStore(ageStore, ageStorageKey)
}

// Event listeners
document.body.addEventListener("slider-change", (event: CustomEvent<CustomSliderEventDetail>) => {
    if (event.detail.id == "ageSlider") {
        ageStore.age = parseInt(event.detail.value)
    } else if (event.detail.id == "yearSlider") {
        ageStore.year = parseInt(event.detail.value)
    }
    calculateAge()
})

document.addEventListener("DOMContentLoaded", () => {
    ageSlider.setAttribute("value", `${ageStore.age}`)
    yearSlider.setAttribute("value", `${ageStore.year}`)
})

calculateAge()