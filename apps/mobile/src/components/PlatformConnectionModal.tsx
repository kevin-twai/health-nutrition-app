import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Platform, SyncFrequency, DataType } from '@health-tracker/shared-types';

interface PlatformConnectionModalProps {
  visible: boolean;
  platform: Platform;
  platformName: string;
  onClose: () => void;
  onConnect: (credentials: any, settings: any) => void;
  isLoading?: boolean;
}

const SYNC_FREQUENCY_OPTIONS = [
  { value: SyncFrequency.REAL_TIME, label: '即時同步' },
  { value: SyncFrequency.HOURLY, label: '每小時' },
  { value: SyncFrequency.DAILY, label: '每日' },
  { value: SyncFrequency.WEEKLY, label: '每週' },
];

const DATA_TYPE_OPTIONS = [
  { value: DataType.FOOD_LOGS, label: '飲食記錄' },
  { value: DataType.NUTRITION_DATA, label: '營養資料' },
  { value: DataType.HEALTH_REPORTS, label: '健康報告' },
  { value: DataType.ACHIEVEMENTS, label: '成就記錄' },
  { value: DataType.HEALTH_METRICS, label: '健康指標' },
];

const PlatformConnectionModal: React.FC<PlatformConnectionModalProps> = ({
  visible,
  platform,
  platformName,
  onClose,
  onConnect,
  isLoading = false,
}) => {
  const [credentials, setCredentials] = useState<any>({});
  const [settings, setSettings] = useState({
    syncEnabled: true,
    syncFrequency: SyncFrequency.DAILY,
    dataTypes: [DataType.FOOD_LOGS, DataType.NUTRITION_DATA],
    notificationsEnabled: true,
    autoSync: true,
  });

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleDataTypeToggle = (dataType: DataType) => {
    setSettings((prev: any) => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(dataType)
        ? prev.dataTypes.filter((type: DataType) => type !== dataType)
        : [...prev.dataTypes, dataType]
    }));
  };

  const handleConnect = () => {
    // 驗證必要欄位
    if (platform === Platform.NOTION && !credentials.apiKey) {
      Alert.alert('錯誤', '請輸入 Notion API Key');
      return;
    }

    if (platform === Platform.LINE && !credentials.channelAccessToken) {
      Alert.alert('錯誤', '請輸入 LINE Channel Access Token');
      return;
    }

    if (settings.dataTypes.length === 0) {
      Alert.alert('錯誤', '請至少選擇一種資料類型進行同步');
      return;
    }

    onConnect(credentials, settings);
  };

  const renderCredentialFields = () => {
    switch (platform) {
      case Platform.NOTION:
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notion 設定</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>API Key *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="請輸入 Notion API Key"
                value={credentials.apiKey || ''}
                onChangeText={(value) => handleCredentialChange('apiKey', value)}
                secureTextEntry
              />
              <Text style={styles.inputHint}>
                在 Notion 開發者頁面建立整合並複製 API Key
              </Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>資料庫 ID</Text>
              <TextInput
                style={styles.textInput}
                placeholder="請輸入資料庫 ID (選填)"
                value={credentials.databaseId || ''}
                onChangeText={(value) => handleCredentialChange('databaseId', value)}
              />
              <Text style={styles.inputHint}>
                留空將自動建立新的健康追蹤資料庫
              </Text>
            </View>
          </View>
        );

      case Platform.LINE:
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LINE 設定</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Channel Access Token *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="請輸入 Channel Access Token"
                value={credentials.channelAccessToken || ''}
                onChangeText={(value) => handleCredentialChange('channelAccessToken', value)}
                secureTextEntry
              />
              <Text style={styles.inputHint}>
                在 LINE Developers Console 取得 Channel Access Token
              </Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Webhook URL</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Webhook URL (選填)"
                value={credentials.webhookUrl || ''}
                onChangeText={(value) => handleCredentialChange('webhookUrl', value)}
              />
            </View>
          </View>
        );

      case Platform.APPLE_HEALTH:
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Apple Health 設定</Text>
            <Text style={styles.infoText}>
              Apple Health 整合需要在 iOS 設定中授權健康資料存取權限。
              連接後，應用程式將自動同步相關的健康指標。
            </Text>
          </View>
        );

      default:
        return null;
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.title}>連接 {platformName}</Text>
          <TouchableOpacity
            onPress={handleConnect}
            style={[styles.connectButton, isLoading && styles.disabledButton]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.connectButtonText}>連接</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {renderCredentialFields()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>同步設定</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>啟用同步</Text>
              <Switch
                value={settings.syncEnabled}
                onValueChange={(value) => handleSettingChange('syncEnabled', value)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={settings.syncEnabled ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>自動同步</Text>
              <Switch
                value={settings.autoSync}
                onValueChange={(value) => handleSettingChange('autoSync', value)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={settings.autoSync ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>同步通知</Text>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => handleSettingChange('notificationsEnabled', value)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={settings.notificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>同步頻率</Text>
              <View style={styles.optionGroup}>
                {SYNC_FREQUENCY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      settings.syncFrequency === option.value && styles.selectedOption
                    ]}
                    onPress={() => handleSettingChange('syncFrequency', option.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      settings.syncFrequency === option.value && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>資料類型</Text>
            <Text style={styles.sectionSubtitle}>選擇要同步的資料類型</Text>
            
            {DATA_TYPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.checkboxRow}
                onPress={() => handleDataTypeToggle(option.value)}
              >
                <View style={[
                  styles.checkbox,
                  settings.dataTypes.includes(option.value) && styles.checkedCheckbox
                ]}>
                  {settings.dataTypes.includes(option.value) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>隱私說明</Text>
            <Text style={styles.infoText}>
              • 所有資料傳輸都經過 SSL/TLS 加密{'\n'}
              • 我們不會儲存您的平台認證資訊{'\n'}
              • 您可以隨時停用或刪除連接{'\n'}
              • 資料同步遵循各平台的隱私政策
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
  connectButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputHint: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    lineHeight: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  optionText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  selectedOptionText: {
    color: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ced4da',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});

export default PlatformConnectionModal;