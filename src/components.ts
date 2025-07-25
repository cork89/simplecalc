import { CustomSliderEventDetail } from "./global"

class CustomSlider extends HTMLElement {
    private slider!: HTMLInputElement
    private valueDisplay!: HTMLDivElement
    shadowRoot!: ShadowRoot

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({
            mode: "open",
        });
    }

    static get observedAttributes(): string[] {
        return ["min", "max", "value", "step", "label", "unit"];
    }

    connectedCallback(): void {
        this.render();

        this.slider = this.shadowRoot.querySelector("input[type='range']",) as HTMLInputElement;
        this.valueDisplay = this.shadowRoot.querySelector(".value-display",) as HTMLDivElement;

        this.slider.addEventListener("input", this._handleSliderInput.bind(this));
        this._updateDisplay();
    }

    attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null,
    ): void {
        if (this.slider && this.valueDisplay && oldValue !== newValue) {
            if (name === "label") {
                (this.shadowRoot.querySelector("label") as HTMLLabelElement).textContent =
                    newValue;
            } else if (["min", "max", "step", "value"].includes(name)) {
                (this.slider as any)[name] = newValue;
                this._updateDisplay();
            } else if (name === "unit") {
                this._updateDisplay();
            }
        }
    }

    private _handleSliderInput(): void {
        this._updateDisplay();
        this.dispatchEvent(
            new CustomEvent<CustomSliderEventDetail>("slider-change", {
                detail: {
                    value: this.slider.value,
                    id: this.id,
                },
                bubbles: true,
                composed: true,
            }),
        );
    }

    private _updateDisplay(): void {
        const value = this.slider.value;
        const unit = this.getAttribute("unit") || "";
        let formattedValue: string;

        if (unit === "$") {
            formattedValue = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(Number(value));
        } else {
            formattedValue = `${value}${unit}`;
        }

        this.valueDisplay.textContent = formattedValue;
    }

    private render(): void {
        const label = this.getAttribute("label") || "Slider";
        const min = this.getAttribute("min") || "0";
        const max = this.getAttribute("max") || "100";
        const initialValue = this.getAttribute("value") || "50";
        const step = this.getAttribute("step") || "1";
        const id = this.id;

        this.shadowRoot.innerHTML = `
      <style>
        :host {
            display: block;
            margin-bottom: var(--spacing-xxl);
        }
        .input-group {
            margin-bottom: var(--spacing-xxl);
        }
        label {
            display: block;
            margin-bottom: var(--spacing-sm);
            font-weight: var(--font-weight-bold);
            color: var(--text-secondary);
        }
        .slider-container {
            position: relative;
            margin-bottom: var(--spacing-md);
        }
        input[type="range"] {
            width: 100%;
            height: var(--slider-height);
            border-radius: var(--border-radius);
            background: var(--border-color);
            outline: none;
            -webkit-appearance: none;
            margin: 0;
        }
        
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: var(--slider-thumb-size);
            height: var(--slider-thumb-size);
            border-radius: 50%;
            background: var(--success-color);
            cursor: pointer;
        }
            
        input[type="range"]::-moz-range-thumb {
            width: var(--slider-thumb-size);
            height: var(--slider-thumb-size);
            border-radius: 50%;
            background: var(--success-color);
            cursor: pointer;
            border: none;
        }
        
        input[type="range"]:focus {
            outline: none;
            background: rgba(76, 175, 80, 0.1);
            box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
        }

        input[type="range"]:focus::-webkit-slider-thumb {
            box-shadow: var(--slider-focus-shadow);
            transform: scale(1.1);
        }

        input[type="range"]:focus::-moz-range-thumb {
            box-shadow: var(--slider-focus-shadow);
            transform: scale(1.1);
        }

        .value-display {
            text-align: center;
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-bold);
            color: var(--text-primary);
            margin-top: var(--spacing-xs);
        }
      </style>
      <div class="input-group">
          <label for="${id}">${label}</label>
          <div class="slider-container">
              <input type="range" id="${id}" min="${min}" max="${max}" value="${initialValue}" step="${step}" />
          </div>
          <div class="value-display"></div>
      </div>
    `;
    }
}

