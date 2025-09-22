import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import SearchSection from './SearchSection';
import FilterSidebar from './FilterSidebar';
import CarGrid from './CarGrid';
import './styles/MainPage.css';

const MainPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="main-page">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="content-section">
        <div className="main-content">
          <FilterSidebar />
          <div className="right-content">
            <SearchSection />
            <CarGrid />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;