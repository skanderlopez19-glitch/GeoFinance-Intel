import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
import io
import json # <--- ¡NUEVA LIBRERÍA IMPORTADA!

# =================================================================
# CONFIGURACIÓN GLOBAL (VARIABLES CRUCIALES)
# =================================================================
sender_email = "skanderlopez19@gmail.com"
password = "unbujapaltomprjp"
receiver_email = "skanderlopez19@gmail.com"
TICKER_TO_NAME = {
    '^GSPC': 'EE. UU. (S&P 500)', 'GC=F': 'Oro (Refugio)', 'USDMXN=X': 'México (Peso)',
    'USDBRL=X': 'Brasil (Real)', 'USDCOP=X': 'Colombia (Peso)', 'USDCLP=X': 'Chile (Peso)',
    'CL=F': 'Petróleo WTI', 'HG=F': 'Cobre Futuros'
}
# =================================================================

# =================================================================
# MODULO 1: DESCARGA DE DATOS (INPUT)
# =================================================================
tickers_geo_latam_completo = [
    '^GSPC', 'GC=F', 'USDMXN=X', 'USDBRL=X', 'USDCOP=X', 'USDCLP=X', 'CL=F', 'HG=F',
]
fecha_inicio = '2020-01-01'
fecha_fin = '2025-01-01'

datos_historicos = yf.download(tickers_geo_latam_completo, start=fecha_inicio, end=fecha_fin)
precios_cierre = datos_historicos['Close'].dropna()

# =================================================================
# MODULO 1.5: GRÁFICO DE RENDIMIENTO SEMANAL
# =================================================================
rendimiento_comparativo = precios_cierre.iloc[-30:] / precios_cierre.iloc[-30:].iloc[0]

# =================================================================
# MODULO 2: CÁLCULO DE LA MATRIZ (ANÁLISIS DE VALOR)
# =================================================================

rendimientos = precios_cierre.pct_change().dropna()
matriz_correlacion = rendimientos.corr()

# =================================================================
# MODULO 2.5/2.6: INTERPRETACIÓN Y CÁLCULO IRDC
# =================================================================

# --- 2.5 CÁLCULO DE CORRELACIÓN MÁXIMA/MÍNIMA ---
matriz_correlacion.index.name = None
matriz_correlacion.columns.name = None
pares_correlacion = matriz_correlacion.stack().reset_index(name='Correlacion')
pares_correlacion.columns = ['Activo_A', 'Activo_B', 'Correlacion']
pares_correlacion = pares_correlacion[pares_correlacion['Activo_A'] != pares_correlacion['Activo_B']]
pares_correlacion_ordenada = pares_correlacion.sort_values(by='Correlacion', ascending=False)
correlacion_maxima_row = pares_correlacion_ordenada.iloc[0]
correlacion_maxima = correlacion_maxima_row['Correlacion']
activo_a_max = correlacion_maxima_row['Activo_A']
activo_b_max = correlacion_maxima_row['Activo_B']
correlacion_minima_row = pares_correlacion_ordenada.iloc[-1]
correlacion_minima = correlacion_minima_row['Correlacion']
activo_a_min = correlacion_minima_row['Activo_A']
activo_b_min = correlacion_minima_row['Activo_B']

resumen_narrativo = f"""
ANÁLISIS DE INTERDEPENDENCIA CUANTIFICADA:
---
RIESGO MÁXIMO DE DEPENDENCIA ({TICKER_TO_NAME.get(activo_a_max, activo_a_max)} vs. {TICKER_TO_NAME.get(activo_b_max, activo_b_max)}):
La correlación más alta es de {correlacion_maxima:.2f}. La fuerte dependencia a factores externos (ej. política de la Reserva Federal o demanda de China) obliga a que estos activos se muevan como un solo bloque.

OPORTUNIDAD ESTRATÉGICA (COBERTURA):
La correlación más baja es de {correlacion_minima:.2f} entre {TICKER_TO_NAME.get(activo_a_min, activo_a_min)} y {TICKER_TO_NAME.get(activo_b_min, activo_b_min)}. Esta pareja ofrece la mejor oportunidad para la 'cobertura de cartera'.
"""
# --- 2.6 CÁLCULO IRDC ---
activos_riesgo = ['CL=F', 'HG=F', '^GSPC']
correlacion_riesgo = matriz_correlacion.loc[activos_riesgo].abs()
indice_riesgo_dependencia = correlacion_riesgo.mean().sort_values(ascending=False)
indice_riesgo_dependencia = indice_riesgo_dependencia.drop(activos_riesgo, errors='ignore')


