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
    const token = localStorage.getItem('authToken');
    
    // Verificar se o token não é um token mock antigo
    const isMockToken = token && token.startsWith('mock-token-');
    
    if (isMockToken) {
      console.log('⚠️ Token mock detectado, limpando sessão...');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      setUser(null);
      return;
    }
    
    // Verificar se há usuário válido
    if (currentUser && authService.isAuthenticated()) {
      console.log('✅ Usuário encontrado no localStorage:', currentUser.name);
      setUser(currentUser);
    } else {
      console.log('ℹ️ Nenhum usuário autenticado, mostrando login');
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
    console.log('🚪 Iniciando logout...');
    
    // Limpeza local imediata para resposta rápida
    setUser(null);
    setCurrentView('login');
    
    // Limpar localStorage completamente
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    
    console.log('✅ Usuário deslogado, voltando para login');
    
    // Chamada da API em background (não bloqueia a UI)
    authService.logout().catch(error => {
      console.error('Erro ao fazer logout na API:', error);
    });
  };

  if (user) {
    // Verificar se é barbeiro baseado nos campos que o backend envia
    // Barbeiros têm: cpf, birthDate
    // Clientes NÃO têm esses campos
    const hasCpf = user.cpf && user.cpf !== null && user.cpf !== undefined;
    const hasBirthDate = user.birthDate && user.birthDate !== null && user.birthDate !== undefined;
    
    // Verificações adicionais (caso o backend envie)
    const hasBarberId = user.barberId || user.barber_id;
    const hasClientId = user.clientId || user.client_id;
    const hasBarbershopId = user.barbershopId || user.barbershop_id;
    const isBarberByType = user.userType === 'barber' || user.userType === 'BARBER';
    
    // É barbeiro se:
    // 1. Tem CPF E birthDate (campos exclusivos de barbeiro) OU
    // 2. Tem userType = 'barber' OU
    // 3. Tem barberId ou barbershopId
    const isBarber = (hasCpf && hasBirthDate) || isBarberByType || hasBarberId || (hasBarbershopId && !hasClientId);
    
    console.log('🔍 DEBUG APP.JS:', {
      userName: user.name,
      userType: user.userType,
      cpf: user.cpf,
      birthDate: user.birthDate,
      hasCpf,
      hasBirthDate,
      barberId: hasBarberId,
      clientId: hasClientId,
      barbershopId: hasBarbershopId,
      isBarber,
      pagina: isBarber ? '✅ BarberHomePage (Dashboard)' : '❌ HomePage (Cliente)'
    });
    
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
