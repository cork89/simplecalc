import { CustomSliderEventDetail } from "./global"
import { formatCurrency } from "./store.js"


const radioButtons: NodeListOf<Element> = document.querySelectorAll('input[name="fileType"]')
const standardDeduction: HTMLElement = document.getElementById("standardDeduction") ?? (() => { throw new Error("standardDeduction cannot be null") })()
const taxableIncome: HTMLElement = document.getElementById("taxableIncome") ?? (() => { throw new Error("taxableIncome cannot be null") })()
const totalTaxes: HTMLElement = document.getElementById("totalTaxes") ?? (() => { throw new Error("totalTaxes cannot be null") })()
const taxChart = document.getElementById("taxChart") ?? (() => { throw new Error("taxChart cannot be null") })()

const ctx = (taxChart as HTMLCanvasElement).getContext("2d")

enum FilingType {
    SINGLE,
    MARRIED,
    HOH,
    MARRIEDSEP,
}

type BracketDetail = {
    min: number,
    max: number,
    rate: number,
    taxes: number,
}

type FilingTypeInfo = {
    standardDeduction: number,
    details: BracketDetail[],
}

type BracketInfo = Record<FilingType, FilingTypeInfo>;

const bracketInfo: BracketInfo = {
    [FilingType.SINGLE]: {
        standardDeduction: 15750,
        details: [
            {
                min: 0,
                max: 11925,
                rate: 0.1,
                taxes: 11925 * 0.1,
            },
            {
                min: 11926,
                max: 48475,
                rate: 0.12,
                taxes: (48475 - 11926) * 0.12,
            },
            {
                min: 48476,
                max: 103350,
                rate: 0.22,
                taxes: (103350 - 48476) * 0.22,
            },
            {
                min: 103351,
                max: 197300,
                rate: 0.24,
                taxes: (197300 - 103351) * 0.24
            },
            {
                min: 197301,
                max: 250525,
                rate: 0.32,
                taxes: (250525 - 197301) * 0.32,
            },
            {
                min: 250526,
                max: 626350,
                rate: 0.35,
                taxes: (626350 - 250526) * 0.35,
            },
            {
                min: 626351,
                max: 1000001,
                rate: 0.37,
                taxes: (1000000 - 626350) * 0.37,
            }
        ]
    },
    [FilingType.MARRIED]: {
        standardDeduction: 31500,
        details: [
            {
                min: 0,
                max: 23850,
                rate: 0.1,
                taxes: (23850 - 0) * 0.1,
            },
            {
                min: 23851,
                max: 96950,
                rate: 0.12,
                taxes: (96950 - 23851) * 0.12,
            },
            {
                min: 96951,
                max: 206700,
                rate: 0.22,
                taxes: (206700 - 96951) * 0.22,
            },
            {
                min: 206701,
                max: 394600,
                rate: 0.24,
                taxes: (394600 - 206701) * 0.24,
            },
            {
                min: 394601,
                max: 501050,
                rate: 0.32,
                taxes: (501050 - 394601) * 0.32,
            },
            {
                min: 501051,
                max: 751600,
                rate: 0.35,
                taxes: (751600 - 501051) * 0.35,
            },
            {
                min: 751601,
                max: 1000000,
                rate: 0.37,
                taxes: (1000000 - 751601) * 0.37,
            }
        ]
    },
    [FilingType.HOH]: {
        standardDeduction: 23625,
        details: [
            {
                min: 0,
                max: 17000,
                rate: 0.1,
                taxes: (17000 - 0) * 0.1,
            },
            {
                min: 17001,
                max: 64850,
                rate: 0.12,
                taxes: (64850 - 17001) * 0.12,
            },
            {
                min: 64851,
                max: 103350,
                rate: 0.22,
                taxes: (103350 - 64851) * 0.22,
            },
            {
                min: 103351,
                max: 197300,
                rate: 0.24,
                taxes: (197300 - 103351) * 0.24,
            },
            {
                min: 197301,
                max: 250500,
                rate: 0.32,
                taxes: (250500 - 197301) * 0.32,
            },
            {
                min: 250501,
                max: 626350,
                rate: 0.35,
                taxes: (626350 - 250501) * 0.35,
            },
            {
                min: 626351,
                max: 1000000,
                rate: 0.37,
                taxes: (1000000 - 626351) * 0.37,
            }

        ]
    },
    [FilingType.MARRIEDSEP]: {
        standardDeduction: 15750,
        details: [
            {
                min: 0,
                max: 11925,
                rate: 0.1,
                taxes: (11925 - 0) * 0.1,
            },
            {
                min: 11926,
                max: 48475,
                rate: 0.12,
                taxes: (48475 - 11926) * 0.12,
            },
            {
                min: 48476,
                max: 103350,
                rate: 0.22,
                taxes: (103350 - 48476) * 0.22,
            },
            {
                min: 103351,
                max: 197300,
                rate: 0.24,
                taxes: (197300 - 103351) * 0.24,
            },
            {
                min: 197301,
                max: 250525,
                rate: 0.32,
                taxes: (250525 - 197301) * 0.32,
            },
            {
                min: 250526,
                max: 375800,
                rate: 0.35,
                taxes: (375800 - 250526) * 0.35,
            },
            {
                min: 375801,
                max: 1000000,
                rate: 0.37,
                taxes: (1000000 - 375801) * 0.37,
            }
        ]
    },
}


