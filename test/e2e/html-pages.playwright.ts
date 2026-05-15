import { afterEach, describe, expect, test } from "vitest"

type PageCase = {
    fileName: string
    title: string
    heading: string | RegExp
    initialText: Array<string | RegExp>
    sliderChanges?: Record<string, string>
    changedText?: Array<string | RegExp>
    changedSliderText?: Record<string, string>
}

const pageCases: PageCase[] = [
    {
        fileName: "index.html",
        title: "Simple Calc",
        heading: "Simple Calculators",
        initialText: ["approximately, everything you need", "Age", "Mortgage", "Student Loans", "Tax", "Retirement"],
    },
    {
        fileName: "age.html",
        title: "Age Calculator",
        heading: "Age Calculator",
        initialText: [/Age in 2025: ~25 years old/],
        sliderChanges: {
            ageSlider: "40",
            yearSlider: "2030",
        },
        changedText: [/Age in 2030: ~45 years old/],
    },
    {
        fileName: "rule1.html",
        title: "Mortgage Calculator",
        heading: "Mortgage Calculator",
        initialText: ["Monthly Income:", "$6,250", "Max Monthly Payment:", "$1,750", "Maximum Loan Amount:", "$276,869"],
        sliderChanges: {
            grossIncome: "120000",
        },
        changedText: ["$10,000", "$2,800", "$442,990"],
    },
    {
        fileName: "rule2.html",
        title: "Mortgage Calculator",
        heading: "Mortgage Calculator",
        initialText: ["Home Price:", "$300,000", "Monthly Payment:", "$1,517", "Required Annual Income:", "$54,611"],
        sliderChanges: {
            homePrice: "400000",
        },
        changedText: ["$400,000", "$2,023", "$808,142", "$72,814", "$80,000", "$40,000", "$120,000"],
    },
    {
        fileName: "compare.html",
        title: "Mortgage Comparison Calculator",
        heading: "Mortgage Comparison Calculator",
        initialText: ["Monthly Payment Difference:", "$253", "Total Cost Difference:", "$101,018", "Winner:", "Scenario A"],
        sliderChanges: {
            homePriceB: "500000",
        },
        changedText: ["$1,011", "$404,071", "$204,071", "$36,407/year"],
    },
    {
        fileName: "student.html",
        title: "Student Loans Calculator",
        heading: "Student Loans Calculator",
        initialText: ["Interest Accrued:", "$14,503", "Monthly Payment Required:", "$454"],
        sliderChanges: {
            loanAmount: "60000",
        },
        changedText: ["$21,755", "$681"],
    },
    {
        fileName: "student-compare.html",
        title: "Student Loans vs 401k Comparison",
        heading: "Repaying Loans vs Contributing to 401k Comparison",
        initialText: ["Loan Interest Accrued:", "$14,503", "Total Contributions After", "Contributions minus Interest:"],
        sliderChanges: {
            loanAmount: "60000",
            annualSalary: "100000",
            employerMatchRate: "5",
        },
        changedText: ["$21,755", "$155,905", "$134,150"],
    },
    {
        fileName: "tax.html",
        title: "Tax Calculator",
        heading: "Marginal Tax Calculator",
        initialText: ["Standard Deduction:", "$15,750", "Taxable Income:", "$59,250", "Total Taxes Owed:", "$7,949"],
        sliderChanges: {
            grossIncome: "100000",
        },
        changedText: ["$84,250", "$13,449"],
    },
    {
        fileName: "retirement.html",
        title: "Retirement Calculator",
        heading: "Retirement Calculator",
        initialText: ["Retirement Runway"],
        sliderChanges: {
            budget: "5000",
        },
        changedSliderText: {
            budget: "$5,000",
        },
    },
]

function addErrorCapture(html: string): string {
    const errorCaptureScript = `<script>
        localStorage.clear();
        window.__testErrors = [];
        window.addEventListener("error", (event) => {
            window.__testErrors.push(event.message || String(event.error));
        });
        window.addEventListener("unhandledrejection", (event) => {
            window.__testErrors.push(event.reason?.message || String(event.reason));
        });
        const originalConsoleError = console.error.bind(console);
        console.error = (...args) => {
            window.__testErrors.push(args.map(String).join(" "));
            originalConsoleError(...args);
        };
    </script>`

    return html
        .replace("<head>", `<head><base href="/dist/">${errorCaptureScript}`)
        .replace(
            /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/ag-charts-community\/dist\/umd\/ag-charts-community\.js"><\/script>/,
            `<script>window.agCharts = { AgCharts: { create: () => ({ update: async () => undefined }) } };</script>`
        )
        .replace(
            /<script defer data-domain="calc\.hearteyesemoji\.dev"\s+src="https:\/\/plausible\.hearteyesemoji\.dev\/js\/script\.js"><\/script>/g,
            ""
        )
}

