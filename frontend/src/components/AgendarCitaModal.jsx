import { useState } from 'react';
import { X, Calendar, Clock, PawPrint, User, Phone, Mail, CheckCircle2 } from 'lucide-react';

export function AgendarCitaModal({ isOpen, onClose, servicios, user }) {
  const [formData, setFormData] = useState({
    nombre_cliente: user?.nombre || '',
    telefono: '',
    correo: user?.email || '',
    nombre_mascota: '',
    especie: 'Perro',
    raza: '',
    edad: '',
    servicio_id: servicios?.[0]?.id || '',
    fecha: '',
    hora: '09:00'
  });

  const [enviando, setEnviando] = useState(false);
  const [citaConfirmada, setCitaConfirmada] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const res = await fetch('http://localhost:3000/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          servicio_id: formData.servicio_id || servicios?.[0]?.id
        })
      });
      const data = await res.json();

      if (data.success) {
        setCitaConfirmada(true);
      } else {
        alert(data.message || 'No se pudo agendar la cita.');
      }
    } catch (error) {
      alert('Error de conexión con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  const reiniciarYCerrar = () => {
    setCitaConfirmada(false);
    setFormData({
      nombre_cliente: user?.nombre || '',
      telefono: '',
      correo: user?.email || '',
      nombre_mascota: '',
      especie: 'Perro',
      raza: '',
      edad: '',
      servicio_id: servicios?.[0]?.id || '',
      fecha: '',
      hora: '09:00'
    });
    onClose();
  };

  // Fecha mínima: hoy
  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl p-8 rounded-3xl shadow-2xl border border-slate-100 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={reiniciarYCerrar}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-2 rounded-full bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {citaConfirmada ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">¡Cita Agendada con Éxito!</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Hemos reservado el espacio para <strong>{formData.nombre_mascota}</strong> el día{' '}
              <strong>{formData.fecha}</strong> a las <strong>{formData.hora}</strong>.
            </p>
            <button
              onClick={reiniciarYCerrar}
              className="mt-4 bg-[#FF6B4A] hover:bg-[#e05a3b] text-white px-8 py-3 rounded-xl font-bold text-sm cursor-pointer shadow"
            >
              Listo, volver al inicio
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-wider">Reserva en línea</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">📅 Agendar Nueva Cita</h3>
              <p className="text-xs text-slate-500 mt-1">Completa los datos del propietario, tu mascota y el servicio deseado.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              {/* SECCIÓN 1: DATOS DEL PROPIETARIO */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-3">
                <h4 className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#FF6B4A]" /> Datos del Propietario
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombre completo *</label>
                    <input
                      type="text"
                      name="nombre_cliente"
                      required
                      value={formData.nombre_cliente}
                      onChange={handleChange}
                      placeholder="Ej. María González"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Teléfono / WhatsApp *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        name="telefono"
                        required
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Ej. 7890-1234"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Correo electrónico (opcional)</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        placeholder="correo@ejemplo.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: DATOS DE LA MASCOTA */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-3">
                <h4 className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
                  <PawPrint className="w-4 h-4 text-[#FF6B4A]" /> Datos de la Mascota
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombre de la mascota *</label>
                    <input
                      type="text"
                      name="nombre_mascota"
                      required
                      value={formData.nombre_mascota}
                      onChange={handleChange}
                      placeholder="Ej. Max"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Especie *</label>
                    <select
                      name="especie"
                      value={formData.especie}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="Perro">Perro</option>
                      <option value="Gato">Gato</option>
                      <option value="Ave">Ave</option>
                      <option value="Conejo">Conejo</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Raza (opcional)</label>
                    <input
                      type="text"
                      name="raza"
                      value={formData.raza}
                      onChange={handleChange}
                      placeholder="Ej. Labrador / Mestizo"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Edad en años (opcional)</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      name="edad"
                      value={formData.edad}
                      onChange={handleChange}
                      placeholder="Ej. 3"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: SERVICIO, FECHA Y HORA */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-3">
                <h4 className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#FF6B4A]" /> Servicio y Horario
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Selecciona el Servicio *</label>
                    <select
                      name="servicio_id"
                      required
                      value={formData.servicio_id}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                    >
                      {servicios && servicios.length > 0 ? (
                        servicios.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nombre} — ${s.precio} ({s.duracion_estimada} min)
                          </option>
                        ))
                      ) : (
                        <option value="">No hay servicios disponibles</option>
                      )}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Fecha de la cita *</label>
                    <input
                      type="date"
                      name="fecha"
                      required
                      min={hoy}
                      value={formData.fecha}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Hora *</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="time"
                        name="hora"
                        required
                        value={formData.hora}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando || !servicios?.length}
                className="w-full bg-[#FF6B4A] hover:bg-[#e05a3b] text-white py-3.5 rounded-2xl font-bold shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {enviando ? 'Confirmando reserva...' : 'Confirmar Cita'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}