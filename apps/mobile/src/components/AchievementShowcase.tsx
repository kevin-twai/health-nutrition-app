import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Achievement, AchievementRarity } from '@health-tracker/shared-types';

interface AchievementShowcaseProps {
  achievements: Achievement[];
  onAchievementPress?: (achievement: Achievement) => void;
  showUnlockedOnly?: boolean;
  layout?: 'grid' | 'list';
}

const { width } = Dimensions.get('window');

const AchievementShowcase: React.FC<AchievementShowcaseProps> = ({
  achievements,
  onAchievementPress,
  showUnlockedOnly = false,
  layout = 'grid',
}) => {
  const filteredAchievements = showUnlockedOnly
    ? achievements.filter(a => a.unlockedAt)
    : achievements;

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

  const getRarityGradient = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.LEGENDARY:
        return ['#f1c40f', '#f39c12'];
      case AchievementRarity.EPIC:
        return ['#9b59b6', '#8e44ad'];
      case AchievementRarity.RARE:
        return ['#3498db', '#2980b9'];
      default:
        return ['#95a5a6', '#7f8c8d'];
    }
  };

  const renderAchievementCard = (achievement: Achievement, index: number) => {
    const isUnlocked = !!achievement.unlockedAt;
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    const cardWidth = layout === 'grid' ? (width - 60) / 2 : width - 40;

    return (
      <Animated.View
        key={achievement.id}
        style={[
          {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.achievementCard,
            layout === 'list' && styles.listCard,
            { width: cardWidth },
            !isUnlocked && styles.lockedCard,
            isUnlocked && {
              borderColor: getRarityColor(achievement.rarity),
              borderWidth: 2,
            },
          ]}
          onPress={() => onAchievementPress?.(achievement)}
          activeOpacity={0.8}
        >
          <View style={styles.achievementHeader}>
            <View style={[
              styles.achievementIconContainer,
              isUnlocked && {
                backgroundColor: getRarityColor(achievement.rarity) + '20',
              },
            ]}>
              <Text style={[
                styles.achievementIcon,
                !isUnlocked && styles.lockedIcon,
              ]}>
                {isUnlocked ? achievement.icon : '🔒'}
              </Text>
              {isUnlocked && (
                <View style={[
                  styles.unlockedBadge,
                  { backgroundColor: getRarityColor(achievement.rarity) },
                ]}>
                  <Icon name="check" size={12} color="#ffffff" />
                </View>
              )}
            </View>
            
            <View style={[
              styles.rarityBadge,
              { backgroundColor: getRarityColor(achievement.rarity) },
            ]}>
              <Text style={styles.rarityText}>
                {achievement.rarity.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.achievementContent}>
            <Text style={[
              styles.achievementName,
              !isUnlocked && styles.lockedText,
            ]}>
              {achievement.name}
            </Text>
            
            <Text style={[
              styles.achievementDescription,
              !isUnlocked && styles.lockedText,
            ]}>
              {achievement.description}
            </Text>

            <View style={styles.achievementFooter}>
              <View style={styles.pointsContainer}>
                <Icon 
                  name="stars" 
                  size={14} 
                  color={isUnlocked ? '#f1c40f' : '#bdc3c7'} 
                />
                <Text style={[
                  styles.pointsText,
                  !isUnlocked && styles.lockedText,
                ]}>
                  {achievement.points}
                </Text>
              </View>

              {isUnlocked && achievement.unlockedAt && (
                <Text style={styles.unlockedDate}>
                  {new Date(achievement.unlockedAt).toLocaleDateString('zh-TW', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              )}
            </View>
          </View>

          {isUnlocked && achievement.rarity === AchievementRarity.LEGENDARY && (
            <View style={styles.legendaryGlow} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderStats = () => {
    const unlockedCount = achievements.filter(a => a.unlockedAt).length;
    const totalPoints = achievements
      .filter(a => a.unlockedAt)
      .reduce((sum, a) => sum + a.points, 0);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{unlockedCount}</Text>
          <Text style={styles.statLabel}>已解鎖</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{achievements.length}</Text>
          <Text style={styles.statLabel}>總計</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalPoints}</Text>
          <Text style={styles.statLabel}>積分</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderStats()}
      
      <View style={[
        styles.achievementGrid,
        layout === 'list' && styles.achievementList,
      ]}>
        {filteredAchievements.map(renderAchievementCard)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 16,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementList: {
    flexDirection: 'column',
  },
  achievementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  listCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedCard: {
    opacity: 0.6,
    backgroundColor: '#f8f9fa',
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    position: 'relative',
  },
  achievementIcon: {
    fontSize: 24,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  unlockedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rarityText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    lineHeight: 16,
    marginBottom: 8,
  },
  lockedText: {
    color: '#bdc3c7',
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 12,
    color: '#f1c40f',
    fontWeight: '600',
    marginLeft: 4,
  },
  unlockedDate: {
    fontSize: 10,
    color: '#95a5a6',
  },
  legendaryGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f1c40f',
    opacity: 0.3,
  },
});

export default AchievementShowcase;