import { useState } from 'react';
import './quote.css';
type Item = { id: string; name: string; description: string; price: string };
type Draft = { item: Item; name: string; pax: number; date: string; scenario: string; permit: boolean };
export default function Quote({items}: {items: Item[]}) {
 const [id,setId]=useState(items[0].id), [name,setName]=useState('Sophie'), [pax,setPax]=useState(2), [date,setDate]=useState('2027-09-15'), [scenario,setScenario]=useState('normal'), [permit,setPermit]=useState(false);
 const [draft,setDraft]=useState<Draft|null>(null), [approved,setApproved]=useState(false);
 const clear=()=>{setDraft(null);setApproved(false);};
 const valid=draft && draft.item.price!=='' && Number.isFinite(Number(draft.item.price)) && Number(draft.item.price)>=0 && draft.date>='2027-01-01' && draft.date<='2027-12-31' && draft.scenario!=='expired';
 const pending=draft && (draft.scenario==='offline'||draft.scenario==='pending');
 const allowed=valid && (!pending || draft?.permit);
 const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
 return <><div className="notice">Catálogo y tarifas ficticios. No se consulta IA, TourPlan ni disponibilidad real. Vigencia de ejemplo: 2027.</div><div className="grid">
 <section><h2>Consulta ficticia</h2><form onSubmit={e=>{e.preventDefault();const item=items.find(x=>x.id===id);if(!item||!name.trim()||!Number.isInteger(pax)||pax<1||pax>20)return;setDraft({item:{...item},name:name.trim(),pax,date,scenario,permit});setApproved(false);}}>
 <label htmlFor="q-name">Nombre ficticio</label><input id="q-name" required maxLength={60} value={name} onChange={e=>{setName(e.target.value);clear();}}/>
 <label htmlFor="q-item">Itinerario</label><select id="q-item" value={id} onChange={e=>{setId(e.target.value);clear();}}>{items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select>
 <label htmlFor="q-pax">Viajeros</label><input id="q-pax" type="number" min="1" max="20" required value={pax} onChange={e=>{setPax(Number(e.target.value));clear();}}/>
 <label htmlFor="q-date">Fecha de viaje</label><input id="q-date" type="date" required value={date} onChange={e=>{setDate(e.target.value);clear();}}/>
 <label htmlFor="q-scenario">Escenario simulado</label><select id="q-scenario" value={scenario} onChange={e=>{setScenario(e.target.value);clear();}}><option value="normal">Tarifa y disponibilidad válidas</option><option value="offline">TourPlan sin respuesta</option><option value="expired">Tarifa vencida</option><option value="pending">Servicio por confirmar</option></select>
 <label className="check"><input type="checkbox" checked={permit} onChange={e=>{setPermit(e.target.checked);clear();}}/> Permitir preliminar si la disponibilidad está pendiente</label><button className="active">Generar borrador</button>
 </form></section><section aria-live="polite"><h2>Borrador</h2>{!draft?<p>Genera un borrador para revisarlo.</p>:<>
 <span className="badge">{!valid?'Bloqueado · tarifa ausente o no vigente':pending?(allowed?'Preliminar · por confirmar':'Bloqueado · disponibilidad pendiente'):'Listo para revisión simulada'}</span>
 <p>{draft.name} · {draft.pax} viajeros · {draft.date}</p><h3>{draft.item.name}</h3><p>{draft.item.description}</p>
 <p>{draft.scenario==='offline'?'TourPlan sin respuesta (simulado); se usa el tarifario ficticio ARM.':'Origen: tarifario ficticio de la demo.'}</p>
 <p>{pending?'Disponibilidad por confirmar: una tarifa no confirma disponibilidad.':'Disponibilidad confirmada únicamente en esta simulación.'}</p>
 {valid?<><p>{money(Number(draft.item.price))} por persona × {draft.pax} = <strong>{money(Number(draft.item.price)*draft.pax)} total</strong></p><p>Hola {draft.name}, te compartimos una propuesta {pending?'preliminar, con servicios pendientes de confirmación':'de ejemplo'}: {draft.item.name}. Total ilustrativo: {money(Number(draft.item.price)*draft.pax)}. Sujeto a revisión de un asesor.</p></>:<p>No se calcula el total: falta precio o la tarifa no es válida para la fecha elegida.</p>}
 {allowed&&<button type="button" disabled={approved} onClick={()=>setApproved(true)}>{pending?'Aprobar preliminar (simulado)':'Aprobar borrador (simulado)'}</button>}{approved&&<p>Aprobación simulada: no se envió ningún mensaje ni se registró una aprobación real.</p>}
 </>}</section></div></>;
}
