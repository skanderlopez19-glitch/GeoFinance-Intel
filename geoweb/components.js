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
// 5. MÓDULO DE RENDERING 3D (CORRECCIÓN DE ERRORES)
// =================================================================

function renderizarNexus3D(data) {
    const container = document.getElementById('nexus-3d-container');
    if (!container) {
        console.warn("Contenedor 'nexus-3d-container' no encontrado. Gráfico 3D no renderizado.");
        return;
    }

    // Usamos la variable global de la librería (ForceGraph3D)
    // Se elimina la llamada a cameraPosition que causaba el TypeError.
    if (typeof ForceGraph3D !== 'undefined') {
        const Graph = ForceGraph3D()
            (container)
            .graphData({ nodes: data.nexus_nodes, links: data.nexus_links })
            .nodeLabel('name')
            .linkWidth(link => Math.abs(link.correlation) * 4)
            .linkColor(link => link.correlation > 0 ? '#FF0000' : '#00FFFF')
            .linkDirectionalArrowLength(3.5)
            .linkDirectionalArrowRelPos(1);

        console.log("Nexus de Correlación 3D Renderizado con éxito.");
    } else {
        console.error("Librería ForceGraph3D no cargada. No se puede renderizar el Nexus.");
    }
}

// =================================================================
// 3. FUNCIÓN PARA ACTUALIZAR LOS ELEMENTOS DEL DASHBOARD
// =================================================================

function actualizarDashboard(data) {
    // Panel Rojo: ALERTA CRÍTICA (Bloque de Contagio)
    const alerta = document.getElementById('alerta-critica');
    if (alerta) {
        const riesgoMaximo = data.resumen_maximo;

        alerta.innerHTML = `
            <div class="header-alerta">ALERTA CRÍTICA: BLOQUE DE CONTAGIO</div>
            <div class="riesgo-maximo">${riesgoMaximo}</div>
            <p class="small-text">RIESGO MÁXIMO GLOBAL</p>
            <p class="small-text">PARES AFECTADOS: ${riesgoMaximo.split(': ')[1]}</p>
        `;
        alerta.classList.remove('offline');
        alerta.classList.add('online');
    }

    // Panel Amarillo: ACCIÓN BLINDAJE (Oportunidad de Cobertura)
    const blindaje = document.getElementById('accion-blindaje');
    if (blindaje) {
        const correlacionMinima = data.correlacion_minima;

        blindaje.innerHTML = `
            <div class="header-accion">ACCIÓN: BLINDAJE ESTRATÉGICO</div>
            <div class="oportunidad-cobertura">${correlacionMinima}</div>
            <p class="small-text">OPORTUNIDAD DE COBERTURA: ${correlacionMinima}</p>
            <p class="small-text">ACTIVO REFUGIO: ORO (GC=F)</p>
        `;
        blindaje.classList.remove('offline');
        blindaje.classList.add('online');
    }
}

// =================================================================
// 2. FUNCIÓN DE CONEXIÓN A LA MATRIZ (data.json)
// =================================================================

function fetchData() {
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Fallo de conexión a la matriz: HTTP ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Datos de la Matriz cargados:", data);

            // 💡 1. Actualiza el Dashboard con los datos (RIESGO y COBERTURA)
            actualizarDashboard(data);

            // LLAMADA CRÍTICA AL RENDERIZADO 3D (Si hay datos):
            if (data.nexus_nodes && data.nexus_links) {
                 renderizarNexus3D(data); // Pasamos todo el objeto data
            }

            // 💡 2. Finaliza el estado 'OFFLINE' con la hora de actualización
            const estadoCarga = document.getElementById('estado-carga-alerta');
            if (estadoCarga) {
                estadoCarga.innerText = `ACTIVO Y ESTABLE. Última actualización: ${data.ultima_actualizacion}`;
                estadoCarga.classList.remove('offline');
                estadoCarga.classList.add('online');
            }
        })
        .catch(error => {
            console.error("Error al cargar data.json:", error);
            const estadoCarga = document.getElementById('estado-carga-alerta');
            if (estadoCarga) {
                estadoCarga.innerText = "⚠️ SIN CONEXIÓN A LA MATRIZ. Revise el data.json.";
            }
        });
}


// =================================================================
// 4. INICIO DEL PROCESO (Llamada limpia)
// =================================================================

// Ejecutar la conexión cuando la página haya terminado de cargar todos sus elementos
document.addEventListener('DOMContentLoaded', fetchData);