# Roadmap · Agente IA y memoria del ARM

## Objetivo

Diseñar un agente que conserve y recupere únicamente el contexto útil de cada viaje, inspirado en el enfoque de memoria curada y recuperación selectiva de Engram. La intención es mejorar la continuidad de la atención y evaluar el consumo de tokens, sin depender de almacenar conversaciones completas en cada solicitud.

**Estado actual:** el proyecto es una demo. No existe todavía un agente conectado, memoria persistente, lectura automática de PDF, autenticación ni integración con servicios corporativos. Este documento es una guía futura, no una descripción de funcionalidades implementadas.

## Principios

- Separar reglas del agente, memoria de conversaciones, catálogo de itinerarios y tarifas.
- Aislar los datos por empresa y controlar su acceso por usuario y rol.
- Guardar solo información necesaria, con origen, fecha y reglas de conservación y eliminación.
- Las tarifas, cálculos y controles de disponibilidad no dependen de la memoria de la IA.
- Ningún envío comercial real se realiza sin la aprobación humana prevista en la política acordada.
- El cliente controla sus cuentas, datos, accesos y exportaciones.
- No asumir que Engram es la base de datos del ARM: evaluar cada herramienta por sus requisitos técnicos y de privacidad.

## Fase 1 · Diseño y demostración

- [ ] Definir con la agencia qué datos del viaje son necesarios, quién puede verlos y cuándo se eliminan.
- [ ] Diseñar una ficha de ejemplo por viaje: idioma, destino, fechas, pasajeros, intereses y datos pendientes.
- [ ] Diseñar reglas visibles para el agente: tono, idiomas, preguntas, escalamiento y aprobación.
- [ ] Simular en el panel el contexto que recibiría la IA, usando exclusivamente datos ficticios.
- [ ] Mostrar claramente qué información proviene del viajero y qué procede del catálogo.
- [ ] No conectar proveedores ni almacenar credenciales durante esta fase.

## Fase 2 · Backend y control de acceso

- [ ] Incorporar una API y persistencia bajo control acordado con el cliente.
- [ ] Implementar autenticación y autorización en el servidor, no solo ocultar controles en la interfaz.
- [ ] Evaluar Microsoft Entra ID para cuentas corporativas y definir roles de administración, ventas y otros necesarios.
- [ ] Proteger secretos en el servidor con un mecanismo adecuado al entorno; nunca enviarlos al navegador ni subirlos al repositorio.
- [ ] Definir auditoría, copias, restauración, exportación, retención y eliminación.
- [ ] Verificar requisitos legales y contractuales de protección de datos con asesoría competente.

## Fase 3 · Memoria por viaje

- [ ] Guardar hechos estructurados con su fuente, fecha, estado de confirmación y referencia al viaje.
- [ ] Mantener resúmenes breves de conversación y una ventana limitada de mensajes recientes.
- [ ] Recuperar solo datos pertinentes, respetando empresa, viaje y permisos.
- [ ] Permitir corrección y eliminación; evitar que un resumen sustituya sin revisión información crítica.
- [ ] Tratar datos sensibles con especial cautela y minimizar su recopilación.
- [ ] Probar casos de información contradictoria, incompleta, desactualizada o atribuida al viajero equivocado.

## Fase 4 · Documentos e itinerarios

- [ ] Acordar con la agencia el almacenamiento de originales en SharePoint u otra ubicación corporativa.
- [ ] Implementar carga, controles de seguridad y extracción de contenido de PDF; considerar documentos escaneados y errores de lectura.
- [ ] Exigir revisión y aprobación humana antes de incorporar contenido al catálogo.
- [ ] Recuperar fragmentos pertinentes de documentos aprobados, con referencia a origen y versión.
- [ ] Gestionar actualizaciones, retirada de documentos y eliminación de índices o copias derivadas.
- [ ] Tratar el contenido recuperado como datos no confiables, no como instrucciones que puedan alterar las reglas del agente.

## Fase 5 · Integraciones y cotizaciones

- [ ] Definir adaptadores para proveedores de IA y conexión con credenciales bajo control del cliente.
- [ ] Integrar HubSpot y WhatsApp Business cuando exista autorización y acceso.
- [ ] Validar con TourPlan la interfaz disponible, licencias y condiciones antes de implementar la conexión.
- [ ] Consultar tarifas y vigencias desde TourPlan o el tarifario aprobado del ARM.
- [ ] Tratar la disponibilidad por separado: el tarifario alternativo no la confirma.
- [ ] Validar importes y reglas en el servidor; bloquear errores y gestionar preliminares según la política aprobada.
- [ ] Registrar fuentes, fecha, validaciones y aprobación humana de cada cotización.

## Fase 6 · Medición y pruebas

- [ ] Medir tokens de entrada y salida, coste, latencia y calidad por flujo, sin registrar información sensible innecesaria.
- [ ] Comparar una línea base con historial completo frente a memoria resumida y recuperación selectiva.
- [ ] Medir también costes de resúmenes, extracción e indexación; no prometer ahorro antes de probarlo.
- [ ] Probar aislamiento entre empresas, recuperación de respaldos, errores de integración y acceso no autorizado.
- [ ] Revisar periódicamente memoria obsoleta, errores de recuperación y cambios de reglas.

## Engram: posible uso para desarrollo

Engram puede evaluarse para conservar decisiones técnicas del proyecto entre sesiones de desarrollo, sin datos privados de viajeros. Su uso para datos comerciales requeriría una evaluación independiente de aislamiento, control de acceso, eliminación, recuperación y titularidad; no está aprobado ni integrado.

Referencias: [Engram](https://github.com/Gentleman-Programming/engram) y [Engram Cloud](https://github.com/Gentleman-Programming/engram/blob/main/docs/engram-cloud/README.md).
