// 從 ../types/shared 遷移過來的共享類型
// 用戶相關類型
export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
  healthGoals: HealthGoal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface HealthGoal {
  id: string;
  type: GoalType;
  target: number;
  current: number;
  deadline: Date;
  status: GoalStatus;
}

// 營養相關類型
export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  nutritionPer100g: NutritionData;
  commonPortions: Portion[];
  tags: string[];
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbohydrates: number;
  carbs?: number; // 別名，與 carbohydrates 相同
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  vitamins?: VitaminData;
  minerals?: MineralData;
}

export interface FoodLog {
  id: string;
  userId: string;
  foodId: string;
  portion: number;
  mealType: MealType;
  timestamp: Date;
  source: LogSource;
  confidence?: number;
}

// API 相關類型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 拍照辨識相關類型
export interface RecognitionResult {
  foods: DetectedFood[];
  confidence: number;
  processingTime: number;
}

export interface DetectedFood {
  id: string;
  name: string;
  confidence: number;
  estimatedPortion: number;
  nutrition: NutritionData;
}

// AI 聊天相關類型
export interface ChatResponse {
  message: string;
  suggestions: string[];
  actionItems: ActionItem[];
  confidence: number;
}

export interface ActionItem {
  id: string;
  type: ActionType;
  description: string;
  priority: Priority;
}

export interface Conversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: ConversationContext;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: MessageMetadata;
  timestamp: Date;
}

export interface ConversationContext {
  recentNutritionData: NutritionContextData[];
  healthGoals: HealthGoal[];
  userPreferences: UserPreferences;
  conversationSummary: string;
  lastInteractionAt: Date;
}

export interface NutritionContextData {
  date: Date;
  totalCalories: number;
  macros: MacronutrientBreakdown;
  meals: FoodLog[];
}

export interface MessageMetadata {
  nutritionAnalysis?: NutritionAnalysis;
  recommendations?: Recommendation[];
  confidence?: number;
  processingTime?: number;
  status?: 'sending' | 'sent' | 'failed';
}

export interface NutritionAnalysis {
  period: DateRange;
  averageCalories: number;
  macroBalance: MacronutrientBreakdown;
  deficiencies: string[];
  excesses: string[];
  trends: HealthTrend[];
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: Priority;
  actionable: boolean;
  relatedGoals: string[];
}

// 遊戲化相關類型
export interface UserProgress {
  level: number;
  experiencePoints: number;
  totalPoints: number;
  streakDays: number;
  lastActivityDate?: Date;
  achievements: Achievement[];
  badges: Badge[];
  currentTasks: Task[];
  completedTasks: number;
  activeTasks: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  type: AchievementType;
  points: number;
  rarity: AchievementRarity;
  unlockedAt?: Date;
  progress?: Record<string, any>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  earnedAt?: Date;
  isDisplayed: boolean;
}

export interface Task {
  id: string;
  templateId?: string;
  title: string;
  description: string;
  type: TaskType;
  category: string;
  points: number;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  progress: number;
  target: number;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  requirements?: Record<string, any>;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  category: string;
  points: number;
  difficulty: TaskDifficulty;
  requirements: Record<string, any>;
  isActive: boolean;
}

export interface PointsRecord {
  id: string;
  userId: string;
  points: number;
  source: PointsSource;
  sourceId?: string;
  description?: string;
  earnedAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  rank: number;
  avatar?: string;
}

export interface Leaderboard {
  type: LeaderboardType;
  period: DateRange;
  entries: LeaderboardEntry[];
  userRank?: number;
  totalParticipants: number;
}

// 報告相關類型
export interface HealthReport {
  id: string;
  userId: string;
  period: DateRange;
  nutritionSummary: NutritionSummary;
  trends: HealthTrend[];
  recommendations: string[];
  achievements: Achievement[];
  generatedAt: Date;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface NutritionSummary {
  totalCalories: number;
  avgDailyCalories: number;
  macronutrients: MacronutrientBreakdown;
  micronutrients: MicronutrientSummary;
}

// 枚舉類型
export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  EXTREMELY_ACTIVE = 'extremely_active'
}

