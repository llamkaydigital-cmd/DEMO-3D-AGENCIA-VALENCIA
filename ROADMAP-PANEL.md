# Roadmap · Recuperación del panel operativo

## Referencia

Las capturas del panel original muestran navegación lateral, indicadores, tareas, embudo, tablero de consultas, cotizaciones detalladas, cobros, clientes y chat simulado. La migración debe recuperar el flujo completo sin perder itinerarios, integraciones ni roles simulados.

## Etapas

1. **Flujo de demostración:** datos ficticios compartidos entre panel, consultas, cotizaciones, cobros, clientes y chat. El envío y los pagos son simulados.
2. **Interfaz:** navegación lateral adaptable, indicadores, tablero por etapas, detalle de cotización con mensaje editable y desglose transparente.
3. **Reglas:** no inventar fechas, diferenciar tarifario de disponibilidad, bloquear tarifas inválidas, indicar explícitamente las pre-cotizaciones y evitar la edición libre de importes validados.
4. **Catálogo y administración:** conservar itinerarios, PDF en sesión, integraciones y roles visuales; no introducir credenciales reales.
5. **Conexión con el 3D:** diseñar un caso compartido y una API de demo aislada; actualmente solo se transfiere la estación seleccionada.
6. **Persistencia y producción:** backend, autenticación, permisos, auditoría, documentos corporativos, integraciones y pruebas supervisadas. No usar datos reales hasta completar seguridad y validación.

## Criterios para la demo

- Una consulta simulada puede avanzar de nuevo a seguimiento, cotizado y ganado.
- Una cotización muestra itinerario, importes, fuente y disponibilidad simulados.
- Tarifas ausentes o vencidas bloquean la aprobación; servicios pendientes solo permiten pre-cotización cuando se autoriza expresamente.
- Aprobar no envía mensajes reales; registrar pagos no procesa dinero.
- Los datos de la demo son temporales y no representan conexiones reales.
- La interfaz se adapta a móvil y conserva controles accesibles.

## Estado de esta iteración

El panel React incluye navegación lateral, tablero, cotizaciones, cobros y chat simulados con estado compartido en memoria, y conserva itinerarios y roles visuales. Dos programas de ejemplo incluyen un desglose ficticio de precios de venta por servicio; los itinerarios añadidos por el usuario conservan únicamente el precio del paquete. No se calculan costos ni utilidades reales. El texto editable rechaza dígitos como precaución de demo, sin constituir validación para producción.

Pendientes: persistencia y conexión completa con el 3D; carga real y lectura de PDF; catálogo estructurado con tarifas por servicio; pruebas funcionales y de accesibilidad en navegador; autenticación y permisos reales; integraciones autorizadas; auditoría y controles de producción. Las reglas y datos de esta demo no deben utilizarse para operar con clientes reales.

## Pendientes priorizados

### Para completar la demo comercial

- [ ] Probar en navegador el recorrido de consulta, borrador, aprobación simulada y depósito, incluidos móvil y teclado.
- [ ] Compartir el caso completo entre 3D y panel mediante una API de demostración con sesiones aisladas. Actualmente solo se comparte la estación seleccionada.
- [ ] Persistir y reiniciar cada sesión ficticia sin mezclar información entre visitantes.
- [ ] Permitir editar líneas de servicios, sus tarifas de ejemplo, vigencia y disponibilidad; incorporar controles por línea.
- [ ] Mejorar el modal, el embudo y la bandeja de chat conforme a las capturas del panel original.
- [ ] Incorporar pruebas automatizadas de transiciones, cálculos, bloqueos y recuperación de estado.

### Para la implementación real, después del acuerdo y autorización

- [ ] Diseñar backend, base de datos y controles de seguridad en infraestructura acordada con la empresa.
- [ ] Implementar inicio de sesión corporativo, autorización por rol, registro de auditoría y protección de secretos.
- [ ] Permitir carga persistente y extracción segura de PDF; revisar y aprobar el contenido antes de usarlo.
- [ ] Integrar SharePoint/Microsoft 365 y definir propiedad, permisos, retención, eliminación y respaldo.
- [ ] Validar y conectar HubSpot, WhatsApp Business, TourPlan y el proveedor de IA elegido.
- [ ] Aplicar validaciones financieras y de disponibilidad en servidor, con aprobación humana y trazabilidad.
- [ ] Realizar pruebas supervisadas, recuperación y entrega documentada antes de usar datos reales.