# =================================================================
# MODULO 5: EXPORTAR DATOS PARA LA WEB (JSON) <--- ¡NUEVO MÓDULO!
# =================================================================

# 1. Convertimos los 3 principales riesgos IRDC a un formato de lista simple
top_3_dependencias = []
for idx, val in indice_riesgo_dependencia.head(3).items():
    top_3_dependencias.append({
        'nombre': TICKER_TO_NAME.get(idx, idx),
        'puntuacion_irdc': f'{val:.2f}'
    })

# 2. Estructura final del JSON
datos_json = {
    'ultima_actualizacion': datetime.now().strftime("%d/%m/%Y a las %H:%M"),
    'resumen_maximo': f"Riesgo Máximo: {TICKER_TO_NAME.get(activo_a_max, activo_a_max)} y {TICKER_TO_NAME.get(activo_b_max, activo_b_max)} ({correlacion_maxima:.2f})",
    'top_dependencias': top_3_dependencias
}

# 3. Guardamos el archivo JSON en la carpeta GeoWeb/
ruta_json_web = 'GeoWeb/data.json'

with open(ruta_json_web, 'w') as f:
    json.dump(datos_json, f, indent=4)

print(f"\n✅ Datos de la Web exportados a {ruta_json_web}!")
# =================================================================


# =================================================================
# MODULO 3: GENERACIÓN DEL INFORME PDF (ReportLab)
# =================================================================
fecha_actual = datetime.now().strftime("%Y%m%d")
nombre_archivo_pdf = f"INFORME_GEOPOLITICO_{fecha_actual}.pdf"
buffer = io.BytesIO()
doc = SimpleDocTemplate(buffer, pagesize=letter, title=nombre_archivo_pdf)
styles = getSampleStyleSheet()

# 1. Convertir la tabla IRDC de Pandas a formato de lista para ReportLab
data_ircd = [["ACTIVO", "DEPENDENCIA (IRDC)"]] + [[TICKER_TO_NAME.get(idx, idx), f'{val:.2f}'] for idx, val in indice_riesgo_dependencia.items()]

# 2. Generar Gráfico de Rendimiento Comparativo
temp_png_rendimiento = 'temp_rendimiento.png'
plt.figure(figsize=(10, 5))
rendimiento_comparativo[['USDMXN=X', 'USDBRL=X', 'USDCOP=X', 'USDCLP=X']].plot(ax=plt.gca(), legend=False)
plt.title('Rendimiento Comparativo de Divisas LATAM (Últimos 30 días)', fontsize=14)
plt.ylabel('Rendimiento (Base 100)')
plt.grid(True)
plt.legend([TICKER_TO_NAME.get(t, t) for t in ['USDMXN=X', 'USDBRL=X', 'USDCOP=X', 'USDCLP=X']], loc='best')
plt.savefig(temp_png_rendimiento, dpi=300)
plt.close()

# 3. Guardar el Mapa de Calor temporalmente como PNG
temp_png_mapa = 'temp_mapa_calor.png'
plt.figure(figsize=(10, 8))
sns.heatmap(matriz_correlacion, annot=True, cmap="coolwarm", fmt=".2f", linewidths=.5, cbar_kws={'label': 'Coeficiente de Correlación'})
plt.title('Mapa de Calor de Correlaciones Geo-Financieras', fontsize=16)
plt.yticks(rotation=0)
plt.xticks(rotation=90)
plt.tight_layout()
plt.savefig(temp_png_mapa, dpi=300)
plt.close()


