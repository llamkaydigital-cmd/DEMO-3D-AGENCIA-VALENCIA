import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import Operation, { type OperationalTab, type Counts } from './Operation';
import './layout.css';
import './theme.css';

type Itinerary = { id: string; name: string; description: string; price: string; pdf: string; pdfUrl?: string; services?: {name:string; price:number}[] };
const initial: Itinerary[] = [
  { id: 'trail', name: 'Cusco y Short Inca Trail', description: 'Cusco · Valle Sagrado · Short Inca Trail · Machu Picchu · Despedida', price: '2180', pdf: '', services: [{name:'Estadía en Cusco',price:450},{name:'Valle Sagrado',price:300},{name:'Short Inca Trail',price:650},{name:'Machu Picchu y tren',price:600},{name:'Traslados',price:180}] },
  { id: 'cusco', name: 'Cusco y Valle Sagrado', description: 'Cusco · Valle Sagrado · Machu Picchu · Despedida', price: '1550', pdf: '', services: [{name:'Estadía en Cusco',price:450},{name:'Valle Sagrado',price:300},{name:'Machu Picchu y tren',price:600},{name:'Traslados',price:200}] }
];
type Tab = OperationalTab | 'resumen' | 'itinerarios' | 'integraciones' | 'usuarios';
type Role = 'Administrador' | 'Vendedor';
type DemoUser = { id: string; name: string; role: Role };

const IC: Record<string, React.ReactNode> = {
  panel: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  consultas: <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  cotizaciones: <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg>,
  cobros: <svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>,
  clientes: <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>,
  chat: <svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg>,
  resumen: <svg viewBox="0 0 24 24"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12v10M12 12L3 7"/></svg>,
  itinerarios: <svg viewBox="0 0 24 24"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>,
  integraciones: <svg viewBox="0 0 24 24"><path d="M9 7V3M15 7V3M7 7h10v5a5 5 0 0 1-10 0z"/><path d="M12 17v4"/></svg>,
  usuarios: <svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.4 9-8 11-4.6-2-8-6-8-11V5z"/></svg>
};
const TIT: Record<string, string> = { panel: 'Panel del día', consultas: 'Consultas', cotizaciones: 'Cotizaciones', cobros: 'Cobros', clientes: 'Clientes', chat: 'Chat de WhatsApp', resumen: 'Caso 3D', itinerarios: 'Itinerarios', integraciones: 'Integraciones', usuarios: 'Usuarios y roles' };
const EYE: Record<string, string> = { panel: 'Resumen', consultas: 'Ventas', cotizaciones: 'Ventas', cobros: 'Finanzas', clientes: 'Base de datos', chat: 'Atención', resumen: 'Recorrido', itinerarios: 'Catálogo', integraciones: 'Conexiones', usuarios: 'Accesos' };
const SCEN: [string, string][] = [['normal', 'Todo vigente'], ['offline', 'TourPlan sin respuesta'], ['expired', 'Tarifa vencida'], ['pending', 'Servicio por confirmar']];