export enum GoalType {
  WEIGHT_LOSS = 'weight_loss',
  WEIGHT_GAIN = 'weight_gain',
  MUSCLE_GAIN = 'muscle_gain',
  MAINTENANCE = 'maintenance',
  HEALTH_IMPROVEMENT = 'health_improvement'
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export enum FoodCategory {
  FRUITS = 'fruits',
  VEGETABLES = 'vegetables',
  GRAINS = 'grains',
  PROTEINS = 'proteins',
  DAIRY = 'dairy',
  FATS = 'fats',
  BEVERAGES = 'beverages',
  SNACKS = 'snacks'
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack'
}

export enum LogSource {
  PHOTO_RECOGNITION = 'photo_recognition',
  MANUAL_INPUT = 'manual_input',
  THIRD_PARTY_SYNC = 'third_party_sync'
}

export enum ActionType {
  NUTRITION_ADJUSTMENT = 'nutrition_adjustment',
  EXERCISE_RECOMMENDATION = 'exercise_recommendation',
  HABIT_FORMATION = 'habit_formation',
  HEALTH_CHECK = 'health_check'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  MILESTONE = 'milestone'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired'
}

export enum TaskDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

export enum AchievementType {
  MILESTONE = 'milestone',
  STREAK = 'streak',
  COLLECTION = 'collection',
  SPECIAL = 'special'
}

export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum PointsSource {
  TASK_COMPLETION = 'task_completion',
  DAILY_LOGIN = 'daily_login',
  ACHIEVEMENT = 'achievement',
  BONUS = 'bonus',
  STREAK_BONUS = 'streak_bonus',
  MILESTONE = 'milestone'
}

export enum LeaderboardType {
  WEEKLY_POINTS = 'weekly_points',
  MONTHLY_POINTS = 'monthly_points',
  TOTAL_POINTS = 'total_points',
  STREAK_DAYS = 'streak_days',
  COMPLETED_TASKS = 'completed_tasks',
  ACHIEVEMENTS = 'achievements'
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export enum RecommendationType {
  NUTRITION_ADJUSTMENT = 'nutrition_adjustment',
  MEAL_PLANNING = 'meal_planning',
  EXERCISE = 'exercise',
  HABIT_FORMATION = 'habit_formation',
  HEALTH_CHECK = 'health_check',
  GOAL_ADJUSTMENT = 'goal_adjustment'
}

// 輔助類型
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  weeklyReport: boolean;
  achievements: boolean;
}

export interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  thirdPartyIntegration: boolean;
}

export interface Portion {
  name: string;
  weight: number; // grams
  description: string;
}

export interface VitaminData {
  vitaminA: number;
  vitaminC: number;
  vitaminD: number;
  vitaminE: number;
  vitaminK: number;
  thiamine: number;
  riboflavin: number;
  niacin: number;
  vitaminB6: number;
  folate: number;
  vitaminB12: number;
}

export interface MineralData {
  calcium: number;
  iron: number;
  magnesium: number;
  phosphorus: number;
  potassium: number;
  sodium: number;
  zinc: number;
  copper: number;
  manganese: number;
  selenium: number;
}

export interface MacronutrientBreakdown {
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
}

export interface MicronutrientSummary {
  vitamins: Partial<VitaminData>;
  minerals: Partial<MineralData>;
}

export interface HealthTrend {
  metric: string;
  change: number;
  direction: 'up' | 'down' | 'stable';
  significance: 'low' | 'medium' | 'high';
  period: DateRange;
  description: string;
}

// 報告生成相關類型
export interface ReportSettings {
  frequency: ReportFrequency;
  includeCharts: boolean;
  includeTrends: boolean;
  includeRecommendations: boolean;
  deliveryMethod: DeliveryMethod[];
  customSections: string[];
}

export interface DataAggregationOptions {
  userId: string;
  period: DateRange;
  groupBy: GroupByPeriod;
  includeComparisons: boolean;
  includeTrends: boolean;
}