# 4. Construir el contenido (Ensayo y Gráficos)
Story = []
Story.append(Paragraph(f"<b>INFORME ESTRATÉGICO GEO-FINANCIERO LATAM</b>", styles['Title']))
Story.append(Paragraph(f"Fecha: {datetime.now().strftime('%d/%m/%Y')} | Análisis de Riesgo Cuantificado", styles['Normal']))
Story.append(Spacer(1, 0.4 * inch))

# --- GRÁFICO DE TENDENCIA (DIDÁCTICO) ---
Story.append(Paragraph(f"<b>1. TENDENCIA DE MERCADO (Últimos 30 Días)</b>", styles['Heading2']))
Story.append(Paragraph("Este gráfico muestra cómo han variado las principales divisas de la región. Una línea ascendente indica fortaleza de la divisa frente al dólar.", styles['Normal']))
Story.append(Image(temp_png_rendimiento, width=450, height=250))
Story.append(Spacer(1, 0.4 * inch))


# --- TABLA IRDC ---
Story.append(Paragraph(f"<b>2. ÍNDICE DE RIESGO DE DEPENDENCIA (IRDC)</b>", styles['Heading2']))
Story.append(Paragraph(f"Puntaje de volatilidad promedio ligado a los impulsos globales (Petróleo, Cobre, S&P 500):", styles['Normal']))
table_style = TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
])
t = Table(data_ircd, colWidths=[2*inch, 2*inch])
t.setStyle(table_style)
Story.append(t)
Story.append(Spacer(1, 0.4 * inch))


# --- ANÁLISIS DE CORRELACIÓN (HARVARD) ---
Story.append(Paragraph(f"<b>3. RIESGO ESTRATÉGICO Y COBERTURA (Análisis Cuantitativo)</b>", styles['Heading2']))
Story.append(Paragraph(resumen_narrativo.replace('\n', '<br/>'), styles['BodyText']))
Story.append(Spacer(1, 0.4 * inch))


# --- NUEVA SECCIÓN: GEOPOLÍTICA A NIVEL EJECUTIVO ---
Story.append(Paragraph(f"<b>4. JUICIO GEOPOLÍTICO: LA TRADUCCIÓN DE LA POLÍTICA MONETARIA</b>", styles['Heading2']))
Story.append(Paragraph(f"Los movimientos en los pares de divisas no son accidentales; son la respuesta cuantificada a las decisiones de Washington y Beijing. Nuestro análisis lo revela:", styles['BodyText']))
Story.append(Spacer(1, 0.1 * inch))

Story.append(Paragraph(f"<b>Dependencia del Bloque (México/Brasil):</b> La correlación de {correlacion_maxima:.2f} entre el Peso Mexicano y el Real Brasileño demuestra que <b>las políticas internas tienen un efecto limitado</b>. El destino de ambos activos está unido por la liquidez del mercado estadounidense. No diversificar aquí es un error costoso.", styles['BodyText']))
Story.append(Spacer(1, 0.1 * inch))

Story.append(Paragraph(f"<b>El Contagio de la Tasa de EE. UU.:</b> Cuando la Reserva Federal de EE. UU. (FED) sube las tasas, estas economías más pequeñas se ven obligadas a subir las suyas para evitar que el capital huya, lo cual impacta el crecimiento. El riesgo sistémico es la **política monetaria no oficial de la región**.", styles['BodyText']))
Story.append(Spacer(1, 0.4 * inch))


# --- CONCLUSIÓN DE INVERSIÓN (JUICIO PROFESIONAL) ---
Story.append(Paragraph(f"<b>5. CONCLUSIÓN Y RECOMENDACIÓN DE INVERSIÓN EN ACCIONES LATAM</b>", styles['Heading1']))
Story.append(Spacer(1, 0.2 * inch))

Story.append(Paragraph(f"<b>DECISIÓN BASE: MÉXICO (PESO)</b>", styles['Heading3']))
Story.append(Paragraph(
    f"Nuestro análisis revela que la divisa **México (Peso)** ofrece la **menor exposición al riesgo puro de commodities** de toda la región (IRDC de {indice_riesgo_dependencia.loc['USDMXN=X']:.2f}). Las empresas que priorizan la estabilidad y la liquidez deben basar su inversión de capital en activos mexicanos. Esto minimiza el impacto directo de choques geopolíticos en Petróleo o Cobre.",
    styles['BodyText']
))
Story.append(Spacer(1, 0.1 * inch))

