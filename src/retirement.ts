import { formatCurrency, saveStore } from "./store.js"

const age: HTMLElement = document.getElementById("age") ?? (() => { throw new Error("age cannot be null") })()
const nestEgg: HTMLElement = document.getElementById("nestEgg") ?? (() => { throw new Error("nestEgg cannot be null") })()
const returnRate: HTMLElement = document.getElementById("returnRate") ?? (() => { throw new Error("returnRate cannot be null") })()
const budget: HTMLElement = document.getElementById("budget") ?? (() => { throw new Error("budget cannot be null") })()
const retirementChart = document.getElementById("retirementChart") ?? (() => { throw new Error("retirementChart cannot be null") })()
const tip = document.getElementById("tip") ?? (() => { throw new Error("tip cannot be null") })()

let quarterlyRate: number = 1
let withdrawalPerQuarter: number = 1

const ctx = (retirementChart as HTMLCanvasElement).getContext("2d", { alpha: true })


type RetirementStore = {
    age: number
    nestEgg: number
    returnRate: number
    budget: number
}


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

type Point = { age: number; money: number }

// 2.31% annual inflation rate
const inflationRate = 0.0231 / 4;

function calc(money: number, year: number): number {
    let next = money;
    const inflationMultiplier = Math.pow(1 + inflationRate, year * 4);
    const adjustedWithdrawalPerQuarter = withdrawalPerQuarter * inflationMultiplier;

    for (let i = 0; i < 4; ++i) {
        next = next * (1 + quarterlyRate) - adjustedWithdrawalPerQuarter;
    }

    if (next < 0) next = 0;
    return next;
}

// ===================================================

const margin = { top: 24, right: 24, bottom: 48, left: 90 };

const state: { series: Point[]; xMin: number; xMax: number; yMin: number; yMax: number } = {
    series: [],
    xMin: 0,
    xMax: 0,
    yMin: 0,
    yMax: 0,
};


retirementChart.addEventListener("mousemove", (e: MouseEvent) => {
    const rect = retirementChart.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    const { invX } = scales();
    const age = invX(x / dpr);
    const nearest = nearestPoint(age, state.series);
    if (!nearest) {
        tip.style.display = "none";
        draw(); // clear hover
        return;
    }

    draw(nearest);

    // Position tooltip near mouse cursor (viewport pixels)
    tip.textContent =
        `Age: ${nearest.age} | ` +
        `Money: ${formatCurrency(nearest.money)}`;
    tip.style.position = "fixed";
    const offset = 12;
    tip.style.left = `${e.clientX + offset}px`;
    tip.style.top = `${e.clientY + offset}px`;
    tip.style.display = "block";
});

retirementChart.addEventListener("mouseleave", () => {
    tip.style.display = "none";
    draw();
});

function simulateAndDraw(): void {
    const startAge = retirementStore.age;
    const endAge = 100;
    const startMoney = retirementStore.nestEgg

    state.series = simulate(
        startAge,
        endAge,
        startMoney,
        calc
    );

    // Y extent from data with padding
    let yMin = Math.min(...state.series.map((d) => d.money));
    let yMax = Math.max(...state.series.map((d) => d.money));
    if (!isFinite(yMin) || !isFinite(yMax)) {
        yMin = 0;
        yMax = 1;
    }
    const pad = (yMax - yMin) * 0.1 || 1;
    state.yMin = Math.max(0, yMin - pad);
    state.yMax = yMax + pad;

    state.xMin = startAge;
    state.xMax = endAge;

    draw();
}

function simulate(
    startAge: number,
    endAge: number,
    startMoney: number,
    calcFn: (money: number) => number
): Point[] {
    const series: Point[] = [];
    let age: number = startAge;
    let money: number = startMoney;
    series.push({ age, money });

    const nSteps = Math.max(
        1,
        endAge - startAge
    );

    for (let i = 0; i < nSteps; i++) {
        const next = calcFn(money, i);
        age = age + 1
        money = next
        series.push({ age, money });
    }
    return series;
}


function scales(): {
    x: (v: number) => number;
    y: (v: number) => number;
    invX: (px: number) => number;
    invY: (py: number) => number;
    plotW: number;
    plotH: number;
} {
    const plotW = retirementChart.clientWidth - margin.left - margin.right;
    const plotH = retirementChart.clientHeight - margin.top - margin.bottom;

    const xMin = state.xMin;
    const xMax = state.xMax;
    const yMin = state.yMin;
    const yMax = state.yMax;

    const x = (v: number) =>
        margin.left +
        ((v - xMin) / (xMax - xMin)) * plotW;
    const y = (v: number) =>
        margin.top +
        plotH -
        ((v - yMin) / (yMax - yMin)) * plotH;

    const invX = (px: number) =>
        xMin + ((px - margin.left) / plotW) * (xMax - xMin);
    const invY = (py: number) => {
        const t =
            (py - margin.top) / plotH;
        return yMin + (1 - t) * (yMax - yMin);
    };

    return { x, y, invX, invY, plotW, plotH };
}

function draw(hoverPoint: Point | null = null): void {
    const w = retirementChart.clientWidth;
    const h = retirementChart.clientHeight;
    ctx?.clearRect(0, 0, w, h);

    drawGridAndAxes();
    drawSeries();

    if (hoverPoint) {
        drawHover(hoverPoint);
    }
}

