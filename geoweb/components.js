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
// 5. MÓDULO DE RENDERING 3D (DE VUELTA EN EL ARCHIVO DE LÓGICA)
// =================================================================

// NOTA: Esta función se define sin llamar a ForceGraph3D directamente,
// ya que ForceGraph debe ser llamado con ForceGraph()() si no está en un namespace global.
// Asumiremos que el script de ForceGraph está cargado en el index.html.

function drawNexus(nodes, links) {
    const container = document.getElementById('nexus-target');
    if (!container) {
        console.warn("Contenedor 'nexus-target' no encontrado. Gráfico 3D no renderizado.");
        return;
    }
    if (typeof ForceGraph === 'undefined') {
        console.error("Librería ForceGraph no cargada. No se puede renderizar el Nexus.");
        return;
    }

    const CORRELATION_COLOR_MAP = (corr) => {
        if (corr >= 0.4) return 'rgba(255, 30, 30, 0.9)';
        if (corr <= -0.15) return 'rgba(30, 255, 255, 0.9)';
        return 'rgba(255, 255, 255, 0.3)';
    };

    const Graph = ForceGraph()(container)
        .graphData({ nodes: nodes, links: links })
        .nodeId('id')
        .nodeLabel('name')
        .nodeAutoColorBy('name')
        .nodeVal(node => {
            return (node.id === '^GSPC' || node.id === 'CNY=X') ? 30 : 10;
        })
        .nodeRelSize(4)
        .linkLabel(link => `Correlación: ${link.correlation}`)
        .linkWidth(link => Math.abs(link.correlation) * 8)
        .linkColor(link => CORRELATION_COLOR_MAP(link.correlation))
        .linkDirectionalArrowLength(3.5)
        .linkDirectionalArrowRelPos(1);

    Graph.cameraPosition({ z: 600 });
    console.log("Nexus de Correlación 3D Renderizado con éxito.");
}


// =================================================================
// 3. FUNCIÓN PARA ACTUALIZAR LOS ELEMENTOS DEL DASHBOARD
// =================================================================

function actualizarDashboard(data) {
    // Panel Rojo: ALERTA CRÍTICA (Bloque de Contagio)
    const alerta = document.getElementById('resumen-maximo-data'); // Apuntamos al ID de la cifra
    const paresAfectados = document.getElementById('pares-afectados-data'); // Apuntamos al ID de los pares

    // Panel Amarillo: ACCIÓN BLINDAJE (Oportunidad de Cobertura)
    const blindaje = document.getElementById('correlacion-minima-data'); // Apuntamos al ID de la cifra
    const paresCobertura = document.getElementById('pares-cobertura-data'); // Apuntamos al ID de los pares

    const fechaActualizacion = document.getElementById('fecha-actualizacion');
    const ctaMini = document.querySelector('.cta-mini');

    // --- 1. PARSEO Y EXTRACCIÓN DE CIFRAS ---
    // Extrae la cifra y los pares para la Alerta Crítica
    const maxMatch = data.resumen_maximo.match(/\((.*?)\)/);
    const maxCifra = maxMatch ? maxMatch[1] : 'N/A';
    const maxPares = data.resumen_maximo.replace('Riesgo Máximo: ', '').replace(`(${maxCifra})`, '').trim();

    // Extrae la cifra y los pares para la Acción Blindaje
    const minMatch = data.correlacion_minima.match(/\((.*?)\)/);
    const minCifra = minMatch ? minMatch[1] : 'N/A';
    const minPares = data.correlacion_minima.replace(' vs. ', ' vs. ').replace(`(${minCifra})`, '').trim();

    // --- 2. INYECCIÓN DE DATOS Y RESOLUCIÓN DEL ESTADO "CARGANDO..." ---

    if (alerta) alerta.textContent = maxCifra;
    if (paresAfectados) paresAfectados.textContent = maxPares;

    if (blindaje) blindaje.textContent = minCifra;
    if (paresCobertura) paresCobertura.textContent = minPares;

    // Actualiza el texto de la alerta CTA
    if (ctaMini) {
        ctaMini.innerHTML = `🔥 **ALERTA HOY:** ${data.resumen_maximo} | Última Actualización: ${data.ultima_actualizacion}`;
    }

    // Actualiza la fecha de auditoría
    if (fechaActualizacion) {
        fechaActualizacion.textContent = data.ultima_actualizacion;
    }

    // Si la conexión es exitosa, llama al renderizado 3D
    if (data.nexus_nodes && data.nexus_links) {
        drawNexus(data.nexus_nodes, data.nexus_links);
    }

    console.log("✅ Dashboard actualizado y Nexus 3D inicializado.");
}


// =================================================================
// 2. FUNCIÓN DE CONEXIÓN A LA MATRIZ (data.json)
// =================================================================
const JSON_URL = 'data.json';

function loadAnalysis() {
    fetch(JSON_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - No se encontró data.json`);
            }
            return response.json();
        })
        .then(data => {
            // Lógica de aplicación de datos
            actualizarDashboard(data);
        })
        .catch(error => {
            console.error('❌ Error al cargar o procesar datos JSON:', error);
            // Failsafe (lo que ves ahora)
            document.getElementById('resumen-maximo-data').textContent = 'OFFLINE';
            document.getElementById('pares-afectados-data').textContent = 'FALLO DE CONEXIÓN A LA MATRIZ';
            document.getElementById('correlacion-minima-data').textContent = 'OFFLINE';
            document.getElementById('pares-cobertura-data').textContent = 'FALLO DE CONEXIÓN A LA MATRIZ';
            document.getElementById('fecha-actualizacion').textContent = 'ERROR DE CARGA';
            const ctaMini = document.querySelector('.cta-mini');
            if (ctaMini) { ctaMini.innerHTML = `⚠️ SIN CONEXIÓN A LA MATRIZ.`; }
        });
}


// =================================================================
// 4. INICIO DEL PROCESO (Llamada limpia)
// =================================================================

// Esta es la única línea que tu index.html necesita para arrancar todo
document.addEventListener('DOMContentLoaded', loadAnalysis);