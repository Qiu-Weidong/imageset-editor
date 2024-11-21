import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConceptState } from "./conceptSlice";


// 数据集信息, 具体进入 train/regular 后再编辑
export interface ImageSetState {
  name: string, // 图片集的名字
  
  type: 'regular' | 'train' | null, // 类型
  concepts: ConceptState[], // 概念
};

const initialState: ImageSetState = {
  name: "<no>",
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

