import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';


export const store = configureStore({
  reducer: {
    setting: settingsReducer, // 用户设置
  },
})

export type RootState = ReturnType<typeof store.getState> 


