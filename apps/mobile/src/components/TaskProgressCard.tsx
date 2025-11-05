import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Task,
  TaskStatus,
  TaskDifficulty,
  TaskType,
} from '@health-tracker/shared-types';

interface TaskProgressCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onPress?: (task: Task) => void;
}

const TaskProgressCard: React.FC<TaskProgressCardProps> = ({
  task,
  onComplete,
  onPress,
}) => {
  const progressPercentage = (task.progress / task.target) * 100;
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const canComplete = task.progress >= task.target && !isCompleted;
  const isExpired = task.expiresAt && new Date(task.expiresAt) < new Date();
  
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 進度條動畫
    Animated.timing(progressAnimation, {
      toValue: progressPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // 完成任務時的脈衝動畫
    if (canComplete) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [progressPercentage, canComplete]);

  const handleTaskPress = () => {
    if (onPress) {
      onPress(task);
    } else {
      // 顯示任務詳情
      Alert.alert(
        task.title,
        `${task.description}\n\n難度: ${getDifficultyLabel(task.difficulty)}\n積分: ${task.points}\n進度: ${task.progress}/${task.target}`,
        [{ text: '確定', style: 'default' }]
      );
    }
  };

  const handleCompletePress = () => {
    Alert.alert(
      '完成任務',
      `確定要完成「${task.title}」嗎？\n\n您將獲得 ${task.points} 積分獎勵！`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '完成',
          style: 'default',
          onPress: () => onComplete?.(task.id),
        },
      ]
    );
  };

  const getDifficultyColor = (difficulty: TaskDifficulty) => {
    switch (difficulty) {
      case TaskDifficulty.EASY:
        return '#27ae60';
      case TaskDifficulty.MEDIUM:
        return '#f39c12';
      case TaskDifficulty.HARD:
        return '#e74c3c';
      case TaskDifficulty.EXPERT:
        return '#9b59b6';
      default:
        return '#95a5a6';
    }
  };

  const getTypeIcon = (type: TaskType) => {
    switch (type) {
      case TaskType.DAILY:
        return 'today';
      case TaskType.WEEKLY:
        return 'date-range';
      case TaskType.MONTHLY:
        return 'calendar-month';
      case TaskType.MILESTONE:
        return 'flag';
      default:
        return 'assignment';
    }
  };

  const getTypeLabel = (type: TaskType) => {
    switch (type) {
      case TaskType.DAILY:
        return '每日';
      case TaskType.WEEKLY:
        return '每週';
      case TaskType.MONTHLY:
        return '每月';
      case TaskType.MILESTONE:
        return '里程碑';
      default:
        return '任務';
    }
  };

  const getDifficultyLabel = (difficulty: TaskDifficulty) => {
    switch (difficulty) {
      case TaskDifficulty.EASY:
        return '簡單';
      case TaskDifficulty.MEDIUM:
        return '中等';
      case TaskDifficulty.HARD:
        return '困難';
      case TaskDifficulty.EXPERT:
        return '專家';
      default:
        return '未知';
    }
  };

  const formatExpiryTime = (expiresAt?: Date) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} 天後到期`;
    } else if (diffHours > 0) {
      return `${diffHours} 小時後到期`;
    } else if (diffMs > 0) {
      return '即將到期';
    } else {
      return '已過期';
    }
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: canComplete ? pulseAnimation : 1 }] }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.container,
          isCompleted && styles.completedContainer,
          isExpired && styles.expiredContainer,
          canComplete && styles.completableContainer,
        ]}
        onPress={handleTaskPress}
        activeOpacity={0.7}
      >
      <View style={styles.header}>
        <View style={styles.taskInfo}>
          <View style={styles.titleRow}>
            <Icon
              name={getTypeIcon(task.type)}
              size={16}
              color="#7f8c8d"
              style={styles.typeIcon}
            />
            <Text style={[
              styles.title,
              isCompleted && styles.completedText,
            ]}>
              {task.title}
            </Text>
          </View>
          
          <Text style={[
            styles.description,
            isCompleted && styles.completedText,
          ]}>
            {task.description}
          </Text>
        </View>

        <View style={styles.badges}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {getTypeLabel(task.type)}
            </Text>
          </View>
          
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(task.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>
              {getDifficultyLabel(task.difficulty)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            進度: {task.progress}/{task.target}
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  }),
                  backgroundColor: isCompleted 
                    ? '#27ae60' 
                    : canComplete 
                    ? '#e74c3c' 
                    : isExpired 
                    ? '#95a5a6' 
                    : '#3498db',
                },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.leftFooter}>
          <View style={styles.pointsContainer}>
            <Icon name="stars" size={16} color="#f1c40f" />
            <Text style={styles.pointsText}>{task.points} 積分</Text>
          </View>
          
          {task.expiresAt && (
            <View style={styles.expiryContainer}>
              <Icon 
                name="schedule" 
                size={12} 
                color={isExpired ? '#e74c3c' : '#95a5a6'} 
              />
              <Text style={[
                styles.expiryText,
                isExpired && styles.expiredText,
              ]}>
                {formatExpiryTime(task.expiresAt)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.rightFooter}>
          {isCompleted ? (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={16} color="#27ae60" />
              <Text style={styles.completedBadgeText}>已完成</Text>
            </View>
          ) : canComplete ? (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompletePress}
            >
              <Icon name="check" size={16} color="#ffffff" />
              <Text style={styles.completeButtonText}>完成</Text>
            </TouchableOpacity>
          ) : isExpired ? (
            <View style={styles.expiredBadge}>
              <Icon name="access-time" size={16} color="#e74c3c" />
              <Text style={styles.expiredBadgeText}>已過期</Text>
            </View>
          ) : (
            <View style={styles.inProgressBadge}>
              <Icon name="schedule" size={16} color="#3498db" />
              <Text style={styles.inProgressText}>進行中</Text>
            </View>
          )}
        </View>
      </View>

      {task.startedAt && (
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampText}>
            開始於 {new Date(task.startedAt).toLocaleDateString('zh-TW')}
          </Text>
          {task.completedAt && (
            <Text style={styles.timestampText}>
              完成於 {new Date(task.completedAt).toLocaleDateString('zh-TW')}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedContainer: {
    backgroundColor: '#f8f9fa',
    opacity: 0.8,
  },
  expiredContainer: {
    backgroundColor: '#fdf2f2',
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
  },
  completableContainer: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeIcon: {
    marginRight: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  completedText: {
    color: '#95a5a6',
    textDecorationLine: 'line-through',
  },
  badges: {
    alignItems: 'flex-end',
  },
  typeBadge: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarBackground: {
    flex: 1,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftFooter: {
    flex: 1,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  pointsText: {
    fontSize: 12,
    color: '#f1c40f',
    fontWeight: '600',
    marginLeft: 4,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  expiryText: {
    fontSize: 10,
    color: '#95a5a6',
    marginLeft: 4,
  },
  expiredText: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiredBadgeText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  rightFooter: {
    alignItems: 'flex-end',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedBadgeText: {
    color: '#27ae60',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  inProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inProgressText: {
    color: '#3498db',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  timestampContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  timestampText: {
    fontSize: 10,
    color: '#95a5a6',
    marginBottom: 2,
  },
});

export default TaskProgressCard;