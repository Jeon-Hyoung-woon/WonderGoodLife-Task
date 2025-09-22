import React, { useState } from 'react';
import './styles/Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const [isCompanyInfoExpanded, setIsCompanyInfoExpanded] = useState(true);
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2>메뉴</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="sidebar-content">
          <div className="menu-sections">
            <div className="sidebar-section">
              <h3>Task 특별 할인 보기 ↗</h3>
            </div>
            
            <div className="sidebar-section">
              <h3>로그인 · 회원가입</h3>
            </div>
            
            <div className="sidebar-section with-spacing">
              <ul className="sidebar-menu">
                <li><a href="#">신차</a></li>
                <li><a href="#">중고차</a></li>
                <li><a href="#">간편 상담</a></li>
                <li><a href="#">자금안내</a></li>
                <li><a href="#">사고차량안내</a></li>
                <li><a href="#">회사소개</a></li>
                <li><a href="#">자주묻는질문</a></li>
                <li><a href="#">상품소개</a></li>
              </ul>
            </div>
          </div>
          
          <div className="sidebar-footer">
            <div className="footer-links">
              <span>자동차대여업</span>
              <span>개인정보 처리방침</span>
              <span>단기 렌트 요금표</span>
            </div>
            
            <div className="sidebar-social">
              <span>📘</span>
              <span>N</span>
            </div>
            
            <div className="company-info">
              <div className="company-header">
                <h4>Task</h4>
                <button 
                  className="collapse-btn"
                  onClick={() => setIsCompanyInfoExpanded(!isCompanyInfoExpanded)}
                >
                  {isCompanyInfoExpanded ? '접기 ∧' : '펼치기 ∨'}
                </button>
              </div>
              
              {isCompanyInfoExpanded && (
                <div className="company-details">
                  <p>서울특별시 영등포구 의사당대로 8,</p>
                  <p>태영빌딩 802호</p>
                  <br />
                  <p>사업자번호 : 128-81-47957</p>
                  <br />
                  <p>통신판매업신고번호 : 제2012-서울영등포-1249호</p>
                  <br />
                  <p>Copyright ⓒ 2016 by task. All rights reserved.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;