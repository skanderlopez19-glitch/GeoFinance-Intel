// =================================================================
// 1. WEB COMPONENTS (HEADER Y FOOTER)
// =================================================================

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

// =================================================================
// 2. FUNCIÓN DE CONEXIÓN A LA MATRIZ (data.json)
// =================================================================

function fetchData() {
    fetch('data.json')
        .then(response => {
            // Verifica si la respuesta HTTP es correcta (si no es 404, etc.)
            if (!response.ok) {
                // Si la conexión falla a nivel de red/servidor, lanza un error
                throw new Error('Fallo de conexión a la matriz: HTTP ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Datos de la Matriz cargados:", data);

            // 💡 1. Actualiza el Dashboard con los datos (RIESGO y COBERTURA)
            actualizarDashboard(data);

            // 💡 2. Finaliza el estado 'OFFLINE' con la hora de actualización
            const estadoCarga = document.getElementById('estado-carga-alerta');
            if (estadoCarga) {
                estadoCarga.innerText = `ACTIVO Y ESTABLE. Última actualización: ${data.ultima_actualizacion}`;
                estadoCarga.classList.remove('offline'); // O el nombre de tu clase de error
                estadoCarga.classList.add('online');
            }

            // ATENCIÓN: La función renderizarNexus3D(data) debe ser definida
            // en otro archivo o aquí si lo necesitas para dibujar el gráfico 3D.
            // if (typeof renderizarNexus3D === 'function') {
            //     renderizarNexus3D(data.nexus_nodes, data.nexus_links);
            // }

        })
        .catch(error => {
            console.error("Error al cargar data.json:", error);
            // Si falla, inyecta el error de conexión en la UI
            const estadoCarga = document.getElementById('estado-carga-alerta');
            if (estadoCarga) {
                estadoCarga.innerText = "⚠️ SIN CONEXIÓN A LA MATRIZ. Revise el data.json.";
            }
        });
}

// =================================================================
// 3. FUNCIÓN PARA ACTUALIZAR LOS ELEMENTOS DEL DASHBOARD
//    (Inyecta los datos del JSON en los DIVs de tu HTML)
// =================================================================

function actualizarDashboard(data) {
    // Panel Rojo: ALERTA CRÍTICA (Bloque de Contagio)
    const alerta = document.getElementById('alerta-critica');
    if (alerta) {
        alerta.innerHTML = `
            <div class="header-alerta">ALERTA CRÍTICA: BLOQUE DE CONTAGIO</div>
            <div class="riesgo-maximo">${data.resumen_maximo}</div>
            <p class="small-text">RIESGO MÁXIMO GLOBAL</p>
            <p class="small-text">PARES AFECTADOS: ${data.resumen_maximo}</p>
        `;
        alerta.classList.remove('offline'); // Eliminar la clase 'OFFLINE'
        alerta.classList.add('online');
    }

    // Panel Amarillo: ACCIÓN BLINDAJE (Oportunidad de Cobertura)
    const blindaje = document.getElementById('accion-blindaje');
    if (blindaje) {
        blindaje.innerHTML = `
            <div class="header-accion">ACCIÓN: BLINDAJE ESTRATÉGICO</div>
            <div class="oportunidad-cobertura">${data.correlacion_minima}</div>
            <p class="small-text">OPORTUNIDAD DE COBERTURA: ${data.correlacion_minima}</p>
            <p class="small-text">ACTIVO REFUGIO: ORO (GC=F)</p>
        `;
        blindaje.classList.remove('offline'); // Eliminar la clase 'OFFLINE'
        blindaje.classList.add('online');
    }
}


// =================================================================
// 4. INICIO DEL PROCESO
// =================================================================

// Ejecutar la conexión cuando la página haya terminado de cargar todos sus elementos
document.addEventListener('DOMContentLoaded', fetchData);