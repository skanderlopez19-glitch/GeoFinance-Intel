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