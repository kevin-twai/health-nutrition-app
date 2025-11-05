import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchConversations,
  createConversation,
  fetchMessages,
  sendMessage,
  setCurrentConversation,
  clearError,
  addMessage,
  setConnectionStatus,
  updateMessageStatus,
} from '../store/slices/chatSlice';
import { ChatMessage, MessageRole } from '@health-tracker/shared-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { webSocketService } from '../services/WebSocketService';
import { voiceService, VoiceRecognitionResult } from '../services/VoiceService';
import ChatInput, { ChatAttachment } from '../components/ChatInput';
import TypingIndicator from '../components/TypingIndicator';

const { height: screenHeight } = Dimensions.get('window');

interface ChatBubbleProps {
  message: ChatMessage;
  isUser: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser }) => {
  const getStatusIcon = () => {
    if (!isUser || !message.metadata?.status) return null;
    
    switch (message.metadata.status) {
      case 'sending':
        return <ActivityIndicator size="small" color="#95a5a6" style={styles.statusIcon} />;
      case 'sent':
        return <Icon name="done" size={16} color="#27ae60" style={styles.statusIcon} />;
      case 'failed':
        return <Icon name="error" size={16} color="#e74c3c" style={styles.statusIcon} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
      <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
        {message.content}
      </Text>
      <View style={styles.messageFooter}>
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
          {new Date(message.timestamp).toLocaleTimeString('zh-TW', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
        {getStatusIcon()}
      </View>
      {message.metadata?.recommendations && message.metadata.recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>建議：</Text>
          {message.metadata.recommendations.map((rec, index) => (
            <Text key={index} style={styles.recommendationText}>
              • {rec.description}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const ChatScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const chatState = useAppSelector((state) => state.chat) as any;
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isSending,
    error,
    isConnected,
  } = chatState;

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 初始化聊天
  useEffect(() => {
    initializeChat();
    return () => {
      webSocketService.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // 監聽當前對話變化，獲取訊息
  useEffect(() => {
    if (currentConversation) {
      dispatch(fetchMessages(currentConversation.id));
      webSocketService.connect(currentConversation.id);
    }
  }, [currentConversation, dispatch]);

  // 監聽錯誤
  useEffect(() => {
    if (error) {
      Alert.alert('錯誤', error, [
        { text: '確定', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  // 自動滾動到底部
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const initializeChat = async () => {
    try {
      const conversationsAction = await dispatch(fetchConversations());
      if (fetchConversations.fulfilled.match(conversationsAction)) {
        const conversationsResult = conversationsAction.payload;
        
        if (conversationsResult.length > 0) {
          // 使用最新的對話
          dispatch(setCurrentConversation(conversationsResult[0]));
        } else {
          // 創建新對話
          const newConversationAction = await dispatch(createConversation());
          if (createConversation.fulfilled.match(newConversationAction)) {
            dispatch(setCurrentConversation(newConversationAction.payload));
          }
        }
      }
    } catch (error) {
      console.error('初始化聊天失敗:', error);
    }
  };

  // 處理輸入文字變化和打字指示器
  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
    
    // 發送打字指示器
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      webSocketService.sendTyping(true);
    }
    
    // 清除之前的計時器
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // 設置新的計時器，停止打字指示器
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      webSocketService.sendTyping(false);
    }, 1000);
  }, [isTyping]);

  const handleSendMessage = useCallback(async (message: string, attachments?: ChatAttachment[]) => {
    if (!message.trim() || !currentConversation || isSending) {
      return;
    }

    setInputText('');
    setAiIsTyping(true);

    try {
      const sendAction = await dispatch(sendMessage({
        conversationId: currentConversation.id,
        message: message
      }));
      
      if (!sendMessage.fulfilled.match(sendAction)) {
        setInputText(message);
      }
    } catch (error) {
      console.error('發送訊息失敗:', error);
      setInputText(message);
    } finally {
      setAiIsTyping(false);
    }
  }, [currentConversation, isSending, dispatch]);



  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === MessageRole.USER;
    return <ChatBubble message={item} isUser={isUser} />;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="chat" size={64} color="#bdc3c7" />
      <Text style={styles.emptyStateTitle}>開始與 AI 顧問對話</Text>
      <Text style={styles.emptyStateSubtitle}>
        我可以幫您分析營養攝取、提供健康建議，或回答任何關於飲食的問題
      </Text>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => setInputText('分析我今天的營養攝取')}
      >
        <Text style={styles.quickActionText}>分析今日營養</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => setInputText('給我一些健康飲食建議')}
      >
        <Text style={styles.quickActionText}>健康建議</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => setInputText('我的健康目標進度如何？')}
      >
        <Text style={styles.quickActionText}>目標進度</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 標題欄 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="smart-toy" size={24} color="#3498db" />
          <Text style={styles.headerTitle}>AI 營養顧問</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.connectionStatus, { backgroundColor: isConnected ? '#27ae60' : '#e74c3c' }]} />
          <TouchableOpacity onPress={() => {
            dispatch(createConversation());
          }}>
            <Icon name="add" size={24} color="#3498db" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 訊息列表 */}
      <View style={styles.messagesContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>載入對話中...</Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyState}
              ListHeaderComponent={messages.length === 0 ? renderQuickActions : null}
            />
            <TypingIndicator visible={aiIsTyping} />
          </>
        )}
      </View>

      {/* 輸入區域 */}
      <ChatInput
        value={inputText}
        onChangeText={handleInputChange}
        onSendMessage={handleSendMessage}
        isSending={isSending}
        disabled={false}
      />
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  messagesContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7f8c8d',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3498db',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#2c3e50',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    marginRight: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiTimestamp: {
    color: '#95a5a6',
  },
  statusIcon: {
    marginLeft: 4,
  },
  recommendationsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 8,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: screenHeight * 0.4,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  quickActionText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },

});

export default ChatScreen;