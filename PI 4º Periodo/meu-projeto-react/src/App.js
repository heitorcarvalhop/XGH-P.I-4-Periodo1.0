import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import HomePage from './components/HomePage';
import BarberHomePage from './components/BarberHomePage';
import { authService } from './services/api';

// A imagem será carregada via CSS

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);

  // Verificar se há usuário logado ao carregar a aplicação
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
  }, []);

  const handleLogin = (loginData) => {
    console.log('Dados de login:', loginData);
    // Se loginData não tem user, usar os dados diretamente
    const userData = loginData.user || loginData;
    setUser(userData);
  };

  const handleRegister = (registerData) => {
    console.log('Dados de cadastro:', registerData);
    setCurrentView('login');
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };


  const handleLogout = () => {
    console.log('Iniciando logout...');
    
    // Limpeza local imediata para resposta rápida
    setUser(null);
    setCurrentView('login');
    
    // Limpar localStorage imediatamente
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    console.log('Usuário deslogado, voltando para login');
    
    // Chamada da API em background (não bloqueia a UI)
    authService.logout().catch(error => {
      console.error('Erro ao fazer logout na API:', error);
    });
  };

  if (user) {
    // Verificar se é barbeiro
    const isBarber = user.userType === 'barber' || user.userType === 'BARBER';
    
    if (isBarber) {
      return (
        <BarberHomePage 
          user={user}
          onLogout={handleLogout}
        />
      );
    }
    
    // Se for cliente
    return (
      <HomePage 
        onLogin={() => setCurrentView('login')}
        onRegister={() => setCurrentView('register')}
        user={user}
        onLogout={handleLogout}
      />
    );
  }


  return (
    <div className="app-container">
      {currentView === 'login' && (
        <Login 
          onSwitchToRegister={switchToRegister}
          onLogin={handleLogin}
        />
      )}
      {currentView === 'register' && (
        <Register 
          onSwitchToLogin={switchToLogin}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
}

export default App;
