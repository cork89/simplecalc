import { formatCurrency, formatCurrencyShort, saveStore } from "./store.js"

type AgChartInstance = {
    destroy?: () => void
    update: (options: AgChartOptions) => Promise<void>
}

type AgChartOptions = {
    container: HTMLElement
    data: Point[]
    series: Array<Record<string, unknown>>
    axes: Record<string, Record<string, unknown>>
    theme?: Record<string, unknown>
    legend?: Record<string, unknown>
}

declare const agCharts: {
    AgCharts: {
        create: (options: AgChartOptions) => AgChartInstance
    }
}

const age: HTMLElement = document.getElementById("age") ?? (() => { throw new Error("age cannot be null") })()
const nestEgg: HTMLElement = document.getElementById("nestEgg") ?? (() => { throw new Error("nestEgg cannot be null") })()
const returnRate: HTMLElement = document.getElementById("returnRate") ?? (() => { throw new Error("returnRate cannot be null") })()
const budget: HTMLElement = document.getElementById("budget") ?? (() => { throw new Error("budget cannot be null") })()
const retirementChart: HTMLElement = document.getElementById("retirementChart") ?? (() => { throw new Error("retirementChart cannot be null") })()

let quarterlyRate: number = 1
let withdrawalPerQuarter: number = 1
let chart: AgChartInstance | null = null

type RetirementStore = {
    age: number
    nestEgg: number
    returnRate: number
    budget: number
}

type Point = { age: number; money: number }

const retirementStorageKey: string = "retirementStore"
const retirementLocationStorage: string | null = localStorage.getItem(retirementStorageKey)
let retirementStore: RetirementStore
if (retirementLocationStorage) {
    retirementStore = JSON.parse(retirementLocationStorage)
} else {
    retirementStore = {
        age: 50,
        nestEgg: 1000000,
        returnRate: 8,
        budget: 3000
    }
}

// 2.31% annual inflation rate
const inflationRate = 0.0231 / 4

const state: { series: Point[] } = {
    series: []
}

function calc(money: number, year: number): number {
    let next = money
    const inflationMultiplier = Math.pow(1 + inflationRate, year * 4)
    const adjustedWithdrawalPerQuarter = withdrawalPerQuarter * inflationMultiplier

    for (let i = 0; i < 4; ++i) {
        next = next * (1 + quarterlyRate) - adjustedWithdrawalPerQuarter
    }

    if (next < 0) next = 0
    return next
}

function simulateAndDraw(): void {
    const startAge = retirementStore.age
    const endAge = 100
    const startMoney = retirementStore.nestEgg

    state.series = simulate(
        startAge,
        endAge,
        startMoney,
        calc
    )

    draw()
}

function simulate(
    startAge: number,
    endAge: number,
    startMoney: number,
    calcFn: (money: number, year: number) => number
): Point[] {
    const series: Point[] = []
    let age: number = startAge
    let money: number = startMoney
    series.push({ age, money })

    const nSteps = Math.max(
        1,
        endAge - startAge
    )

    for (let i = 0; i < nSteps; i++) {
        const next = calcFn(money, i)
        age = age + 1
        money = next
        series.push({ age, money })
    }
    return series
}

function getChartOptions(): AgChartOptions {
    return {
        container: retirementChart,
        data: state.series,
        series: [
            {
                type: "line",
                xKey: "age",
                yKey: "money",
                yName: "Money",
                stroke: "#4CAF50",
                marker: {
                    enabled: false
                },
                tooltip: {
                    renderer: ({ datum }: { datum: Point }) => ({
                        title: `Age: ${datum.age}`,
                        content: `Money: ${formatCurrency(datum.money)}`
                    })
                }
            }
        ],
        axes: {
            x: {
                type: "number",
                position: "bottom",
                title: {
                    text: "Age (years)"
                },
                label: {
                    formatter: ({ value }: { value: number }) => Number(value).toFixed(0)
                }
            },
            y: {
                type: "number",
                position: "left",
                title: {
                    text: "Nest Egg (USD)"
                },
                label: {
                    formatter: ({ value }: { value: number }) => formatCurrencyShort(value)
                }
            }
        },
        theme: {
            params: {
                accentColor: "#4CAF50"
            },
            palette: {
                fills: ["#4CAF50"],
                strokes: ["#4CAF50"]
            },
            overrides: {
                line: {
                    series: {
                        styler: () => ({ stroke: "#4CAF50" })
                    }
                }
            }
        },
        legend: {
            enabled: false
        }
    }
}

function draw(): void {
    const options = getChartOptions()
    if (chart) {
        void chart.update(options)
        return
    }
    chart = agCharts.AgCharts.create(options)
}

document.body.addEventListener("slider-change", (event: CustomEvent<CustomSliderEventDetail>) => {
    if (event.detail.id == "age") {
        retirementStore.age = parseInt(event.detail.value)
    } else if (event.detail.id == "nestEgg") {
        retirementStore.nestEgg = parseFloat(event.detail.value)
    } else if (event.detail.id == "returnRate") {
        retirementStore.returnRate = parseFloat(event.detail.value)
        quarterlyRate = retirementStore.returnRate / 100 / 4
    } else if (event.detail.id == "budget") {
        retirementStore.budget = parseFloat(event.detail.value)
        withdrawalPerQuarter = retirementStore.budget * 3
    }
    saveStore(retirementStore, retirementStorageKey)
    simulateAndDraw()
})

document.addEventListener("DOMContentLoaded", () => {
    age.setAttribute("value", `${retirementStore.age}`)
    nestEgg.setAttribute("value", `${retirementStore.nestEgg}`)
    returnRate.setAttribute("value", `${retirementStore.returnRate}`)
    budget.setAttribute("value", `${retirementStore.budget}`)
    quarterlyRate = retirementStore.returnRate / 100 / 4
    withdrawalPerQuarter = retirementStore.budget * 3
    simulateAndDraw()
})
