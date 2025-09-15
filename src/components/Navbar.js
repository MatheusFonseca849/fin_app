import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">FinApp</div>
        <ul className="navbar-nav">
          <li>
            <Link 
              to="/dashboard" 
              className={location.pathname === '/dashboard' || location.pathname === '/' ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/transactions" 
              className={location.pathname === '/transactions' ? 'active' : ''}
            >
              Extrato
            </Link>
          </li>
          <li>
            <Link 
              to="/analytics" 
              className={location.pathname === '/analytics' ? 'active' : ''}
            >
              Analytics
            </Link>
          </li>
          <li>
            <span style={{ marginRight: '10px' }}>Olá, {user?.name}</span>
            <button 
              onClick={onLogout} 
              className="btn btn-secondary"
              style={{ padding: '5px 10px', fontSize: '12px' }}
            >
              Sair
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
