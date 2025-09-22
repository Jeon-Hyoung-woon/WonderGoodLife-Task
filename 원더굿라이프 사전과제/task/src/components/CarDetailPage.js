import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getCarById } from '../data/carData';
import Header from './Header';
import Sidebar from './Sidebar';
import { usePriceCalculations } from '../hooks/usePriceCalculations';
import { useOptionValidations } from '../hooks/useOptionValidations';
import { useOptionManagement } from '../hooks/useOptionManagement';
import { getSelectedItemPrice, getOptionPrice, getOptionDescription } from '../utils/dataHelpers';
import { generateQuoteJson, handleFileOperation } from '../utils/jsonHelpers';
import './styles/CarDetailPage.css';

const CarDetailPage = () => {
  const { model } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('차량정보');
  const [showJsonDisplay, setShowJsonDisplay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCar, setCurrentCar] = useState(null);
  const [specTrim, setSpecTrim] = useState(''); // 사양정보 탭에서 선택된 트림

  // 커스텀 훅들 사용
  const { selectedOptions, setSelectedOptions, getInitialOptions, resetToInitialOptions, handleOptionChange } = useOptionManagement(currentCar);
  const { calculateTaxBenefitDiscount, calculateAdditionalOptionsPrice, calculateTotalPrice } = usePriceCalculations(currentCar, selectedOptions);
  const { isOptionDisabled, isOptionIncluded, shouldShowOption, isWheelDisabled, isWheelIncluded, isInteriorDisabled } = useOptionValidations(currentCar, selectedOptions);

  // 차량 데이터 가져오기 및 예외처리
  useEffect(() => {
    const loadCarData = async () => {
      try {
        setIsLoading(true);
        
        // 1. location.state에서 전달받은 데이터 확인
        let carData = location.state?.carData;
        
        // 2. location.state가 없으면 URL 파라미터로 데이터 조회
        if (!carData && model) {
          console.log(`URL 파라미터를 통해 차량 데이터 조회: ${model}`);
          carData = getCarById(model);
          
          if (!carData) {
            console.warn(`URL 파라미터에 해당하는 차량을 찾을 수 없습니다: ${model}`);
            alert(`'${model}' 차량을 찾을 수 없습니다. 올바른 URL인지 확인해주세요.`);
            navigate('/', { replace: true });
            return;
          }
        }
        
        // 3. 모든 방법으로도 차량 데이터를 찾을 수 없으면
        if (!carData) {
          console.warn('차량 데이터를 찾을 수 없습니다. 잘못된 접근입니다.');
          alert('잘못된 경로로 접근하였습니다. 메인페이지에서 차량을 선택해주세요.');
          navigate('/', { replace: true });
          return;
        }
        
        // 4. 차량 데이터 유효성 검사
        if (!carData.id || !carData.fullName || !carData.trims || !carData.exterior || !carData.interior) {
          console.error('차량 데이터가 올바르지 않습니다:', carData);
          alert('차량 데이터가 올바르지 않습니다. 메인페이지로 이동합니다.');
          navigate('/', { replace: true });
          return;
        }
        
        setCurrentCar(carData);
        console.log('차량 데이터 로드 성공:', carData.fullName);
        
      } catch (err) {
        console.error('차량 데이터 로드 실패:', err);
        alert('차량 정보를 불러오는 중 오류가 발생했습니다. 메인페이지로 이동합니다.');
        navigate('/', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCarData();
  }, [model, location.state]);









  // useEffect for initial options

  useEffect(() => {
    if (currentCar) {
      setSelectedOptions(getInitialOptions());
      // 사양정보 탭의 트림도 초기화
      const initialTrim = currentCar.trims?.find(t => t.selected)?.name || currentCar.trims?.[0]?.name || '';
      setSpecTrim(initialTrim);
      console.log('CurrentCar loaded:', currentCar);
      console.log('Initial specTrim set to:', initialTrim);
      console.log('TrimSpecs available:', currentCar.trimSpecs ? 'Yes' : 'No');
    }
  }, [getInitialOptions, currentCar]);











  // 헬퍼 함수들 (분리된 유틸리티 함수들을 래핑)

  // 헬퍼 함수들 (분리된 유틸리티 함수들을 래핑)
  const getSelectedItemPriceHelper = (type, name) => getSelectedItemPrice(currentCar, type, name);
  const getOptionPriceHelper = (optionName) => getOptionPrice(currentCar, optionName, selectedOptions.trim);
  const getOptionDescriptionHelper = (optionName) => getOptionDescription(currentCar, selectedOptions, optionName);
  
  // JSON 관련 함수들
  const generateQuoteJsonHelper = () => generateQuoteJson(currentCar, selectedOptions, calculateTaxBenefitDiscount);
  const handleFileOperationHelper = (operation) => handleFileOperation(
    operation,
    currentCar,
    selectedOptions,
    setSelectedOptions,
    setShowJsonDisplay,
    generateQuoteJsonHelper
  );

  // 로딩 상태 렌더링
  if (isLoading) {
    return (
      <div className="car-detail-page">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="detail-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>차량 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 데이터가 없으면 렌더링하지 않음 (리다이렉트 진행 중)
  if (!currentCar) {
    return null;
  }

  return (
    <div className="car-detail-page">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="detail-content">
        {/* 차량 정보 헤더 */}
        <div className="car-info-header-fixed">
          <div className="car-info-header-container">
            <h1 className="car-title">{currentCar.fullName}</h1>
            <div className="car-price-section">
              <div className="price-info">
                <span className="price-label">인기</span>
                <span className="price-amount">{currentCar.fullPrice}원</span>
              </div>
            </div>
          </div>
        </div>

        <div className="info-wrap">
          {/* 좌측 영역 */}
          <div className="info-section">
            {/* 탭 네비게이션 */}
            <div className="tab-navigation">
              {['차량정보', '사양정보'].map(tab => (
                <button 
                  key={tab}
                  className={`tab-button ${activeTab === tab ? 'active' : ''}`} 
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 탭별 컨텐츠 */}
            {activeTab === '차량정보' && (
              <div className="vehicle-overview">
                <div className="car-image-section">
                  <div className="car-brand-logo">
                    <span className="brand-text">KIA</span>
                  </div>
                  <img src={currentCar.image} alt={currentCar.fullName} className="detail-car-image" />
                </div>
                <div className="specs-table">
                  {Object.entries(currentCar.specs).map(([label, value]) => (
                    <div key={label} className="spec-row">
                      <span className="spec-label">{label}</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === '사양정보' && currentCar && (
              <div className="detailed-specs">
                {/* 트림 선택 */}
                <div className="spec-trim-selector">
                  <h3>트림별 주요 기본 품목</h3>
                  <select 
                    value={specTrim} 
                    onChange={(e) => setSpecTrim(e.target.value)}
                    className="trim-select spec-trim-select"
                  >
                    {currentCar.trims?.map((trim, index) => (
                      <option key={index} value={trim.name}>
                        {trim.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 상세 사양 - 최상단으로 이동 */}
                <div className="common-specs">
                  <h3>상세 사양</h3>
                  
                  {/* 기본정보 - 공통 정보와 트림별 기본정보 병합 */}
                  {currentCar.detailedSpecs && currentCar.detailedSpecs.기본정보 && (
                    <div className="spec-category">
                      <h4>기본정보</h4>
                      <div className="specs-table">
                        {(() => {
                          // 트림별 기본정보가 있으면 병합
                          let mergedBasicInfo = { ...currentCar.detailedSpecs.기본정보 };
                          if (currentCar.trimSpecs && specTrim && currentCar.trimSpecs[specTrim] && currentCar.trimSpecs[specTrim].기본정보) {
                            mergedBasicInfo = { ...currentCar.detailedSpecs.기본정보, ...currentCar.trimSpecs[specTrim].기본정보 };
                          }
                          
                          return Object.entries(mergedBasicInfo).map(([label, value]) => {
                            // 트림별 차체사양이 있으면 해당 값으로 대체
                            let displayValue = value;
                            if (currentCar.trimSpecs && specTrim && currentCar.trimSpecs[specTrim] && currentCar.trimSpecs[specTrim].차체사양) {
                              const trimBodySpec = currentCar.trimSpecs[specTrim].차체사양[label];
                              if (trimBodySpec) {
                                displayValue = trimBodySpec;
                              }
                            }
                            
                            return (
                              <div key={label} className="spec-row">
                                <span className="spec-label">{label}</span>
                                <span className="spec-value">{displayValue}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {/* 나머지 공통 사양들 - 트림별 성능 정보 병합 */}
                  {currentCar.detailedSpecs && Object.entries(currentCar.detailedSpecs).filter(([category]) => category !== '기본정보').map(([category, specs]) => {
                    // 트림별 성능 정보가 있으면 병합
                    let mergedSpecs = { ...specs };
                    if (category === '성능' && currentCar.trimSpecs && specTrim && currentCar.trimSpecs[specTrim] && currentCar.trimSpecs[specTrim].성능) {
                      mergedSpecs = { ...specs, ...currentCar.trimSpecs[specTrim].성능 };
                    }
                    
                    return (
                      <div key={category} className="spec-category">
                        <h4>{category}</h4>
                        <div className="specs-table">
                          {Object.entries(mergedSpecs).map(([label, value]) => (
                            <div key={label} className="spec-row">
                              <span className="spec-label">{label}</span>
                              <span className="spec-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 선택된 트림의 전용 특화 사양 */}
                {currentCar.trimSpecs && specTrim && currentCar.trimSpecs[specTrim] && currentCar.trimSpecs[specTrim]["전용 특화 사양"] && (
                  <div className="trim-exclusive-features">
                    {Object.entries(currentCar.trimSpecs[specTrim]["전용 특화 사양"]).map(([category, features]) => (
                      <div key={category} className="spec-category">
                        <h4>{category}</h4>
                        <div className="spec-content">
                          {features.split('\n').map((line, index) => (
                            <p key={index} style={{ margin: '0.25rem 0' }}>
                              {line.startsWith('※') ? (
                                <span style={{ fontSize: '0.9em', color: '#666', fontStyle: 'italic' }}>
                                  {line}
                                </span>
                              ) : (
                                line
                              )}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 선택된 트림의 기본 품목 */}
                {currentCar.trimSpecs && specTrim && currentCar.trimSpecs[specTrim] && currentCar.trimSpecs[specTrim].기본품목 ? (
                  <div className="trim-basic-features">
                    {Object.entries(currentCar.trimSpecs[specTrim].기본품목).map(([category, features]) => (
                      <div key={category} className="spec-category">
                        <h4>{category}</h4>
                        <div className="spec-content">
                          {features.split('\n').map((line, index) => (
                            <p key={index} style={{ margin: '0.25rem 0' }}>
                              {line.startsWith('※') ? (
                                <span style={{ fontSize: '0.9em', color: '#666', fontStyle: 'italic' }}>
                                  {line}
                                </span>
                              ) : (
                                line
                              )}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-trim-data">
                    <p>선택된 트림의 기본 품목 정보를 불러오는 중입니다...</p>
                    <p>현재 선택된 트림: {specTrim || '없음'}</p>
                  </div>
                )}
              </div>
            )}

            {/* 추가 옵션 섹션 - 차량정보 탭에서만 표시 */}
            {activeTab === '차량정보' && (
              <div className="additional-options">
                <div className="options-header">
                  <h3>추가 옵션</h3>
                  <span className="options-count">총합 {(calculateAdditionalOptionsPrice() - calculateTaxBenefitDiscount()).toLocaleString()}원</span>
                </div>
                
                {/* 선택 옵션들 */}
                {[
                  { type: 'trim', label: '트림', data: currentCar.trims, selected: selectedOptions.trim, className: 'trim-select' }
                ].map(({ type, label, data, selected, className }) => (
                  <div key={type} className="option-category select-row">
                    <div className="option-label-box">{label}</div>
                    <select 
                      value={selected} 
                      onChange={(e) => handleOptionChange(type, e.target.value)}
                      className={className}
                    >
                      {data.map((item, index) => (
                        <option key={index} value={item.name}>
                          {item.name} {item.price > 0 ? `(+${item.price.toLocaleString()}원)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* 세제혜택 선택 - taxBenefitDiscounts가 있는 차량만 표시 */}
                {currentCar?.taxBenefitDiscounts && (
                  <div className="option-category select-row">
                    <div className="option-label-box">세제혜택</div>
                    <select 
                      value={selectedOptions.taxBenefit} 
                      onChange={(e) => handleOptionChange('taxBenefit', e.target.value)}
                      className="tax-benefit-select"
                    >
                      <option value="미적용">미적용</option>
                      {selectedOptions.trim && (
                        <option value="적용">
                          적용 (-{(currentCar?.taxBenefitDiscounts?.[selectedOptions.trim] || 0).toLocaleString()}원)
                        </option>
                      )}
                    </select>
                  </div>
                )}

                {/* 외장 색상 - 스타일 패키지와 무광 색상 상호 제한 적용 */}
                <div className="option-category select-row">
                  <div className="option-label-box">외장 색상</div>
                  <select 
                    value={selectedOptions.exterior} 
                    onChange={(e) => handleOptionChange('exterior', e.target.value)}
                    className="color-select"
                  >
                    {currentCar.exterior.map((item, index) => {
                      // EV9-GT에서 스타일 패키지 선택 시 무광 색상 비활성화
                      const disabled = currentCar?.id === 'ev9-gt' && 
                                     item.name.includes('무광') && 
                                     (selectedOptions.패키지옵션 || []).includes('스타일');
                      return (
                        <option 
                          key={index} 
                          value={item.name}
                          disabled={disabled}
                        >
                          {item.name} {item.price > 0 ? `(+${item.price.toLocaleString()}원)` : ''} {disabled ? '(스타일 패키지와 동시 선택 불가)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 내장 색상 - 트림별 제한 적용 */}
                <div className="option-category select-row">
                  <div className="option-label-box">내장 색상</div>
                  <select 
                    value={selectedOptions.interior} 
                    onChange={(e) => handleOptionChange('interior', e.target.value)}
                    className="color-select"
                  >
                    {currentCar.interior.map((item, index) => {
                      const disabled = isInteriorDisabled(item.name, selectedOptions.trim);
                      return (
                        <option 
                          key={index} 
                          value={item.name}
                          disabled={disabled}
                        >
                          {item.name} {item.price > 0 ? `(+${item.price.toLocaleString()}원)` : ''} {disabled ? '(해당 트림에서 선택 불가)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 버튼 형식 옵션들 */}
                <div className="option-category">
                  {Object.entries(currentCar.options).map(([categoryName, options]) => (
                    <div key={categoryName} className="option-subcategory">
                      <h5>{categoryName}</h5>
                      <div className="option-buttons-grid">
                        {options
                          .filter(option => shouldShowOption(option.name, selectedOptions.trim))
                          .map((option, index) => {
                          const disabled = isOptionDisabled(option.name, selectedOptions.trim);
                          const included = isOptionIncluded(option.name, selectedOptions.trim);
                          const isSelected = (selectedOptions[categoryName] || selectedOptions.options || []).includes(option.name);
                          
                          return (
                            <button
                              key={index}
                              className={`option-button ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${included ? 'included' : ''}`}
                              onClick={() => {
                                if (!disabled && !included) {
                                  handleOptionChange(categoryName, option.name, !isSelected);
                                }
                              }}
                              disabled={disabled}
                            >
                              <div className="option-content">
                                <div className="option-top">
                                  <div className="option-left">
                                    <span className="option-name">{option.name}</span>
                                    {included && <span className="included-badge">기본</span>}
                                  </div>
                                  <div className="tooltip-container">
                                    <span className="info-icon">ⓘ</span>
                                    <div className="tooltip">
                                      {getOptionDescriptionHelper(option.name).split('\n').map((line, index) => (
                                        <div key={index} style={{ margin: '0.2rem 0' }}>
                                          {line.startsWith('※') ? (
                                            <span style={{ fontSize: '0.85em', color: '#888', fontStyle: 'italic' }}>
                                              {line}
                                            </span>
                                          ) : (
                                            line
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <span className="option-price">
                                  {included ? '기본 옵션' : `+ ${(() => {
                                    // 트림별 가격이 있으면 해당 트림의 가격 사용
                                    if (option.trimPrices && selectedOptions.trim && option.trimPrices[selectedOptions.trim] !== undefined) {
                                      return option.trimPrices[selectedOptions.trim].toLocaleString();
                                    }
                                    // 기본 가격 사용 (없으면 0으로 처리)
                                    return (option.price || 0).toLocaleString();
                                  })()}원`}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 휠 선택 */}
                <div className="option-subcategory">
                  <h5>휠</h5>
                  <div className={`option-buttons-grid wheels-grid ${currentCar.wheels.length === 1 ? 'single-wheel' : ''}`}>
                    {currentCar.wheels.map((wheel, index) => {
                      const wheelDisabled = isWheelDisabled(wheel.name, selectedOptions.trim);
                      const wheelIncluded = isWheelIncluded(wheel.name, selectedOptions.trim);
                      const isSelected = selectedOptions.wheels === wheel.name;
                      
                      return (
                        <button
                          key={index}
                          className={`option-button ${isSelected ? 'selected' : ''} ${wheelDisabled ? 'disabled' : ''} ${wheelIncluded ? 'included' : ''}`}
                          onClick={() => {
                            if (!wheelDisabled && !wheelIncluded) {
                              handleOptionChange('wheels', wheel.name);
                            }
                          }}
                          disabled={wheelDisabled}
                        >
                          <div className="option-content">
                            <div className="option-top">
                              <div className="option-left">
                                <span className="option-name">{wheel.name}</span>
                                {wheelIncluded && <span className="included-badge">기본</span>}
                              </div>
                              {wheel.description && (
                                <div className="tooltip-container">
                                  <span className="info-icon">ⓘ</span>
                                  <div className="tooltip">
                                    {wheel.description.split('\n').map((line, index) => (
                                      <div key={index} style={{ margin: '0.2rem 0' }}>
                                        {line.startsWith('※') ? (
                                          <span style={{ fontSize: '0.85em', color: '#888', fontStyle: 'italic' }}>
                                            {line}
                                          </span>
                                        ) : (
                                          line
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <span className="option-price">
                              {wheelIncluded ? '기본 옵션' : wheel.price > 0 ? `+ ${wheel.price.toLocaleString()}원` : '0원'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 우측 영역 */}
          <div className="config-section">
            <div className="selected-options-summary">
              <div className="options-header-with-reset">
                <h3>선택된 옵션</h3>
                <button className="reset-options-button" onClick={resetToInitialOptions} title="옵션 초기화">
                  초기화
                </button>
              </div>
              
              {/* 선택된 옵션 표시 */}
              {[
                { label: '차량 기본가', value: `${parseInt(currentCar.fullPrice.replace(/,/g, '')).toLocaleString()}원` },
                { label: '트림', value: `${selectedOptions.trim}${getSelectedItemPriceHelper('trims', selectedOptions.trim)}` },
                ...(currentCar?.taxBenefitDiscounts ? [{ label: '세제혜택', value: selectedOptions.taxBenefit === '적용' ? `적용 (-${calculateTaxBenefitDiscount().toLocaleString()}원)` : '미적용' }] : []),
                { label: '외장 색상', value: `${selectedOptions.exterior}${getSelectedItemPriceHelper('exterior', selectedOptions.exterior)}` },
                { label: '내장 색상', value: `${selectedOptions.interior}${getSelectedItemPriceHelper('interior', selectedOptions.interior)}` },
                { label: '휠', value: `${selectedOptions.wheels}${getSelectedItemPriceHelper('wheels', selectedOptions.wheels)}` }
              ].map(({ label, value }) => (
                <div key={label} className="selected-option-item">
                  <span className="option-label">{label}:</span>
                  <span className="option-value">{value}</span>
                </div>
              ))}
              
              {/* 추가 옵션 */}
              {(() => {
                // 모든 카테고리의 선택된 옵션들을 수집
                const allSelectedOptions = [];
                
                // 기존 options 배열 포함
                if (selectedOptions.options && selectedOptions.options.length > 0) {
                  selectedOptions.options.forEach(optionName => {
                    allSelectedOptions.push({
                      name: optionName,
                      price: getOptionPriceHelper(optionName)
                    });
                  });
                }
                
                // 카테고리별 옵션들 포함
                if (currentCar?.options) {
                  Object.keys(currentCar.options).forEach(categoryName => {
                    if (selectedOptions[categoryName] && selectedOptions[categoryName].length > 0) {
                      selectedOptions[categoryName].forEach(optionName => {
                        // 중복 제거 (기존 options 배열과 겹치지 않도록)
                        if (!allSelectedOptions.some(opt => opt.name === optionName)) {
                          allSelectedOptions.push({
                            name: optionName,
                            price: getOptionPriceHelper(optionName)
                          });
                        }
                      });
                    }
                  });
                }
                
                return allSelectedOptions.length > 0 ? (
                  <div className="selected-option-item">
                    <span className="option-label">추가 옵션:</span>
                    <div className="option-list">
                      {allSelectedOptions.map((option, index) => (
                        <div key={index} className="option-list-item">
                          {option.name} (+{option.price.toLocaleString()}원)
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="selected-option-item">
                    <span className="option-label">추가 옵션:</span>
                    <span className="option-value">없음</span>
                  </div>
                );
              })()}
              
              <div className="total-price">
                <span className="total-label">총액:</span>
                <span className="total-value">{calculateTotalPrice().toLocaleString()}원</span>
              </div>
              
              {/* 버튼들 */}
              <div className="json-controls">
                {[
                  { label: '견적 내보내기 (JSON)', class: 'export', action: () => handleFileOperationHelper('export') },
                  { label: '견적 가져오기 (JSON)', class: 'import', action: () => handleFileOperationHelper('import') },
                  { label: showJsonDisplay ? 'JSON 숨기기' : 'JSON 확인하기', class: 'confirm', action: () => setShowJsonDisplay(!showJsonDisplay) }
                ].map(({ label, class: className, action }) => (
                  <button key={className} className={`json-button ${className}`} onClick={action}>
                    {label}
                  </button>
                ))}
              </div>

              {/* JSON 표시 */}
              {showJsonDisplay && (
                <div className="json-display">
                  <pre>{JSON.stringify(generateQuoteJsonHelper(), null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;