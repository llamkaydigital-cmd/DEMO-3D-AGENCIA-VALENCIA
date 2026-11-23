import { useEffect, useState } from 'react';

export type OperationalTab = 'panel' | 'consultas' | 'cotizaciones' | 'cobros' | 'clientes' | 'chat';
type Stage = 'Nuevo' | 'En seguimiento' | 'Cotizado' | 'Ganado';
type Lead = { id: string; name: string; message: string; stage: Stage; pax: number; date: string; itemId: string };
type Item = { id: string; name: string; description: string; price: string; services?: {name:string; price:number}[] };
type Quote = { id: string; leadId: string; item: Item; pax: number; date: string; total: number; text: string; state: 'Borrador' | 'Enviada (simulada)'; scenario: string; preliminary: boolean };
type Payment = { id: string; leadId: string; quoteId: string; total: number; paid: number };
const stages: Stage[] = ['Nuevo', 'En seguimiento', 'Cotizado', 'Ganado'];
const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const initialLeads: Lead[] = [
 { id: 'L001', name: 'Sophie (ejemplo)', message: 'Somos dos y queremos conocer Cusco y el Short Inca Trail.', stage: 'Nuevo', pax: 2, date: '2027-09-15', itemId: 'trail' },
 { id: 'L002', name: 'Daniel Brooks (ejemplo)', message: 'We are four and would like Cusco and the Sacred Valley.', stage: 'Cotizado', pax: 4, date: '2027-09-10', itemId: 'cusco' },
 { id: 'L003', name: 'Ana Beltrán (ejemplo)', message: 'Hola, somos dos y queremos Cusco y el Valle Sagrado.', stage: 'En seguimiento', pax: 2, date: '2027-10-05', itemId: 'cusco' },
 { id: 'L004', name: 'Lucas Almeida (ejemplo)', message: 'Olá! Somos três e queremos conhecer Cusco e o Short Inca Trail.', stage: 'Nuevo', pax: 3, date: '2027-11-12', itemId: 'trail' },
 { id: 'L005', name: 'Marco Rossi (ejemplo)', message: 'Grazie, confermiamo Cusco e il Short Inca Trail per due.', stage: 'Ganado', pax: 2, date: '2027-08-20', itemId: 'trail' }
];
const stCls = (e: string) => /Borrador|Pendiente|Nuevo/.test(e) ? 'w' : (/Ganado|Pagado|recibido/.test(e) ? 'd' : '');