Story.append(Paragraph(f"<b>MITIGACIÓN DE RIESGO: ORO (GC=F)</b>", styles['Heading3']))
Story.append(Paragraph(
    f"A pesar de la estabilidad del Peso Mexicano, el riesgo de un evento geopolítico global (como una crisis del S&P 500) sigue siendo latente. Por ello, recomendamos balancear la inversión con el **ORO (GC=F)**. El Oro es la única clase de activo que consistentemente actúa como **cobertura o 'seguro'** en momentos de pánico global, protegiendo su cartera contra el riesgo geopolítico que su inversión en LATAM no puede evitar.",
    styles['BodyText']
))
Story.append(Spacer(1, 0.5 * inch))


# --- EVIDENCIA DEL MAPA DE CALOR ---
Story.append(Paragraph(f"<b>6. EVIDENCIA VISUAL: MAPA DE CALOR DE RIESGO</b>", styles['Heading2']))
Story.append(Paragraph("Las celdas ROJAS indican una dependencia económica total (RIESGO); las AZULES son protección.", styles['Normal']))
Story.append(Image(temp_png_mapa, width=450, height=390))
Story.append(Spacer(1, 0.2 * inch))


doc.build(Story)
buffer.seek(0)
os.remove(temp_png_rendimiento)
os.remove(temp_png_mapa)
print(f"\n¡PDF Generado Exitosamente: {nombre_archivo_pdf}!")


# =================================================================
# MODULO 4: AUTOMATIZACIÓN DEL EMAIL (ENTREGA DE VALOR - INFORME ROBUSTO)
# =================================================================

# --- 2. CREACIÓN DEL MENSAJE Y ADJUNTO ---
msg = MIMEMultipart()
msg['From'] = sender_email
msg['To'] = receiver_email
subject = f"INFORME PREMIUM: Análisis de Riesgo Geo-Financiero Cuantificado ({datetime.now().strftime('%d/%m/%Y')})"
msg['Subject'] = subject

# Cuerpo del mensaje (texto del informe)
body = f"""
Estimado suscriptor,

Adjuntamos el INFORME ESTRATÉGICO GEO-FINANCIERO LATAM, generado automáticamente por nuestra plataforma de Inteligencia Cuantificada.

Este informe contiene:
1. Rendimiento Comparativo del Mercado (Gráfico)
2. Índice de Riesgo de Dependencia (IRDC) por País.
3. Conclusión Ejecutiva sobre la mejor inversión en acciones LATAM.

¡Gracias por su suscripción!
Atentamente,
Tu Plataforma de Análisis Cuantitativo
"""
msg.attach(MIMEText(body, 'plain'))

# --- ADJUNTAR EL PDF DESDE LA MEMORIA (BUFFER) ---
if buffer:
    print(f"Adjuntando el PDF: {nombre_archivo_pdf}")
    part = MIMEBase("application", "pdf")
    part.set_payload(buffer.getvalue())
    encoders.encode_base64(part)
    part.add_header("Content-Disposition", f"attachment; filename= {nombre_archivo_pdf}")
    msg.attach(part)
else:
    print(f"Error: No se encontró el buffer PDF para adjuntar.")

# --- 3. ENVÍO DEL EMAIL USANDO SMTP ---
try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(sender_email, password)
    server.sendmail(sender_email, receiver_email, msg.as_string())
    print("\n✅ ¡Éxito! El informe premium ha sido enviado automáticamente por email.")

except Exception as e:
    print(f"\n❌ ERROR al enviar el correo. Detalles: {e}")
    print("POSIBLES CAUSAS: 1. Contraseña de Aplicación incorrecta. 2. Puerto SMTP bloqueado.")
finally:
    if 'server' in locals() and server:
        server.quit()