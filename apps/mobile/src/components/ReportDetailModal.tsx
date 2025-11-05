import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { HealthReport, HealthTrend } from '@health-tracker/shared-types';
import HealthStatsChart from './HealthStatsChart';

interface ReportDetailModalProps {
  visible: boolean;
  report: HealthReport | null;
  onClose: () => void;
  onShare?: (reportId: string) => void;
}

const { width, height } = Dimensions.get('window');

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  visible,
  report,
  onClose,
  onShare,
}) => {
  const [selectedTab, setSelectedTab] = useState<'summary' | 'trends' | 'recommendations' | 'achievements'>('summary');
  
  if (!report) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = new Date(start).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
    });
    const endStr = new Date(end).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
    });
    return `${startStr} - ${endStr}`;
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'trending-flat';
    }
  };

  const getTrendColor = (direction: string, significance: string) => {
    if (significance === 'low') return '#95a5a6';
    
    switch (direction) {
      case 'up':
        return '#27ae60';
      case 'down':
        return '#e74c3c';
      default:
        return '#3498db';
    }
  };

  const renderNutritionSummary = () => (
    <>
      <HealthStatsChart 
        nutritionSummary={report.nutritionSummary}
        trends={report.trends}
        showTrends={false}
      />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>詳細營養資訊</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {Math.round(report.nutritionSummary.totalCalories)}
            </Text>
            <Text style={styles.summaryLabel}>總熱量</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {Math.round(report.nutritionSummary.avgDailyCalories)}
            </Text>
            <Text style={styles.summaryLabel}>平均每日熱量</Text>
          </View>
        </View>

        <View style={styles.macroSection}>
          <Text style={styles.macroTitle}>營養素詳情</Text>
          
          <View style={styles.macroItem}>
            <View style={styles.macroInfo}>
              <View style={[styles.macroColor, { backgroundColor: '#e74c3c' }]} />
              <Text style={styles.macroName}>蛋白質</Text>
            </View>
            <Text style={styles.macroValue}>
              {Math.round(report.nutritionSummary.macronutrients.protein)}g
            </Text>
          </View>
          
          <View style={styles.macroItem}>
            <View style={styles.macroInfo}>
              <View style={[styles.macroColor, { backgroundColor: '#f39c12' }]} />
              <Text style={styles.macroName}>碳水化合物</Text>
            </View>
            <Text style={styles.macroValue}>
              {Math.round(report.nutritionSummary.macronutrients.carbohydrates)}g
            </Text>
          </View>
          
          <View style={styles.macroItem}>
            <View style={styles.macroInfo}>
              <View style={[styles.macroColor, { backgroundColor: '#9b59b6' }]} />
              <Text style={styles.macroName}>脂肪</Text>
            </View>
            <Text style={styles.macroValue}>
              {Math.round(report.nutritionSummary.macronutrients.fat)}g
            </Text>
          </View>
          
          <View style={styles.macroItem}>
            <View style={styles.macroInfo}>
              <View style={[styles.macroColor, { backgroundColor: '#27ae60' }]} />
              <Text style={styles.macroName}>纖維</Text>
            </View>
            <Text style={styles.macroValue}>
              {Math.round(report.nutritionSummary.macronutrients.fiber)}g
            </Text>
          </View>
        </View>
      </View>
    </>
  );

  const renderTrends = () => (
    <>
      <HealthStatsChart 
        nutritionSummary={report.nutritionSummary}
        trends={report.trends}
        showTrends={true}
      />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>趨勢詳細分析</Text>
        
        {report.trends.length === 0 ? (
          <Text style={styles.emptyText}>本週沒有顯著的健康趨勢變化</Text>
        ) : (
          report.trends.map((trend, index) => (
            <View key={index} style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Icon
                  name={getTrendIcon(trend.direction)}
                  size={20}
                  color={getTrendColor(trend.direction, trend.significance)}
                />
                <Text style={styles.trendMetric}>{trend.metric}</Text>
                <View style={[
                  styles.significanceBadge,
                  { backgroundColor: getTrendColor(trend.direction, trend.significance) },
                ]}>
                  <Text style={styles.significanceText}>
                    {trend.significance === 'high' && '高'}
                    {trend.significance === 'medium' && '中'}
                    {trend.significance === 'low' && '低'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.trendDescription}>{trend.description}</Text>
              
              <View style={styles.trendChange}>
                <Text style={[
                  styles.trendChangeText,
                  { color: getTrendColor(trend.direction, trend.significance) },
                ]}>
                  {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </>
  );

  const renderRecommendations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>個人化建議</Text>
      
      {report.recommendations.length === 0 ? (
        <Text style={styles.emptyText}>目前沒有特別的建議，繼續保持良好習慣！</Text>
      ) : (
        report.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationItem}>
            <View style={styles.recommendationIcon}>
              <Icon name="lightbulb-outline" size={16} color="#f39c12" />
            </View>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))
      )}
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>本週成就</Text>
      
      {report.achievements.length === 0 ? (
        <Text style={styles.emptyText}>本週沒有獲得新成就</Text>
      ) : (
        <View style={styles.achievementGrid}>
          {report.achievements.map((achievement) => (
            <TouchableOpacity 
              key={achievement.id} 
              style={styles.achievementItem}
              onPress={() => {
                Alert.alert(
                  achievement.name,
                  achievement.description,
                  [{ text: '確定', style: 'default' }]
                );
              }}
            >
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <View style={styles.achievementPoints}>
                <Icon name="stars" size={12} color="#f1c40f" />
                <Text style={styles.achievementPointsText}>{achievement.points}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const handleShareReport = async () => {
    try {
      const shareContent = `我的健康週報 (${formatDateRange(report.period.start, report.period.end)})

📊 營養摘要:
• 總熱量: ${Math.round(report.nutritionSummary.totalCalories)} 卡
• 平均每日熱量: ${Math.round(report.nutritionSummary.avgDailyCalories)} 卡

🏆 本週成就: ${report.achievements.length} 個
💡 個人化建議: ${report.recommendations.length} 項

透過健康營養追蹤系統生成`;

      await Share.share({
        message: shareContent,
        title: '健康週報分享',
      });
    } catch (error) {
      console.error('分享失敗:', error);
    }
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tabButton, selectedTab === 'summary' && styles.activeTab]}
        onPress={() => setSelectedTab('summary')}
      >
        <Icon
          name="assessment"
          size={16}
          color={selectedTab === 'summary' ? '#3498db' : '#95a5a6'}
        />
        <Text style={[
          styles.tabText,
          selectedTab === 'summary' && styles.activeTabText,
        ]}>
          摘要
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, selectedTab === 'trends' && styles.activeTab]}
        onPress={() => setSelectedTab('trends')}
      >
        <Icon
          name="trending-up"
          size={16}
          color={selectedTab === 'trends' ? '#3498db' : '#95a5a6'}
        />
        <Text style={[
          styles.tabText,
          selectedTab === 'trends' && styles.activeTabText,
        ]}>
          趨勢
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, selectedTab === 'recommendations' && styles.activeTab]}
        onPress={() => setSelectedTab('recommendations')}
      >
        <Icon
          name="lightbulb-outline"
          size={16}
          color={selectedTab === 'recommendations' ? '#3498db' : '#95a5a6'}
        />
        <Text style={[
          styles.tabText,
          selectedTab === 'recommendations' && styles.activeTabText,
        ]}>
          建議
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, selectedTab === 'achievements' && styles.activeTab]}
        onPress={() => setSelectedTab('achievements')}
      >
        <Icon
          name="emoji-events"
          size={16}
          color={selectedTab === 'achievements' ? '#3498db' : '#95a5a6'}
        />
        <Text style={[
          styles.tabText,
          selectedTab === 'achievements' && styles.activeTabText,
        ]}>
          成就
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'summary':
        return renderNutritionSummary();
      case 'trends':
        return renderTrends();
      case 'recommendations':
        return renderRecommendations();
      case 'achievements':
        return renderAchievements();
      default:
        return renderNutritionSummary();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#2c3e50" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>週度健康報告</Text>
            <Text style={styles.headerSubtitle}>
              {formatDateRange(report.period.start, report.period.end)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareReport}
          >
            <Icon name="share" size={24} color="#3498db" />
          </TouchableOpacity>
        </View>

        {renderTabBar()}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderTabContent()}
          
          <View style={styles.footer}>
            <Text style={styles.generatedText}>
              報告生成於 {formatDate(report.generatedAt)}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  closeButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  macroSection: {
    marginTop: 16,
  },
  macroTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  macroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  macroInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  macroName: {
    fontSize: 14,
    color: '#2c3e50',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  trendItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 16,
    marginBottom: 16,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendMetric: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
    flex: 1,
  },
  significanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  significanceText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  trendDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 8,
  },
  trendChange: {
    alignItems: 'flex-end',
  },
  trendChangeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: (width - 80) / 3,
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementPointsText: {
    fontSize: 10,
    color: '#f1c40f',
    marginLeft: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  generatedText: {
    fontSize: 12,
    color: '#95a5a6',
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
    fontSize: 12,
    color: '#95a5a6',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: '600',
  },
});

export default ReportDetailModal;