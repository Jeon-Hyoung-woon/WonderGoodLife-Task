import React, { useState } from 'react';
import './styles/SearchSection.css';

const SearchSection = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <section className="search-section">
      <div className="search-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="차량명, 브랜드를 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-button">
            🔍
          </button>
        </div>
        <div className="search-options">
          <span className="search-option">추천순 ▼</span>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;