import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>健康營養追蹤</Text>
        <Text style={styles.subtitle}>今日營養攝取概覽</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionCard}>
          <Icon name="camera-alt" size={32} color="#3498db" />
          <Text style={styles.actionText}>拍照辨識</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard}>
          <Icon name="chat" size={32} color="#9b59b6" />
          <Text style={styles.actionText}>AI 顧問</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard}>
          <Icon name="assessment" size={32} color="#e67e22" />
          <Text style={styles.actionText}>健康報告</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard}>
          <Icon name="emoji-events" size={32} color="#f1c40f" />
          <Text style={styles.actionText}>成就系統</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;