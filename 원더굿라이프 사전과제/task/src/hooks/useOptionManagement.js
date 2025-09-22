import { useState, useCallback } from 'react';
import { useOptionValidations } from './useOptionValidations';

export const useOptionManagement = (currentCar) => {
  const [selectedOptions, setSelectedOptions] = useState({
    trim: '', exterior: '', interior: '', options: [], wheels: '', taxBenefit: '미적용'
  });

  const { isInteriorDisabled, isWheelDisabled } = useOptionValidations(currentCar, selectedOptions);

  // 초기 옵션 설정
  const getInitialOptions = useCallback(() => {
    if (!currentCar) return { trim: '', exterior: '', interior: '', options: [], wheels: '', taxBenefit: '미적용' };
    
    try {
      const initialOptions = {
        trim: currentCar.trims?.find(t => t.selected)?.name || currentCar.trims?.[0]?.name || '',
        exterior: currentCar.exterior?.find(e => e.selected)?.name || currentCar.exterior?.[0]?.name || '',
        interior: currentCar.interior?.find(i => i.selected)?.name || currentCar.interior?.[0]?.name || '',
        options: [], // 기존 호환성을 위해 유지
        wheels: currentCar.wheels?.find(w => w.selected)?.name || currentCar.wheels?.[0]?.name || '',
        taxBenefit: '미적용'
      };
      
      // 모든 옵션 카테고리 초기화
      if (currentCar.options) {
        Object.keys(currentCar.options).forEach(categoryName => {
          initialOptions[categoryName] = [];
        });
      }
      
      return initialOptions;
    } catch (err) {
      console.error('초기 옵션 설정 실패:', err);
      return { trim: '', exterior: '', interior: '', options: [], wheels: '', taxBenefit: '미적용' };
    }
  }, [currentCar]);

  // 옵션 초기화
  const resetToInitialOptions = () => {
    try {
      setSelectedOptions(getInitialOptions());
      alert('옵션이 초기 상태로 재설정되었습니다.');
    } catch (err) {
      console.error('옵션 초기화 실패:', err);
      alert('옵션 초기화 중 오류가 발생했습니다.');
    }
  };

  // 옵션 선택 핸들러 (예외처리 추가)
  const handleOptionChange = (type, value, isChecked = false) => {
    try {
      setSelectedOptions(prev => {
        // 기존 'options' 타입 호환성 유지 및 카테고리별 옵션 처리
        if (type === 'options' || (currentCar?.options && currentCar.options[type])) {
          // options 타입이거나 currentCar.options에 해당 카테고리가 있으면 배열로 처리
          const categoryKey = type === 'options' ? 'options' : type;
          return {
            ...prev,
            [categoryKey]: isChecked 
              ? [...(prev[categoryKey] || []), value]
              : (prev[categoryKey] || []).filter(opt => opt !== value)
          };
        }
        
        // 트림 변경 시 모든 옵션 초기화
        if (type === 'trim') {
          // 새로운 트림에 맞는 기본 옵션들로 초기화
          const defaultExterior = currentCar?.exterior?.find(e => e.selected)?.name || currentCar?.exterior?.[0]?.name || '';
          const defaultInterior = currentCar?.interior?.find(i => i.selected && !isInteriorDisabled(i.name, value))?.name || 
                                  currentCar?.interior?.find(i => !isInteriorDisabled(i.name, value))?.name || '';
          const defaultWheels = (() => {
            const restrictions = currentCar?.trimOptionRestrictions?.[value];
            // 트림별 기본 휠이 설정되어 있으면 사용
            if (restrictions?.defaultWheel) {
              return restrictions.defaultWheel;
            }
            // 기본 휠이 없으면 기존 로직 사용
            return currentCar?.wheels?.find(w => w.selected && !isWheelDisabled(w.name, value))?.name || 
                   currentCar?.wheels?.find(w => !isWheelDisabled(w.name, value))?.name || '';
          })();
          
          const resetOptions = {
            trim: value,
            exterior: defaultExterior,
            interior: defaultInterior,
            options: [], // 기존 호환성을 위해 유지
            wheels: defaultWheels,
            taxBenefit: '미적용' // 세제혜택도 초기화
          };
          
          // 모든 옵션 카테고리 초기화
          if (currentCar?.options) {
            Object.keys(currentCar.options).forEach(categoryName => {
              resetOptions[categoryName] = [];
            });
          }
          
          return resetOptions;
        }
        
        // EV9-GT에서 외장 색상 변경 시 스타일 패키지와의 상호 제한 처리
        if (type === 'exterior' && currentCar?.id === 'ev9-gt') {
          const newExterior = value;
          const isMatteColor = newExterior.includes('무광');
          
          // 무광 색상 선택 시 스타일 패키지 자동 해제
          if (isMatteColor) {
            return {
              ...prev,
              [type]: value,
              패키지옵션: (prev.패키지옵션 || []).filter(opt => opt !== '스타일')
            };
          }
        }
        
        return { ...prev, [type]: value };
      });
    } catch (err) {
      console.error('옵션 변경 실패:', err);
      alert('옵션 변경 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.');
    }
  };

  return {
    selectedOptions,
    setSelectedOptions,
    getInitialOptions,
    resetToInitialOptions,
    handleOptionChange
  };
};