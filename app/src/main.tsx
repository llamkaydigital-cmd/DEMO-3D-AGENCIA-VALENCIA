import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import Operation, { type OperationalTab } from './Operation';
import './layout.css';

type Itinerary = { id: string; name: string; description: string; price: string; pdf: string; pdfUrl?: string; services?: {name:string; price:number}[] };
const initial: Itinerary[] = [
  { id: 'trail', name: 'Cusco y Short Inca Trail', description: 'Cusco · Valle Sagrado · Short Inca Trail · Machu Picchu · Despedida', price: '2180', pdf: '', services: [{name:'Estadía en Cusco',price:450},{name:'Valle Sagrado',price:300},{name:'Short Inca Trail',price:650},{name:'Machu Picchu y tren',price:600},{name:'Traslados',price:180}] },
  { id: 'cusco', name: 'Cusco y Valle Sagrado', description: 'Cusco · Valle Sagrado · Machu Picchu · Despedida', price: '1550', pdf: '', services: [{name:'Estadía en Cusco',price:450},{name:'Valle Sagrado',price:300},{name:'Machu Picchu y tren',price:600},{name:'Traslados',price:200}] }
];
type Tab = OperationalTab | 'resumen' | 'itinerarios' | 'integraciones' | 'usuarios';
type Role = 'Administrador' | 'Vendedor';
type DemoUser = { id: string; name: string; role: Role };

function App() {
  const [tab, setTab] = useState<Tab>('panel');
  const [items, setItems] = useState(initial);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [notice, setNotice] = useState('');
  const [demoVersion, setDemoVersion] = useState(0);
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
    <nav aria-label="Navegación principal">{([['panel','Panel'],['consultas','Consultas'],['cotizaciones','Cotizaciones'],['cobros','Cobros'],['clientes','Clientes'],['chat','Chat WhatsApp'],['resumen','Caso 3D'],['itinerarios','Itinerarios'],...(actingUser.role === 'Administrador' ? [['integraciones','Integraciones'],['usuarios','Usuarios y roles']] as const : [])] as const).map(([id,label])=><button key={id} className={tab===id?'active':''} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</nav><p>Datos ficticios · ninguna conexión real</p><a href={back}>← Volver al 3D</a></aside>
    <div className="workspace"><header><div><strong>LLAMKAY ARM</strong><p>Panel operativo · Valencia Travel</p></div><a href={back}>← Volver al 3D</a></header>
    <main><span className="badge">DEMO · DATOS FICTICIOS</span><h1>Del recorrido a la operación</h1>
      <p>Un espacio de demostración para consultas, itinerarios e integraciones. No introduzcas información real ni credenciales.</p>
      <div className="notice"><label htmlFor="demo-role">Ver demo como (simulado)</label><select id="demo-role" value={actingId} onChange={e => { setActingId(e.target.value); setTab('resumen'); }}>{users.map(user => <option key={user.id} value={user.id}>{user.name} · {user.role}</option>)}</select><small> Solo cambia la interfaz; no hay inicio de sesión ni permisos reales.</small></div>
      <div hidden={!isOperational}><button type="button" onClick={()=>{if(window.confirm('¿Reiniciar consultas, cotizaciones y cobros de esta sesión?'))setDemoVersion(v=>v+1);}}>Reiniciar operación simulada</button><Operation key={demoVersion} tab={isOperational ? tab as OperationalTab : 'panel'} items={items} go={setTab}/></div>
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
