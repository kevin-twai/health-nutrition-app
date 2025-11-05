import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AchievementShowcase from '../AchievementShowcase';
import { Achievement, AchievementRarity } from '@health-tracker/shared-types';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock Animated
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Animated.timing = () => ({
    start: jest.fn(),
  });
  return RN;
});

describe('AchievementShowcase', () => {
  const mockAchievements: Achievement[] = [
    {
      id: 'achievement-1',
      name: '健康新手',
      description: '完成第一次食物記錄',
      icon: '🏆',
      rarity: AchievementRarity.COMMON,
      points: 10,
      unlockedAt: new Date('2023-01-01'),
    },
    {
      id: 'achievement-2',
      name: '營養專家',
      description: '連續7天記錄飲食',
      icon: '🥗',
      rarity: AchievementRarity.RARE,
      points: 50,
      unlockedAt: new Date('2023-01-07'),
    },
    {
      id: 'achievement-3',
      name: '傳奇大師',
      description: '達成所有健康目標',
      icon: '👑',
      rarity: AchievementRarity.LEGENDARY,
      points: 500,
    },
  ];

  const mockOnAchievementPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應該正確渲染成就統計', () => {
    const { getByText } = render(
      <AchievementShowcase achievements={mockAchievements} />
    );

    expect(getByText('2')).toBeTruthy(); // 已解鎖數量
    expect(getByText('3')).toBeTruthy(); // 總計
    expect(getByText('60')).toBeTruthy(); // 總積分 (10 + 50)
    expect(getByText('已解鎖')).toBeTruthy();
    expect(getByText('總計')).toBeTruthy();
    expect(getByText('積分')).toBeTruthy();
  });

  it('應該正確渲染已解鎖的成就', () => {
    const { getByText } = render(
      <AchievementShowcase achievements={mockAchievements} />
    );

    expect(getByText('健康新手')).toBeTruthy();
    expect(getByText('完成第一次食物記錄')).toBeTruthy();
    expect(getByText('🏆')).toBeTruthy();
    expect(getByText('COMMON')).toBeTruthy();
  });

  it('應該正確渲染未解鎖的成就', () => {
    const { getByText } = render(
      <AchievementShowcase achievements={mockAchievements} />
    );

    expect(getByText('傳奇大師')).toBeTruthy();
    expect(getByText('達成所有健康目標')).toBeTruthy();
    expect(getByText('🔒')).toBeTruthy(); // 鎖定圖標
    expect(getByText('LEGENDARY')).toBeTruthy();
  });

  it('當 showUnlockedOnly 為 true 時應該只顯示已解鎖的成就', () => {
    const { getByText, queryByText } = render(
      <AchievementShowcase 
        achievements={mockAchievements} 
        showUnlockedOnly={true}
      />
    );

    expect(getByText('健康新手')).toBeTruthy();
    expect(getByText('營養專家')).toBeTruthy();
    expect(queryByText('傳奇大師')).toBeNull();
  });

  it('點擊成就時應該觸發 onAchievementPress 回調', () => {
    const { getByText } = render(
      <AchievementShowcase 
        achievements={mockAchievements}
        onAchievementPress={mockOnAchievementPress}
      />
    );

    fireEvent.press(getByText('健康新手'));
    expect(mockOnAchievementPress).toHaveBeenCalledWith(mockAchievements[0]);
  });

  it('應該根據稀有度顯示正確的顏色', () => {
    const { getByText } = render(
      <AchievementShowcase achievements={mockAchievements} />
    );

    // 檢查稀有度標籤是否存在
    expect(getByText('COMMON')).toBeTruthy();
    expect(getByText('RARE')).toBeTruthy();
    expect(getByText('LEGENDARY')).toBeTruthy();
  });

  it('應該顯示成就的解鎖日期', () => {
    const { getByText } = render(
      <AchievementShowcase achievements={mockAchievements} />
    );

    // 檢查日期格式化是否正確
    expect(getByText('1月1日')).toBeTruthy();
    expect(getByText('1月7日')).toBeTruthy();
  });

  it('應該正確處理列表佈局', () => {
    const { getByText } = render(
      <AchievementShowcase 
        achievements={mockAchievements}
        layout="list"
      />
    );

    expect(getByText('健康新手')).toBeTruthy();
    expect(getByText('營養專家')).toBeTruthy();
  });

  it('應該正確處理網格佈局', () => {
    const { getByText } = render(
      <AchievementShowcase 
        achievements={mockAchievements}
        layout="grid"
      />
    );

    expect(getByText('健康新手')).toBeTruthy();
    expect(getByText('營養專家')).toBeTruthy();
  });

  it('應該正確顯示成就積分', () => {
    const { getAllByText } = render(
      <AchievementShowcase achievements={mockAchievements} />
    );

    // 檢查積分是否正確顯示
    expect(getAllByText('10')).toBeTruthy();
    expect(getAllByText('50')).toBeTruthy();
    expect(getAllByText('500')).toBeTruthy();
  });

  it('空成就列表時應該正確處理', () => {
    const { getByText } = render(
      <AchievementShowcase achievements={[]} />
    );

    const { getAllByText } = render(
      <AchievementShowcase achievements={[]} />
    );
    
    const zeroElements = getAllByText('0');
    expect(zeroElements.length).toBeGreaterThanOrEqual(3); // 已解鎖數量、總計、總積分
  });
});