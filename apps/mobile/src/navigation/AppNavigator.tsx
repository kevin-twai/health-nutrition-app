import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// 導入畫面組件
import HomeScreen from '../screens/HomeScreen';
import PhotoScreen from '../screens/PhotoScreen';
import ChatScreen from '../screens/ChatScreen';
import ReportsScreen from '../screens/ReportsScreen';
import GamificationScreen from '../screens/GamificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import SettingsScreen from '../screens/SettingsScreen';
import IntegrationsScreen from '../screens/IntegrationsScreen';

// 導航類型定義
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Settings: undefined;
  Integrations: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Photo: undefined;
  Chat: undefined;
  Reports: undefined;
  Gamification: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 主要標籤導航
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Photo':
              iconName = 'camera-alt';
              break;
            case 'Chat':
              iconName = 'chat';
              break;
            case 'Reports':
              iconName = 'assessment';
              break;
            case 'Gamification':
              iconName = 'emoji-events';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#ecf0f1',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: '首頁',
          tabBarLabel: '首頁'
        }} 
      />
      <Tab.Screen 
        name="Photo" 
        component={PhotoScreen} 
        options={{ 
          title: '拍照辨識',
          tabBarLabel: '拍照'
        }} 
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ 
          title: 'AI 顧問',
          tabBarLabel: '聊天'
        }} 
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{ 
          title: '健康報告',
          tabBarLabel: '報告'
        }} 
      />
      <Tab.Screen 
        name="Gamification" 
        component={GamificationScreen} 
        options={{ 
          title: '遊戲化',
          tabBarLabel: '挑戰'
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: '個人檔案',
          tabBarLabel: '我的'
        }} 
      />
    </Tab.Navigator>
  );
}

// 根導航器
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3498db',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ 
            title: '登入',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator} 
          options={{ 
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ 
            title: '設定'
          }} 
        />
        <Stack.Screen 
          name="Integrations" 
          component={IntegrationsScreen} 
          options={{ 
            title: '第三方整合'
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}