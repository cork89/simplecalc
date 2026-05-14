function setCheckedRadioValue(buttons: NodeListOf<Element>, value: number): void {
    buttons.forEach((button: Element) => {
        const btn = button as HTMLInputElement
        if (parseInt(btn.value) == value) btn.checked = true
    })
}

function addNumericRadioListener(buttons: NodeListOf<Element>, onChange: (value: number) => void): void {
    buttons.forEach((button: Element) => {
        button.addEventListener("change", (event: Event) => {
            const target = event.target as HTMLInputElement
            onChange(parseInt(target.value))
        })
    })
}

export {
    addNumericRadioListener,
    setCheckedRadioValue,
}
