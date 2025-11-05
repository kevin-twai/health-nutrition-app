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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../store';
import {
  fetchReports,
  generateWeeklyReport,
  setCurrentReport,
  clearError,
  shareReport,
} from '../store/slices/reportsSlice';
import { HealthReport } from '@health-tracker/shared-types';
import ReportDetailModal from '../components/ReportDetailModal';

const { width } = Dimensions.get('window');

const ReportsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reports, currentReport, isLoading, isGenerating, error } = useSelector(
    (state: RootState) => state.reports as any
  );
  const [refreshing, setRefreshing] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchReports() as any);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('錯誤', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchReports() as any);
    setRefreshing(false);
  };

  const handleGenerateReport = () => {
    Alert.alert(
      '生成週報',
      '確定要生成本週的健康報告嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: () => dispatch(generateWeeklyReport() as any),
        },
      ]
    );
  };

  const handleReportPress = (report: HealthReport) => {
    dispatch(setCurrentReport(report));
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
  };

  const handleShareReport = (reportId: string) => {
    Alert.alert(
      '分享報告',
      '選擇分享方式',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '電子郵件',
          onPress: () => dispatch(shareReport({ reportId, method: 'email' }) as any),
        },
        {
          text: '第三方平台',
          onPress: () => dispatch(shareReport({ reportId, method: 'third_party' }) as any),
        },
      ]
    );
  };

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

  const getReportScore = (report: HealthReport) => {
    // 計算報告評分 (0-100)
    let score = 70; // 基礎分數
    
    // 根據成就數量加分
    score += Math.min(report.achievements.length * 5, 20);
    
    // 根據趨勢改善加分
    const improvingTrends = report.trends.filter(t => 
      t.direction === 'up' && t.significance !== 'low'
    ).length;
    score += Math.min(improvingTrends * 3, 10);
    
    return Math.min(score, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#27ae60';
    if (score >= 75) return '#f39c12';
    if (score >= 60) return '#e67e22';
    return '#e74c3c';
  };

  const renderReportCard = (report: HealthReport) => {
    const score = getReportScore(report);
    
    return (
      <TouchableOpacity
        key={report.id}
        style={styles.reportCard}
        onPress={() => handleReportPress(report)}
      >
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleSection}>
          <Text style={styles.reportTitle}>週度健康報告</Text>
          <Text style={styles.reportDate}>
            {formatDateRange(report.period.start, report.period.end)}
          </Text>
        </View>
        <View style={styles.scoreSection}>
          <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(score) }]}>
            <Text style={styles.scoreText}>{score}</Text>
          </View>
          <Text style={styles.scoreLabel}>健康分數</Text>
        </View>
      </View>
      
      <View style={styles.reportStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round(report.nutritionSummary.avgDailyCalories)}
          </Text>
          <Text style={styles.statLabel}>平均每日熱量</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {report.achievements.length}
          </Text>
          <Text style={styles.statLabel}>新成就</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {report.trends.length}
          </Text>
          <Text style={styles.statLabel}>健康趨勢</Text>
        </View>
      </View>

      <View style={styles.macroBreakdown}>
        <Text style={styles.macroTitle}>營養素分布</Text>
        <View style={styles.macroBar}>
          <View
            style={[
              styles.macroSegment,
              styles.proteinSegment,
              {
                width: `${
                  (report.nutritionSummary.macronutrients.protein / 
                   (report.nutritionSummary.macronutrients.protein + 
                    report.nutritionSummary.macronutrients.carbohydrates + 
                    report.nutritionSummary.macronutrients.fat)) * 100
                }%`,
              },
            ]}
          />
          <View
            style={[
              styles.macroSegment,
              styles.carbsSegment,
              {
                width: `${
                  (report.nutritionSummary.macronutrients.carbohydrates / 
                   (report.nutritionSummary.macronutrients.protein + 
                    report.nutritionSummary.macronutrients.carbohydrates + 
                    report.nutritionSummary.macronutrients.fat)) * 100
                }%`,
              },
            ]}
          />
          <View
            style={[
              styles.macroSegment,
              styles.fatSegment,
              {
                width: `${
                  (report.nutritionSummary.macronutrients.fat / 
                   (report.nutritionSummary.macronutrients.protein + 
                    report.nutritionSummary.macronutrients.carbohydrates + 
                    report.nutritionSummary.macronutrients.fat)) * 100
                }%`,
              },
            ]}
          />
        </View>
        <View style={styles.macroLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.proteinColor]} />
            <Text style={styles.legendText}>蛋白質</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.carbsColor]} />
            <Text style={styles.legendText}>碳水化合物</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.fatColor]} />
            <Text style={styles.legendText}>脂肪</Text>
          </View>
        </View>
      </View>

      <View style={styles.reportFooter}>
        <Text style={styles.generatedDate}>
          生成於 {formatDate(report.generatedAt)}
        </Text>
        <TouchableOpacity
          style={styles.quickShareButton}
          onPress={() => handleShareReport(report.id)}
        >
          <Icon name="share" size={16} color="#3498db" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>健康報告</Text>
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.disabledButton]}
          onPress={handleGenerateReport}
          disabled={isGenerating}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? '生成中...' : '生成週報'}
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
        {reports.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>還沒有健康報告</Text>
            <Text style={styles.emptySubtitle}>
              點擊上方的「生成週報」按鈕來創建您的第一份健康報告
            </Text>
          </View>
        ) : (
          reports.map(renderReportCard)
        )}
      </ScrollView>

      <ReportDetailModal
        visible={detailModalVisible}
        report={currentReport}
        onClose={handleCloseDetailModal}
        onShare={handleShareReport}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  generateButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reportTitleSection: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  scoreSection: {
    alignItems: 'center',
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
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
    textAlign: 'center',
  },
  macroBreakdown: {
    marginBottom: 16,
  },
  macroTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  macroBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  macroSegment: {
    height: '100%',
  },
  proteinSegment: {
    backgroundColor: '#e74c3c',
  },
  carbsSegment: {
    backgroundColor: '#f39c12',
  },
  fatSegment: {
    backgroundColor: '#9b59b6',
  },
  macroLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  proteinColor: {
    backgroundColor: '#e74c3c',
  },
  carbsColor: {
    backgroundColor: '#f39c12',
  },
  fatColor: {
    backgroundColor: '#9b59b6',
  },
  legendText: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  generatedDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  quickShareButton: {
    padding: 4,
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});

export default ReportsScreen;