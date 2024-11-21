import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import imageSetRecucer from './imageSetSlice';


export const store = configureStore({
  reducer: {
    setting: settingsReducer, // 用户设置
    imageSet: imageSetRecucer,
  },
})

export type RootState = ReturnType<typeof store.getState> 


