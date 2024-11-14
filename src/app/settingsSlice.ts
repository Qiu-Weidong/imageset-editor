import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { eel } from "..";

// 定义配置项目

export interface SettingsState {
  defaultImageGalleryColumns: number, // 图片的列数
  thumbnailWidth: number, // 缩略图的宽度
  baseDir: string, // 数据集存放路径
};

// eel
const initialState: SettingsState = {
  defaultImageGalleryColumns: 12,
  thumbnailWidth: 128,
  baseDir: '',
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

