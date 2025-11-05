import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// 導入 reducers
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import nutritionReducer from './slices/nutritionSlice';
import chatReducer from './slices/chatSlice';
import gamificationReducer from './slices/gamificationSlice';
import reportsReducer from './slices/reportsSlice';
import integrationsReducer from './slices/integrationsSlice';

// 配置 store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    nutrition: nutritionReducer,
    chat: chatReducer,
    gamification: gamificationReducer,
    reports: reportsReducer,
    integrations: integrationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register'],
      },
    }),
});

// 類型定義
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 類型化的 hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;