type TaxStore = {
    annualIncome: number
    standardDeduction: number
    taxableIncome: number
    brackets: number[]
    totalTaxes: number
    filingType: FilingType
}


const taxStorageKey: string = "taxStore"
const taxLocationStorage: string | null = localStorage.getItem(taxStorageKey)
let taxStore: TaxStore
if (taxLocationStorage) {
    taxStore = JSON.parse(taxLocationStorage)
} else {
    taxStore = {
        annualIncome: 75000,
        standardDeduction: 15750,
        taxableIncome: 75000 - 15750,
        brackets: [
            bracketInfo[FilingType.SINGLE].details[0].taxes,
            bracketInfo[FilingType.SINGLE].details[1].taxes,
            (75000 - 15750 - bracketInfo[FilingType.SINGLE].details[2].min) * bracketInfo[FilingType.SINGLE].details[2].rate,
            0,
            0,
            0,
            0,
        ],
        totalTaxes: 7948.78,
        filingType: FilingType.SINGLE
    }
}

// function formatCurrency(amount: number): string {
//     return new Intl.NumberFormat("en-US", {
//         style: "currency",
//         currency: "USD",
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     }).format(amount);
// }

function updateCalculations(): void {
    taxStore.totalTaxes = 0
    for (let i = 0; i < bracketInfo[taxStore.filingType].details.length; ++i) {
        let bracketTax = 0
        if (taxStore.taxableIncome < bracketInfo[taxStore.filingType].details[i].max && taxStore.taxableIncome > bracketInfo[taxStore.filingType].details[i].min) {
            bracketTax = (taxStore.taxableIncome - bracketInfo[taxStore.filingType].details[i].min) * bracketInfo[taxStore.filingType].details[i].rate
        } else if (taxStore.taxableIncome > bracketInfo[taxStore.filingType].details[i].max) {
            bracketTax = bracketInfo[taxStore.filingType].details[i].taxes
        }
        taxStore.brackets[i] = bracketTax
        taxStore.totalTaxes += bracketTax
    }
    taxStore.standardDeduction = bracketInfo[taxStore.filingType].standardDeduction
    taxStore.taxableIncome = taxStore.annualIncome - taxStore.standardDeduction
    standardDeduction.textContent = formatCurrency(taxStore.standardDeduction)
    taxableIncome.textContent = formatCurrency(taxStore.taxableIncome)
    totalTaxes.textContent = formatCurrency(taxStore.totalTaxes)
    drawBarChart()
}

