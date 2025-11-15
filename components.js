// =================================================================
// 1. DEFINICIÓN DE COMPONENTES WEB
// =================================================================

// ----------------------------------------------------
// a. Main Header Component
// ----------------------------------------------------

// En components.js

class Header extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // CORRECCIÓN FINAL: Se eliminó la etiqueta <img /> ya que el archivo logo-geofinance.png no existe.
        this.innerHTML = `
        <header>
            <div class="logo">
                <h1>GEOFINANCE INTEL</h1>
            </div>
            <nav>
                <a href="/GeoFinance-Intel/index.html">Inicio</a>
                <a href="/GeoFinance-Intel/analisis-metodologia-irdc.html">Teoría</a>
                <a href="/GeoFinance-Intel/analisis-frente-este.html">Crisis</a>
                <a href="/GeoFinance-Intel/analisis-rol-china.html">Análisis</a>
                <a href="#suscribir" class="btn-cta-nav">SUSCRIBIRSE</a>
            </nav>
        </header>
        `;
    }
}
customElements.define('main-header', Header);

// ----------------------------------------------------
// b. Main Footer Component
// ----------------------------------------------------

class Footer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <footer>
            <div class="footer-grid">
                <div>
                    <h3>GeoFinance Intel</h3>
                    <p>Inteligencia Geo-Financiera Cuantificada.</p>
                    <p>&copy; ${new Date().getFullYear()} Todos los derechos reservados.</p>
                </div>
                <div>
                    <h3>Enlaces Rápidos</h3>
                    <ul>
                        <li><a href="/GeoFinance-Intel/index.html">Inicio</a></li>
                        <li><a href="/GeoFinance-Intel/analisis-metodologia-irdc.html">Teoría del Poder</a></li>
                        <li><a href="/GeoFinance-Intel/analisis-frente-este.html">Sala de Crisis</a></li>
                        <li><a href="#suscribir">Suscribirse</a></li>
                    </ul>
                </div>
                <div>
                    <h3>Contacto</h3>
                    <p>skanderlopez19@gmail.com</p>
                    <p>Política de Privacidad</p>
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

// RUTA FINAL: Asumiendo data.json está en la raíz del repositorio
const JSON_URL = '/GeoFinance-Intel/data.json';

function loadAnalysis() {
    fetch(JSON_URL)
        .then(response => {
            if (!response.ok) {
                // Si el fetch falla (404, 500, etc.), muestra el error de conexión
                throw new Error('FALLO DE CONEXIÓN HTTP a data.json: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            // VERIFICACIÓN Y ADAPTACIÓN AL NUEVO FORMATO JSON

            if (!data || !data.resumen_maximo) {
                throw new Error('El archivo JSON está vacío o tiene un formato inválido (resumen_maximo faltante).');
            }

            // 1. Actualizar el panel de alerta crítica (Máximo Contagio)
            // Lógica con RegEx para extraer el número entre paréntesis
            const maximoMatch = data.resumen_maximo.match(/\((\-?\d+\.\d+)\)/);
            const maximoValor = maximoMatch ? maximoMatch[1] : 'N/A';
            // Quita "Riesgo Máximo:" y el valor entre paréntesis para dejar solo los pares afectados
            const paresAfectados = data.resumen_maximo.replace(maximoMatch ? maximoMatch[0] : '', '').replace('Riesgo Máximo:', '').trim();

            document.getElementById('resumen-maximo-data').textContent = maximoValor;
            document.getElementById('pares-afectados-data').textContent = paresAfectados;

            // 2. Actualizar el panel de blindaje (Mínimo Contagio / Cobertura)
            // Lógica con RegEx para extraer el número entre paréntesis
            const minimoMatch = data.correlacion_minima.match(/\((\-?\d+\.\d+)\)/);
            // Quita el valor entre paréntesis para dejar solo el par de cobertura
            const paresCobertura = data.correlacion_minima.replace(minimoMatch ? minimoMatch[0] : '', '').trim();
            const minimoValor = minimoMatch ? minimoMatch[1] : 'N/A';

            document.getElementById('correlacion-minima-data').textContent = paresCobertura;
            document.getElementById('pares-cobertura-data').textContent = `Correlación: ${minimoValor}`;

            // 3. Actualizar fecha de actualización
            document.getElementById('fecha-actualizacion').textContent = `Última Actualización: ${data.ultima_actualizacion}`;

            // 4. Renderizar el gráfico 3D Force-Graph (NEXUS)
            const adaptedNexusData = {
                nodes: data.nexus_nodes.map(n => ({ id: n.id, name: n.name, group: 1 })),
                links: data.nexus_links.map(l => ({ source: l.source, target: l.target, value: l.correlation }))
            };
            renderNexusGraph(adaptedNexusData);

            console.log("Dashboard cargado exitosamente.");

        })
        .catch(error => {
            console.error("CRITICAL ERROR: Fallo en la carga del dashboard:", error);
            // Mostrar mensaje de OFFLINE en caso de fallo
            document.getElementById('resumen-maximo-data').textContent = 'OFFLINE';
            document.getElementById('pares-afectados-data').textContent = 'FALLO DE CONEXIÓN A LA MATRIZ';
            document.getElementById('correlacion-minima-data').textContent = 'OFFLINE';
            document.getElementById('pares-cobertura-data').textContent = 'FALLO DE CONEXIÓN A LA MATRIZ';
            document.getElementById('fecha-actualizacion').textContent = 'ERROR DE CARGA';

            // Agregar alerta visible en la página
            const alertDiv = document.createElement('div');
            alertDiv.style.cssText = "margin: 20px auto; padding: 15px; background-color: #ffc107; color: #333; font-weight: bold; text-align: center; border-radius: 4px; max-width: 800px;";
            alertDiv.innerHTML = '⚠️ SIN CONEXIÓN A LA MATRIZ. Revise consola (F12).';
            document.querySelector('#analisis').prepend(alertDiv);
        });
}

// =================================================================
// 3. FUNCIÓN DE RENDERIZADO DEL GRÁFICO 3D (Nexus)
// =================================================================

function renderNexusGraph(graphData) {
    const elem = document.getElementById('nexus-target');
    const ForceGraph3D = window.ForceGraph3D;

    if (typeof ForceGraph3D !== 'function') {
        console.error("ForceGraph3D no cargó correctamente.");
        elem.innerHTML = '<p style="text-align: center; color: #888; padding-top: 200px;">Error al cargar visualización 3D.</p>';
        return;
    }

    ForceGraph3D()(elem)
        .graphData(graphData)
        .nodeLabel('id')
        .nodeAutoColorBy('group')
        .linkWidth(link => Math.abs(link.value) * 5)
        .linkOpacity(0.5)
        .linkDirectionalArrowLength(3.5)
        .linkDirectionalArrowRelPos(1)
        .linkCurvature(0.25)
        .linkAutoColorBy(link => link.value)
        .backgroundColor('#0d0d0d');
}