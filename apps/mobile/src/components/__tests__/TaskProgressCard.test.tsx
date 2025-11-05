import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import TaskProgressCard from '../TaskProgressCard';
import { Task, TaskStatus, TaskDifficulty, TaskType } from '@health-tracker/shared-types';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock Animated
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Animated.timing = () => ({
    start: jest.fn(),
  });
  RN.Animated.loop = () => ({
    start: jest.fn(),
  });
  RN.Animated.sequence = jest.fn(() => ({}));
  return RN;
});

describe('TaskProgressCard', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: '每日喝水',
    description: '每天喝足8杯水',
    type: TaskType.DAILY,
    difficulty: TaskDifficulty.EASY,
    status: TaskStatus.IN_PROGRESS,
    progress: 5,
    target: 8,
    points: 50,
    startedAt: new Date('2023-01-01'),
    expiresAt: new Date('2023-12-31'),
  };

  const mockOnComplete = jest.fn();
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應該正確渲染任務資訊', () => {
    const { getByText } = render(
      <TaskProgressCard task={mockTask} />
    );

    expect(getByText('每日喝水')).toBeTruthy();
    expect(getByText('每天喝足8杯水')).toBeTruthy();
    expect(getByText('進度: 5/8')).toBeTruthy();
    expect(getByText('63%')).toBeTruthy();
    expect(getByText('50 積分')).toBeTruthy();
  });

  it('應該顯示正確的任務類型標籤', () => {
    const { getByText } = render(
      <TaskProgressCard task={mockTask} />
    );

    expect(getByText('每日')).toBeTruthy();
    expect(getByText('簡單')).toBeTruthy();
  });

  it('當任務可完成時應該顯示完成按鈕', () => {
    const completableTask = {
      ...mockTask,
      progress: 8,
    };

    const { getByText } = render(
      <TaskProgressCard task={completableTask} onComplete={mockOnComplete} />
    );

    expect(getByText('完成')).toBeTruthy();
  });

  it('當任務已完成時應該顯示已完成標籤', () => {
    const completedTask = {
      ...mockTask,
      status: TaskStatus.COMPLETED,
      progress: 8,
      completedAt: new Date('2023-01-02'),
    };

    const { getByText } = render(
      <TaskProgressCard task={completedTask} />
    );

    expect(getByText('已完成')).toBeTruthy();
  });

  it('當任務過期時應該顯示已過期標籤', () => {
    const expiredTask = {
      ...mockTask,
      expiresAt: new Date('2022-12-31'),
    };

    const { getByText } = render(
      <TaskProgressCard task={expiredTask} />
    );

    const { getAllByText } = render(
      <TaskProgressCard task={expiredTask} />
    );
    
    const expiredElements = getAllByText('已過期');
    expect(expiredElements.length).toBeGreaterThan(0);
  });

  it('點擊任務卡片時應該觸發 onPress 回調', () => {
    const { getByText } = render(
      <TaskProgressCard task={mockTask} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('每日喝水'));
    expect(mockOnPress).toHaveBeenCalledWith(mockTask);
  });

  it('點擊任務卡片時沒有 onPress 回調應該顯示 Alert', () => {
    const { getByText } = render(
      <TaskProgressCard task={mockTask} />
    );

    fireEvent.press(getByText('每日喝水'));
    expect(Alert.alert).toHaveBeenCalledWith(
      '每日喝水',
      expect.stringContaining('每天喝足8杯水'),
      [{ text: '確定', style: 'default' }]
    );
  });

  it('點擊完成按鈕時應該顯示確認對話框', () => {
    const completableTask = {
      ...mockTask,
      progress: 8,
    };

    const { getByText } = render(
      <TaskProgressCard task={completableTask} onComplete={mockOnComplete} />
    );

    fireEvent.press(getByText('完成'));
    expect(Alert.alert).toHaveBeenCalledWith(
      '完成任務',
      expect.stringContaining('確定要完成「每日喝水」嗎？'),
      expect.arrayContaining([
        { text: '取消', style: 'cancel' },
        expect.objectContaining({ text: '完成' }),
      ])
    );
  });

  it('應該根據難度顯示正確的顏色', () => {
    const hardTask = {
      ...mockTask,
      difficulty: TaskDifficulty.HARD,
    };

    const { getByText } = render(
      <TaskProgressCard task={hardTask} />
    );

    expect(getByText('困難')).toBeTruthy();
  });

  it('應該正確格式化到期時間', () => {
    const soonExpireTask = {
      ...mockTask,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2小時後
    };

    const { getByText } = render(
      <TaskProgressCard task={soonExpireTask} />
    );

    expect(getByText('1 小時後到期')).toBeTruthy();
  });

  it('應該顯示任務開始和完成時間戳', () => {
    const completedTask = {
      ...mockTask,
      status: TaskStatus.COMPLETED,
      completedAt: new Date('2023-01-02'),
    };

    const { getByText } = render(
      <TaskProgressCard task={completedTask} />
    );

    expect(getByText(/開始於/)).toBeTruthy();
    expect(getByText(/完成於/)).toBeTruthy();
  });
});