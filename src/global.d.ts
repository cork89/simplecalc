export type { CustomSliderEventDetail }

declare global {
    interface CustomSliderEventDetail {
        value: string
        id: string
    }

    interface HTMLElementEventMap {
        "slider-change": CustomEvent<CustomSliderEventDetail>
    }
}