export interface AggregatedNutritionData {
  period: DateRange;
  totalCalories: number;
  avgDailyCalories: number;
  macronutrients: MacronutrientBreakdown;
  micronutrients: MicronutrientSummary;
  mealDistribution: MealDistribution;
  dailyBreakdown: DailyNutritionData[];
  weeklyAverages: WeeklyNutritionData[];
}

export interface DailyNutritionData {
  date: Date;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  mealCounts: Record<MealType, number>;
}

export interface WeeklyNutritionData {
  weekStart: Date;
  weekEnd: Date;
  avgCalories: number;
  avgProtein: number;
  avgCarbohydrates: number;
  avgFat: number;
  avgFiber: number;
  consistency: number; // 0-1, 一致性評分
}

export interface MealDistribution {
  breakfast: number;
  lunch: number;
  dinner: number;
  snack: number;
}

export interface TrendAnalysisResult {
  trends: HealthTrend[];
  insights: TrendInsight[];
  predictions: TrendPrediction[];
  recommendations: TrendRecommendation[];
}

export interface TrendInsight {
  type: InsightType;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number;
  relatedMetrics: string[];
}

export interface TrendPrediction {
  metric: string;
  predictedValue: number;
  confidence: number;
  timeframe: number; // days
  factors: string[];
}

export interface TrendRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: Priority;
  expectedImpact: string;
  relatedTrends: string[];
}

export enum ReportFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

export enum DeliveryMethod {
  EMAIL = 'email',
  IN_APP = 'in_app',
  PUSH_NOTIFICATION = 'push_notification',
  THIRD_PARTY = 'third_party'
}

export enum GroupByPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}

export enum InsightType {
  PATTERN_DETECTION = 'pattern_detection',
  ANOMALY_DETECTION = 'anomaly_detection',
  GOAL_PROGRESS = 'goal_progress',
  HABIT_FORMATION = 'habit_formation',
  NUTRITIONAL_BALANCE = 'nutritional_balance'
}

// 第三方平台整合相關類型
export interface IntegrationConnection {
  id: string;
  userId: string;
  platform: Platform;
  status: ConnectionStatus;
  credentials: EncryptedCredentials;
  settings: IntegrationSettings;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationSettings {
  syncEnabled: boolean;
  syncFrequency: SyncFrequency;
  dataTypes: DataType[];
  notificationsEnabled: boolean;
  autoSync: boolean;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errors: SyncError[];
  startTime: Date;
  endTime: Date;
}

export interface SyncError {
  type: string;
  message: string;
  recordId?: string;
  retryable: boolean;
}

export interface NotionPageData {
  id: string;
  title: string;
  properties: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LineMessage {
  type: 'text' | 'image' | 'template';
  content: string | LineTemplateContent;
  userId?: string;
}

export interface LineTemplateContent {
  type: 'buttons' | 'carousel' | 'confirm';
  text: string;
  actions: LineAction[];
}

export interface LineAction {
  type: 'message' | 'uri' | 'postback';
  label: string;
  data?: string;
  uri?: string;
}

export interface HealthKitData {
  type: HealthKitDataType;
  value: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  metadata?: Record<string, any>;
}

export enum Platform {
  NOTION = 'notion',
  LINE = 'line',
  APPLE_HEALTH = 'apple_health'
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  PENDING = 'pending'
}

export enum SyncFrequency {
  REAL_TIME = 'real_time',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly'
}

export enum DataType {
  FOOD_LOGS = 'food_logs',
  NUTRITION_DATA = 'nutrition_data',
  HEALTH_REPORTS = 'health_reports',
  ACHIEVEMENTS = 'achievements',
  HEALTH_METRICS = 'health_metrics'
}

export enum HealthKitDataType {
  WEIGHT = 'weight',
  HEIGHT = 'height',
  BODY_FAT_PERCENTAGE = 'body_fat_percentage',
  ACTIVE_ENERGY = 'active_energy',
  DIETARY_ENERGY = 'dietary_energy',
  STEPS = 'steps',
  HEART_RATE = 'heart_rate'
}

export interface EncryptedCredentials {
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  secret?: string;
  expiresAt?: Date;
}
