export const useOptionValidations = (currentCar, selectedOptions) => {
  // 트림별 옵션 제한 확인 함수
  const isOptionDisabled = (optionName, selectedTrim) => {
    try {
      if (!selectedTrim) return false;

      // EV3 와이드 선루프 특별 제한: Air/Air_롱레인지에서만 스타일 패키지 필요
      if (currentCar?.id === 'ev3' && optionName === '와이드 선루프') {
        if (selectedTrim === 'Air' || selectedTrim === 'Air_롱레인지') {
          const hasStylePackage = selectedOptions.패키지옵션?.includes('스타일');
          if (!hasStylePackage) return true;
        }
        // Earth, GT-Line, GT-Line_롱레인지는 제한 없음
      }

      // requiredPackageOptions 확인 - 필수 패키지 옵션이 선택되지 않은 경우 비활성화
      if (currentCar?.options) {
        for (const category of Object.values(currentCar.options)) {
          const option = category.find(opt => opt.name === optionName);
          if (option && option.requiredPackageOptions) {
            const hasRequiredPackage = option.requiredPackageOptions.some(requiredPkg => 
              selectedOptions.패키지옵션?.includes(requiredPkg)
            );
            if (!hasRequiredPackage) return true;
          }
        }
      }

      // 새로운 trimRestrictions 방식 처리 (Ray-EV 등)
      if (currentCar?.options) {
        for (const category of Object.values(currentCar.options)) {
          const option = category.find(opt => opt.name === optionName);
          if (option && option.trimRestrictions && option.trimRestrictions[selectedTrim]) {
            return option.trimRestrictions[selectedTrim] === "선택불가";
          }
        }
      }

      // 기존 trimOptionRestrictions 방식 처리
      if (!currentCar?.trimOptionRestrictions) {
        // EV9-GT의 특별 제한: 스타일 패키지와 무광 외장 칼라 상호 제한
        if (currentCar?.id === 'ev9-gt') {
          // 스타일 패키지 선택 시 무광 외장 칼라 제한
          if (optionName === '스타일') {
            const isMatteColor = selectedOptions.exterior && selectedOptions.exterior.includes('무광');
            return isMatteColor;
          }
        }
        return false;
      }
      
      const restrictions = currentCar.trimOptionRestrictions[selectedTrim];
      
      // EV9-GT의 특별 제한: 스타일 패키지와 무광 외장 칼라 상호 제한
      if (currentCar?.id === 'ev9-gt' && optionName === '스타일') {
        const isMatteColor = selectedOptions.exterior && selectedOptions.exterior.includes('무광');
        return isMatteColor;
      }
      
      return restrictions?.disabledOptions?.includes(optionName) || 
             restrictions?.disabledPackageOptions?.includes(optionName) || false;
    } catch (err) {
      console.error('옵션 제한 확인 실패:', err);
      return false;
    }
  };

  // 트림에 기본 포함된 옵션인지 확인
  const isOptionIncluded = (optionName, selectedTrim) => {
    try {
      if (!selectedTrim) return false;

      // 새로운 trimRestrictions 방식 처리 (Ray-EV 등)
      if (currentCar?.options) {
        for (const category of Object.values(currentCar.options)) {
          const option = category.find(opt => opt.name === optionName);
          if (option && option.trimRestrictions && option.trimRestrictions[selectedTrim]) {
            return option.trimRestrictions[selectedTrim] === "기본포함";
          }
        }
      }

      // 기존 trimOptionRestrictions 방식 처리
      if (!currentCar?.trimOptionRestrictions) return false;
      
      const restrictions = currentCar.trimOptionRestrictions[selectedTrim];
      return restrictions?.includedOptions?.includes(optionName) || 
             restrictions?.includedPackageOptions?.includes(optionName) || false;
    } catch (err) {
      console.error('기본 옵션 확인 실패:', err);
      return false;
    }
  };

  // 특정 트림에서 옵션을 보여줄지 여부 확인
  const shouldShowOption = (optionName, selectedTrim) => {
    try {
      if (!selectedTrim) return true;

      // 새로운 trimRestrictions 방식에서 처리
      if (currentCar?.options) {
        for (const category of Object.values(currentCar.options)) {
          const option = category.find(opt => opt.name === optionName);
          if (option && option.trimRestrictions) {
            // 현재 트림이 trimRestrictions에 없으면 표시하지 않음 (스타일 패키지 등)
            if (!option.trimRestrictions.hasOwnProperty(selectedTrim)) {
              return false;
            }
          }
        }
      }

      return true;
    } catch (err) {
      console.error('옵션 표시 여부 확인 실패:', err);
      return true;
    }
  };

  // 휠 옵션 비활성화 확인 함수
  const isWheelDisabled = (wheelName, selectedTrim) => {
    try {
      if (!selectedTrim) return false;

      // 새로운 trimRestrictions 방식 처리 (Ray-EV 등)
      if (currentCar?.wheels) {
        const wheel = currentCar.wheels.find(w => w.name === wheelName);
        if (wheel && wheel.trimRestrictions && wheel.trimRestrictions[selectedTrim]) {
          return wheel.trimRestrictions[selectedTrim] === "선택불가";
        }
      }

      // 기존 trimOptionRestrictions 방식 처리
      if (!currentCar?.trimOptionRestrictions) return false;
      
      const restrictions = currentCar.trimOptionRestrictions[selectedTrim];
      return restrictions?.disabledWheels?.includes(wheelName) || false;
    } catch (err) {
      console.error('휠 제한 확인 실패:', err);
      return false;
    }
  };

  // 트림에 기본 포함된 휠인지 확인
  const isWheelIncluded = (wheelName, selectedTrim) => {
    try {
      // EV9-GT의 21인치 GT전용 전면가공 휠은 기본 포함
      if (currentCar?.id === 'ev9-gt' && wheelName === '21인치 GT전용 전면가공 휠') {
        return true;
      }

      // 새로운 trimRestrictions 방식 처리 (Ray-EV 등)
      if (currentCar?.wheels) {
        const wheel = currentCar.wheels.find(w => w.name === wheelName);
        if (wheel && wheel.trimRestrictions && wheel.trimRestrictions[selectedTrim]) {
          const restriction = wheel.trimRestrictions[selectedTrim];
          return restriction === "기본포함" || restriction === "기본옵션";
        }
      }
      
      // 기존 trimOptionRestrictions 방식 처리
      if (!currentCar?.trimOptionRestrictions) return false;
      
      const restrictions = currentCar.trimOptionRestrictions[selectedTrim];
      return restrictions?.includedWheels?.includes(wheelName) || false;
    } catch (err) {
      console.error('기본 휠 확인 실패:', err);
      return false;
    }
  };

  // 인테리어 옵션 비활성화 확인 함수
  const isInteriorDisabled = (interiorName, selectedTrim) => {
    try {
      if (!currentCar?.trimOptionRestrictions || !selectedTrim) return false;
      
      const restrictions = currentCar.trimOptionRestrictions[selectedTrim];
      if (!restrictions) return false;
      
      // GT-Line 전용 인테리어는 GT-Line 트림에서만 사용 가능
      if (interiorName.includes('GT-Line')) {
        return !selectedTrim.includes('GT-Line');
      }
      
      // 트림별 비활성화된 인테리어 확인
      return restrictions.disabledInterior?.includes(interiorName) || false;
    } catch (err) {
      console.error('인테리어 제한 확인 실패:', err);
      return false;
    }
  };

  return {
    isOptionDisabled,
    isOptionIncluded,
    shouldShowOption,
    isWheelDisabled,
    isWheelIncluded,
    isInteriorDisabled
  };
};