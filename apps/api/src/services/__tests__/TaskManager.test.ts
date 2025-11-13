// Mock dependencies first
jest.mock('../../database/connection', () => ({
  db: {
    getPool: jest.fn()
  }
}));

jest.mock('../../database/redis', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn()
  }
}));

import { TaskManager } from '../TaskManager';
import { db } from '../../database/connection';
import { redis } from '../../database/redis';
import { TaskType, TaskStatus } from '../../types/shared';

const mockDb = {
  query: jest.fn(),
  connect: jest.fn()
};

const mockClient = {
  query: jest.fn(),
  release: jest.fn()
};

// Setup mocks
(db.getPool as jest.Mock).mockReturnValue(mockDb);

describe('TaskManager', () => {
  let taskManager: TaskManager;

  beforeEach(() => {
    taskManager = new TaskManager();
    jest.clearAllMocks();
  });

  describe('generateDailyTasks', () => {
    it('應該成功生成每日任務', async () => {
      const userId = 'test-user-id';
      const mockTemplates = [
        {
          id: 'template-1',
          title: '記錄早餐',
          description: '記錄今天的早餐內容',
          type: 'daily',
          points: 10,
          requirements: { count: 1 }
        }
      ];

      // Mock Redis cache miss
      (redis?.get as jest.Mock)?.mockResolvedValue(null);
      
      // Mock template query
      mockDb.query.mockResolvedValueOnce({ rows: mockTemplates });
      
      // Mock task creation
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'task-1' }] });
      
      // Mock task retrieval
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'task-1',
          template_id: 'template-1',
          title: '記錄早餐',
          description: '記錄今天的早餐內容',
          type: 'daily',
          points: 10,
          progress: 0,
          target: 1,
          status: 'pending',
          category: 'nutrition',
          difficulty: 'easy'
        }]
      });

      const tasks = await taskManager.generateDailyTasks(userId);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('記錄早餐');
      expect(tasks[0].type).toBe(TaskType.DAILY);
      expect(redis?.setex).toHaveBeenCalled();
    });

    it('應該從快取返回已生成的任務', async () => {
      const userId = 'test-user-id';
      const cachedTasks = [
        {
          id: 'task-1',
          title: '記錄早餐',
          type: TaskType.DAILY,
          status: TaskStatus.PENDING
        }
      ];

      (redis?.get as jest.Mock)?.mockResolvedValue(JSON.stringify(cachedTasks));

      const tasks = await taskManager.generateDailyTasks(userId);

      expect(tasks).toEqual(cachedTasks);
      expect(mockDb.query).not.toHaveBeenCalled();
    });
  });

  describe('updateTaskProgress', () => {
    it('應該成功更新任務進度', async () => {
      const taskId = 'task-1';
      const progressDelta = 1;
      
      mockDb.connect.mockResolvedValue(mockClient);
      
      // Mock BEGIN
      mockClient.query.mockResolvedValueOnce({});
      
      // Mock task query
      mockClient.query.mockResolvedValueOnce({
        rows: [{
          id: taskId,
          user_id: 'user-1',
          progress: 0,
          target: 1,
          status: 'pending',
          points: 10
        }]
      });
      
      // Mock update query
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
      
      // Mock progress log
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
      
      // Mock points award
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });
      
      // Mock COMMIT
      mockClient.query.mockResolvedValueOnce({});

      const result = await taskManager.updateTaskProgress(taskId, progressDelta);

      expect(result).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('應該處理任務不存在的情況', async () => {
      const taskId = 'non-existent-task';
      const progressDelta = 1;
      
      mockDb.connect.mockResolvedValue(mockClient);
      // Mock BEGIN
      mockClient.query.mockResolvedValueOnce({});
      // Mock task query (no results)
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      // Mock ROLLBACK
      mockClient.query.mockResolvedValueOnce({});

      const result = await taskManager.updateTaskProgress(taskId, progressDelta);

      expect(result).toBe(false);
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getUserActiveTasks', () => {
    it('應該返回用戶的活躍任務', async () => {
      const userId = 'test-user-id';
      const mockTasks = [
        {
          id: 'task-1',
          template_id: 'template-1',
          title: '記錄早餐',
          description: '記錄今天的早餐內容',
          type: 'daily',
          points: 10,
          progress: 0,
          target: 1,
          status: 'pending',
          category: 'nutrition',
          difficulty: 'easy'
        }
      ];

      mockDb.query.mockResolvedValue({ rows: mockTasks });

      const tasks = await taskManager.getUserActiveTasks(userId);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('記錄早餐');
      expect(tasks[0].status).toBe(TaskStatus.PENDING);
    });
  });

  describe('generateDynamicTask', () => {
    it('應該為首次食物記錄生成動態任務', async () => {
      const userId = 'test-user-id';
      const actionType = 'first_food_log';
      const actionData = { foodId: 'food-1' };

      // Mock existing task check
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock task creation
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'dynamic-task-1' }] });
      
      // Mock task retrieval
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'dynamic-task-1',
          title: '繼續記錄',
          description: '再記錄2次餐點來建立良好習慣',
          type: 'daily',
          points: 30,
          progress: 0,
          target: 2,
          status: 'pending',
          category: 'logging',
          difficulty: 'easy'
        }]
      });

      const task = await taskManager.generateDynamicTask(userId, actionType, actionData);

      expect(task).toBeTruthy();
      expect(task?.title).toBe('繼續記錄');
      expect(task?.points).toBe(30);
    });

    it('應該避免創建重複的動態任務', async () => {
      const userId = 'test-user-id';
      const actionType = 'first_food_log';
      const actionData = { foodId: 'food-1' };

      // Mock existing task found
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: 'existing-task' }] });

      const task = await taskManager.generateDynamicTask(userId, actionType, actionData);

      expect(task).toBeNull();
    });
  });

  describe('getTaskCompletionStats', () => {
    it('應該返回任務完成統計', async () => {
      const userId = 'test-user-id';
      const mockStats = {
        total: '10',
        completed: '7',
        points_earned: '150'
      };

      mockDb.query.mockResolvedValue({ rows: [mockStats] });

      const stats = await taskManager.getTaskCompletionStats(userId);

      expect(stats.total).toBe(10);
      expect(stats.completed).toBe(7);
      expect(stats.completionRate).toBe(70);
      expect(stats.pointsEarned).toBe(150);
    });
  });

  describe('updateExpiredTasks', () => {
    it('應該更新過期任務狀態', async () => {
      mockDb.query.mockResolvedValue({ rowCount: 3 });

      const expiredCount = await taskManager.updateExpiredTasks();

      expect(expiredCount).toBe(3);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("SET status = 'expired'")
      );
    });
  });
});