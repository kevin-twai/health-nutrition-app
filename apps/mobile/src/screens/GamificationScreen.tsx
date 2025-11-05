import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../store';
import {
  fetchUserProgress,
  fetchAvailableTasks,
  completeTask,
  fetchAchievements,
  fetchLeaderboard,
  claimDailyReward,
  clearError,
} from '../store/slices/gamificationSlice';
import {
  Task,
  Achievement,
  TaskStatus,
  TaskDifficulty,
  AchievementRarity,
  LeaderboardType,
} from '@health-tracker/shared-types';
import TaskProgressCard from '../components/TaskProgressCard';
import AchievementShowcase from '../components/AchievementShowcase';

const { width } = Dimensions.get('window');

const GamificationScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    userProgress,
    availableTasks,
    achievements,
    leaderboards,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.gamification as any);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'tasks' | 'achievements' | 'leaderboard'>('tasks');
  const [selectedLeaderboardType, setSelectedLeaderboardType] = useState<LeaderboardType>(
    LeaderboardType.WEEKLY_POINTS
  );
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    dispatch(fetchUserProgress() as any);
    dispatch(fetchAvailableTasks() as any);
    dispatch(fetchAchievements() as any);
    dispatch(fetchLeaderboard(LeaderboardType.WEEKLY_POINTS) as any);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('錯誤', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchUserProgress() as any),
      dispatch(fetchAvailableTasks() as any),
      dispatch(fetchAchievements() as any),
      dispatch(fetchLeaderboard(selectedLeaderboardType) as any),
    ]);
    setRefreshing(false);
  };

  const handleCompleteTask = (taskId: string) => {
    Alert.alert(
      '完成任務',
      '確定要標記此任務為完成嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: () => dispatch(completeTask(taskId) as any),
        },
      ]
    );
  };

  const handleClaimDailyReward = () => {
    dispatch(claimDailyReward() as any);
  };

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setAchievementModalVisible(true);
  };

  const handleLeaderboardTypeChange = (type: LeaderboardType) => {
    setSelectedLeaderboardType(type);
    dispatch(fetchLeaderboard(type) as any);
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

  const getRarityColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.COMMON:
        return '#95a5a6';
      case AchievementRarity.RARE:
        return '#3498db';
      case AchievementRarity.EPIC:
        return '#9b59b6';
      case AchievementRarity.LEGENDARY:
        return '#f1c40f';
      default:
        return '#95a5a6';
    }
  };

  const renderProgressBar = () => {
    if (!userProgress) return null;

    const progressPercentage = (userProgress.experiencePoints % 1000) / 10; // 假設每1000經驗升一級

    return (
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{userProgress.level}</Text>
          </View>
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsText}>{userProgress.totalPoints} 總積分</Text>
            <Text style={styles.streakText}>連續 {userProgress.streakDays} 天</Text>
          </View>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage}%` },
              ]}
              testID="level-progress-bar"
            />
          </View>
          <Text style={styles.progressText}>
            {userProgress.experiencePoints % 1000}/1000 經驗值
          </Text>
        </View>

        <View style={styles.rewardSection}>
          <TouchableOpacity
            style={[
              styles.dailyRewardButton,
              userProgress?.lastActivityDate && 
              new Date(userProgress.lastActivityDate).toDateString() === new Date().toDateString() &&
              styles.disabledRewardButton
            ]}
            onPress={handleClaimDailyReward}
            disabled={
              userProgress?.lastActivityDate && 
              new Date(userProgress.lastActivityDate).toDateString() === new Date().toDateString()
            }
            testID="daily-reward-button"
          >
            <Icon name="card-giftcard" size={20} color="#ffffff" />
            <Text style={styles.dailyRewardText}>
              {userProgress?.lastActivityDate && 
               new Date(userProgress.lastActivityDate).toDateString() === new Date().toDateString()
                ? '今日已領取' 
                : '領取每日獎勵'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.streakInfoButton}
            onPress={() => {
              Alert.alert(
                '連續登入獎勵',
                `您已連續登入 ${userProgress?.streakDays || 0} 天！\n\n連續登入可獲得額外積分獎勵：\n• 7天: +50積分\n• 14天: +100積分\n• 30天: +200積分`,
                [{ text: '了解', style: 'default' }]
              );
            }}
          >
            <Icon name="info-outline" size={16} color="#3498db" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTaskCard = (task: Task) => (
    <TaskProgressCard
      key={task.id}
      task={task}
      onComplete={handleCompleteTask}
      onPress={(task) => {
        // 可以在這裡添加任務詳情查看邏輯
        console.log('Task pressed:', task.title);
      }}
    />
  );

  const renderAchievementCard = (achievement: Achievement) => (
    <TouchableOpacity
      key={achievement.id}
      style={[
        styles.achievementCard,
        achievement.unlockedAt && styles.unlockedAchievement,
      ]}
      onPress={() => handleAchievementPress(achievement)}
    >
      <View style={styles.achievementIcon}>
        <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
        {achievement.unlockedAt && (
          <View style={styles.unlockedBadge}>
            <Icon name="check" size={12} color="#ffffff" />
          </View>
        )}
      </View>
      
      <View style={styles.achievementInfo}>
        <Text style={[
          styles.achievementName,
          !achievement.unlockedAt && styles.lockedText,
        ]}>
          {achievement.name}
        </Text>
        <Text style={[
          styles.achievementDescription,
          !achievement.unlockedAt && styles.lockedText,
        ]}>
          {achievement.description}
        </Text>
        
        <View style={styles.achievementMeta}>
          <View
            style={[
              styles.rarityBadge,
              { backgroundColor: getRarityColor(achievement.rarity) },
            ]}
          >
            <Text style={styles.rarityText}>
              {achievement.rarity.toUpperCase()}
            </Text>
          </View>
          <View style={styles.pointsContainer}>
            <Icon name="stars" size={12} color="#f1c40f" />
            <Text style={styles.achievementPoints}>{achievement.points}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLeaderboardEntry = (entry: any, index: number) => (
    <TouchableOpacity 
      key={entry.userId} 
      style={[
        styles.leaderboardEntry,
        entry.userId === userProgress?.userId && styles.currentUserEntry
      ]}
      onPress={() => {
        Alert.alert(
          entry.userName,
          `排名: #${entry.rank}\n積分: ${entry.score}\n\n${index < 3 ? '🏆 恭喜進入前三名！' : '繼續努力，爭取更好的排名！'}`,
          [{ text: '確定', style: 'default' }]
        );
      }}
    >
      <View style={styles.rankContainer}>
        <Text style={[
          styles.rankText,
          index < 3 && styles.topRankText,
        ]}>
          #{entry.rank}
        </Text>
        {index < 3 && (
          <Icon
            name={index === 0 ? 'emoji-events' : 'military-tech'}
            size={16}
            color={index === 0 ? '#f1c40f' : index === 1 ? '#95a5a6' : '#cd7f32'}
          />
        )}
      </View>
      
      <View style={styles.userInfo}>
        <Text style={[
          styles.userName,
          entry.userId === userProgress?.userId && styles.currentUserName
        ]}>
          {entry.userName}
          {entry.userId === userProgress?.userId && ' (您)'}
        </Text>
      </View>
      
      <Text style={[
        styles.userScore,
        entry.userId === userProgress?.userId && styles.currentUserScore
      ]}>
        {entry.score}
      </Text>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'tasks':
        return (
          <View style={styles.tabContent}>
            {availableTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="assignment" size={48} color="#bdc3c7" />
                <Text style={styles.emptyTitle}>沒有可用任務</Text>
                <Text style={styles.emptySubtitle}>
                  所有任務都已完成，明天會有新的挑戰！
                </Text>
              </View>
            ) : (
              availableTasks.map(renderTaskCard)
            )}
          </View>
        );

      case 'achievements':
        return (
          <View style={styles.tabContent}>
            <AchievementShowcase
              achievements={achievements}
              onAchievementPress={handleAchievementPress}
              layout="grid"
            />
          </View>
        );

      case 'leaderboard':
        const currentLeaderboard = leaderboards[selectedLeaderboardType];
        return (
          <View style={styles.tabContent}>
            <View style={styles.leaderboardTypeSelector}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Object.values(LeaderboardType).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      selectedLeaderboardType === type && styles.activeTypeButton,
                    ]}
                    onPress={() => handleLeaderboardTypeChange(type)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      selectedLeaderboardType === type && styles.activeTypeButtonText,
                    ]}>
                      {type === LeaderboardType.WEEKLY_POINTS && '週積分'}
                      {type === LeaderboardType.MONTHLY_POINTS && '月積分'}
                      {type === LeaderboardType.TOTAL_POINTS && '總積分'}
                      {type === LeaderboardType.STREAK_DAYS && '連續天數'}
                      {type === LeaderboardType.COMPLETED_TASKS && '完成任務'}
                      {type === LeaderboardType.ACHIEVEMENTS && '成就數量'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {currentLeaderboard ? (
              <View style={styles.leaderboardList}>
                {currentLeaderboard.entries.map(renderLeaderboardEntry)}
                
                {currentLeaderboard.userRank && (
                  <View style={styles.userRankCard}>
                    <Text style={styles.userRankTitle}>您的排名</Text>
                    <Text style={styles.userRankText}>
                      #{currentLeaderboard.userRank} / {currentLeaderboard.totalParticipants}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="leaderboard" size={48} color="#bdc3c7" />
                <Text style={styles.emptyTitle}>排行榜載入中...</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderProgressBar()}

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'tasks' && styles.activeTab]}
          onPress={() => setSelectedTab('tasks')}
        >
          <Icon
            name="assignment"
            size={20}
            color={selectedTab === 'tasks' ? '#3498db' : '#95a5a6'}
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'tasks' && styles.activeTabText,
          ]}>
            任務
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'achievements' && styles.activeTab]}
          onPress={() => setSelectedTab('achievements')}
        >
          <Icon
            name="emoji-events"
            size={20}
            color={selectedTab === 'achievements' ? '#3498db' : '#95a5a6'}
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'achievements' && styles.activeTabText,
          ]}>
            成就
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'leaderboard' && styles.activeTab]}
          onPress={() => setSelectedTab('leaderboard')}
        >
          <Icon
            name="leaderboard"
            size={20}
            color={selectedTab === 'leaderboard' ? '#3498db' : '#95a5a6'}
          />
          <Text style={[
            styles.tabText,
            selectedTab === 'leaderboard' && styles.activeTabText,
          ]}>
            排行榜
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>

      {/* 成就詳情模態框 */}
      <Modal
        visible={achievementModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAchievementModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAchievement && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalAchievementIcon}>
                    {selectedAchievement.icon}
                  </Text>
                  <Text style={styles.modalAchievementName}>
                    {selectedAchievement.name}
                  </Text>
                  <View
                    style={[
                      styles.modalRarityBadge,
                      { backgroundColor: getRarityColor(selectedAchievement.rarity) },
                    ]}
                  >
                    <Text style={styles.modalRarityText}>
                      {selectedAchievement.rarity.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalAchievementDescription}>
                  {selectedAchievement.description}
                </Text>

                <View style={styles.modalAchievementMeta}>
                  <View style={styles.modalMetaItem}>
                    <Icon name="stars" size={16} color="#f1c40f" />
                    <Text style={styles.modalMetaText}>
                      {selectedAchievement.points} 積分
                    </Text>
                  </View>
                  
                  {selectedAchievement.unlockedAt && (
                    <View style={styles.modalMetaItem}>
                      <Icon name="schedule" size={16} color="#95a5a6" />
                      <Text style={styles.modalMetaText}>
                        {new Date(selectedAchievement.unlockedAt).toLocaleDateString('zh-TW')}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setAchievementModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>關閉</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  progressCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  levelText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pointsInfo: {
    flex: 1,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  streakText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 4,
  },
  rewardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dailyRewardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledRewardButton: {
    backgroundColor: '#95a5a6',
  },
  dailyRewardText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  streakInfoButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
    color: '#95a5a6',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: (width - 48) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    opacity: 0.6,
  },
  unlockedAchievement: {
    opacity: 1,
  },
  achievementIcon: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  achievementEmoji: {
    fontSize: 32,
  },
  unlockedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#27ae60',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementInfo: {
    alignItems: 'center',
  },
  achievementName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
  lockedText: {
    color: '#bdc3c7',
  },
  achievementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  achievementPoints: {
    fontSize: 12,
    color: '#f1c40f',
    marginLeft: 2,
  },
  leaderboardTypeSelector: {
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    marginRight: 8,
  },
  activeTypeButton: {
    backgroundColor: '#3498db',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  activeTypeButtonText: {
    color: '#ffffff',
  },
  leaderboardList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginRight: 4,
  },
  topRankText: {
    color: '#f1c40f',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    color: '#2c3e50',
  },
  currentUserName: {
    fontWeight: 'bold',
    color: '#3498db',
  },
  userScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  currentUserScore: {
    color: '#e74c3c',
  },
  currentUserEntry: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  userRankCard: {
    backgroundColor: '#3498db',
    padding: 16,
    alignItems: 'center',
  },
  userRankTitle: {
    color: '#ffffff',
    fontSize: 12,
    marginBottom: 4,
  },
  userRankText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: width - 40,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAchievementIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  modalAchievementName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalRarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalRarityText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalAchievementDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalAchievementMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  modalMetaText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  modalCloseButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GamificationScreen;