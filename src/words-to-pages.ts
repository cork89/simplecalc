import { initializeStores, saveStore, wordsToPagesStorageKey, wordsToPagesStore } from "./store.js"

const wordCountSlider: HTMLElement = document.getElementById("wordCountSlider") ?? (() => { throw new Error("wordCountSlider cannot be null") })()
const wordsPerPageSlider: HTMLElement = document.getElementById("wordsPerPageSlider") ?? (() => { throw new Error("wordsPerPageSlider cannot be null") })()
const result: HTMLElement = document.getElementById("result") ?? (() => { throw new Error("result cannot be null") })()

function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-US").format(value)
}

function calculatePages(): void {
    const { wordCount, wordsPerPage } = wordsToPagesStore

    if (!wordCount || wordCount <= 0) {
        result.textContent = "Please enter a valid word count"
        result.className = "result error"
        return
    }

    if (!wordsPerPage || wordsPerPage <= 0) {
        result.textContent = "Please enter a valid words-per-page value"
        result.className = "result error"
        return
    }

    const pages = wordCount / wordsPerPage
    const roundedPages = Math.round(pages * 10) / 10

    result.className = "result"
    result.textContent = `${formatNumber(wordCount)} words ≈ ${formatNumber(roundedPages)} pages (at ~${wordsPerPage} words/page)`
    saveStore(wordsToPagesStore, wordsToPagesStorageKey)
}

document.body.addEventListener("slider-change", (event: CustomEvent<CustomSliderEventDetail>) => {
    if (event.detail.id === "wordCountSlider") {
        wordsToPagesStore.wordCount = parseInt(event.detail.value)
    } else if (event.detail.id === "wordsPerPageSlider") {
        wordsToPagesStore.wordsPerPage = parseInt(event.detail.value)
    }
    calculatePages()
})

function initializePage(): void {
    wordCountSlider.setAttribute("value", `${wordsToPagesStore.wordCount}`)
    wordsPerPageSlider.setAttribute("value", `${wordsToPagesStore.wordsPerPage}`)
    calculatePages()
}

void initializeStores().then(initializePage)