function App() {
  const [tab, setTab] = useState<Tab>('panel');
  const [items, setItems] = useState(initial);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [notice, setNotice] = useState('');
  const [demoVersion, setDemoVersion] = useState(0);
  const [scenario, setScenario] = useState('normal');
  const [counts, setCounts] = useState<Counts>({ consultas: 0, cotizaciones: 0, cobros: 0, clientes: 0 });
  const [users, setUsers] = useState<DemoUser[]>([
    { id: 'admin', name: 'Ana (ejemplo)', role: 'Administrador' },
    { id: 'sales', name: 'Luis (ejemplo)', role: 'Vendedor' }
  ]);
  const [actingId, setActingId] = useState('admin');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<Role>('Vendedor');
  const actingUser = users.find(user => user.id === actingId) ?? users[0];
  const urls = useRef<string[]>([]);
  useEffect(() => () => { urls.current.forEach(url => URL.revokeObjectURL(url)); }, []);
  const stepText = new URLSearchParams(location.search).get('paso');
  const step = stepText && /^(0|[1-9]\d*)$/.test(stepText) && Number(stepText) <= 10 ? Number(stepText) : null;

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!name.trim() || !description.trim()) return;
    if (file && (file.size > 5 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.pdf'))) {
      setNotice('Selecciona un PDF de hasta 5 MB.'); return;
    }
    if (file) {
      const signature = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
      if (signature !== '%PDF-') { setNotice('El archivo seleccionado no parece ser un PDF válido.'); return; }
    }
    const pdfUrl = file ? URL.createObjectURL(file) : undefined;
    if (pdfUrl) urls.current.push(pdfUrl);
    setItems(previous => [...previous, { id: crypto.randomUUID(), name: name.trim(), description: description.trim(), price, pdf: file?.name || '', pdfUrl }]);
    setName(''); setDescription(''); setPrice(''); setFile(null); form.reset();
    setNotice('Itinerario añadido a esta sesión. El PDF se mantiene solo en este navegador hasta cerrar o actualizar la página.');
  }
  const back = location.hostname === 'arm.llamkaydigitals.com' ? 'https://demo3d.llamkaydigitals.com/' : '../index.html';
  const isOperational = (['panel','consultas','cotizaciones','cobros','clientes','chat'] as string[]).includes(tab);
  return <div className="app-layout"><aside className="sidebar"><div className="sidebrand">llamkay <b>ARM</b><small>DEMO · VALENCIA TRAVEL</small></div>
    <nav aria-label="Navegación principal">{([['panel','Panel'],['consultas','Consultas'],['cotizaciones','Cotizaciones'],['cobros','Cobros'],['clientes','Clientes'],['chat','Chat WhatsApp'],['resumen','Caso 3D'],['itinerarios','Itinerarios'],...(actingUser.role === 'Administrador' ? [['integraciones','Integraciones'],['usuarios','Usuarios y roles']] as const : [])] as const).map(([id,label])=><button key={id} className={tab===id?'active':''} aria-pressed={tab===id} onClick={()=>setTab(id)}>{IC[id]}<span>{label}</span>{id in counts && <span className="n">{counts[id as keyof Counts]}</span>}</button>)}</nav><div className="foot">Datos ficticios de demostración. En tu empresa, la app y la IA son tuyas, sin alquiler mensual.</div><a className="back" href={back}>← Volver al 3D</a></aside>
    <div className="workspace"><header><div><strong>LLAMKAY ARM</strong><p>Panel operativo · Valencia Travel</p></div><a href={back}>← Volver al 3D</a></header>
    <main><svg className="deco" viewBox="0 0 300 190" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><path d="M300 30H210L180 60H120"/><path d="M300 70H235L215 90"/><path d="M300 110H190L160 140H100"/><path d="M300 150H250"/><circle cx="120" cy="60" r="4"/><circle cx="215" cy="90" r="3"/><circle cx="100" cy="140" r="4"/><circle cx="180" cy="60" r="2" fill="currentColor"/><path d="M296 30h4M296 70h4M296 110h4M296 150h4" strokeWidth="3"/></svg>
      <div className="top"><div className="tl"><div className="eye">{EYE[tab]} · Valencia Travel</div><h1>{TIT[tab]}</h1></div>
        <span className="chip">IA: modo demo</span><span className="chip">WhatsApp: simulación</span>
        {isOperational && <><select aria-label="Escenario de prueba del control de cotización" value={scenario} onChange={e => setScenario(e.target.value)}>{SCEN.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <button type="button" className="sm ghost" onClick={()=>{if(window.confirm('¿Reiniciar consultas, cotizaciones y cobros de esta sesión?'))setDemoVersion(v=>v+1);}}>Reiniciar demo</button></>}</div>
      <span className="badge">DEMO · DATOS FICTICIOS</span>
      <div className="notice"><label htmlFor="demo-role">Ver demo como (simulado)</label><select id="demo-role" value={actingId} onChange={e => { setActingId(e.target.value); setTab('resumen'); }}>{users.map(user => <option key={user.id} value={user.id}>{user.name} · {user.role}</option>)}</select><small> Solo cambia la interfaz; no hay inicio de sesión ni permisos reales.</small></div>
      <div hidden={!isOperational}><Operation scenario={scenario} onCounts={setCounts} key={demoVersion} tab={isOperational ? tab as OperationalTab : 'panel'} items={items} go={setTab}/></div>
      {tab === 'resumen' && <div className="grid"><section><h2>Caso de Sophie</h2><p>2 viajeros · Inglés · WhatsApp</p><p>Interés: Cusco y Short Inca Trail</p><span className="badge">Caso ficticio</span></section>
        <section><h2>Recorrido 3D</h2><p>{step === null ? 'No se ha recibido una estación.' : `Estación seleccionada: ${step} de 10.`}</p><small>Solo se transfiere la estación; la sincronización completa del caso todavía no está implementada.</small></section></div>}
      {tab === 'itinerarios' && <><div className="notice">Catálogo ficticio en memoria: al actualizar la página se pierden los cambios y el PDF. No se envía al servidor ni se analiza. Microsoft 365 todavía no está conectado; usa solo archivos de ejemplo.</div>
        <div className="grid">{actingUser.role === 'Administrador' && <section><h2>Añadir itinerario</h2><form onSubmit={add}>
          <label htmlFor="name">Nombre del programa</label><input id="name" value={name} onChange={e => setName(e.target.value)} required maxLength={100}/>
          <label htmlFor="desc">Descripción</label><textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} required maxLength={3000}/>
          <label htmlFor="price">Precio por persona en USD (opcional)</label><input id="price" type="number" min="0" max="1000000" step="0.01" value={price} onChange={e => setPrice(e.target.value)}/>
          <label htmlFor="pdf">PDF de ejemplo (opcional, máx. 5 MB)</label><input id="pdf" type="file" accept=".pdf,application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)}/>
          <button className="active" type="submit">Añadir a la demo</button></form><p role="status">{notice}</p></section>}
          <section><h2>Catálogo de ejemplo</h2>{items.map(item => <article key={item.id}><h3>{item.name}</h3><p>{item.description}</p><small>{item.price ? `Precio ilustrativo: US$ ${item.price} por persona` : 'Precio no definido'}</small>{item.pdfUrl && <p><a href={item.pdfUrl} target="_blank" rel="noopener noreferrer">Abrir PDF de ejemplo: {item.pdf}</a></p>}</article>)}</section></div></>}
      {tab === 'integraciones' && actingUser.role === 'Administrador' && <><div className="notice">Solo diseño de demostración. No hay conexiones activas ni campos para credenciales reales.</div><div className="grid">
        {[['HubSpot','Contactos, negocios y etapas comerciales.'],['TourPlan','Programas, tarifas y disponibilidad; sujeto a acceso y documentación.'],['WhatsApp Business','Mensajes mediante la API oficial de Meta.'],['Microsoft 365','Acceso corporativo y documentos en SharePoint, sujetos a configuración.'],['Proveedor de IA','Configuración futura del proveedor y modelo elegido por la empresa. Las claves requieren un servidor seguro.']].map(([title, text]) =>
          <section key={title}><h2>{title}</h2><span className="badge">No conectado</span><p>{text}</p><button disabled>Configuración pendiente</button></section>)}</div></>}
      {tab === 'usuarios' && actingUser.role === 'Administrador' && <><div className="notice">Usuarios ficticios y permisos solo visuales: no se crean cuentas, no se envían invitaciones y todo se pierde al actualizar. No introduzcas datos reales.</div>
        <div className="grid"><section><h2>Crear usuario de ejemplo</h2><form onSubmit={e => {
          e.preventDefault(); const trimmed = userName.trim(); if (!trimmed) return;
          setUsers(previous => [...previous, { id: crypto.randomUUID(), name: trimmed, role: userRole }]); setUserName(''); setUserRole('Vendedor');
        }}><label htmlFor="user-name">Nombre ficticio</label><input id="user-name" maxLength={60} value={userName} onChange={e => setUserName(e.target.value)} required />
          <label htmlFor="user-role">Rol</label><select id="user-role" value={userRole} onChange={e => setUserRole(e.target.value as Role)}><option>Vendedor</option><option>Administrador</option></select>
          <button className="active" type="submit">Añadir usuario simulado</button></form></section>
          <section><h2>Equipo de ejemplo</h2>{users.map(user => <article key={user.id}><h3>{user.name}</h3><span className="badge">{user.role}</span></article>)}
          <h3>Permisos ilustrativos</h3><p>Administración: catálogo, integraciones y usuarios. Ventas: consulta del catálogo y caso de ejemplo.</p><small>El alcance de consultas y la autorización de envíos se definirán con la agencia.</small></section></div></>}
    </main></div></div>;
}

createRoot(document.getElementById('root')!).render(<App />);
