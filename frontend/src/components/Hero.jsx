import React, { useState, useEffect } from 'react';
import { ShieldCheck, Edit3, Trash2, Clock, X } from 'lucide-react';
import { AgendarCitaModal } from './AgendarCitaModal';

export function Hero({ user, onNavigateLogin }) {
  const [dataNegocio, setDataNegocio] = useState({});
  const [servicios, setServicios] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showServicesList, setShowServicesList] = useState(false);
  const [showCitaModal, setShowCitaModal] = useState(false); // Estado para abrir/cerrar el modal de citas

  // Estados para edición general del negocio
  const [nombre, setNombre] = useState('');
  const [slogan, setSlogan] = useState('');
  const [horarios, setHorarios] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [imagenPrincipal, setImagenPrincipal] = useState('');

  // Estado para formulario de servicio (Crear o Editar)
  const [editandoServicioId, setEditandoServicioId] = useState(null);
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', categoria: '', precio: '', duracion_estimada: '' });

  const esPersonalAdmin = user && user.rol && user.rol !== 'CLIENTE';

  const cargarDatos = () => {
    fetch('http://localhost:3000/api/home-data')
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setDataNegocio(data.negocio);
          setNombre(data.negocio.nombre || '');
          setSlogan(data.negocio.slogan || '');
          setHorarios(data.negocio.horarios || '');
          setLogoUrl(data.negocio.logo_url || '');
          setImagenPrincipal(data.negocio.imagen_principal || '');
          setServicios(data.servicios);
        }
      });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleImageUpload = (e, setImageState) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageState(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNegocio = async (e) => {
    e.preventDefault();
    const bodyData = { nombre, slogan, logo_url: logoUrl, imagen_principal: imagenPrincipal, horarios };

    try {
      const res = await fetch('http://localhost:3000/api/negocio/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const result = await res.json();
      if(result.success) {
        alert('¡Cambios guardados con éxito!');
        setShowAdminPanel(false);
        cargarDatos();
      }
    } catch (err) {
      alert('Error al conectar con el servidor.');
    }
  };

  // Guardar o Actualizar Servicio
  const handleGuardarServicio = async (e) => {
    e.preventDefault();
    const url = editandoServicioId 
      ? `http://localhost:3000/api/servicios/${editandoServicioId}` 
      : 'http://localhost:3000/api/servicios';
    
    const method = editandoServicioId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoServicio)
      });
      const result = await res.json();
      if(result.success) {
        alert(editandoServicioId ? '¡Servicio actualizado con éxito!' : '¡Servicio añadido con éxito!');
        setNuevoServicio({ nombre: '', categoria: '', precio: '', duracion_estimada: '' });
        setEditandoServicioId(null);
        cargarDatos();
      }
    } catch (err) {
      alert('Error al guardar el servicio');
    }
  };

  const handlePrepararEdicionServicio = (serv) => {
    setEditandoServicioId(serv.id);
    setNuevoServicio({
      nombre: serv.nombre,
      categoria: serv.categoria,
      precio: serv.precio,
      duracion_estimada: serv.duracion_estimada
    });
  };

  const handleDeleteServicio = async (id) => {
    if(!confirm('¿Estás seguro de eliminar este servicio?')) return;
    try {
      await fetch(`http://localhost:3000/api/servicios/${id}`, { method: 'DELETE' });
      cargarDatos();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 relative">
      
      {/* BARRA DE ACCESO ADMINISTRATIVO */}
      {esPersonalAdmin && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span>Modo Administrativo Activo ({user.rol}).</span>
          </div>
          <button 
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow"
          >
            <Edit3 className="w-4 h-4" /> {showAdminPanel ? 'Cerrar Panel de Edición' : '⚙️ Abrir Panel de Edición'}
          </button>
        </div>
      )}

      {/* MODAL / PANEL FLOTANTE DE EDICIÓN */}
      {showAdminPanel && esPersonalAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl p-8 rounded-3xl shadow-2xl border border-amber-300 relative max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setShowAdminPanel(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-2 rounded-full bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              ⚙️ Panel de Control y Personalización
            </h3>
            
            <form onSubmit={handleSaveNegocio} className="space-y-4" autoComplete="off">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre de la Veterinaria</label>
                  <input 
                    type="text" 
                    value={nombre} 
                    onChange={e => setNombre(e.target.value)} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Horarios (Usa saltos de línea)</label>
                  <textarea 
                    rows="2"
                    value={horarios} 
                    onChange={e => setHorarios(e.target.value)} 
                    placeholder="Lun - Vie: 8:00 AM - 6:00 PM
Sábados: 8:00 AM - 1:00 PM"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm whitespace-pre-wrap" 
                  />
                  <span className="text-[10px] text-slate-400">Puedes escribir varias líneas y se ordenarán perfectamente.</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Eslogan Principal</label>
                <input 
                  type="text" 
                  value={slogan} 
                  onChange={e => setSlogan(e.target.value)} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Logo del Dispositivo</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => handleImageUpload(e, setLogoUrl)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FF6B4A] file:text-white hover:file:bg-[#e05a3b] cursor-pointer"
                  />
                  {logoUrl && <img src={logoUrl} alt="Logo" className="mt-2 h-10 object-contain rounded" />}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Foto Principal</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => handleImageUpload(e, setImagenPrincipal)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FF6B4A] file:text-white hover:file:bg-[#e05a3b] cursor-pointer"
                  />
                  {imagenPrincipal && <img src={imagenPrincipal} alt="Principal" className="mt-2 h-16 object-cover rounded-lg" />}
                </div>
              </div>

              <button type="submit" className="bg-[#FF6B4A] hover:bg-[#e05a3b] text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer shadow">
                Guardar Cambios Generales
              </button>
            </form>

            {/* SECCIÓN CREAR / EDITAR SERVICIOS */}
            <div className="mt-10 pt-8 border-t border-slate-200">
              <h4 className="text-lg font-black text-slate-900 mb-4">
                {editandoServicioId ? '✏️ Editando Servicio Existente' : '➕ Añadir Nuevo Servicio o Tarifa'}
              </h4>
              <form onSubmit={handleGuardarServicio} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3" autoComplete="off">
                <input 
                  type="text" 
                  placeholder="Nombre" 
                  value={nuevoServicio.nombre} 
                  onChange={e => setNuevoServicio({...nuevoServicio, nombre: e.target.value})}
                  required
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  autoComplete="off"
                />
                <input 
                  type="text" 
                  placeholder="Categoría" 
                  value={nuevoServicio.categoria} 
                  onChange={e => setNuevoServicio({...nuevoServicio, categoria: e.target.value})}
                  required
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  autoComplete="off"
                />
                <input 
                  type="number" 
                  placeholder="Precio ($)" 
                  value={nuevoServicio.precio} 
                  onChange={e => setNuevoServicio({...nuevoServicio, precio: e.target.value})}
                  required
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
                <input 
                  type="number" 
                  placeholder="Duración (min)" 
                  value={nuevoServicio.duracion_estimada} 
                  onChange={e => setNuevoServicio({...nuevoServicio, duracion_estimada: e.target.value})}
                  required
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
                <div className="sm:col-span-2 md:col-span-4 flex gap-2">
                  <button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm cursor-pointer">
                    {editandoServicioId ? 'Actualizar Servicio' : 'Registrar Nuevo Servicio'}
                  </button>
                  {editandoServicioId && (
                    <button 
                      type="button" 
                      onClick={() => { setEditandoServicioId(null); setNuevoServicio({ nombre: '', categoria: '', precio: '', duracion_estimada: '' }); }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-xl font-bold text-sm cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* VISTA PRINCIPAL VISUAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-6">
            {dataNegocio.slogan || 'Cuidado amoroso, profesional y sin estrés para tus compañeros de vida.'}
          </h1>
          
          {/* HORARIO CON RELOJ ALINEADO A LA IZQUIERDA */}
          <div className="flex items-start gap-3 text-slate-700 font-semibold text-sm mb-6 bg-slate-100/90 border border-slate-200/60 px-5 py-3.5 rounded-2xl w-fit text-left">
            <Clock className="w-5 h-5 text-[#FF6B4A] shrink-0 mt-0.5" />
            <div className="whitespace-pre-line leading-relaxed text-left">
              {dataNegocio.horarios || 'Lun - Sáb: 8:00 AM - 7:00 PM'}
            </div>
          </div>

          <p className="text-slate-500 text-base mb-8">
            Consultas, prevención, cirugía y urgencias 24/7 en un espacio diseñado para la serenidad de tu perro y gato.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => setShowCitaModal(true)}
              className="bg-[#FF6B4A] hover:bg-[#e05a3b] text-white px-6 py-3.5 rounded-2xl font-bold shadow-md transition cursor-pointer"
            >
              📅 Agendar Cita Ahora
            </button>
            
            <button 
              onClick={() => setShowServicesList(!showServicesList)}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-6 py-3.5 rounded-2xl font-bold transition cursor-pointer flex items-center gap-2"
            >
              ▶ {showServicesList ? 'Ocultar Servicios y Precios' : 'Ver Servicios & Precios'}
            </button>
          </div>
        </div>

        <div className="relative">
          <img 
            src={dataNegocio.imagen_principal || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600"} 
            alt="Mascota principal" 
            className="rounded-3xl shadow-2xl object-cover w-full h-[380px]"
          />
        </div>
      </div>

      {/* SECCIÓN DESPLEGABLE DE SERVICIOS Y PRECIOS */}
      {showServicesList && (
        <div className="mt-12 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-slate-900">Servicios y Tarifas Disponibles</h3>
            {esPersonalAdmin && (
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full">
                💡 Modo Admin: Puedes editar o eliminar servicios
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicios && servicios.length > 0 ? (
              servicios.map((serv) => (
                <div key={serv.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm relative group flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-wider">{serv.categoria}</span>
                    <h4 className="text-lg font-black text-slate-900 mt-1">{serv.nombre}</h4>
                    <p className="text-sm font-bold text-slate-600 mt-3">Precio: ${serv.precio}</p>
                    <p className="text-xs text-slate-400 mt-1">Duración estimada: {serv.duracion_estimada} min</p>
                  </div>

                  {esPersonalAdmin && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200">
                      <button 
                        onClick={() => { setShowAdminPanel(true); handlePrepararEdicionServicio(serv); }}
                        className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteServicio(serv.id)}
                        className="bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white p-2 rounded-xl transition cursor-pointer"
                        title="Eliminar servicio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No hay servicios registrados en la base de datos todavía.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL PARA AGENDAR CITA (Ubicado correctamente dentro del return) */}
      <AgendarCitaModal
        isOpen={showCitaModal}
        onClose={() => setShowCitaModal(false)}
        servicios={servicios}
        user={user}
      />

    </div>
  );
}