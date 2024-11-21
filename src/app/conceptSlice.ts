import { createSlice } from "@reduxjs/toolkit";



// 图片信息
export interface ImageState {
  src: string, // 缩略图的base64编码
  id: string, // 图片id
  filename: string, // 图片的文件名
  path: string, // 图片的完整路径
  captions: string[], // 图片的字幕
  width: number, // 图片的实际宽度
  height: number, // 图片的实际高度
};

// 概念信息
export interface ConceptState {
  name: string, // concept 的名称
  repeat: number, // 重复次数
  images: ImageState[] | null, // 如果为 null 表示还未加载 
};

const initialState: ConceptState = {
  name: '<no>',
  repeat: 0, 
  images: null,
};

export const conceptSlice = createSlice({
  name: "concept", 
  initialState, 
  reducers: {
    
  },
});



