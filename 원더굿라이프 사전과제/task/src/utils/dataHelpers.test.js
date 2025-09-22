import { getSelectedItemPrice, getOptionPrice, getOptionDescription } from './dataHelpers';

const mockCar = {
  id: 'test-car',
  exterior: [
    { name: '화이트', price: 0 },
    { name: '블랙', price: 100000 }
  ],
  options: {
    패키지옵션: [
      { 
        name: '스타일', 
        price: 500000,
        trimPrices: {
          'Air': 500000,
          'Earth': 400000
        },
        description: '스타일 패키지'
      },
      {
        name: '컴포트',
        price: 300000,
        description: '컴포트 패키지'
      }
    ]
  }
};

describe('Data Helper Functions', () => {
  describe('getSelectedItemPrice', () => {
    test('returns empty string for free option', () => {
      const result = getSelectedItemPrice(mockCar, 'exterior', '화이트');
      expect(result).toBe('');
    });

    test('returns formatted price for paid option', () => {
      const result = getSelectedItemPrice(mockCar, 'exterior', '블랙');
      expect(result).toBe(' (+100,000원)');
    });

    test('returns empty string for invalid input', () => {
      const result = getSelectedItemPrice(null, 'exterior', '블랙');
      expect(result).toBe('');
    });
  });

  describe('getOptionPrice', () => {
    test('returns basic price when no trim specified', () => {
      const result = getOptionPrice(mockCar, '스타일');
      expect(result).toBe(500000);
    });

    test('returns trim-specific price when trim specified', () => {
      const result = getOptionPrice(mockCar, '스타일', 'Earth');
      expect(result).toBe(400000);
    });

    test('returns basic price when trim not in trimPrices', () => {
      const result = getOptionPrice(mockCar, '컴포트', 'Air');
      expect(result).toBe(300000);
    });

    test('returns 0 for non-existent option', () => {
      const result = getOptionPrice(mockCar, '존재하지않는옵션');
      expect(result).toBe(0);
    });
  });

  describe('getOptionDescription', () => {
    test('returns option description', () => {
      const result = getOptionDescription(mockCar, {}, '스타일');
      expect(result).toBe('스타일 패키지');
    });

    test('returns default message for non-existent option', () => {
      const result = getOptionDescription(mockCar, {}, '존재하지않는옵션');
      expect(result).toBe('해당 옵션에 대한 상세 정보입니다.');
    });
  });
});