import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import HomePage from './components/HomePage';
import { authService } from './services/api';

// A imagem será carregada via CSS

function App() {
  const [currentView, setCurrentView] = useState('home');
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
    setUser(loginData);
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

  const switchToHome = () => {
    setCurrentView('home');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      setCurrentView('home');
    }
  };

  if (user) {
    return (
      <div className="app-container">
        <div className="welcome-container">
          <h1>Bem-vindo ao BarberShop!</h1>
          <p>Olá, {user.email}!</p>
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {currentView === 'home' && (
        <HomePage 
          onLogin={() => setCurrentView('login')}
          onRegister={() => setCurrentView('register')}
          user={user}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'login' && (
        <Login 
          onSwitchToRegister={switchToRegister}
          onLogin={handleLogin}
          onSwitchToHome={switchToHome}
        />
      )}
      {currentView === 'register' && (
        <Register 
          onSwitchToLogin={switchToLogin}
          onRegister={handleRegister}
          onSwitchToHome={switchToHome}
        />
      )}
    </div>
  );
}

export default App;
