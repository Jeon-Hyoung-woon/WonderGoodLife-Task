import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Header.css';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <span className="logo-text">Task</span>
          </div>
        </div>
        <div className="header-center">
          <nav className="main-nav">
            <a href="#" className="nav-link active">신차</a>
            <a href="#" className="nav-link">중고차</a>
            <a href="#" className="nav-link">특별 할인↗</a>
          </nav>
        </div>
        <div className="header-right">
          <a href="#" className="header-link">지점안내</a>
          <a href="#" className="header-link">사고처리안내</a>
          <span className="header-separator">|</span>
          <a href="#" className="header-link">간편상담</a>
          <a href="#" className="header-link">로그인·회원가입</a>
          <button className="menu-button" onClick={onMenuClick}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;