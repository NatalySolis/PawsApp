import React, { useState, useEffect } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';

export function Home({ user, onLogout }) {
  const [dataNegocio, setDataNegocio] = useState({});
  const [servicios, setServicios] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Estado para abrir el panel de edición

  // Saber si el usuario tiene permisos de edición (Empleados, Dueños o Devs)
  const esPersonalAutorizado = user.rol && user.rol !== 'CLIENTE';

  useEffect(() => {
    // Cargamos los datos del negocio y servicios desde el backend
    fetch('http://localhost:3000/api/home-data')
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setDataNegocio(data.negocio);
          setServicios(data.servicios);
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Barra superior de navegación */}
      <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-black text-xl text-slate-900">{dataNegocio.nombre || 'PawsApp'}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-600">
            Rol: {user.rol}
          </span>
          <button onClick={onLogout} className="text-xs text-rose-500 font-semibold cursor-pointer">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* 🚀 BOTÓN FLOTANTE DE EDICIÓN (SOLO APARECE SI ES EMPLEADO / DUEÑO) */}
      {esPersonalAutorizado && (
        <div className="bg-amber-50 border-b border-amber-200 px-8 py-3 flex justify-between items-center">
          <span className="text-xs font-bold text-amber-800">
            ✨ Modo Administrativo Activo: Tienes permisos para editar el sitio.
          </span>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" /> {isEditing ? 'Cerrar Editor' : 'Editar Página y Servicios'}
          </button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL DE LA VISTA */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-slate-900 max-w-xl mb-6">
          {dataNegocio.slogan || 'Cuidado amoroso, profesional y sin estrés para tus compañeros de vida.'}
        </h1>

        {/* ✏️ SI EL MODO EDICIÓN ESTÁ ABIERTO, MOSTRAMOS FORMULARIOS PARA CAMBIAR DATOS */}
        {isEditing && (
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-amber-300 mb-10">
            <h3 className="text-lg font-black text-slate-900 mb-4">Panel de Edición del Administrador</h3>
            
            {/* Formulario rápido para editar el eslogan */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              const nuevoSlogan = e.target.slogan.value;
              
              // Petición al backend para actualizar
              await fetch('http://localhost:3000/api/negocio/1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...dataNegocio, slogan: nuevoSlogan })
              });
              alert('¡Actualizado con éxito!');
              window.location.reload();
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Editar Eslogan Principal</label>
                <input 
                  type="text" 
                  name="slogan"
                  defaultValue={dataNegocio.slogan}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <button type="submit" className="bg-[#FF6B4A] text-white px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer">
                Guardar Cambios
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}