function getFrameDocument(frame: HTMLIFrameElement): Document {
    return frame.contentDocument ?? (() => { throw new Error("frame document cannot be null") })()
}

function getFrameErrors(frame: HTMLIFrameElement): string[] {
    const frameWindow = frame.contentWindow as (Window & { __testErrors?: string[] }) | null
    return frameWindow?.__testErrors ?? []
}

function getVisibleText(document: Document, text: string | RegExp): string | null {
    const elements = Array.from(document.body.querySelectorAll("*"))
    for (const element of elements) {
        const htmlElement = element as HTMLElement
        const elementText = htmlElement.textContent ?? ""
        const isMatch = typeof text === "string" ? elementText.includes(text) : text.test(elementText)

        if (isMatch && htmlElement.offsetParent !== null) {
            return elementText
        }
    }

    return null
}

function getSliderInput(document: Document, id: string): HTMLInputElement {
    const slider = document.getElementById(id) ?? (() => { throw new Error(`${id} cannot be null`) })()
    return slider.shadowRoot?.querySelector("input[type='range']") ?? (() => { throw new Error(`${id} input cannot be null`) })()
}

function getSliderDisplay(document: Document, id: string): string {
    const slider = document.getElementById(id) ?? (() => { throw new Error(`${id} cannot be null`) })()
    return slider.shadowRoot?.querySelector(".value-display")?.textContent ?? ""
}

async function deleteStoreDatabase(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase("simpleCalcStore")

        request.onsuccess = () => {
            resolve()
        }

        request.onerror = () => {
            reject(request.error ?? new Error("Failed to delete store database"))
        }

        request.onblocked = () => {
            reject(new Error("Deleting store database was blocked"))
        }
    })
}

async function changeSlider(document: Document, id: string, value: string): Promise<void> {
    const input = getSliderInput(document, id)
    input.value = value
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }))

    await new Promise<void>((resolve) => {
        setTimeout(resolve, 0)
    })
}

async function waitForVisibleText(document: Document, text: string | RegExp): Promise<void> {
    await expect.poll(() => getVisibleText(document, text), {
        message: `Missing visible text: ${text}`,
    }).not.toBeNull()
}

let frame: HTMLIFrameElement | null = null

afterEach(() => {
    frame?.remove()
    frame = null
})

describe("static HTML pages", () => {
    for (const pageCase of pageCases) {
        test(`${pageCase.fileName} renders without runtime errors`, async () => {
            await deleteStoreDatabase()

            const response = await fetch(`/dist/${pageCase.fileName}`)
            const html = await response.text()

            frame = document.createElement("iframe")
            frame.style.width = "1280px"
            frame.style.height = "720px"
            frame.srcdoc = addErrorCapture(html)
            document.body.append(frame)

            await new Promise<void>((resolve) => {
                frame?.addEventListener("load", () => resolve(), { once: true })
            })

            const frameDocument = getFrameDocument(frame)
            const heading = frameDocument.querySelector("h1")

            expect(frameDocument.title).toBe(pageCase.title)
            expect(heading?.textContent?.trim()).toMatch(pageCase.heading)
            for (const text of pageCase.initialText) {
                await waitForVisibleText(frameDocument, text)
            }
            expect(getFrameErrors(frame)).toEqual([])

            for (const [id, value] of Object.entries(pageCase.sliderChanges ?? {})) {
                await changeSlider(frameDocument, id, value)
            }

            for (const text of pageCase.changedText ?? []) {
                await waitForVisibleText(frameDocument, text)
            }

            for (const [id, text] of Object.entries(pageCase.changedSliderText ?? {})) {
                expect(getSliderDisplay(frameDocument, id)).toBe(text)
            }

            expect(getFrameErrors(frame)).toEqual([])
        })
    }
})
