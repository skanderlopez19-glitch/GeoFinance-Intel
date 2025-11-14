// =================================================================
// 1. WEB COMPONENTS (HEADER Y FOOTER)
// =================================================================

class Header extends HTMLElement {
    constructor() {
        super();
    }

// En la clase Header:
connectedCallback() {
    this.innerHTML = `
        <header>
            <div class="logo">
                <img src="/GeoFinance-Intel/images/logo-geofinance.png" alt="GeoFinance Intel Logo">
                <h1>GEOFINANCE INTEL</h1>
            </div>
            <nav>
    <a href="/GeoFinance-Intel/index.html">Inicio</a>

    <a href="/GeoFinance-Intel/geoweb/analisis-metodologia-irdc.html">Teoría</a>
    <a href="/GeoFinance-Intel/geoweb/analisis-frente-este.html">Crisis</a>
    <a href="/GeoFinance-Intel/geoweb/analisis-rol-china.html">Análisis</a>
    <a href="#suscribir" class="btn-cta-nav">SUSCRIBIRSE</a>
</nav>
        </header>
    `;
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
// =================================================================
// 2. FUNCIÓN DE CONEXIÓN A LA MATRIZ (data.json)
// =================================================================
// ¡Tu corrección es la correcta
// CORREGIDO: data.json está en la raíz del repositorio
const JSON_URL = '/GeoFinance-Intel/data.json';

function loadAnalysis() {
    fetch(JSON_URL)
        .then(response => {
            if (!response.ok) {
                // Generará un error si es 404 (Not Found) o 400 (Bad Request)
                throw new Error(`Error HTTP: ${response.status} - No se encontró data.json en la ruta: ${JSON_URL}`);
            }
            return response.json();
        })
        .then(data => {
            // Lógica de aplicación de datos
            actualizarDashboard(data);
            // Llamada para generar los artículos
            generarArticulos(data.top_dependencias);
        })
        .catch(error => {
            console.error('❌ Error al cargar o procesar datos JSON:', error);
            // Failsafe para mostrar el error en el Dashboard
            document.getElementById('resumen-maximo-data').textContent = 'OFFLINE';
            document.getElementById('pares-afectados-data').textContent = 'FALLO DE CONEXIÓN A LA MATRIZ';
            document.getElementById('correlacion-minima-data').textContent = 'OFFLINE';
            document.getElementById('pares-cobertura-data').textContent = 'FALLO DE CONEXIÓN A LA MATRIZ';
            document.getElementById('fecha-actualizacion').textContent = 'ERROR DE CARGA';
            const ctaMini = document.querySelector('.cta-mini');
            if (ctaMini) { ctaMini.innerHTML = `⚠️ SIN CONEXIÓN A LA MATRIZ. Revise consola (F12).`; }
        });
}
// ... (El resto del código JavaScript sigue igual)


// =================================================================
// 3. FUNCIÓN PARA ACTUALIZAR LOS ELEMENTOS DEL DASHBOARD
// =================================================================

function actualizarDashboard(data) {
    // Panel Rojo: ALERTA CRÍTICA (Bloque de Contagio)
    const alerta = document.getElementById('resumen-maximo-data');
    const paresAfectados = document.getElementById('pares-afectados-data');

    // Panel Amarillo: ACCIÓN BLINDAJE (Oportunidad de Cobertura)
    const blindaje = document.getElementById('correlacion-minima-data');
    const paresCobertura = document.getElementById('pares-cobertura-data');

    const fechaActualizacion = document.getElementById('fecha-actualizacion');
    const ctaMini = document.querySelector('.cta-mini');

    // --- 1. PARSEO Y EXTRACCIÓN DE CIFRAS ---
    const maxMatch = data.resumen_maximo.match(/\((.*?)\)/);
    const maxCifra = maxMatch ? maxMatch[1] : 'N/A';
    // Se quita la cifra del texto para inyectar solo los pares
    const maxPares = data.resumen_maximo.replace('Riesgo Máximo: ', '').replace(`(${maxCifra})`, '').trim();

    const minMatch = data.correlacion_minima.match(/\((.*?)\)/);
    const minCifra = minMatch ? minMatch[1] : 'N/A';
    // Se quita la cifra del texto para inyectar solo los pares
    const minPares = data.correlacion_minima.replace(`(${minCifra})`, '').trim();

    // --- 2. INYECCIÓN DE DATOS ---
    if (alerta) alerta.textContent = maxCifra;
    if (paresAfectados) paresAfectados.textContent = maxPares;

    if (blindaje) blindaje.textContent = minCifra;
    if (paresCobertura) paresCobertura.textContent = minPares;

    if (ctaMini) {
        ctaMini.innerHTML = `🔥 **ALERTA HOY:** ${maxPares} (${maxCifra}) | Última Actualización: ${data.ultima_actualizacion}`;
    }

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
// 4. FUNCIÓN PARA CREAR Y MOSTRAR ARTÍCULOS (CONTENIDO FALTANTE)
// =================================================================

function generarArticulos(topDependencias) {
    const container = document.querySelector('.analysis-container');
    if (!container) return;

    // Limpia el contenido antes de añadir (por si acaso)
    container.innerHTML = '';

    // Usaremos los 4 principales riesgos (top_dependencias) como "Artículos"
    topDependencias.forEach(item => {
        // Estructura de tarjeta basada en tu HTML y CSS (asumiendo estilos oscuros)
        const articleHTML = `
            <div class="analysis-card"
                 style="width: 250px; margin-bottom: 20px; padding: 25px; background: #1a1a1a; border-radius: 8px; border-left: 5px solid var(--color-alert-danger, #d81e1e);">
                <h3 style="color: #FFC300; margin-bottom: 10px; font-size: 1.1em;">ACTIVO EN RIESGO</h3>
                <p style="font-size: 1.6em; font-weight: 700; color: #fff; margin-bottom: 5px;">${item.nombre}</p>
                <p style="color: #f00; font-size: 1em;">IRDC (Índice de Riesgo): ${item.puntuacion_irdc}</p>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', articleHTML);
    });
    console.log("✅ Artículos de Fundamentos cargados.");
}


// =================================================================
// 5. MÓDULO DE RENDERING 3D (DE VUELTA EN EL ARCHIVO DE LÓGICA)
// =================================================================

function drawNexus(nodes, links) {
    const container = document.getElementById('nexus-target');
    if (!container) {
        console.warn("Contenedor 'nexus-target' no encontrado. Gráfico 3D no renderizado.");
        return;
    }
    // Aseguramos que ForceGraph esté disponible
    if (typeof ForceGraph === 'undefined') {
        console.error("Librería ForceGraph no cargada. No se puede renderizar el Nexus.");
        return;
    }

    // Mapeo de color para las líneas de correlación
    const CORRELATION_COLOR_MAP = (corr) => {
        if (corr >= 0.4) return 'rgba(216, 30, 30, 0.9)'; // Alta correlación (Rojo, Peligro)
        if (corr <= -0.15) return 'rgba(30, 255, 255, 0.9)'; // Baja/Negativa (Cyan, Cobertura)
        return 'rgba(255, 255, 255, 0.3)'; // Baja (Blanco/Gris)
    };

    // Convertimos el campo 'correlation' a un valor de tamaño para el enlace
    const graphLinks = links.map(link => ({
        ...link,
        value: Math.abs(link.correlation) * 10 // Multiplicar para hacerlo visible
    }));


    const Graph = ForceGraph()(container)
        .graphData({ nodes: nodes, links: graphLinks })
        .nodeId('id')
        .nodeLabel('name')
        .nodeAutoColorBy('name')
        .nodeVal(node => {
            // Hacemos que los nodos importantes (S&P 500, China) sean más grandes
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
// 6. INICIO DEL PROCESO (Llamada limpia)
// =================================================================

// Esta es la única línea que tu index.html necesita para arrancar todo
document.addEventListener('DOMContentLoaded', loadAnalysis);