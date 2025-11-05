import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { NutritionSummary, HealthTrend } from '@health-tracker/shared-types';

interface HealthStatsChartProps {
  nutritionSummary: NutritionSummary;
  trends?: HealthTrend[];
  showTrends?: boolean;
}

const { width } = Dimensions.get('window');
const chartWidth = width - 80;

const HealthStatsChart: React.FC<HealthStatsChartProps> = ({
  nutritionSummary,
  trends = [],
  showTrends = false,
}) => {
  const { macronutrients } = nutritionSummary;
  const total = macronutrients.protein + macronutrients.carbohydrates + macronutrients.fat;

  const proteinPercentage = (macronutrients.protein / total) * 100;
  const carbsPercentage = (macronutrients.carbohydrates / total) * 100;
  const fatPercentage = (macronutrients.fat / total) * 100;

  const renderMacroBar = () => (
    <View style={styles.macroBarContainer}>
      <Text style={styles.chartTitle}>營養素分布</Text>
      <View style={styles.macroBar}>
        <View
          style={[
            styles.macroSegment,
            styles.proteinSegment,
            { width: `${proteinPercentage}%` },
          ]}
        />
        <View
          style={[
            styles.macroSegment,
            styles.carbsSegment,
            { width: `${carbsPercentage}%` },
          ]}
        />
        <View
          style={[
            styles.macroSegment,
            styles.fatSegment,
            { width: `${fatPercentage}%` },
          ]}
        />
      </View>
      <View style={styles.macroLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.proteinColor]} />
          <Text style={styles.legendText}>
            蛋白質 {Math.round(macronutrients.protein)}g ({Math.round(proteinPercentage)}%)
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.carbsColor]} />
          <Text style={styles.legendText}>
            碳水化合物 {Math.round(macronutrients.carbohydrates)}g ({Math.round(carbsPercentage)}%)
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.fatColor]} />
          <Text style={styles.legendText}>
            脂肪 {Math.round(macronutrients.fat)}g ({Math.round(fatPercentage)}%)
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCalorieChart = () => {
    const dailyGoal = 2000; // 假設的每日目標熱量
    const percentage = Math.min((nutritionSummary.avgDailyCalories / dailyGoal) * 100, 100);
    
    return (
      <View style={styles.calorieChartContainer}>
        <Text style={styles.chartTitle}>平均每日熱量</Text>
        <View style={styles.calorieCircle}>
          <View style={styles.calorieInnerCircle}>
            <Text style={styles.calorieValue}>
              {Math.round(nutritionSummary.avgDailyCalories)}
            </Text>
            <Text style={styles.calorieUnit}>卡路里</Text>
          </View>
        </View>
        <View style={styles.calorieProgress}>
          <View style={styles.calorieProgressBackground}>
            <View
              style={[
                styles.calorieProgressFill,
                { width: `${percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.calorieProgressText}>
            目標: {dailyGoal} 卡路里 ({Math.round(percentage)}%)
          </Text>
        </View>
      </View>
    );
  };

  const renderTrendChart = () => {
    if (!showTrends || trends.length === 0) return null;

    return (
      <View style={styles.trendChartContainer}>
        <Text style={styles.chartTitle}>健康趨勢</Text>
        <View style={styles.trendList}>
          {trends.slice(0, 3).map((trend, index) => (
            <View key={index} style={styles.trendItem}>
              <View style={styles.trendIndicator}>
                <View
                  style={[
                    styles.trendDot,
                    {
                      backgroundColor:
                        trend.direction === 'up'
                          ? '#27ae60'
                          : trend.direction === 'down'
                          ? '#e74c3c'
                          : '#3498db',
                    },
                  ]}
                />
                <Text style={styles.trendMetric}>{trend.metric}</Text>
              </View>
              <Text
                style={[
                  styles.trendChange,
                  {
                    color:
                      trend.direction === 'up'
                        ? '#27ae60'
                        : trend.direction === 'down'
                        ? '#e74c3c'
                        : '#3498db',
                  },
                ]}
              >
                {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderCalorieChart()}
      {renderMacroBar()}
      {renderTrendChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  macroBarContainer: {
    marginBottom: 24,
  },
  macroBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
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
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
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
    fontSize: 12,
    color: '#7f8c8d',
  },
  calorieChartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  calorieCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  calorieInnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  calorieUnit: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  calorieProgress: {
    width: '100%',
    alignItems: 'center',
  },
  calorieProgressBackground: {
    width: '80%',
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  calorieProgressFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  calorieProgressText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  trendChartContainer: {
    marginTop: 8,
  },
  trendList: {
    gap: 12,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  trendMetric: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  trendChange: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HealthStatsChart;