import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/CarCard.css';

const CarCard = ({ car }) => {
  const { brand, model, fullPrice, image, hoverImage, features } = car || {};
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    try {
      // 차량 데이터 유효성 검사
      if (!car || !car.id) {
        console.error('유효하지 않은 차량 데이터:', car);
        alert('차량 정보가 올바르지 않습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      // 필수 데이터 검증
      if (!car.fullName || !car.trims || !car.exterior || !car.interior) {
        console.warn('불완전한 차량 데이터로 이동:', car);
        alert('차량 정보가 불완전합니다. 상세 페이지에서 일부 기능이 제한될 수 있습니다.');
      }

      navigate(`/car/${car.id}`, { 
        state: { 
          carData: car,
          timestamp: new Date().toISOString() // 데이터 전달 확인용
        } 
      });
    } catch (err) {
      console.error('차량 상세 페이지 이동 실패:', err);
      alert('페이지 이동 중 오류가 발생했습니다. 새로고침 후 다시 시도해주세요.');
    }
  };

  // 차량 데이터가 없는 경우 렌더링하지 않음
  if (!car) {
    return null;
  }

  return (
    <div 
      className="car-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="car-image-container">
        <img 
          src={image} 
          alt={`${brand} ${model}`} 
          className={`car-image ${isHovered ? 'hidden' : ''}`}
        />
        <img 
          src={hoverImage} 
          alt={`${brand} ${model} focus`} 
          className={`car-image hover-image ${isHovered ? 'visible' : ''}`}
        />
        <div className="car-badges">
          {features.map((feature, index) => (
            <span key={index} className={`badge ${feature.toLowerCase()}`}>
              {feature}
            </span>
          ))}
        </div>
      </div>
      
      <div className="car-content">
        <div className="car-header">
          <span className="car-brand">{brand}</span>
          <h3 className="car-model">{model}</h3>
        </div>
        
        <div className="car-details">
          <p className="car-price">{parseInt(fullPrice?.replace(/,/g, '') || '0').toLocaleString()}원 ~</p>
        </div>
        
        <div className="car-actions">
          <span className="interest-icon">♡ 인기</span>
        </div>
      </div>
    </div>
  );
};

export default CarCard;