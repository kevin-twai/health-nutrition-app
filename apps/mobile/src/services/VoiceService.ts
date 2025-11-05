import { Platform, PermissionsAndroid, Alert } from 'react-native';

// 語音識別結果介面
export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

// 語音識別錯誤介面
export interface VoiceRecognitionError {
  code: string;
  message: string;
}

// 語音識別事件回調
export interface VoiceRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (result: VoiceRecognitionResult) => void;
  onError?: (error: VoiceRecognitionError) => void;
  onEnd?: () => void;
  onVolumeChanged?: (volume: number) => void;
}

export class VoiceService {
  private isRecording = false;
  private callbacks: VoiceRecognitionCallbacks = {};

  constructor() {
    // 初始化語音識別服務
    this.initializeVoiceRecognition();
  }

  private async initializeVoiceRecognition(): Promise<void> {
    try {
      // 檢查平台支援
      if (Platform.OS === 'android') {
        await this.requestAndroidPermissions();
      }
      
      // TODO: 初始化語音識別引擎
      // 這裡可以整合 react-native-voice 或其他語音識別庫
      console.log('語音識別服務初始化完成');
    } catch (error) {
      console.error('語音識別服務初始化失敗:', error);
    }
  }

  private async requestAndroidPermissions(): Promise<boolean> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: '麥克風權限',
          message: '應用需要麥克風權限來進行語音輸入',
          buttonNeutral: '稍後詢問',
          buttonNegative: '拒絕',
          buttonPositive: '允許',
        }
      );
      
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('請求麥克風權限失敗:', error);
      return false;
    }
  }

  async startRecording(callbacks: VoiceRecognitionCallbacks = {}): Promise<void> {
    if (this.isRecording) {
      console.warn('語音識別已在進行中');
      return;
    }

    try {
      // 檢查權限
      if (Platform.OS === 'android') {
        const hasPermission = await this.checkMicrophonePermission();
        if (!hasPermission) {
          const granted = await this.requestAndroidPermissions();
          if (!granted) {
            throw new Error('麥克風權限被拒絕');
          }
        }
      }

      this.callbacks = callbacks;
      this.isRecording = true;

      // TODO: 開始語音識別
      // 這裡應該調用實際的語音識別 API
      console.log('開始語音識別');
      
      if (this.callbacks.onStart) {
        this.callbacks.onStart();
      }

      // 模擬語音識別過程
      this.simulateVoiceRecognition();

    } catch (error) {
      this.isRecording = false;
      const errorMessage = error instanceof Error ? error.message : '語音識別啟動失敗';
      
      if (this.callbacks.onError) {
        this.callbacks.onError({
          code: 'START_FAILED',
          message: errorMessage
        });
      }
      
      throw error;
    }
  }

  async stopRecording(): Promise<void> {
    if (!this.isRecording) {
      console.warn('語音識別未在進行中');
      return;
    }

    try {
      this.isRecording = false;
      
      // TODO: 停止語音識別
      console.log('停止語音識別');
      
      if (this.callbacks.onEnd) {
        this.callbacks.onEnd();
      }
    } catch (error) {
      console.error('停止語音識別失敗:', error);
      
      if (this.callbacks.onError) {
        this.callbacks.onError({
          code: 'STOP_FAILED',
          message: '停止語音識別失敗'
        });
      }
    }
  }

  private async checkMicrophonePermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const result = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        return result;
      } catch (error) {
        console.error('檢查麥克風權限失敗:', error);
        return false;
      }
    }
    
    // iOS 權限檢查需要使用其他方法
    return true;
  }

  private simulateVoiceRecognition(): void {
    // 模擬語音識別過程，實際實作時應該移除
    let volume = 0;
    const volumeInterval = setInterval(() => {
      if (!this.isRecording) {
        clearInterval(volumeInterval);
        return;
      }
      
      volume = Math.random() * 100;
      if (this.callbacks.onVolumeChanged) {
        this.callbacks.onVolumeChanged(volume);
      }
    }, 100);

    // 模擬識別結果
    setTimeout(() => {
      if (this.isRecording && this.callbacks.onResult) {
        this.callbacks.onResult({
          text: '這是模擬的語音識別結果',
          confidence: 0.95,
          isFinal: true
        });
      }
      
      // 自動停止
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, 500);
    }, 2000);
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  async checkAvailability(): Promise<boolean> {
    try {
      // 檢查設備是否支援語音識別
      if (Platform.OS === 'android') {
        const hasPermission = await this.checkMicrophonePermission();
        return hasPermission;
      }
      
      // iOS 檢查
      return true;
    } catch (error) {
      console.error('檢查語音識別可用性失敗:', error);
      return false;
    }
  }

  showPermissionAlert(): void {
    Alert.alert(
      '需要麥克風權限',
      '請在設定中允許應用使用麥克風來進行語音輸入',
      [
        { text: '取消', style: 'cancel' },
        { text: '前往設定', onPress: () => {
          // TODO: 打開應用設定頁面
          console.log('打開應用設定');
        }}
      ]
    );
  }
}

// 創建單例實例
export const voiceService = new VoiceService();