customElements.define("simple-slider", CustomSlider);

class SimpleHeader extends HTMLElement {
    private mobileMenuToggle!: HTMLButtonElement
    private headerNav!: HTMLElement
    shadowRoot!: ShadowRoot

    constructor() {
        super()
        this.shadowRoot = this.attachShadow({ mode: "open" })
    }

    connectedCallback(): void {
        this.render()

        this.mobileMenuToggle = this.shadowRoot.querySelector(".mobile-menu-toggle") as HTMLButtonElement
        this.headerNav = this.shadowRoot.querySelector(".header-nav") as HTMLElement

        this.mobileMenuToggle.addEventListener("click", () => {
            this.headerNav.classList.toggle("active")
            this.mobileMenuToggle.classList.toggle("active")
        });

        this.headerNav.querySelectorAll(".nav-link").forEach((link) => {
            link.addEventListener("click", () => {
                if (this.headerNav.classList.contains("active")) {
                    this.headerNav.classList.remove("active")
                    this.mobileMenuToggle.classList.remove("active")
                }
            })
        })
    }

    private render(): void {
        this.shadowRoot.innerHTML = `
            <style>
                .dancing-script-1 {
                    font-family: "Dancing Script", cursive;
                    font-optical-sizing: auto;
                    font-weight: 500;
                    font-style: normal;
                }
                .main-header {
                    background-color: var(--primary-background);
                    padding: var(--spacing-md) var(--spacing-lg);
                    color: var(--card-background);
                    box-shadow: 0 2px 5px var(--shadow-color);
                    margin-bottom: var(--spacing-xl);
                    border-radius: var(--border-radius-lg);
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    max-width: var(--container-max-width);
                    margin: 0 auto;
                    position: relative;
                }

                .app-name {
                    font-size: var(--font-size-xl);
                    font-weight: var(--font-weight-bold);
                    color: var(--card-background);
                }

                .mobile-menu-toggle {
                    display: none;
                    flex-direction: column;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: var(--spacing-xs);
                    z-index: 1001;
                }

                .mobile-menu-toggle span {
                    width: 25px;
                    height: 3px;
                    background-color: var(--card-background);
                    margin: 3px 0;
                    transition: 0.3s;
                    border-radius: 2px;
                }

                .header-nav {
                    display: flex;
                    gap: var(--spacing-sm);
                }

                .header-nav .nav-link {
                    color: var(--card-background);
                    text-decoration: none;
                    font-size: var(--font-size-base);
                    padding: var(--spacing-xs) var(--spacing-sm);
                    border-radius: var(--border-radius);
                    transition: background-color 0.3s ease;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .header-nav .nav-link:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                }

                @media (max-width: 768px) {
                    .main-header {
                        padding: var(--spacing-sm) var(--spacing-md);
                        margin-bottom: var(--spacing-lg);
                    }

                    .app-name {
                        font-size: var(--font-size-xl);
                    }

                    .mobile-menu-toggle {
                        display: flex;
                    }

                    .header-nav {
                        display: none;
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background-color: var(--primary-background);
                        flex-direction: column;
                        padding: var(--spacing-md);
                        border-radius: var(--border-radius-lg);
                        box-shadow: 0 4px 10px var(--shadow-color);
                        gap: var(--spacing-xs);
                        z-index: 1000;
                    }

                    .header-nav.active {
                        display: flex;
                    }

                    .header-nav .nav-link {
                        padding: var(--spacing-sm) var(--spacing-md);
                        text-align: center;
                        border-radius: var(--border-radius);
                    }
                }
            </style>
            <header class="main-header">
                <div class="header-content">
                    <div class="app-name dancing-script-1">Simple Calc</div>
                    <button class="mobile-menu-toggle" aria-label="Toggle navigation">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <nav class="header-nav">
                        <a href="./" class="nav-link">Age</a>
                        <a href="./rule1.html" class="nav-link">Mortgage</a>
                        <a href="./student.html" class="nav-link">Student Loans</a>
                        <a href="./tax.html" class="nav-link">Tax</a>
                    </nav>
                </div>
            </header>
        `
    }
}


customElements.define("simple-header", SimpleHeader);