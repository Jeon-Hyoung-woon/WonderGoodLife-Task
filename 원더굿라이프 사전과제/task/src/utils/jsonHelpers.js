import { getOptionPrice } from './dataHelpers';

// JSON 관련 함수들 (예외처리 추가)
export const generateQuoteJson = (currentCar, selectedOptions, calculateTaxBenefitDiscount) => {
  try {
    if (!currentCar) {
      throw new Error('차량 데이터가 없습니다.');
    }

    // 선택된 트림 정보
    const selectedTrimInfo = currentCar.trims?.find(trim => trim.name === selectedOptions.trim);
    
    // 선택된 외장 색상 정보
    const selectedExteriorInfo = currentCar.exterior?.find(item => item.name === selectedOptions.exterior);
    
    // 선택된 내장 색상 정보
    const selectedInteriorInfo = currentCar.interior?.find(item => item.name === selectedOptions.interior);
    
    // 선택된 휠 정보
    const selectedWheelInfo = currentCar.wheels?.find(item => item.name === selectedOptions.wheels);
    
    // 선택된 옵션들 정보
    const selectedOptionsDetails = [];
    console.log('=== DEBUG: generateQuoteJson ===');
    console.log('selectedOptions:', selectedOptions);
    console.log('currentCar.options:', currentCar.options);
    
    if (currentCar.options) {
      Object.entries(currentCar.options).forEach(([category, options]) => {
        console.log(`Checking category: ${category}`);
        console.log(`selectedOptions[${category}]:`, selectedOptions[category]);
        console.log(`Is array:`, Array.isArray(selectedOptions[category]));
        
        if (selectedOptions[category]) {
          if (Array.isArray(selectedOptions[category])) {
            // 배열인 경우
            options.forEach(option => {
              if (selectedOptions[category].includes(option.name)) {
                console.log(`Found selected option: ${option.name} in category: ${category}`);
                
                // 트림별 가격이 있으면 해당 트림의 가격 사용, 없으면 기본 가격 사용
                let optionPrice = option.price || 0;
                if (option.trimPrices && selectedOptions.trim && option.trimPrices[selectedOptions.trim] !== undefined) {
                  optionPrice = option.trimPrices[selectedOptions.trim];
                }
                
                selectedOptionsDetails.push({
                  category: category,
                  name: option.name,
                  price: optionPrice,
                  description: option.description || ''
                });
              }
            });
          } else {
            // 배열이 아닌 경우 (단일 값 또는 다른 형태)
            console.log(`selectedOptions[${category}] is not an array:`, typeof selectedOptions[category]);
          }
        }
      });
    }
    
    console.log('selectedOptionsDetails:', selectedOptionsDetails);
    console.log('=== END DEBUG ===');

    // 세제혜택 할인 금액
    const taxBenefitDiscount = selectedOptions.taxBenefit === '적용' ? (typeof calculateTaxBenefitDiscount === 'function' ? calculateTaxBenefitDiscount() : 0) : 0;
    
    // 가격 계산
    const basePrice = parseInt(currentCar.fullPrice?.replace(/,/g, '') || '0');
    const trimPrice = selectedTrimInfo?.price || 0;
    const exteriorPrice = selectedExteriorInfo?.price || 0;
    const interiorPrice = selectedInteriorInfo?.price || 0;
    const wheelsPrice = selectedWheelInfo?.price || 0;
    const additionalOptionsPrice = selectedOptionsDetails.reduce((sum, option) => sum + option.price, 0);
    
    // 할인 전 총 금액
    const totalBeforeDiscount = basePrice + trimPrice + exteriorPrice + interiorPrice + wheelsPrice + additionalOptionsPrice;
    
    // 할인 후 총 금액 (할인 전 금액에서 세제혜택 금액을 차감)
    const totalAfterDiscount = totalBeforeDiscount - taxBenefitDiscount;

    return {
      carModel: currentCar.fullName || 'Unknown',
      carId: currentCar.id || 'unknown',
      basePrice: basePrice,
      selectedOptions: {
        trim: {
          name: selectedOptions.trim,
          price: trimPrice
        },
        exterior: {
          name: selectedOptions.exterior,
          price: exteriorPrice
        },
        interior: {
          name: selectedOptions.interior,
          price: interiorPrice
        },
        wheels: {
          name: selectedOptions.wheels,
          price: wheelsPrice
        },
        taxBenefit: {
          applied: selectedOptions.taxBenefit === '적용',
          discount: taxBenefitDiscount
        },
        additionalOptions: selectedOptionsDetails
      },
      priceBredown: {
        basePrice: basePrice,
        trimPrice: trimPrice,
        exteriorPrice: exteriorPrice,
        interiorPrice: interiorPrice,
        wheelsPrice: wheelsPrice,
        additionalOptionsPrice: additionalOptionsPrice,
        totalBeforeDiscount: totalBeforeDiscount,
        taxBenefitDiscount: -taxBenefitDiscount,
        totalAfterDiscount: totalAfterDiscount
      },
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('JSON 생성 실패:', err);
    return {
      error: '견적 데이터 생성에 실패했습니다.',
      timestamp: new Date().toISOString()
    };
  }
};

export const handleFileOperation = (operation, currentCar, selectedOptions, setSelectedOptions, setShowJsonDisplay, generateQuoteJsonFn) => {
  try {
    if (operation === 'export') {
      const jsonData = generateQuoteJsonFn();
      if (jsonData.error) {
        alert(`견적 내보내기 실패: ${jsonData.error}`);
        return;
      }
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `견적서_${currentCar.fullName}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      alert('견적서가 성공적으로 저장되었습니다.');
    } else if (operation === 'import') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          alert('파일을 선택해주세요.');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            
            // 새로운 JSON 구조 처리
            if (data.selectedOptions && data.selectedOptions.trim) {
              const importedOptions = {
                trim: data.selectedOptions.trim.name || data.selectedOptions.trim,
                exterior: data.selectedOptions.exterior.name || data.selectedOptions.exterior,
                interior: data.selectedOptions.interior.name || data.selectedOptions.interior,
                wheels: data.selectedOptions.wheels?.name || data.selectedOptions.wheels || data.selectedOptions.wheel?.name || data.selectedOptions.wheel,
                taxBenefit: data.selectedOptions.taxBenefit.applied ? '적용' : '미적용'
              };
              
              // 추가 옵션들 복원 - additionalOptions와 기존 방식 모두 지원
              if (data.selectedOptions.additionalOptions) {
                // 새로운 방식: additionalOptions 배열에서 복원
                const optionsByCategory = {};
                data.selectedOptions.additionalOptions.forEach(option => {
                  if (!optionsByCategory[option.category]) {
                    optionsByCategory[option.category] = [];
                  }
                  optionsByCategory[option.category].push(option.name);
                });
                
                // 카테고리별 옵션들을 importedOptions에 추가
                Object.entries(optionsByCategory).forEach(([category, options]) => {
                  importedOptions[category] = options;
                });
              } else if (data.selectedOptions.options) {
                // 기존 방식: options 배열 복원
                importedOptions.options = data.selectedOptions.options || [];
              } else {
                // 기본값
                importedOptions.options = [];
                if (currentCar?.options) {
                  Object.keys(currentCar.options).forEach(categoryName => {
                    importedOptions[categoryName] = [];
                  });
                }
              }
              
              setSelectedOptions(importedOptions);
              setShowJsonDisplay(false);
              alert('견적이 성공적으로 불러와졌습니다.');
            } else {
              // 기존 JSON 구조 처리
              if (data.trim && data.exterior && data.interior) {
                setSelectedOptions({
                  trim: data.trim,
                  exterior: data.exterior,
                  interior: data.interior,
                  options: data.options || [],
                  wheels: data.wheels || data.wheel || '',
                  taxBenefit: data.taxBenefit || '미적용'
                });
                setShowJsonDisplay(false);
                alert('견적이 성공적으로 불러와졌습니다.');
              } else {
                throw new Error('올바르지 않은 견적 파일 형식입니다.');
              }
            }
          } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            alert('견적 파일을 읽는 중 오류가 발생했습니다. 올바른 견적 파일인지 확인해주세요.');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }
  } catch (err) {
    console.error('파일 작업 오류:', err);
    alert('파일 작업 중 예상치 못한 오류가 발생했습니다. 다시 시도해주세요.');
  }
};