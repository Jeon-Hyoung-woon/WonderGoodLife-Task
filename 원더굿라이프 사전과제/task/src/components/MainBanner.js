import React from 'react';
import './styles/MainBanner.css';

const MainBanner = () => {
  return (
    <section className="main-banner">
      <div className="banner-content">
        <div className="banner-text">
          <h2>MODEL Y</h2>
        </div>
        <div className="banner-image">
          <img src="/api/placeholder/600/300" alt="Model Y" />
        </div>
      </div>
      <div className="banner-indicators">
        <span className="indicator"></span>
        <span className="indicator active"></span>
        <span className="indicator"></span>
      </div>
    </section>
  );
};

export default MainBanner;