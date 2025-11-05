import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { RootState, useAppSelector } from '../store';
import {
  fetchConnections,
  connectPlatform,
  disconnectPlatform,
  syncPlatform,
  testConnection,
  updateConnectionSettings,
  clearError,
} from '../store/slices/integrationsSlice';
import { Platform, ConnectionStatus, SyncFrequency, DataType } from '@health-tracker/shared-types';
import PlatformConnectionModal from '../components/PlatformConnectionModal';
import SyncHistoryModal from '../components/SyncHistoryModal';

interface PlatformConfig {
  platform: Platform;
  name: string;
  description: string;
  icon: string;
  color: string;
  authType: 'oauth' | 'api_key' | 'manual';
}

const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    platform: Platform.NOTION,
    name: 'Notion',
    description: '同步健康資料到 Notion 資料庫',
    icon: '📝',
    color: '#000000',
    authType: 'oauth',
  },
  {
    platform: Platform.LINE,
    name: 'LINE',
    description: '接收健康提醒和報告分享',
    icon: '💬',
    color: '#00C300',
    authType: 'oauth',
  },
  {
    platform: Platform.APPLE_HEALTH,
    name: 'Apple Health',
    description: '同步健康資料到 Apple 健康 App',
    icon: '🍎',
    color: '#FF3B30',
    authType: 'manual',
  },
];

const IntegrationsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const integrations = useAppSelector((state: RootState) => state.integrations) as any;
  const { connections, isLoading, isSyncing, error } = integrations;
  const [refreshing, setRefreshing] = useState(false);
  const [connectionModalVisible, setConnectionModalVisible] = useState(false);
  const [syncHistoryModalVisible, setSyncHistoryModalVisible] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchConnections() as any);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('錯誤', error, [
        { text: '確定', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchConnections() as any);
    setRefreshing(false);
  };

  const handleConnect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setConnectionModalVisible(true);
  };

  const handleConnectionModalConnect = (credentials: any, settings: any) => {
    if (selectedPlatform) {
      dispatch(connectPlatform({
        platform: selectedPlatform,
        credentials,
        settings
      }) as any);
      setConnectionModalVisible(false);
      setSelectedPlatform(null);
    }
  };

  const handleDisconnect = (connectionId: string, platformName: string) => {
    Alert.alert(
      '斷開連接',
      `確定要斷開與 ${platformName} 的連接嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '斷開',
          style: 'destructive',
          onPress: () => dispatch(disconnectPlatform(connectionId) as any)
        }
      ]
    );
  };

  const handleSync = (connectionId: string) => {
    dispatch(syncPlatform(connectionId) as any);
  };

  const handleTestConnection = (connectionId: string) => {
    dispatch(testConnection(connectionId) as any);
  };

  const handleViewSyncHistory = (connectionId: string, platformName: string) => {
    setSelectedConnection(connectionId);
    setSelectedPlatform(PLATFORM_CONFIGS.find(c => c.name === platformName)?.platform || null);
    setSyncHistoryModalVisible(true);
  };

  const handleToggleSetting = (connectionId: string, setting: string, value: boolean) => {
    const connection = connections.find((c: any) => c.id === connectionId);
    if (connection) {
      const updatedSettings = {
        ...connection.settings,
        [setting]: value
      };
      dispatch(updateConnectionSettings({ connectionId, settings: updatedSettings }) as any);
    }
  };

  const getConnectionForPlatform = (platform: Platform) => {
    return connections.find((c: any) => c.platform === platform);
  };

  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return '#28a745';
      case ConnectionStatus.ERROR:
        return '#dc3545';
      case ConnectionStatus.PENDING:
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return '已連接';
      case ConnectionStatus.ERROR:
        return '連接錯誤';
      case ConnectionStatus.PENDING:
        return '連接中';
      default:
        return '未連接';
    }
  };

  const renderPlatformCard = (config: PlatformConfig) => {
    const connection = getConnectionForPlatform(config.platform);
    const isConnected = connection?.status === ConnectionStatus.CONNECTED;

    return (
      <View key={config.platform} style={styles.platformCard}>
        <View style={styles.platformHeader}>
          <View style={styles.platformInfo}>
            <Text style={styles.platformIcon}>{config.icon}</Text>
            <View style={styles.platformDetails}>
              <Text style={styles.platformName}>{config.name}</Text>
              <Text style={styles.platformDescription}>{config.description}</Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(connection?.status || ConnectionStatus.DISCONNECTED) }]} />
            <Text style={styles.statusText}>
              {getStatusText(connection?.status || ConnectionStatus.DISCONNECTED)}
            </Text>
          </View>
        </View>

        {isConnected && connection ? (
          <View style={styles.connectionSettings}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>自動同步</Text>
              <Switch
                value={connection.settings.autoSync}
                onValueChange={(value) => handleToggleSetting(connection.id, 'autoSync', value)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={connection.settings.autoSync ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>通知</Text>
              <Switch
                value={connection.settings.notificationsEnabled}
                onValueChange={(value) => handleToggleSetting(connection.id, 'notificationsEnabled', value)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={connection.settings.notificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.syncButton]}
                onPress={() => handleSync(connection.id)}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>立即同步</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.testButton]}
                onPress={() => handleTestConnection(connection.id)}
              >
                <Text style={styles.actionButtonText}>測試連接</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.historyButton]}
                onPress={() => handleViewSyncHistory(connection.id, config.name)}
              >
                <Text style={styles.actionButtonText}>同步歷史</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.disconnectButton]}
                onPress={() => handleDisconnect(connection.id, config.name)}
              >
                <Text style={styles.actionButtonText}>斷開</Text>
              </TouchableOpacity>
            </View>

            {connection.lastSyncAt && (
              <Text style={styles.lastSyncText}>
                最後同步: {new Date(connection.lastSyncAt).toLocaleString('zh-TW')}
              </Text>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.connectButton, { borderColor: config.color }]}
            onPress={() => handleConnect(config.platform)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={config.color} />
            ) : (
              <Text style={[styles.connectButtonText, { color: config.color }]}>
                連接 {config.name}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>第三方平台整合</Text>
        <Text style={styles.subtitle}>
          連接您常用的應用程式，自動同步健康資料
        </Text>
      </View>

      <View style={styles.platformList}>
        {PLATFORM_CONFIGS.map(renderPlatformCard)}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>關於資料同步</Text>
        <Text style={styles.infoText}>
          • 所有資料傳輸都經過加密保護{'\n'}
          • 您可以隨時停用或刪除連接{'\n'}
          • 同步頻率可以根據需要調整{'\n'}
          • 支援選擇性資料同步
        </Text>
      </View>

      {/* 平台連接設定 Modal */}
      {selectedPlatform && (
        <PlatformConnectionModal
          visible={connectionModalVisible}
          platform={selectedPlatform}
          platformName={PLATFORM_CONFIGS.find((c) => c.platform === selectedPlatform)?.name || ''}
          onClose={() => {
            setConnectionModalVisible(false);
            setSelectedPlatform(null);
          }}
          onConnect={handleConnectionModalConnect}
          isLoading={isLoading}
        />
      )}

      {/* 同步歷史 Modal */}
      {selectedConnection && selectedPlatform && (
        <SyncHistoryModal
          visible={syncHistoryModalVisible}
          connectionId={selectedConnection}
          platformName={PLATFORM_CONFIGS.find((c) => c.platform === selectedPlatform)?.name || ''}
          onClose={() => {
            setSyncHistoryModalVisible(false);
            setSelectedConnection(null);
            setSelectedPlatform(null);
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 22,
  },
  platformList: {
    padding: 16,
  },
  platformCard: {
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
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  platformDetails: {
    flex: 1,
  },
  platformName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  platformDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#6c757d',
  },
  connectionSettings: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    marginBottom: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  syncButton: {
    backgroundColor: '#007bff',
  },
  testButton: {
    backgroundColor: '#28a745',
  },
  historyButton: {
    backgroundColor: '#6f42c1',
  },
  disconnectButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
  },
  connectButton: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});

export default IntegrationsScreen;