function drawGridAndAxes(): void {
    if (!ctx) return;
    const { x, y, plotW, plotH } = scales();
    const xTicks = niceTicks(state.xMin, state.xMax, 8);
    const yTicks = niceTicks(state.yMin, state.yMax, 6);
    // Grid
    ctx.save();
    ctx.strokeStyle =
        "color-mix(in srgb, CanvasText 15%, transparent)";
    ctx.lineWidth = 1;

    // Vertical grid
    xTicks.values.forEach((t) => {
        const px = x(t);
        ctx?.beginPath();
        ctx?.moveTo(px, margin.top);
        ctx?.lineTo(px, margin.top + plotH);
        ctx?.stroke();
    });

    // Horizontal grid
    yTicks.values.forEach((t) => {
        const py = y(t);
        ctx?.beginPath();
        ctx?.moveTo(margin.left, py);
        ctx?.lineTo(margin.left + plotW, py);
        ctx?.stroke();
    });
    ctx.restore();

    // Axes
    ctx.save();
    ctx.strokeStyle = "CanvasText";
    ctx.lineWidth = 1.25;

    // X axis line
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + plotH);
    ctx.lineTo(margin.left + plotW, margin.top + plotH);
    ctx.stroke();

    // Y axis line
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + plotH);
    ctx.stroke();

    // Tick labels
    ctx.fillStyle = "CanvasText";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    xTicks.values.forEach((t) => {
        const px = x(t);
        const py = margin.top + plotH + 6;
        ctx.fillText(fmtNum(t), px, py);
    });

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    yTicks.values.forEach((t) => {
        const py = y(t);
        ctx.fillText(formatCurrency(t), margin.left - 8, py);
    });

    // Axis labels
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.fillText(
        "Age (years)",
        margin.left + plotW / 2,
        margin.top + plotH + 36
    );

    ctx.save();
    ctx.translate(20, margin.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Money ($)", 0, 0);
    ctx.restore();

    ctx.restore();
}

function drawSeries(): void {
    if (!ctx) return;
    if (!state.series.length) return;
    const { x, y } = scales();

    // Line
    ctx.save();
    ctx.strokeStyle = "#3a84ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    state.series.forEach((d, i) => {
        const px = x(d.age);
        const py = y(d.money);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();
}

function drawHover(point: Point): void {
    if (!ctx) return;
    const { x, y } = scales();
    const px = x(point.age);
    const py = y(point.money);

    // Crosshair
    ctx.save();
    ctx.strokeStyle =
        "color-mix(in srgb, CanvasText 35%, transparent)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(px, margin.top);
    ctx.lineTo(px, margin.top + scales().plotH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(margin.left, py);
    ctx.lineTo(margin.left + scales().plotW, py);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();

    // Point
    ctx.save();
    ctx.fillStyle = "#3a84ff";
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function nearestPoint(age: number, series: Point[]): Point | null {
    if (!series.length) return null;
    let lo = 0;
    let hi = series.length - 1;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (series[mid].age < age) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    // lo is now the first index where age <= series[lo].age
    // Compare with previous point to find the closest
    const after = series[lo];
    const before = series[lo - 1] ?? after;
    if (Math.abs(after.age - age) < Math.abs(before.age - age)) {
        return after;
    } else {
        return before;
    }
}

// Nice ticks (rounded tick marks)
function niceTicks(min: number, max: number, maxTicks: number): {
    values: number[];
    spacing: number;
    niceMin: number;
    niceMax: number;
} {
    if (min === max) {
        const eps = Math.abs(min || 1) * 0.5;
        min -= eps;
        max += eps;
    }
    const range = niceNum(max - min, false);
    const spacing = niceNum(range / (maxTicks - 1), true);
    const niceMin = Math.floor(min / spacing) * spacing;
    const niceMax = Math.ceil(max / spacing) * spacing;
    const values: number[] = [];
    for (let v = niceMin; v <= niceMax + 1e-9; v += spacing) {
        values.push(+v.toFixed(10));
    }
    values[0] = min
    return { values, spacing, niceMin, niceMax };
}

/**
 * Returns a "nice" number approximately equal to range.
 * Rounds the number if round = true, otherwise takes ceiling.
 * Used for generating axis tick intervals that are easy to read (1, 2, 5, 10, etc).
 *
 * @param range - The data range to be covered by ticks.
 * @param round - Whether to round the result to the nearest "nice" value.
 * @returns A "nice" number for tick spacing.
 */
function niceNum(range: number, round: boolean): number {
    const exp = Math.floor(Math.log10(range));
    const f = range / Math.pow(10, exp);
    let nf: number;
    if (round) {
        if (f < 1.5) nf = 1;
        else if (f < 3) nf = 2;
        else if (f < 7) nf = 5;
        else nf = 10;
    } else {
        if (f <= 1) nf = 1;
        else if (f <= 2) nf = 2;
        else if (f <= 5) nf = 5;
        else nf = 10;
    }
    return nf * Math.pow(10, exp);
}

function fmtNum(v: number, digits: number = 0): string {
    return Number(v).toFixed(digits);
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
