import React from 'react';
import './Navbar.css';

const Navbar = ({ onLogin, onRegister, user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>BarberShop</h2>
        </div>
        
        <div className="navbar-menu">
          <a href="#home" className="navbar-link">Início</a>
          <a href="#services" className="navbar-link">Serviços</a>
          <a href="#about" className="navbar-link">Sobre</a>
          <a href="#contact" className="navbar-link">Contato</a>
        </div>
        
        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <span className="user-greeting">Olá, {user.email}</span>
              <button className="logout-btn" onClick={onLogout}>
                Sair
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn-login" onClick={onLogin}>
                Entrar
              </button>
              <button className="btn-register" onClick={onRegister}>
                Cadastrar
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
