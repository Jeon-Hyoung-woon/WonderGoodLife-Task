import { useMemo } from 'react';

export const usePriceCalculations = (currentCar, selectedOptions) => {
  // 가격 계산 함수들
  const calculatePrice = (type, name) => {
    try {
      if (!currentCar || !currentCar[type] || !name) return 0;
      const items = currentCar[type];
      return items?.find(item => item.name === name)?.price || 0;
    } catch (err) {
      console.error('가격 계산 실패:', err);
      return 0;
    }
  };

  const calculateOptionsPrice = () => {
    try {
      if (!currentCar || !currentCar.options) return 0;
      
      let totalPrice = 0;
      
      // 기존 options 배열의 옵션들
      if (selectedOptions.options && selectedOptions.options.length > 0) {
        selectedOptions.options.forEach(optionName => {
          Object.values(currentCar.options).forEach(category => {
            const option = category.find(opt => opt.name === optionName);
            if (option) {
              // 트림별 가격이 있으면 해당 트림의 가격 사용
              if (option.trimPrices && selectedOptions.trim && option.trimPrices[selectedOptions.trim] !== undefined) {
                totalPrice += option.trimPrices[selectedOptions.trim];
              } else {
                totalPrice += (option.price || 0);
              }
            }
          });
        });
      }
      
      // 카테고리별 옵션들
      if (currentCar.options) {
        Object.keys(currentCar.options).forEach(categoryName => {
          if (selectedOptions[categoryName] && selectedOptions[categoryName].length > 0) {
            selectedOptions[categoryName].forEach(optionName => {
              const option = currentCar.options[categoryName].find(opt => opt.name === optionName);
              if (option) {
                // 트림별 가격이 있으면 해당 트림의 가격 사용
                if (option.trimPrices && selectedOptions.trim && option.trimPrices[selectedOptions.trim] !== undefined) {
                  totalPrice += option.trimPrices[selectedOptions.trim];
                } else {
                  totalPrice += (option.price || 0);
                }
              }
            });
          }
        });
      }
      
      return totalPrice;
    } catch (err) {
      console.error('옵션 가격 계산 실패:', err);
      return 0;
    }
  };

  const calculateAdditionalOptionsPrice = () => {
    try {
      if (!currentCar) return 0;
      
      const trimPrice = calculatePrice('trims', selectedOptions.trim);
      const exteriorPrice = calculatePrice('exterior', selectedOptions.exterior);
      const interiorPrice = calculatePrice('interior', selectedOptions.interior);
      const wheelsPrice = calculatePrice('wheels', selectedOptions.wheels);
      const optionsPrice = calculateOptionsPrice();
      
      return trimPrice + exteriorPrice + interiorPrice + wheelsPrice + optionsPrice;
    } catch (err) {
      console.error('추가 옵션 가격 계산 실패:', err);
      return 0;
    }
  };

  // 세제혜택 할인 금액 계산
  const calculateTaxBenefitDiscount = () => {
    if (selectedOptions.taxBenefit === '미적용') return 0;
    
    // 현재 차량의 taxBenefitDiscounts 데이터 사용
    return currentCar?.taxBenefitDiscounts?.[selectedOptions.trim] || 0;
  };

  const calculateTotalPrice = () => {
    try {
      if (!currentCar) return 0;
      
      const basePrice = parseInt(currentCar.fullPrice?.replace(/,/g, '') || '0');
      const additionalOptionsPrice = calculateAdditionalOptionsPrice();
      const taxBenefitDiscount = calculateTaxBenefitDiscount();
      
      return basePrice + additionalOptionsPrice - taxBenefitDiscount;
    } catch (err) {
      console.error('총 가격 계산 실패:', err);
      return 0;
    }
  };

  // 메모이제이션된 값들 반환
  const totalPrice = useMemo(() => calculateTotalPrice(), [currentCar, selectedOptions]);
  const additionalOptionsPrice = useMemo(() => calculateAdditionalOptionsPrice(), [currentCar, selectedOptions]);
  const taxBenefitDiscount = useMemo(() => calculateTaxBenefitDiscount(), [currentCar, selectedOptions]);

  return {
    calculatePrice,
    calculateOptionsPrice,
    calculateAdditionalOptionsPrice,
    calculateTaxBenefitDiscount,
    calculateTotalPrice,
    totalPrice,
    additionalOptionsPrice,
    taxBenefitDiscount
  };
};