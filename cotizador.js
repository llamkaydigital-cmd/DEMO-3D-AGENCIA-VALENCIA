(() => {
  'use strict';
  // Datos ficticios: no son programas ni tarifas confirmados por la agencia.
  const catalogo = [
    { id: 'cusco', nombre: 'Cusco y Valle Sagrado', dias: 5, precio: 1550, itinerario: 'Cusco · Valle Sagrado · Machu Picchu · Despedida' },
    { id: 'trail', nombre: 'Cusco y Short Inca Trail', dias: 5, precio: 2180, itinerario: 'Cusco · Valle Sagrado · Short Inca Trail · Machu Picchu · Despedida' },
    { id: 'peru', nombre: 'Perú de ejemplo', dias: 10, precio: 3200, itinerario: 'Lima · Cusco · Valle Sagrado · Machu Picchu' }
  ];
  const desde = '2027-01-01', hasta = '2027-12-31';
  const $ = id => document.getElementById(id);
  const money = n => 'US$ ' + n.toLocaleString('en-US');
  const programa = $('programa'), form = $('quote-form'), resultado = $('resultado');
  catalogo.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = `${item.nombre} · ${item.dias} días`;
    programa.appendChild(option);
    const card = document.createElement('div');
    card.className = 'catalog-item';
    const title = document.createElement('strong');
    title.textContent = `${item.nombre} · ${item.dias} días`;
    const route = document.createElement('p');
    route.textContent = item.itinerario;
    const price = document.createElement('small');
    price.textContent = `Tarifa ficticia: ${money(item.precio)} por persona · Vigencia de ejemplo: ${desde} a ${hasta}`;
    card.append(title, route, price);
    $('catalogo').appendChild(card);
  });
  programa.value = 'trail';
  function resetResult() {
    resultado.replaceChildren();
    const heading = document.createElement('h2');
    heading.textContent = 'Borrador de cotización';
    const text = document.createElement('p');
    text.textContent = 'Los datos cambiaron. Genera un nuevo borrador para revisarlo.';
    resultado.append(heading, text);
  }
  form.addEventListener('input', resetResult);
  form.addEventListener('change', resetResult);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const nombre = $('nombre').value.trim();
    if (!nombre) { $('nombre').setCustomValidity('Introduce un nombre ficticio.'); $('nombre').reportValidity(); $('nombre').setCustomValidity(''); return; }
    const item = catalogo.find(x => x.id === programa.value);
    const pax = Number($('viajeros').value), fecha = $('fecha').value, escenario = $('escenario').value;
    if (!item || !Number.isInteger(pax) || pax < 1 || pax > 20) return;
    const validRate = fecha >= desde && fecha <= hasta && escenario !== 'expired';
    const pending = escenario === 'offline' || escenario === 'pending';
    const preliminary = pending && $('preliminar').checked && validRate;
    const allowed = validRate && (!pending || preliminary);
    const source = escenario === 'offline' ? 'Tarifario ARM de ejemplo · cargado el 01/01/2027' : 'Tarifario de ejemplo · fuente simulada';
    resultado.replaceChildren();
    function add(tag, text, className) {
      const el = document.createElement(tag); el.textContent = text;
      if (className) el.className = className;
      resultado.appendChild(el); return el;
    }
    add('h2', 'Borrador de cotización');
    add('span', !validRate ? 'Bloqueado · tarifa no vigente' : pending ? (preliminary ? 'Preliminar · disponibilidad pendiente' : 'Bloqueado · disponibilidad pendiente') : 'Listo para revisión humana', 'tag ' + (allowed ? 'pending' : ''));
    add('p', `${nombre} · ${pax} ${pax === 1 ? 'viajero' : 'viajeros'} · salida ${fecha}`);
    add('p', `${item.nombre} · ${item.dias} días`);
    add('p', item.itinerario, 'result-line');
    add('p', `Origen: ${source}. Vigencia: ${desde} a ${hasta}.`);
    add('p', pending ? 'Disponibilidad: por confirmar. Una tarifa no confirma disponibilidad.' : 'Disponibilidad: confirmada solo para esta simulación.');
    if (escenario === 'offline') add('p', 'TourPlan sin respuesta (simulado). Se muestra el tarifario alternativo ficticio; no se hizo ninguna consulta real.', 'error');
    if (!validRate) add('p', 'La tarifa no está vigente para la fecha de viaje o se simuló una tarifa vencida. No se calcula el total ni se puede aprobar.', 'error');
    if (pending && !preliminary && validRate) add('p', 'Para este ejemplo, habilita la opción preliminar si la política de la agencia lo permite. De otro modo permanece bloqueado.', 'error');
    if (validRate) {
      add('p', `${money(item.precio)} por persona × ${pax} = ${money(item.precio * pax)} en total.`, 'result-line');
      add('p', `Hola ${nombre}, te compartimos una propuesta ${preliminary ? 'preliminar, con servicios pendientes de confirmación' : 'de ejemplo'}: ${item.nombre}, ${item.dias} días para ${pax} ${pax === 1 ? 'persona' : 'personas'}. Total ilustrativo: ${money(item.precio * pax)}. Sujeta a revisión por un asesor.`, 'message');
    }
    if (allowed) {
      const button = add('button', preliminary ? 'Aprobar preliminar (simulado)' : 'Aprobar borrador (simulado)', 'primary');
      button.type = 'button';
      button.addEventListener('click', () => {
        button.disabled = true;
        add('p', 'Aprobación simulada en esta pantalla. No se envió ningún mensaje ni se registró una aprobación real.', 'tag done');
      });
    }
    add('p', 'Valores y disponibilidad ficticios. No se guarda ni envía información.', 'muted');
  });
})();
