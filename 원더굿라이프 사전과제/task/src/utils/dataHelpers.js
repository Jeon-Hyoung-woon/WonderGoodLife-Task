// 헬퍼 함수들 (예외처리 추가)
export const getSelectedItemPrice = (currentCar, type, name) => {
  try {
    if (!currentCar || !currentCar[type] || !name) return '';
    const item = currentCar[type]?.find(item => item.name === name);
    return item?.price > 0 ? ` (+${item.price.toLocaleString()}원)` : '';
  } catch (err) {
    console.error('선택된 아이템 가격 조회 실패:', err);
    return '';
  }
};

export const getOptionPrice = (currentCar, optionName, selectedTrim = null) => {
  try {
    if (!currentCar || !currentCar.options || !optionName) return 0;
    let price = 0;
    Object.values(currentCar.options).forEach(category => {
      const option = category?.find(opt => opt.name === optionName);
      if (option) {
        // 트림별 가격이 있고 선택된 트림이 있으면 해당 트림의 가격 사용
        if (option.trimPrices && selectedTrim && option.trimPrices[selectedTrim] !== undefined) {
          price = option.trimPrices[selectedTrim];
        } else {
          // 기본 가격 사용
          price = option.price || 0;
        }
      }
    });
    return price;
  } catch (err) {
    console.error('옵션 가격 조회 실패:', err);
    return 0;
  }
};

// 옵션 설명 제공 함수
export const getOptionDescription = (currentCar, selectedOptions, optionName) => {
  if (!currentCar?.options) {
    return '해당 옵션에 대한 상세 정보입니다.';
  }

  // 모든 옵션 카테고리를 검색해서 해당 옵션의 description 찾기
  for (const category of Object.values(currentCar.options)) {
    const option = category.find(opt => opt.name === optionName);
    if (option) {
      // 트림별 설명이 있으면 해당 트림의 설명 사용
      if (option.trimDescriptions && selectedOptions.trim && option.trimDescriptions[selectedOptions.trim]) {
        return option.trimDescriptions[selectedOptions.trim];
      }
      // tooltip이 있으면 tooltip 사용 (더 상세한 정보)
      if (option.tooltip) {
        return option.tooltip;
      }
      // 기본 설명 사용
      if (option.description) {
        return option.description;
      }
    }
  }

  return '해당 옵션에 대한 상세 정보입니다.';
};