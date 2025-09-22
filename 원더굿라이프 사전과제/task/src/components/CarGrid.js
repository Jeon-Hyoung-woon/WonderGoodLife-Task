import React from 'react';
import CarCard from './CarCard';
import { getAllCars } from '../data/carData';
import './styles/CarGrid.css';

const CarGrid = () => {
  const cars = getAllCars();

  return (
    <div className="car-grid">
      <div className="car-grid-container">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </div>
  );
};

export default CarGrid;