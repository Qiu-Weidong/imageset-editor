import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ImageState {
  src: string,                // 图片的url
  thumbnail: string,          // 缩略图url
  filename: string,           // 文件名称(不包含扩展名)
  path: string,               // 准确路径, path 也可以唯一标识, 从 src/reg 目录下开始
  captions: string[],         // 字幕
  width: number,              // 宽度
  height: number,             // 高度
  
  concept: string, 
  repeat: number,
};


export interface ConceptState {
  name: string, // <all>
  images: ImageState[],
  repeat: number | null,  // 简单一点, 通过是否存在repeat来判断是否是临时选择
};


// 进入 detail 之后才加载, 加载 regular 或者 train 中所有图片的元信息
// 对于数据集而言,一个train是一个ImageSet, regular 是一个 ImageSet.
export interface ImageSetState {
  name: string, // 图片集的名字

  // dirty: boolean, // 是否需要写回到文件
  type: 'regular' | 'train' | null, // 类型 数据集还是正则集合

  concepts: ConceptState[], // 概念
};

const initialState: ImageSetState = {
  name: "<uninitiated>",
  // dirty: false, 
  type: null,
  concepts: [],
};


export const imageSetSlice = createSlice({
  name: "imageset",
  initialState,
  reducers: {
    setImageSetName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },

    setImageSetType: (state, action: PayloadAction<'regular' | 'train'>) => {
      state.type = action.payload;
    },

    setConcepts: (state, action: PayloadAction<ConceptState[]>) => {
      state.concepts = action.payload;
    },


    addConcept: (state, action: PayloadAction<ConceptState>) => {
      state.concepts = [...state.concepts, action.payload];
    },

    removeConcept: (state, action: PayloadAction<string>) => {
      state.concepts = state.concepts.filter((concept) => concept.name != action.payload);
    },

    addOrUpdateConcept: (state, action: PayloadAction<ConceptState>) => {
      if (state.concepts.find((item) => item.name == action.payload.name) == undefined) {
        // 直接添加
        state.concepts = [...state.concepts, action.payload];
      } else {
        state.concepts = state.concepts.map((item) => item.name == action.payload.name ? action.payload : item);
      }
    }

  },
});

export default imageSetSlice.reducer;
export const { setImageSetName, setImageSetType, addConcept, removeConcept, addOrUpdateConcept } = imageSetSlice.actions;

