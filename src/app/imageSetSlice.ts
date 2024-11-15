import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConceptState } from "./conceptSlice";


// 数据集信息
export interface ImageSetState {
  name: string, // 图片集的名字
  type: 'regular' | 'train', // 类型
  concepts: ConceptState[], // 概念
};

const initialState: ImageSetState = {
  name: "<no>",  
  type: "regular", 
  concepts: [], 
}; 


export const imageSetSlice = createSlice({
  name: "imageset",
  initialState, 
  reducers: {

  },
});