export type Counts = { consultas: number; cotizaciones: number; cobros: number; clientes: number };
export default function Operation({tab, items, go, scenario, onCounts}: {tab: OperationalTab; items: Item[]; go: (tab: OperationalTab) => void; scenario: string; onCounts: (c: Counts) => void}) {
 const seedItem=(id:string)=>items.find(i=>i.id===id) ?? items[0];
 const [leads,setLeads]=useState<Lead[]>(initialLeads);
 const [quotes,setQuotes]=useState<Quote[]>(()=>[
  {id:'K001',leadId:'L002',item:{...seedItem('cusco')},pax:4,date:'2027-09-10',total:6200,text:'Hola Daniel, te compartimos una propuesta de ejemplo.',state:'Enviada (simulada)',scenario:'normal',preliminary:false},
  {id:'K002',leadId:'L003',item:{...seedItem('cusco')},pax:2,date:'2027-10-05',total:3100,text:'Hola Ana, te compartimos una propuesta de ejemplo.',state:'Borrador',scenario:'normal',preliminary:false},
  {id:'K003',leadId:'L005',item:{...seedItem('trail')},pax:2,date:'2027-08-20',total:4360,text:'Hola Marco, te compartimos una propuesta de ejemplo.',state:'Enviada (simulada)',scenario:'normal',preliminary:false}
 ]);
 const [payments,setPayments]=useState<Payment[]>([{id:'P001',leadId:'L002',quoteId:'K001',total:6200,paid:0},{id:'P002',leadId:'L005',quoteId:'K003',total:4360,paid:1744}]);
 const [lastLead,setLastLead]=useState('L001');
 useEffect(()=>{onCounts({consultas:leads.length,cotizaciones:quotes.length,cobros:payments.length,clientes:leads.length});},[leads.length,quotes.length,payments.length,onCounts]);
 const [selected,setSelected]=useState<string|null>(null), [name,setName]=useState(''), [message,setMessage]=useState(''), [pax,setPax]=useState(2), [date,setDate]=useState(''), [itemId,setItemId]=useState('trail');
 const [allowPre,setAllowPre]=useState(false), [paymentId,setPaymentId]=useState<string|null>(null), [amount,setAmount]=useState(''), [notice,setNotice]=useState('');
 const leadById=(id:string)=>leads.find(l=>l.id===id);
 const quoteByLead=(id:string)=>[...quotes].reverse().find(q=>q.leadId===id);
 const selectedQuote=quotes.find(q=>q.id===selected);
 const payment=payments.find(p=>p.id===paymentId);
 const setStage=(id:string,stage:Stage)=>setLeads(old=>old.map(l=>l.id===id?{...l,stage}:l));
 function makeQuote(lead:Lead) {
  const item=items.find(i=>i.id===lead.itemId);
  if(!item || item.price==='' || !Number.isFinite(Number(item.price)) || Number(item.price)<=0 || !lead.date){setNotice('Falta una fecha o un itinerario con precio ficticio mayor que cero.');return;}
  if(item.services && Math.round(item.services.reduce((sum,s)=>sum+s.price,0)*100)!==Math.round(Number(item.price)*100)){setNotice('La suma de servicios no coincide con el precio de ejemplo.');return;}
  const total=Math.round(Number(item.price)*lead.pax*100)/100;
  const q:Quote={id:`K${String(quotes.length+1).padStart(3,'0')}`,leadId:lead.id,item:{...item},pax:lead.pax,date:lead.date,total,text:`Hola ${lead.name}, te compartimos una propuesta de ejemplo.`,state:'Borrador',scenario,preliminary:false};
  setQuotes(old=>[...old,q]);setStage(lead.id,'En seguimiento');setSelected(q.id);setNotice('');
 }
 function approve(q:Quote) {
  const valid=q.date>='2027-01-01'&&q.date<='2027-12-31'&&q.scenario!=='expired';
  const pending=q.scenario==='offline'||q.scenario==='pending';
  if(!valid||(pending&&!allowPre)||/\d/.test(q.text)||!q.text.trim())return;
  setQuotes(old=>old.map(x=>x.id===q.id?{...x,state:'Enviada (simulada)',preliminary:pending}:x));
  setStage(q.leadId,'Cotizado');
  if(!pending)setPayments(old=>old.some(p=>p.quoteId===q.id)?old:[...old,{id:`P${String(old.length+1).padStart(3,'0')}`,leadId:q.leadId,quoteId:q.id,total:q.total,paid:0}]);
  setSelected(null);setAllowPre(false);setNotice(pending?'Pre-cotización simulada; no se crea cobro mientras haya servicios pendientes.':'Envío simulado y cobro ficticio creado. No se ha enviado ningún mensaje real.');
 }
 return <div hidden={!['panel','consultas','cotizaciones','cobros','clientes','chat'].includes(tab)}>
 {notice&&<p className="notice" role="status">{notice}</p>}

 {tab==='panel'&&<>
  <div className="grid kpis">
   <div className="card kpi"><i className="node"/><small>Consultas nuevas</small><div className="v">{leads.filter(l=>l.stage==='Nuevo').length}</div><div className="s">esperan respuesta</div></div>
   <div className="card kpi"><i className="node"/><small>Por aprobar</small><div className="v">{quotes.filter(q=>q.state==='Borrador').length}</div><div className="s">borradores por revisar</div></div>
   <div className="card kpi"><i className="node"/><small>Cotizado simulado</small><div className="v">{money(quotes.filter(q=>q.state!=='Borrador').reduce((a,q)=>a+q.total,0))}</div><div className="s">{quotes.filter(q=>q.state!=='Borrador').length} cotizaciones enviadas (simulado)</div></div>
   <div className="card kpi"><i className="node"/><small>Por cobrar</small><div className="v">{money(payments.reduce((a,p)=>a+p.total-p.paid,0))}</div><div className="s">{payments.filter(p=>p.paid<p.total).length} cobros abiertos</div></div>
  </div>
  <div className="grid two space">
   <section className="card"><h2>Embudo de ventas</h2>{(()=>{const mx=Math.max(1,...stages.map(s=>leads.filter(l=>l.stage===s).length));return stages.map(s=>{const n=leads.filter(l=>l.stage===s).length;return <div className="bar" key={s}><span>{s}</span><div className="tr"><i style={{width:`${Math.max(4,Math.round(n/mx*100))}%`}}/></div><b>{n}</b></div>;});})()}<p className="note">Las etapas avanzan al preparar la cotización, aprobarla y registrar el depósito (todo simulado).</p></section>
   <section className="card"><h2>Para hoy</h2>{(()=>{const rows:React.ReactNode[]=[];
    leads.filter(l=>l.stage==='Nuevo').forEach(l=>rows.push(<div className="todo" key={'n'+l.id}><div><b>Responder a {l.name}</b><small>{l.message}</small></div><button className="active sm" onClick={()=>makeQuote(l)}>Preparar cotización</button></div>));
    quotes.filter(q=>q.state==='Borrador').forEach(q=>rows.push(<div className="todo" key={'q'+q.id}><div><b>Aprobar cotización {q.id}</b><small>{leadById(q.leadId)?.name} · {q.item.name} · {money(q.total)}</small></div><button className="active sm" onClick={()=>setSelected(q.id)}>Revisar</button></div>));
    payments.filter(p=>p.paid<p.total).forEach(p=>rows.push(<div className="todo" key={'p'+p.id}><div><b>Cobro {p.id} · {leadById(p.leadId)?.name}</b><small>Saldo {money(p.total-p.paid)} · {p.paid>=Math.round(p.total*.4*100)/100?'Depósito simulado recibido':'Pendiente de depósito'}</small></div><button className="sm" onClick={()=>{setPaymentId(p.id);setAmount(String(Math.max(0,Math.round(p.total*.4*100)/100-p.paid)||p.total-p.paid));}}>Registrar pago</button></div>));
    return rows.length?rows:<p>No hay tareas pendientes.</p>;})()}</section>
  </div></>}
 {tab==='consultas'&&<div className="grid kan">{stages.map(s=><div className="col" key={s}><h4>{s}<em>{leads.filter(l=>l.stage===s).length}</em></h4>{leads.filter(l=>l.stage===s).map(l=><div className="item" key={l.id}><b>{l.name}</b><small>{l.id} · WhatsApp simulado</small><p>{l.message}</p>{l.stage==='Nuevo'?<button className="active sm" onClick={()=>makeQuote(l)}>Preparar cotización</button>:<button className="sm" onClick={()=>{const q=quoteByLead(l.id);if(q)setSelected(q.id);}}>Ver cotización</button>}</div>)}</div>)}</div>}
 {tab==='cotizaciones'&&<section className="card"><h2>Cotizaciones de ejemplo</h2>{quotes.length===0?<p>Aún no hay borradores. Prepara la cotización de una consulta nueva.</p>:<div className="table-wrap"><table><thead><tr><th>ID</th><th>Cliente</th><th>Itinerario</th><th>Viajeros</th><th>Total</th><th>Estado</th><th></th></tr></thead><tbody>{quotes.map(q=><tr key={q.id}><td>{q.id}</td><td>{leadById(q.leadId)?.name}</td><td>{q.item.name}</td><td>{q.pax}</td><td>{money(q.total)}</td><td><span className={`st ${stCls(q.state)}`}>{q.state}</span></td><td><button className="sm" onClick={()=>setSelected(q.id)}>Ver detalle</button></td></tr>)}</tbody></table></div>}</section>}
 {tab==='cobros'&&<section className="card"><h2>Cobros simulados</h2>{payments.length===0?<p>Aún no hay cobros de ejemplo.</p>:<div className="table-wrap"><table><thead><tr><th>ID</th><th>Cliente</th><th>Total</th><th>Pagado</th><th>Avance</th><th>Saldo</th><th>Estado</th><th></th></tr></thead><tbody>{payments.map(p=>{const pc=Math.min(100,Math.round(p.paid/p.total*100));const est=p.paid>=p.total?'Pagado total':p.paid>=Math.round(p.total*.4*100)/100?'Depósito simulado recibido':'Pendiente de depósito';return <tr key={p.id}><td>{p.id}</td><td>{leadById(p.leadId)?.name}</td><td>{money(p.total)}</td><td>{money(p.paid)}</td><td><div className="prog" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pc} aria-label={`Avance de ${p.id}`}><i style={{width:`${pc}%`}}/></div></td><td>{money(p.total-p.paid)}</td><td><span className={`st ${stCls(est)}`}>{est}</span></td><td>{p.paid<p.total&&<button className="sm" onClick={()=>{setPaymentId(p.id);setAmount(String(Math.max(0,Math.round(p.total*.4*100)/100-p.paid)||p.total-p.paid));}}>Registrar pago</button>}</td></tr>;})}</tbody></table></div>}</section>}
 {tab==='clientes'&&<div className="grid cli">{leads.map(l=><section className="card" key={l.id}><h2>{l.name}</h2><p>WhatsApp simulado · {l.pax} viajeros</p><p>{l.message}</p><span className={`st ${stCls(l.stage)}`}>{l.stage}</span></section>)}</div>}
 {tab==='chat'&&(()=>{const cl=leadById(lastLead)??leads[0];const cq=cl?quoteByLead(cl.id):undefined;return <div className="grid chat">
  <div className="phone"><div className="ph-h"><div className="av">{cl?cl.name.charAt(0).toUpperCase():'?'}</div><div>{cl?.name}<small>WHATSAPP · SIMULADO</small></div></div>
   <div className="ph-b">{cl&&<div className="msg c">{cl.message}</div>}{cq&&<div className="msg s">{cq.state==='Borrador'?`Cotización ${cq.id} lista como borrador · pendiente de aprobación`:`Cotización ${cq.id} aprobada (envío simulado)`}</div>}{cq&&cq.state!=='Borrador'&&<div className="msg a">{cq.text}{cq.preliminary?' Pre-cotización sujeta a confirmación de servicios.':''}</div>}</div>
   <div className="ph-f"><form onSubmit={e=>{e.preventDefault();if(!name.trim()||!message.trim()||!date||!Number.isInteger(pax)||pax<1||pax>20)return;const l:Lead={id:`L${String(leads.length+1).padStart(3,'0')}`,name:name.trim(),message:message.trim(),pax,date,itemId,stage:'Nuevo'};setLeads(old=>[...old,l]);setLastLead(l.id);setName('');setMessage('');setNotice('Consulta ficticia creada. Selecciona «Preparar cotización» en Consultas.');}}>
   <div className="q"><button type="button" onClick={()=>{setName('Sophie (ejemplo)');setMessage('Somos dos y nos interesa Cusco y el Short Inca Trail.');setPax(2);setDate('2027-09-15');setItemId('trail');}}>Cargar ejemplo</button></div>
   <label htmlFor="lead-name">Nombre ficticio</label><input id="lead-name" value={name} maxLength={60} onChange={e=>setName(e.target.value)} required/>
   <label htmlFor="lead-message">Mensaje de ejemplo</label><textarea id="lead-message" value={message} maxLength={1500} onChange={e=>setMessage(e.target.value)} required/>
   <label htmlFor="lead-pax">Viajeros</label><input id="lead-pax" type="number" min="1" max="20" value={pax} onChange={e=>setPax(Number(e.target.value))} required/>
   <label htmlFor="lead-date">Fecha de viaje</label><input id="lead-date" type="date" value={date} onChange={e=>setDate(e.target.value)} required/>
   <label htmlFor="lead-itinerary">Itinerario seleccionado por el asesor</label><select id="lead-itinerary" value={itemId} onChange={e=>setItemId(e.target.value)}>{items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select>
   <button className="active" style={{width:'100%'}}>Crear consulta simulada</button></form></div></div>
  <section className="card"><h2>Cómo funciona</h2><p>La selección del itinerario es manual. No hay IA ni WhatsApp conectados; una persona revisa el borrador antes del envío simulado.</p><p>Nada sale sin aprobación: la persona del equipo decide qué se envía y las cifras salen de la tarifa, no del texto.</p><h2 style={{marginTop:18}}>Mensajes simulados de esta sesión</h2>{quotes.filter(q=>q.state!=='Borrador').length===0&&<p>Aún no hay mensajes enviados.</p>}{quotes.filter(q=>q.state!=='Borrador').map(q=><div className="todo" key={q.id}><div><b>Para {leadById(q.leadId)?.name} · {q.id}</b><small>{q.text} · {q.item.name} · {money(q.total)}{q.preliminary?' · pre-cotización sujeta a confirmación de servicios':''}</small></div></div>)}</section></div>;})()}
 {selectedQuote&&<div className="overlay"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="quote-title"><h2 id="quote-title">{selectedQuote.item.name}</h2><p>{leadById(selectedQuote.leadId)?.name} · {selectedQuote.pax} viajeros · {selectedQuote.state}</p><p>Precio total ficticio: <strong>{money(selectedQuote.total)}</strong> · fecha {selectedQuote.date}</p><h3>Itinerario</h3><p>{selectedQuote.item.description}</p><h3>Mensaje para el cliente</h3><label htmlFor="quote-message">Texto editable sin importes</label><textarea id="quote-message" value={selectedQuote.text.split('\n\nTotal ilustrativo:')[0]} readOnly={selectedQuote.state!=='Borrador'} onChange={e=>setQuotes(old=>old.map(q=>q.id===selectedQuote.id?{...q,text:e.target.value}:q))}/><p>Importe validado, añadido por el sistema: {money(selectedQuote.total)}</p>
 <h3>Detalle de tarifa simulada</h3>{selectedQuote.item.services?<><div className="table-wrap"><table><thead><tr><th>Servicio</th><th>Precio / persona</th><th>Origen</th><th>Vigencia</th><th>Disponibilidad</th></tr></thead><tbody>{selectedQuote.item.services.map((service,i)=><tr key={i}><td>{service.name}</td><td>{money(service.price)}</td><td>{selectedQuote.scenario==='offline'?'Tarifario ARM ficticio':'Tarifario ficticio'}</td><td>{selectedQuote.scenario==='expired'||selectedQuote.date<'2027-01-01'||selectedQuote.date>'2027-12-31'?'No vigente':'Vigente (demo)'}</td><td>{selectedQuote.scenario==='offline'||selectedQuote.scenario==='pending'?'Por confirmar':'Confirmada (demo)'}</td></tr>)}</tbody></table></div><small>Importes ilustrativos de venta; no son costos ni tarifas reales.</small></>:<p>Este itinerario tiene precio por paquete; no se han cargado importes por servicio.</p>}<p>Paquete completo: {money(Number(selectedQuote.item.price))} por persona × {selectedQuote.pax} = {money(selectedQuote.total)}.</p><p>Fuente: {selectedQuote.scenario==='offline'?'tarifario ARM ficticio':'tarifario de ejemplo'} · {selectedQuote.scenario==='expired'||selectedQuote.date<'2027-01-01'||selectedQuote.date>'2027-12-31'?'Tarifa no vigente': 'Vigencia simulada: 2027'} · {selectedQuote.scenario==='offline'||selectedQuote.scenario==='pending'?'Disponibilidad por confirmar':'Disponibilidad simulada'}</p>
 {(selectedQuote.scenario==='offline'||selectedQuote.scenario==='pending')&&<p>El mensaje simulado incluiría: «Pre-cotización sujeta a confirmación de servicios».</p>}
 <small>Para esta demo, el texto libre no puede contener dígitos; el sistema añade el importe y la información del itinerario por separado. No es una validación financiera para producción.</small>
 {(/\d/.test(selectedQuote.text)||!selectedQuote.text.trim())&&<p>Escribe un mensaje sin dígitos para continuar. Los importes se añaden por separado.</p>}
 {(selectedQuote.scenario==='offline'||selectedQuote.scenario==='pending')&&<label className="check"><input type="checkbox" checked={allowPre} onChange={e=>setAllowPre(e.target.checked)}/> Permitir pre-cotización con disponibilidad pendiente</label>}
 {selectedQuote.state==='Borrador'&&<button className="active" disabled={!selectedQuote.text.trim()||/\d/.test(selectedQuote.text)||selectedQuote.scenario==='expired'||selectedQuote.date<'2027-01-01'||selectedQuote.date>'2027-12-31'||((selectedQuote.scenario==='offline'||selectedQuote.scenario==='pending')&&!allowPre)} onClick={()=>approve(selectedQuote)}>Aprobar envío simulado</button>} <button onClick={()=>{setSelected(null);setAllowPre(false);}}>Cerrar</button><p>No se envía ningún mensaje real.</p></section></div>}
 {payment&&<div className="overlay"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="payment-title"><h2 id="payment-title">Registrar pago simulado</h2><p>Saldo {money(payment.total-payment.paid)}</p><form onSubmit={e=>{e.preventDefault();const n=Number(amount);if(!Number.isFinite(n)||n<=0||n>payment.total-payment.paid)return;const paid=Math.round((payment.paid+n)*100)/100;setPayments(old=>old.map(p=>p.id===payment.id?{...p,paid}:p));if(paid>=Math.round(payment.total*.4*100)/100)setStage(payment.leadId,'Ganado');setPaymentId(null);setNotice('Pago registrado solo en la demo; no se procesó dinero.');}}><label htmlFor="payment-amount">Importe ficticio en USD</label><input id="payment-amount" type="number" min=".01" max={payment.total-payment.paid} step=".01" required value={amount} onChange={e=>setAmount(e.target.value)}/><button className="active">Guardar pago simulado</button> <button type="button" onClick={()=>setPaymentId(null)}>Cancelar</button></form></section></div>}
 </div>;
}
