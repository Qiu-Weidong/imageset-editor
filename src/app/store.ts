import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import imageSetReducer from './imageSetSlice';
import openImageReducer from './openImageSlice';


export const store = configureStore({
  reducer: {
    setting: settingsReducer, // 用户设置
    imageSet: imageSetReducer,
    openImage: openImageReducer,
  },
})

export type RootState = ReturnType<typeof store.getState> 


