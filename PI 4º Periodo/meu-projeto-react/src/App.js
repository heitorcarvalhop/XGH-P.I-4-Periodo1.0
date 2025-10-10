import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
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

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
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
      {currentView === 'login' ? (
        <Login 
          onSwitchToRegister={switchToRegister}
          onLogin={handleLogin}
        />
      ) : (
        <Register 
          onSwitchToLogin={switchToLogin}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
}

export default App;
