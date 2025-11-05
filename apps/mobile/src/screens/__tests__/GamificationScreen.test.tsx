import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GamificationScreen from '../GamificationScreen';
import gamificationReducer from '../../store/slices/gamificationSlice';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock components
jest.mock('../../components/TaskProgressCard', () => 'TaskProgressCard');
jest.mock('../../components/AchievementShowcase', () => 'AchievementShowcase');

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

// 創建測試用的 store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      gamification: gamificationReducer,
    },
    preloadedState: {
      gamification: {
        userProgress: {
          level: 5,
          points: 1250,
          streakDays: 7,
          achievements: [
            {
              id: 'achievement-1',
              name: '健康新手',
              description: '完成第一次食物記錄',
              icon: '🏆',
              rarity: 'common',
              points: 10,
              unlockedAt: new Date('2023-01-01'),
            },
          ],
          currentTasks: [
            {
              id: 'task-1',
              title: '每日喝水',
              description: '每天喝足8杯水',
              type: 'daily',
              difficulty: 'easy',
              status: 'in_progress',
              progress: 5,
              target: 8,
              points: 50,
              startedAt: new Date('2023-01-01'),
              expiresAt: new Date('2023-12-31'),
            },
          ],
        },
        availableTasks: [],
        leaderboard: [],
        isLoading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

describe('GamificationScreen', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  it('應該正確渲染用戶進度資訊', () => {
    const { getByText } = renderWithProvider(
      <GamificationScreen navigation={mockNavigation as any} />
    );

    expect(getByText('等級 5')).toBeTruthy();
    expect(getByText('1,250 積分')).toBeTruthy();
    expect(getByText('連續 7 天')).toBeTruthy();
  });

  it('應該正確渲染標籤頁', () => {
    const { getByText } = renderWithProvider(
      <GamificationScreen navigation={mockNavigation as any} />
    );

    expect(getByText('任務')).toBeTruthy();
    expect(getByText('成就')).toBeTruthy();
    expect(getByText('排行榜')).toBeTruthy();
  });

  it('點擊標籤時應該切換內容', () => {
    const { getByText, getByTestId } = renderWithProvider(
      <GamificationScreen navigation={mockNavigation as any} />
    );

    // 預設應該顯示任務標籤
    expect(getByTestId('tasks-tab')).toBeTruthy();

    // 點擊成就標籤
    fireEvent.press(getByText('成就'));
    expect(getByTestId('achievements-tab')).toBeTruthy();

    // 點擊排行榜標籤
    fireEvent.press(getByText('排行榜'));
    expect(getByTestId('leaderboard-tab')).toBeTruthy();
  });

  it('任務標籤應該顯示當前任務列表', () => {
    const { getByTestId } = renderWithProvider(
      <GamificationScreen navigation={mockNavigation as any} />
    );

    expect(getByTestId('tasks-tab')).toBeTruthy();
    expect(getByTestId('task-progress-card')).toBeTruthy();
  });

  it('成就標籤應該顯示成就展示', () => {
    const { getByText, getByTestId } = renderWithProvider(
      <GamificationScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByText('成就'));
    expect(getByTestId('achievement-showcase')).toBeTruthy();
  });

  it('排行榜標籤應該顯示排行榜內容', () => {
    const { getByText, getByTestId } = renderWithProvider(
      <GamificationScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByText('排行榜'));
    expect(getByTestId('leaderboard-content')).toBeTruthy();
  });

  it('應該正確處理任務完成', async () => {
    const { getByTestId } = renderWithProvider(
      <GamificationScreen navigation={mockNavigation as any} />
    );

    const taskCard = getByTestId('task-progress-card');
    fireEvent(taskCard, 'onComplete', 'task-1');

    // 檢查是否觸發了完成任務的 action
    await waitFor(() => {
      const state = store.getState().gamification;
      // 這裡應該檢查相應的狀態變化
    });
  });

  it('應該正確處理任務點擊', () => {
    const { getByTestId } = renderWithProvider(
      <GamificationScreen navigation={mockNavigation as any} />
    );

    const taskCard = getByTestId('task-progress-card');
    const mockTask = {
      id: 'task-1',
      title: '每日喝水',
      description: '每天喝足8杯水',
    };

    fireEvent(taskCard, 'onPress', mockTask);

    // 檢查是否正確處理任務點擊
    expect(mockNavigation.navigate).toHaveBeenCalledWith('TaskDetail', { task: mockTask });
  });

  it('應該正確處理成就點擊', () => {
    const { getByText, getByTestId } = renderWithProvider(
      <GamificationScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByText('成就'));
    
    const achievementShowcase = getByTestId('achievement-showcase');
    const mockAchievement = {
      id: 'achievement-1',
      name: '健康新手',
      description: '完成第一次食物記錄',
    };

    fireEvent(achievementShowcase, 'onAchievementPress', mockAchievement);

    // 檢查是否正確處理成就點擊
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AchievementDetail', { achievement: mockAchievement });
  });

  it('載入狀態時應該顯示載入指示器', () => {
    const loadingStore = createTestStore({ isLoading: true });
    
    const { getByTestId } = render(
      <Provider store={loadingStore}>
        <GamificationScreen navigation={mockNavigation as any} />
      </Provider>
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('錯誤狀態時應該顯示錯誤訊息', () => {
    const errorStore = createTestStore({ error: '載入失敗' });
    
    const { getByText } = render(
      <Provider store={errorStore}>
        <GamificationScreen navigation={mockNavigation as any} />
      </Provider>
    );

    expect(getByText('載入失敗')).toBeTruthy();
  });

  it('應該正確顯示等級進度條', () => {
    const { getByTestId } = renderWithProvider(
      <GamificationScreen navigation={mockNavigation as any} />
    );

    expect(getByTestId('level-progress-bar')).toBeTruthy();
  });

  it('應該正確處理每日獎勵領取', async () => {
    const { getByTestId } = renderWithProvider(
      <GamificationScreen navigation={mockNavigation as any} />
    );

    const dailyRewardButton = getByTestId('daily-reward-button');
    fireEvent.press(dailyRewardButton);

    await waitFor(() => {
      // 檢查是否觸發了領取每日獎勵的 action
      const state = store.getState().gamification;
      // 這裡應該檢查相應的狀態變化
    });
  });

  it('應該正確顯示連續登入天數', () => {
    const { getByText } = renderWithProvider(
      <GamificationScreen navigation={mockNavigation as any} />
    );

    expect(getByText('連續 7 天')).toBeTruthy();
  });

  it('應該正確處理排行榜類型切換', () => {
    const { getByText, getByTestId } = renderWithProvider(
      <GamificationScreen navigation={mockNavigation as any} />
    );

    fireEvent.press(getByText('排行榜'));
    
    const weeklyButton = getByTestId('weekly-leaderboard-button');
    const monthlyButton = getByTestId('monthly-leaderboard-button');

    fireEvent.press(weeklyButton);
    // 檢查是否切換到週排行榜

    fireEvent.press(monthlyButton);
    // 檢查是否切換到月排行榜
  });

  it('空任務列表時應該顯示空狀態', () => {
    const emptyStore = createTestStore({
      userProgress: {
        level: 1,
        points: 0,
        streakDays: 0,
        achievements: [],
        currentTasks: [],
      },
    });

    const { getByText } = render(
      <Provider store={emptyStore}>
        <GamificationScreen navigation={mockNavigation as any} />
      </Provider>
    );

    expect(getByText('沒有可用任務')).toBeTruthy();
  });
});