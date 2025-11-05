import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Modal,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera, MediaType, ImagePickerResponse } from 'react-native-image-picker';
import { voiceService, VoiceRecognitionResult } from '../services/VoiceService';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSendMessage: (message: string, attachments?: ChatAttachment[]) => void;
  isSending: boolean;
  disabled?: boolean;
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'audio' | 'file';
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSendMessage,
  isSending,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const voiceAnimationValue = useRef(new Animated.Value(0)).current;

  const handleSend = useCallback(() => {
    if ((!value.trim() && attachments.length === 0) || isSending) {
      return;
    }

    onSendMessage(value.trim(), attachments.length > 0 ? attachments : undefined);
    setAttachments([]);
  }, [value, attachments, isSending, onSendMessage]);

  const handleVoiceInput = useCallback(async () => {
    if (isRecording) {
      try {
        await voiceService.stopRecording();
        setIsRecording(false);
        
        Animated.timing(voiceAnimationValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('停止語音輸入失敗:', error);
        Alert.alert('錯誤', '停止語音輸入失敗');
      }
    } else {
      try {
        const isAvailable = await voiceService.checkAvailability();
        if (!isAvailable) {
          voiceService.showPermissionAlert();
          return;
        }

        setIsRecording(true);
        
        Animated.loop(
          Animated.sequence([
            Animated.timing(voiceAnimationValue, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(voiceAnimationValue, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();

        await voiceService.startRecording({
          onResult: (result: VoiceRecognitionResult) => {
            if (result.isFinal && result.text.trim()) {
              onChangeText(value + result.text.trim());
            }
          },
          onError: (error) => {
            console.error('語音識別錯誤:', error);
            setIsRecording(false);
            Animated.timing(voiceAnimationValue, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
            Alert.alert('語音識別錯誤', error.message);
          },
          onEnd: () => {
            setIsRecording(false);
            Animated.timing(voiceAnimationValue, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          },
        });
      } catch (error) {
        console.error('啟動語音輸入失敗:', error);
        Alert.alert('錯誤', '啟動語音輸入失敗');
        setIsRecording(false);
      }
    }
  }, [isRecording, voiceAnimationValue, value, onChangeText]);

  const handleImagePicker = useCallback(() => {
    Alert.alert(
      '選擇圖片',
      '請選擇圖片來源',
      [
        { text: '取消', style: 'cancel' },
        { text: '相機', onPress: () => openCamera() },
        { text: '相簿', onPress: () => openImageLibrary() },
      ]
    );
    setShowAttachmentMenu(false);
  }, []);

  const openCamera = useCallback(() => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as any,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const attachment: ChatAttachment = {
          id: Date.now().toString(),
          type: 'image',
          uri: asset.uri!,
          name: asset.fileName || 'camera_image.jpg',
          size: asset.fileSize,
          mimeType: asset.type,
        };
        setAttachments(prev => [...prev, attachment]);
      }
    });
  }, []);

  const openImageLibrary = useCallback(() => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as any,
      maxWidth: 1024,
      maxHeight: 1024,
      selectionLimit: 5,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets) {
        const newAttachments: ChatAttachment[] = response.assets.map(asset => ({
          id: Date.now().toString() + Math.random(),
          type: 'image',
          uri: asset.uri!,
          name: asset.fileName || 'image.jpg',
          size: asset.fileSize,
          mimeType: asset.type,
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
      }
    });
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  }, []);

  const renderAttachments = () => {
    if (attachments.length === 0) return null;

    return (
      <View style={styles.attachmentsContainer}>
        {attachments.map(attachment => (
          <View key={attachment.id} style={styles.attachmentItem}>
            {attachment.type === 'image' && (
              <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
            )}
            <TouchableOpacity
              style={styles.removeAttachmentButton}
              onPress={() => removeAttachment(attachment.id)}
            >
              <Icon name="close" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderAttachments()}
      
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={onChangeText}
            placeholder="輸入您的問題..."
            placeholderTextColor="#95a5a6"
            multiline
            maxLength={500}
            editable={!isSending && !disabled && !isRecording}
          />
          
          <View style={styles.inputActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowAttachmentMenu(true)}
              disabled={isSending || disabled}
            >
              <Icon name="attach-file" size={20} color="#7f8c8d" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, isRecording && styles.voiceButtonActive]}
              onPress={handleVoiceInput}
              disabled={isSending || disabled}
            >
              <Animated.View
                style={{
                  transform: [{
                    scale: voiceAnimationValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  }],
                }}
              >
                <Icon 
                  name={isRecording ? "mic" : "mic-none"} 
                  size={20} 
                  color={isRecording ? "#ffffff" : "#7f8c8d"} 
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.sendButton, (!value.trim() && attachments.length === 0 || isSending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={(!value.trim() && attachments.length === 0) || isSending}
          testID="send-button"
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#ffffff" testID="loading-indicator" />
          ) : (
            <Icon name="send" size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>

      {/* 附件選單 */}
      <Modal
        visible={showAttachmentMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View style={styles.attachmentMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleImagePicker}>
              <Icon name="photo" size={24} color="#3498db" />
              <Text style={styles.menuItemText}>圖片</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setShowAttachmentMenu(false);
                Alert.alert('功能開發中', '檔案上傳功能即將推出');
              }}
            >
              <Icon name="insert-drive-file" size={24} color="#3498db" />
              <Text style={styles.menuItemText}>檔案</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  attachmentsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    flexWrap: 'wrap',
  },
  attachmentItem: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  attachmentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 16,
    color: '#2c3e50',
    maxHeight: 60,
    minHeight: 40,
    textAlignVertical: 'center',
    paddingRight: 80,
  },
  inputActions: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 16,
  },
  voiceButtonActive: {
    backgroundColor: '#e74c3c',
  },
  sendButton: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
    elevation: 0,
    shadowOpacity: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  attachmentMenu: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 16,
    fontWeight: '500',
  },
});

export default ChatInput;