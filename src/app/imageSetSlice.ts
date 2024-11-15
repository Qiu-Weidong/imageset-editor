import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface ImageState {
  src: string, // 缩略图的base64编码
  id: string, // 图片id
  filename: string, // 图片的文件名
  path: string, // 图片的完整路径
  captions: string[], // 图片的字幕
  concept: string, // 图片所属的概念
  width: number, // 图片的实际宽度
  height: number, // 图片的实际高度
};

export interface ImageSetState {
  name: string, // 图片集的名字
  type: 'regular' | 'train', // 类型
  concepts: { name: string, repeat: number, }[], // 概念
  images: ImageState[],
};

const initialState: ImageSetState = {
  name: "<no>", 
  type: "regular", 
  concepts: [], 
  images: [],
}; 


export const imageSetSlice = createSlice({
  name: "imageset",
  initialState, 
  reducers: {
    pushImage: (state, action: PayloadAction<ImageState>) => {
      state.images = [...state.images, action.payload];
    },

    removeImage: (state, action: PayloadAction<string>) => {
      state.images = state.images.filter((image) => image.id !== action.payload);
    },

    clearImageList: (state) => { state.images = []; },

    setImageList: (state, action: PayloadAction<ImageState[]>) => { state.images = action.payload; },

  },
});

