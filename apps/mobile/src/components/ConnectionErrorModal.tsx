import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Platform } from '@health-tracker/shared-types';

interface ConnectionError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

interface ConnectionErrorModalProps {
  visible: boolean;
  platform: Platform;
  platformName: string;
  error: ConnectionError;
  onClose: () => void;
  onRetry: () => void;
  onSupport: () => void;
}

const ERROR_SOLUTIONS: Record<string, Record<string, string>> = {
  [Platform.NOTION]: {
    'INVALID_API_KEY': '請檢查 API Key 是否正確，並確保已授予適當的權限',
    'DATABASE_NOT_FOUND': '指定的資料庫不存在或無權限存取，請檢查資料庫 ID',
    'RATE_LIMIT_EXCEEDED': 'API 請求頻率過高，請稍後再試',
    'NETWORK_ERROR': '網路連接問題，請檢查網路設定',
    'PERMISSION_DENIED': '權限不足，請檢查 API Key 的權限設定',
  },
  [Platform.LINE]: {
    'INVALID_TOKEN': '請檢查 Channel Access Token 是否正確',
    'WEBHOOK_ERROR': 'Webhook URL 設定錯誤或無法存取',
    'CHANNEL_NOT_FOUND': '找不到指定的 LINE 頻道',
    'RATE_LIMIT_EXCEEDED': 'API 請求頻率過高，請稍後再試',
    'NETWORK_ERROR': '網路連接問題，請檢查網路設定',
  },
  [Platform.APPLE_HEALTH]: {
    'PERMISSION_DENIED': '請在 iOS 設定中授權健康資料存取權限',
    'HEALTH_KIT_UNAVAILABLE': '此裝置不支援 HealthKit 功能',
    'DATA_TYPE_NOT_AVAILABLE': '請求的健康資料類型不可用',
    'NETWORK_ERROR': '網路連接問題，請檢查網路設定',
  },
};

const TROUBLESHOOTING_STEPS: Record<Platform, string[]> = {
  [Platform.NOTION]: [
    '確認 API Key 是否正確複製',
    '檢查 Notion 整合是否已啟用',
    '驗證資料庫權限設定',
    '確認網路連接正常',
  ],
  [Platform.LINE]: [
    '確認 Channel Access Token 是否正確',
    '檢查 LINE 開發者帳號設定',
    '驗證 Webhook URL 設定',
    '確認網路連接正常',
  ],
  [Platform.APPLE_HEALTH]: [
    '開啟 iOS 設定 > 隱私權與安全性 > 健康',
    '找到本應用程式並授權所需權限',
    '確認裝置支援 HealthKit',
    '重新啟動應用程式',
  ],
};

const ConnectionErrorModal: React.FC<ConnectionErrorModalProps> = ({
  visible,
  platform,
  platformName,
  error,
  onClose,
  onRetry,
  onSupport,
}) => {
  const getSolution = () => {
    return ERROR_SOLUTIONS[platform]?.[error.code] || '發生未知錯誤，請聯繫技術支援';
  };

  const getTroubleshootingSteps = () => {
    return TROUBLESHOOTING_STEPS[platform] || [];
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>關閉</Text>
          </TouchableOpacity>
          <Text style={styles.title}>連接錯誤</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.errorSection}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>⚠️</Text>
            </View>
            <Text style={styles.errorTitle}>
              無法連接到 {platformName}
            </Text>
            <Text style={styles.errorMessage}>
              {error.message}
            </Text>
            {error.code && (
              <Text style={styles.errorCode}>
                錯誤代碼: {error.code}
              </Text>
            )}
          </View>

          <View style={styles.solutionSection}>
            <Text style={styles.sectionTitle}>建議解決方案</Text>
            <View style={styles.solutionCard}>
              <Text style={styles.solutionText}>
                {getSolution()}
              </Text>
            </View>
          </View>

          <View style={styles.troubleshootingSection}>
            <Text style={styles.sectionTitle}>故障排除步驟</Text>
            {getTroubleshootingSteps().map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {error.details && Object.keys(error.details).length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>詳細資訊</Text>
              <View style={styles.detailsCard}>
                {Object.entries(error.details).map(([key, value]) => (
                  <View key={key} style={styles.detailItem}>
                    <Text style={styles.detailKey}>{key}:</Text>
                    <Text style={styles.detailValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.helpSection}>
            <Text style={styles.sectionTitle}>需要更多協助？</Text>
            <Text style={styles.helpText}>
              如果問題持續存在，請聯繫我們的技術支援團隊。
              我們會盡快協助您解決連接問題。
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerButton, styles.supportButton]}
            onPress={onSupport}
          >
            <Text style={styles.supportButtonText}>聯繫支援</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.retryButton]}
            onPress={onRetry}
          >
            <Text style={styles.retryButtonText}>重新嘗試</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorIconText: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#dc3545',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  errorCode: {
    fontSize: 12,
    color: '#adb5bd',
    fontFamily: 'monospace',
  },
  solutionSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  solutionCard: {
    backgroundColor: '#d1ecf1',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
  },
  solutionText: {
    fontSize: 16,
    color: '#0c5460',
    lineHeight: 22,
  },
  troubleshootingSection: {
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 22,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailKey: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    minWidth: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  helpSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  helpText: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  supportButton: {
    backgroundColor: '#6c757d',
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#007bff',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConnectionErrorModal;