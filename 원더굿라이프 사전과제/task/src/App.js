import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainPage from './components/MainPage';
import CarDetailPage from './components/CarDetailPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/car/:model" element={<CarDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
