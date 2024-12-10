import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import imageSetReducer from './imageSetSlice';
import openImageReducer from './openImageSlice';
import conceptReducer from './conceptSlice';


export const store = configureStore({
  reducer: {
    setting: settingsReducer, // 用户设置
    imageSet: imageSetReducer,
    openImage: openImageReducer,
    concept: conceptReducer,
  },
})

export type RootState = ReturnType<typeof store.getState> 


