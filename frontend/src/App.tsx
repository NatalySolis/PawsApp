import React, { useEffect, useState } from 'react';
import { 
  PawPrint, Calendar, Phone, User, Play, Heart, 
  Building2, TestTube, Pill, ShieldCheck, Sparkles 
} from 'lucide-react';

export function App() {
  const [apiStatus, setApiStatus] = useState('Verificando conexión...');

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then(res => res.json())
      .then(data => setApiStatus(data.message))
      .catch(() => setApiStatus('Error: No se pudo conectar con el servidor backend'));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* 1. Barrita de Anuncio Superior (Verde) */}
      

      {/* 2. Navbar Principal */}
      <header className="bg-white border-b border-slate-100 py-3.5 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl shadow-md overflow-hidden flex items-center justify-center bg-white border border-slate-100">
            <img src="/logo.png" alt="Logo PawsApp" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-none">PawsApp</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Clínica Veterinaria Integral</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#home" className="text-[#FF6B4A] font-bold">Home</a>
          <a href="#services" className="hover:text-[#FF6B4A] transition">Services</a>
          <a href="#about" className="hover:text-[#FF6B4A] transition">About</a>
          <a href="#location" className="hover:text-[#FF6B4A] transition">Location</a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Phone className="w-4 h-4 text-[#FF6B4A]" />
            <span>(555) 234-PAWS</span>
          </div>

          <a 
            href="#reservar" 
            className="bg-[#FF6B4A] hover:bg-[#e05a3b] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition flex items-center gap-2"
          >
            Agendar Cita
          </a>

          <button className="bg-[#FF6B4A] text-white p-2.5 rounded-full hover:opacity-90 transition">
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Columna Izquierda: Textos y CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.15] mb-6">
            Cuidado amoroso, profesional <br />
            y <span className="text-[#FF6B4A]">sin estrés</span> para tus <br />
            compañeros de vida.
          </h1>

          <p className="text-slate-600 text-base md:text-lg mb-8 leading-relaxed max-w-xl">
            Consultas, prevención, cirugía y urgencias 24/7 en un espacio diseñado para la serenidad de tu perro y gato. Reserva en menos de 2 minutos sin contraseñas ni registros previos.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button className="bg-[#FF6B4A] hover:bg-[#e05a3b] text-white px-7 py-3.5 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Agendar Cita Ahora
            </button>
            <button className="bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl font-bold text-base hover:bg-slate-50 transition flex items-center gap-2">
              <Play className="w-4 h-4 fill-slate-700" /> Ver Servicios & Precios
            </button>
          </div>
        </div>

        {/* Columna Derecha: Foto de la Mascota limpia */}
        <div className="lg:col-span-5 relative">
          <div className="bg-white p-3 rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800" 
              alt="Mascota PawsApp" 
              className="w-full h-[420px] object-cover rounded-2xl"
            />
          </div>
        </div>
      </main>

      {/* 4. Barra Inferior de Ventajas */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3.5 shadow-sm">
            <div className="bg-rose-50 p-2.5 rounded-xl text-[#FF6B4A]">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Manejo Fear-Free</h4>
              <p className="text-xs text-slate-500">Sin estrés ni sujeciones forzadas</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3.5 shadow-sm">
            <div className="bg-sky-50 p-2.5 rounded-xl text-sky-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Salas Separadas</h4>
              <p className="text-xs text-slate-500">Exclusivas para perros y gatos</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3.5 shadow-sm">
            <div className="bg-emerald-50 p-2.5 rounded-xl text-[#059669]">
              <TestTube className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Laboratorio 24/7</h4>
              <p className="text-xs text-slate-500">Diagnóstico clínico inmediato</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3.5 shadow-sm">
            <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Farmacia Interna</h4>
              <p className="text-xs text-slate-500">Medicamentos de dosis exacta</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;