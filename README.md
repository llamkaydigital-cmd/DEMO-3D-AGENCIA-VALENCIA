# Demo 3D · Agencia Valencia · Llamkay ARM

Demo de Llamkay ARM (Agent Relationship Management) para Valencia Travel: el recorrido de una viajera de ejemplo, desde su primer mensaje hasta la reserva, con la perspectiva del viajero y la del ARM. Siempre hay una persona detrás de cada envío.

**Demo 3D:** https://claude.ai/artifact/3oeu2mkBBCscCWFjeiD4Et

**Demo en Apps Script (panel de consultas, cotizaciones y cobros):** https://script.google.com/macros/s/AKfycbwdhEQ03-F4eprDHvfDuSxxD7eZ47ZYqzzEv3vaMP0DTRkQ1OIF217_OeTfLKUOIDQTYA/exec

Si el link de Apps Script da 404 con varias cuentas de Google abiertas, ábrelo en incógnito.

`index.html` es el código fuente de la demo 3D (un solo archivo, Three.js).

## Demo integrada

El plan futuro para reglas del agente, memoria y recuperación de itinerarios está en [ROADMAP-MEMORIA-IA.md](ROADMAP-MEMORIA-IA.md).
La recuperación del panel operativo y su flujo de demo están planificados en [ROADMAP-PANEL.md](ROADMAP-PANEL.md).

### Migración React (en curso)

`app/` contiene la primera versión del panel en React, Vite y TypeScript. Ejecuta `cd app`, `npm install` y `npm run dev` para probarla. Incluye una maqueta de itinerarios e integraciones: los cambios y los PDF seleccionados viven solo en la sesión del navegador. Se puede abrir el PDF, pero no se envía al servidor, se guarda de forma permanente ni se analiza. No introducir datos reales.

El panel React incluye un flujo simulado de consultas, cotizaciones y pagos basado en el catálogo de la sesión, pero no comparte casos completos con el 3D. La migración del 3D, la persistencia, la carga real de documentos y la API compartida están pendientes. Como precaución de la demo se rechazan dígitos en el texto editable y se presenta el importe por separado; esto no es una validación financiera para producción.

El selector de usuarios y el apartado de roles son una simulación en memoria: no crean cuentas ni implementan autenticación o autorización. No usar datos reales.

Abre `index.html` y usa **Panel operativo** para pasar la estación seleccionada a `panel.html` mediante el parámetro `paso` de la URL. El panel muestra hitos ilustrativos; no es sincronización en vivo ni se comparten consultas o cotizaciones. Abrir el panel directamente muestra el caso sin progreso.

Para probarlo de forma consistente, sirve esta carpeta con un servidor local, por ejemplo `python3 -m http.server 8000`, y visita `http://localhost:8000`. La demo 3D requiere acceso al CDN de Three.js y WebGL.

## Preparación para VPS

`compose.yaml` y `deploy/nginx.conf` preparan dos sitios estáticos: `demo3d.llamkaydigitals.com` y `arm.llamkaydigitals.com`, mediante Traefik y la red externa `veritaz`. Antes de usarlos:

1. Configura registros DNS para ambos subdominios apuntando a la IP pública del VPS; configura AAAA solo si IPv6 funciona.
2. El servidor debe tener Docker Compose, Traefik con entrada `websecure`, el resolver `mytlschallenge` y la red externa `veritaz`. No se publican puertos adicionales.
3. Desde la carpeta del proyecto ejecuta `docker compose up -d --build`. La imagen compila el panel React; Traefik gestiona los certificados.
4. Visita ambos subdominios y comprueba navegación y certificados. Para ver el estado usa `docker compose logs llamkay-valencia-demo`.

El servidor solo publica los archivos necesarios. Es una demo pública sin autenticación ni base de datos: no usar datos reales. Una API común, aislamiento por usuario, persistencia y conexiones reales quedan pendientes.

La sección de integraciones es solo una maqueta: HubSpot, TourPlan y Microsoft 365 no están conectados; los campos están deshabilitados y no reciben credenciales. La aplicación no guarda itinerarios en Microsoft 365 ni implementa autenticación o almacenamiento de producción. No introducir datos reales. El panel de Apps Script enlazado arriba es una demo independiente.

En **Cotizaciones**, el panel React permite escoger un programa ficticio, viajeros, fecha y escenario. El total se calcula con reglas fijas de ejemplo; las tarifas vencidas bloquean el borrador, y las indisponibilidades solo permiten una aprobación preliminar simulada si se activa esa opción. La aprobación no envía ni guarda nada y no hay IA conectada. El catálogo y las tarifas son ficticios; no se han importado de SharePoint ni de TourPlan. Este flujo es independiente del recorrido fijo de Sophie en 3D.

Todos los datos y precios son de ejemplo, no son tarifas de Valencia Travel.

Llamkay Digital
