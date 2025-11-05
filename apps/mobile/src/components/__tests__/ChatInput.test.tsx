import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatInput from '../ChatInput';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
  MediaType: {
    photo: 'photo',
  },
}));

// Mock VoiceService
jest.mock('../../services/VoiceService', () => ({
  voiceService: {
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    checkAvailability: jest.fn(() => Promise.resolve(true)),
    showPermissionAlert: jest.fn(),
  },
}));

describe('ChatInput', () => {
  const mockOnSendMessage = jest.fn();
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('應該正確渲染輸入框和按鈕', () => {
    const { getByPlaceholderText } = render(
      <ChatInput 
        value=""
        onChangeText={mockOnChangeText}
        onSendMessage={mockOnSendMessage}
        isSending={false}
      />
    );

    expect(getByPlaceholderText('輸入您的問題...')).toBeTruthy();
  });

  it('輸入文字時應該觸發 onChangeText 回調', () => {
    const { getByPlaceholderText } = render(
      <ChatInput 
        value=""
        onChangeText={mockOnChangeText}
        onSendMessage={mockOnSendMessage}
        isSending={false}
      />
    );

    const textInput = getByPlaceholderText('輸入您的問題...');
    fireEvent.changeText(textInput, '你好');

    expect(mockOnChangeText).toHaveBeenCalledWith('你好');
  });

  it('點擊發送按鈕時應該觸發 onSendMessage 回調', async () => {
    const { getByTestId } = render(
      <ChatInput 
        value="測試訊息"
        onChangeText={mockOnChangeText}
        onSendMessage={mockOnSendMessage}
        isSending={false}
      />
    );

    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('測試訊息', undefined);
  });

  it('空訊息時不應該觸發發送', () => {
    const { getByTestId } = render(
      <ChatInput 
        value=""
        onChangeText={mockOnChangeText}
        onSendMessage={mockOnSendMessage}
        isSending={false}
      />
    );

    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('只有空白字符的訊息不應該觸發發送', () => {
    const { getByTestId } = render(
      <ChatInput 
        value="   "
        onChangeText={mockOnChangeText}
        onSendMessage={mockOnSendMessage}
        isSending={false}
      />
    );

    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('當 isSending 為 true 時應該禁用發送按鈕', () => {
    const { getByTestId } = render(
      <ChatInput 
        value="測試訊息"
        onChangeText={mockOnChangeText}
        onSendMessage={mockOnSendMessage}
        isSending={true}
      />
    );

    const sendButton = getByTestId('send-button');
    expect(sendButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('當 isSending 為 true 時應該顯示載入指示器', () => {
    const { getByTestId } = render(
      <ChatInput 
        value="測試訊息"
        onChangeText={mockOnChangeText}
        onSendMessage={mockOnSendMessage}
        isSending={true}
      />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('應該支援多行文字輸入', () => {
    const { getByPlaceholderText } = render(
      <ChatInput 
        value=""
        onChangeText={mockOnChangeText}
        onSendMessage={mockOnSendMessage}
        isSending={false}
      />
    );

    const textInput = getByPlaceholderText('輸入您的問題...');
    expect(textInput.props.multiline).toBe(true);
  });

  it('應該正確處理最大長度限制', () => {
    const { getByPlaceholderText } = render(
      <ChatInput 
        value=""
        onChangeText={mockOnChangeText}
        onSendMessage={mockOnSendMessage}
        isSending={false}
      />
    );

    const textInput = getByPlaceholderText('輸入您的問題...');
    expect(textInput.props.maxLength).toBe(500);
  });

  it('當 disabled 為 true 時應該禁用輸入', () => {
    const { getByPlaceholderText } = render(
      <ChatInput 
        value=""
        onChangeText={mockOnChangeText}
        onSendMessage={mockOnSendMessage}
        isSending={false}
        disabled={true}
      />
    );

    const textInput = getByPlaceholderText('輸入您的問題...');
    expect(textInput.props.editable).toBe(false);
  });

  it('應該正確顯示輸入的值', () => {
    const { getByDisplayValue } = render(
      <ChatInput 
        value="測試文字"
        onChangeText={mockOnChangeText}
        onSendMessage={mockOnSendMessage}
        isSending={false}
      />
    );

    expect(getByDisplayValue('測試文字')).toBeTruthy();
  });
});