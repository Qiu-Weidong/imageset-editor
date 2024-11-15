import { PayloadAction, createSlice } from "@reduxjs/toolkit";

// 定义配置项目

export interface SettingsState {
  defaultImageGalleryColumns: number, // 图片的列数
  thumbnailWidth: number, // 缩略图的宽度

};

// eel
const initialState: SettingsState = {
  defaultImageGalleryColumns: 12,
  thumbnailWidth: 128,
}


const settingsSlice = createSlice({
  name: "settings",
  initialState, 
  reducers: {
    setSettings: (state, action: PayloadAction<SettingsState>) => state = action.payload,
  }
});



export default settingsSlice.reducer;
export const { setSettings } = settingsSlice.actions;

