import 'react-native';
import React from 'react';
import App from '../App';
import { render } from '@testing-library/react-native';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

// Mock all screens
jest.mock('../screens/HomeScreen', () => 'HomeScreen');
jest.mock('../screens/PhotoScreen', () => 'PhotoScreen');
jest.mock('../screens/ChatScreen', () => 'ChatScreen');
jest.mock('../screens/ReportsScreen', () => 'ReportsScreen');
jest.mock('../screens/ProfileScreen', () => 'ProfileScreen');
jest.mock('../screens/AuthScreen', () => 'AuthScreen');
jest.mock('../screens/SettingsScreen', () => 'SettingsScreen');
jest.mock('../screens/IntegrationsScreen', () => 'IntegrationsScreen');

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

describe('App Component', () => {
  it('renders correctly', () => {
    const component = render(<App />);
    expect(component).toBeTruthy();
  });
});