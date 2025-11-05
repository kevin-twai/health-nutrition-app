import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { RootState, useAppSelector } from '../store';
import { fetchSyncHistory } from '../store/slices/integrationsSlice';
import { SyncResult } from '@health-tracker/shared-types';

interface SyncHistoryModalProps {
  visible: boolean;
  connectionId?: string;
  platformName: string;
  onClose: () => void;
}

const SyncHistoryModal: React.FC<SyncHistoryModalProps> = ({
  visible,
  connectionId,
  platformName,
  onClose,
}) => {
  const dispatch = useDispatch();
  const integrations = useAppSelector((state: RootState) => state.integrations) as any;
  const { syncHistory, isLoading } = integrations;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible) {
      dispatch(fetchSyncHistory(connectionId) as any);
    }
  }, [visible, connectionId, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchSyncHistory(connectionId) as any);
    setRefreshing(false);
  };

  const getStatusColor = (success: boolean) => {
    return success ? '#28a745' : '#dc3545';
  };

  const getStatusText = (success: boolean) => {
    return success ? '成功' : '失敗';
  };

  const formatDuration = (startTime: Date, endTime: Date) => {
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}分${seconds % 60}秒`;
    }
    return `${seconds}秒`;
  };

  const renderSyncItem = ({ item }: { item: SyncResult }) => (
    <View style={styles.syncItem}>
      <View style={styles.syncHeader}>
        <View style={styles.syncStatus}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.success) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.success) }]}>
            {getStatusText(item.success)}
          </Text>
        </View>
        <Text style={styles.syncTime}>
          {new Date(item.endTime).toLocaleString('zh-TW')}
        </Text>
      </View>

      <View style={styles.syncDetails}>
        <View style={styles.syncStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.recordsProcessed}</Text>
            <Text style={styles.statLabel}>處理</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.recordsCreated}</Text>
            <Text style={styles.statLabel}>新增</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.recordsUpdated}</Text>
            <Text style={styles.statLabel}>更新</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.recordsSkipped}</Text>
            <Text style={styles.statLabel}>跳過</Text>
          </View>
        </View>

        <Text style={styles.durationText}>
          耗時: {formatDuration(item.startTime, item.endTime)}
        </Text>

        {item.errors && item.errors.length > 0 && (
          <View style={styles.errorsSection}>
            <Text style={styles.errorsTitle}>錯誤 ({item.errors.length})</Text>
            {item.errors.slice(0, 3).map((error, index) => (
              <Text key={index} style={styles.errorText}>
                • {error.message}
              </Text>
            ))}
            {item.errors.length > 3 && (
              <Text style={styles.moreErrorsText}>
                還有 {item.errors.length - 3} 個錯誤...
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📊</Text>
      <Text style={styles.emptyStateTitle}>暫無同步記錄</Text>
      <Text style={styles.emptyStateText}>
        當您開始同步資料時，同步歷史將會顯示在這裡
      </Text>
    </View>
  );

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
          <Text style={styles.title}>{platformName} 同步歷史</Text>
          <View style={styles.placeholder} />
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>載入同步歷史...</Text>
          </View>
        ) : (
          <FlatList
            data={syncHistory}
            renderItem={renderSyncItem}
            keyExtractor={(item, index) => `${item.endTime}-${index}`}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  syncItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  syncTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  syncDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
  },
  syncStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  durationText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorsSection: {
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc3545',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    lineHeight: 16,
    marginBottom: 4,
  },
  moreErrorsText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SyncHistoryModal;