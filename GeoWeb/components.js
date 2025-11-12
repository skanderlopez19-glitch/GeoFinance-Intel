class Header extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <header>
                <div class="logo">
                    <img src="images/logo-geofinance.png" alt="GeoFinance Intel Logo">
                    <h1>GEOFINANCE INTEL</h1>
                </div>
                <nav>
                    <a href="index.html">Inicio</a>
                    <a href="analisis-metodologia-irdc.html">Teoría</a>
                    <a href="frente-este-ensayo.html">Crisis</a>
                    <a href="analisis-rol-china.html">Análisis</a>
                    <a href="#suscribir" class="btn-cta-nav">SUSCRIBIRSE</a>
                </nav>
            </header>
        `;
    }
}

customElements.define('main-header', Header);

// CÓDIGO DEL FOOTER (Añadir debajo del código del Header)

class Footer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <footer>
                <div class="footer-content">
                    <p>&copy; 2025 GeoFinance Intel. Análisis Automatizado.</p>
                    <div class="social-links">
                        <a href="https://linkedin.com/in/skanderlopez19" target="_blank">LinkedIn</a> |
                        <a href="mailto:skanderlopez19@gmail.com">Contacto</a>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('main-footer', Footer);