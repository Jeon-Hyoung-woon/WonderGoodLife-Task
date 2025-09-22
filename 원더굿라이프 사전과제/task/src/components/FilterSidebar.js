import React, { useState } from 'react';
import './styles/FilterSidebar.css';

const FilterSidebar = () => {
  const [selectedBrands, setSelectedBrands] = useState(['전체']);
  const [selectedPriceRange, setSelectedPriceRange] = useState('전체');
  const [selectedCarType, setSelectedCarType] = useState('전체');
  const [selectedFuelType, setSelectedFuelType] = useState('전체');

  const filterData = {
    brands: [
      { name: '전체', logo: null },
      { name: '현대', logo: 'H' },
      { name: 'KN', logo: 'KN' },
      { name: '기아', logo: 'K' },
      { name: '제네시스', logo: 'G' },
      { name: '한국GM', logo: 'GM' },
      { name: 'KGM', logo: 'KGM' },
      { name: '르노코리아', logo: 'R' },
      { name: '메르세데스', logo: 'M' },
      { name: 'BMW', logo: 'BMW' },
      { name: '볼보', logo: 'V' },
      { name: '아우디', logo: 'A' },
      { name: 'BYD', logo: 'BYD' },
      { name: '폴스타', logo: 'P' }
    ],
    priceRanges: ['전체', '50만 원 이하', '50~70만원', '70~100만원', '100만원 이상'],
    carTypes: ['전체', '승용차', 'SUV・RV', '화물・승합'],
    fuelTypes: ['전체', '가솔린', '디젤(경유)', 'LPG', '하이브리드', '전기・수소']
  };

  const handleBrandSelection = (brandName) => {
    if (brandName === '전체') {
      setSelectedBrands(['전체']);
    } else {
      const newSelection = selectedBrands.includes(brandName)
        ? selectedBrands.filter(b => b !== brandName)
        : [...selectedBrands.filter(b => b !== '전체'), brandName];
      setSelectedBrands(newSelection.length ? newSelection : ['전체']);
    }
  };

  const renderFilterSection = (title, items, selectedValue, onSelect, isMultiSelect = false) => (
    <div className="filter-section">
      <h3>{title}</h3>
      <div className="filter-grid">
        {items.map((item) => {
          const itemName = typeof item === 'string' ? item : item.name;
          const isSelected = isMultiSelect 
            ? selectedValue.includes(itemName) 
            : selectedValue === itemName;
          
          return (
            <button
              key={itemName}
              className={`filter-button ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(itemName)}
            >
              {item.logo && <span className="brand-logo">{item.logo}</span>}
              <span className="brand-name">{itemName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="filter-sidebar">
      {renderFilterSection('제조사', filterData.brands, selectedBrands, handleBrandSelection, true)}
      {renderFilterSection('대여료', filterData.priceRanges, selectedPriceRange, setSelectedPriceRange)}
      {renderFilterSection('차량 종류', filterData.carTypes, selectedCarType, setSelectedCarType)}
      {renderFilterSection('연료', filterData.fuelTypes, selectedFuelType, setSelectedFuelType)}
    </aside>
  );
};

export default FilterSidebar;