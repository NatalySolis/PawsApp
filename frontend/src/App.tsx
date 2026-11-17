import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Login } from './components/Login';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'login'>('home');
  
  // Recupera la sesión de localStorage para que no se pierda al recargar la página
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('pawsapp_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then(res => res.json())
      .catch(() => console.log('Servidor backend offline temporalmente'));
  }, []);

  const handleLogin = (loggedUser: any) => {
    setUser(loggedUser);
    localStorage.setItem('pawsapp_user', JSON.stringify(loggedUser));
    setCurrentView('home'); // Redirige inmediatamente al home con los datos del usuario
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pawsapp_user');
    setCurrentView('home');
  };

  if (currentView === 'login' && !user) {
    return <Login onBack={() => setCurrentView('home')} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      <Navbar 
        user={user} 
        onNavigateLogin={() => setCurrentView('login')} 
        onLogout={handleLogout} 
      />

      <main>
        <Hero user={user} onNavigateLogin={() => setCurrentView('login')} />
        <Features />
      </main>
    </div>
  );
}

export default App;