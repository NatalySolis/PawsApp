import React, { useState, useEffect } from 'react';
import { ShieldCheck, Edit3, Trash2, Clock, Upload } from 'lucide-react';

export function Hero({ user, onNavigateLogin }) {
  const [dataNegocio, setDataNegocio] = useState({});
  const [servicios, setServicios] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showServicesList, setShowServicesList] = useState(false);

  // Estados para el formulario de negocio
  const [nombre, setNombre] = useState('');
  const [slogan, setSlogan] = useState('');
  const [horarios, setHorarios] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [imagenPrincipal, setImagenPrincipal] = useState('');

  // Estado para el formulario de nuevo servicio
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

  // Función para convertir la imagen seleccionada del dispositivo a Base64 (para que se guarde y muestre de inmediato)
  const handleImageUpload = (e, setImageState) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageState(reader.result); // Guarda la imagen convertida
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar cambios generales del negocio
  const handleSaveNegocio = async (e) => {
    e.preventDefault();
    const bodyData = {
      nombre,
      slogan,
      logo_url: logoUrl,
      imagen_principal: imagenPrincipal,
      horarios
    };

    try {
      const res = await fetch('http://localhost:3000/api/negocio/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const result = await res.json();
      if(result.success) {
        alert('¡Cambios guardados con éxito!');
        setIsEditing(false);
        cargarDatos();
      }
    } catch (err) {
      alert('Error al conectar con el servidor.');
    }
  };

  // Agregar un servicio nuevo
  const handleAddServicio = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/servicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoServicio)
      });
      const result = await res.json();
      if(result.success) {
        alert('Servicio añadido con éxito');
        setNuevoServicio({ nombre: '', categoria: '', precio: '', duracion_estimada: '' });
        cargarDatos();
      }
    } catch (err) {
      alert('Error al agregar el servicio');
    }
  };

  // Eliminar un servicio
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
    <div className="max-w-6xl mx-auto px-6 py-12">
      
      {/* PANEL ADMINISTRATIVO */}
      {esPersonalAdmin && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span>Modo Administrativo Activo ({user.rol}): Puedes editar la página, elegir imágenes locales y gestionar servicios.</span>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow"
          >
            <Edit3 className="w-4 h-4" /> {isEditing ? 'Cerrar Panel' : '✏️ Editar Sitio Web'}
          </button>
        </div>
      )}

      {/* FORMULARIO DE EDICIÓN GENERAL CON SELECTOR DE ARCHIVOS */}
      {isEditing && esPersonalAdmin && (
        <div className="mb-12 bg-white p-8 rounded-3xl shadow-xl border border-amber-300">
          <h3 className="text-xl font-black text-slate-900 mb-6">⚙️ Panel de Control y Personalización</h3>
          
          <form onSubmit={handleSaveNegocio} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre de la Veterinaria</label>
                <input 
                  type="text" 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Horarios de Atención</label>
                <input 
                  type="text" 
                  value={horarios} 
                  onChange={e => setHorarios(e.target.value)} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Eslogan Principal (Letras Grandes)</label>
              <input 
                type="text" 
                value={slogan} 
                onChange={e => setSlogan(e.target.value)} 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              
              {/* Selector de Imagen para el Logo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cambiar Logo desde el dispositivo</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => handleImageUpload(e, setLogoUrl)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FF6B4A] file:text-white hover:file:bg-[#e05a3b] cursor-pointer"
                  />
                </div>
                {logoUrl && <img src={logoUrl} alt="Vista previa logo" className="mt-2 h-10 object-contain rounded" />}
              </div>

              {/* Selector de Imagen Principal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cambiar Foto Principal desde el dispositivo</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => handleImageUpload(e, setImagenPrincipal)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FF6B4A] file:text-white hover:file:bg-[#e05a3b] cursor-pointer"
                  />
                </div>
                {imagenPrincipal && <img src={imagenPrincipal} alt="Vista previa principal" className="mt-2 h-16 object-cover rounded-lg" />}
              </div>

            </div>

            <button type="submit" className="bg-[#FF6B4A] hover:bg-[#e05a3b] text-white px-6 py-3 rounded-xl font-bold text-sm cursor-pointer shadow">
              Guardar Cambios Generales
            </button>
          </form>

          {/* SECCIÓN PARA AÑADIR NUEVOS SERVICIOS */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <h4 className="text-lg font-black text-slate-900 mb-4">➕ Añadir Nuevo Servicio o Tarifa</h4>
            <form onSubmit={handleAddServicio} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <input 
                type="text" 
                placeholder="Nombre (ej. Baño y Corte)" 
                value={nuevoServicio.nombre} 
                onChange={e => setNuevoServicio({...nuevoServicio, nombre: e.target.value})}
                required
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
              <input 
                type="text" 
                placeholder="Categoría (ej. Estética)" 
                value={nuevoServicio.categoria} 
                onChange={e => setNuevoServicio({...nuevoServicio, categoria: e.target.value})}
                required
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
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
              <button type="submit" className="sm:col-span-2 md:col-span-4 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm cursor-pointer">
                Registrar Nuevo Servicio
              </button>
            </form>
          </div>

        </div>
      )}

      {/* VISTA PRINCIPAL VISUAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-6">
            {dataNegocio.slogan || 'Cuidado amoroso, profesional y sin estrés para tus compañeros de vida.'}
          </h1>
          
          <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm mb-6 bg-slate-100 p-3 rounded-xl w-fit">
            <Clock className="w-4 h-4 text-[#FF6B4A]" />
            <span>{dataNegocio.horarios || 'Lun - Sáb: 8:00 AM - 7:00 PM'}</span>
          </div>

          <p className="text-slate-500 text-base mb-8">
            Consultas, prevención, cirugía y urgencias 24/7 en un espacio diseñado para la serenidad de tu perro y gato.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={onNavigateLogin}
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
                💡 Modo Admin: Puedes eliminar servicios desde aquí
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicios && servicios.length > 0 ? (
              servicios.map((serv) => (
                <div key={serv.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm relative group">
                  <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-wider">{serv.categoria}</span>
                  <h4 className="text-lg font-black text-slate-900 mt-1">{serv.nombre}</h4>
                  <p className="text-sm font-bold text-slate-600 mt-3">Precio: ${serv.precio}</p>
                  <p className="text-xs text-slate-400 mt-1">Duración estimada: {serv.duracion_estimada} min</p>

                  {esPersonalAdmin && (
                    <button 
                      onClick={() => handleDeleteServicio(serv.id)}
                      className="absolute top-4 right-4 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white p-2 rounded-xl transition opacity-80 group-hover:opacity-100 cursor-pointer"
                      title="Eliminar servicio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No hay servicios registrados en la base de datos todavía.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}