function drawBarChart() {
    if (!ctx) throw new Error("could not found canvas context")
    const canvas = taxChart as HTMLCanvasElement;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const brackets = taxStore.brackets;
    const bracketLabels = ["10%", "12%", "22%", "24%", "32%", "35%", "37%"];
    const colors = [
        "#4CAF50", "#2196F3", "#FF9800", "#F44336",
        "#9C27B0", "#607D8B", "#795548"
    ];

    const padding = 40
    const bottomPadding = 100
    const leftPadding = 100
    const chartWidth = canvas.width - leftPadding - padding
    const chartHeight = canvas.height - padding - bottomPadding
    const barWidth = chartWidth / brackets.length

    // Find max value for scaling
    const maxValue = Math.max(...brackets, 1)

    // Draw bars
    brackets.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight
        const x = leftPadding + index * barWidth + barWidth * 0.1
        const y = canvas.height - bottomPadding - barHeight
        const width = barWidth * 0.8

        ctx.fillStyle = colors[index]
        ctx.fillRect(x, y, width, barHeight)

        if (value > 0) {
            ctx.save()
            ctx.font = "12px Roboto"
            ctx.textAlign = "center"
            ctx.translate(x + width / 2, y - 5)
            ctx.rotate(-Math.PI / 6)

            const text = formatCurrency(value)
            const textMetrics = ctx.measureText(text)
            const textWidth = textMetrics.width
            const textHeight = 12
            const padding = 4

            // Draw background box
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
            ctx.fillRect(
                -textWidth / 2 - padding,
                -textHeight / 2 - padding,
                textWidth + padding * 2,
                textHeight + padding * 2
            )

            // Draw border
            ctx.strokeStyle = "#ccc"
            ctx.lineWidth = 1
            ctx.strokeRect(
                -textWidth / 2 - padding,
                -textHeight / 2 - padding,
                textWidth + padding * 2,
                textHeight + padding * 2
            )

            // Draw text
            ctx.fillStyle = "#333"
            ctx.fillText(text, 0, 4) // Slight vertical adjustment for centering
            ctx.restore()
        }

        // Draw bracket label
        ctx.fillStyle = "#333"
        ctx.font = "14px Roboto"
        ctx.textAlign = "center"
        ctx.fillText(
            bracketLabels[index],
            x + width / 2,
            canvas.height - bottomPadding + 20
        )
    })

    // Draw axes
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 2
    ctx.beginPath()
    // Y-axis
    ctx.moveTo(leftPadding, padding)
    ctx.lineTo(leftPadding, canvas.height - bottomPadding)
    // X-axis
    ctx.lineTo(canvas.width - padding, canvas.height - bottomPadding)
    ctx.stroke()

    // Y-axis labels and grid lines
    ctx.fillStyle = "#666"
    ctx.font = "12px Roboto"
    ctx.textAlign = "right"
    for (let i = 0; i <= 5; i++) {
        const value = (maxValue / 5) * i
        const y = canvas.height - bottomPadding - (chartHeight / 5) * i
        ctx.fillText(formatCurrency(value), leftPadding - 10, y + 4)

        // Grid lines
        if (i > 0) {
            ctx.strokeStyle = "#eee"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(leftPadding, y)
            ctx.lineTo(canvas.width - padding, y)
            ctx.stroke()
            ctx.strokeStyle = "#333" // Reset for axes
            ctx.lineWidth = 2
        }
    }

    // Y-axis label
    ctx.save()
    ctx.translate(20, canvas.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = "#333"
    ctx.font = "16px Roboto"
    ctx.textAlign = "center"
    ctx.fillText("Tax Amount", 0, 0)
    ctx.restore();

    // X-axis label
    ctx.fillStyle = "#333"
    ctx.font = "16px Roboto"
    ctx.textAlign = "center"
    ctx.fillText(
        "Tax Brackets",
        leftPadding + chartWidth / 2,
        canvas.height - 20
    )
}

document.body.addEventListener("slider-change", (event: CustomEvent<CustomSliderEventDetail>) => {
    if (event.detail.id == "grossIncome") {
        taxStore.annualIncome = parseInt(event.detail.value)
        updateCalculations()
    }
    localStorage.setItem(taxStorageKey, JSON.stringify(taxStore))
})

radioButtons.forEach((button: Element) => {
    button.addEventListener("change", (event: Event) => {
        const target = event.target as HTMLInputElement
        const selectedFilingType = target.value
        console.log(selectedFilingType)
        switch (selectedFilingType) {
            case "married":
                taxStore.filingType = FilingType.MARRIED;
                break;
            case "hoh":
                taxStore.filingType = FilingType.HOH;
                break;
            case "marriedsep":
                taxStore.filingType = FilingType.MARRIEDSEP;
                break;
            default:
                taxStore.filingType = FilingType.SINGLE;
        }
        // console.log(taxStore.filingType)
        updateCalculations()
        localStorage.setItem(taxStorageKey, JSON.stringify(taxStore))
        console.log(selectedFilingType)
    })
})

function convertFilingType(): string {
    switch (taxStore.filingType) {
        case FilingType.MARRIED:
            return "married";
        case FilingType.HOH:
            return "hoh"
        case FilingType.MARRIEDSEP:
            return "marriedsep"
        default:
            return "single";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const grossIncome: HTMLElement = document.getElementById("grossIncome") ?? (() => { throw new Error("grossIncome cannot be null") })()
    grossIncome.setAttribute("value", `${taxStore.annualIncome}`)

    const savedFilingType: string = convertFilingType()
    radioButtons.forEach((button) => {
        const btn = button as HTMLInputElement
        if (btn.value == savedFilingType) btn.checked = true
    })
})
updateCalculations()
