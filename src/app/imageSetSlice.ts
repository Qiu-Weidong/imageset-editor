import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ImageState {
  src: string,                // 图片的url
  thumbnail: string,          // 缩略图url
  filename: string,           // 文件名称(不包含扩展名)
  basename: string,           // 文件名称(包含扩展名)
  path: string,               // 准确路径, path 也可以唯一标识, 从 src/reg 目录下开始
  captions: string[],         // 字幕
  width: number,              // 宽度
  height: number,             // 高度

  concept: string,
  repeat: number,
};


export interface FilterState {
  name: string, // id, 对于Concept而言是 8_xxx, 对于临时集合而言是 <all>, 
  images: ImageState[],

  concept: { name: string, repeat: number } | null,  // 简单一点, 通过是否存在repeat来判断是否是临时选择
};


// 进入 detail 之后才加载, 加载 regular 或者 train 中所有图片的元信息
// 对于数据集而言,一个train是一个ImageSet, regular 是一个 ImageSet.
export interface ImageSetState {
  name: string, // 图片集的名字

  // dirty: boolean, // 是否需要写回到文件
  type: 'regular' | 'train' | null, // 类型 数据集还是正则集合

  filters: FilterState[], // 概念
};

const initialState: ImageSetState = {
  name: "<uninitiated>",
  // dirty: false, 
  type: null,
  filters: [],
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

    setImageSet: (state, action: PayloadAction<ImageSetState>) => {
      state.name = action.payload.name;
      state.type = action.payload.type;
      state.filters = action.payload.filters;
    },

    reloadImageSet: (state, action: PayloadAction<ImageSetState>) => {
      // 给一点智能, 如果name和type相同, 则保留selection, 否则直接set
      if (state.name == action.payload.name && state.type == action.payload.type) {
        // 保留 state.filters 中的所有非 <all> 的 selection
        const selection = state.filters.filter(item => item.name.startsWith('<') && item.name !== '<all>');
        state.filters = [...action.payload.filters, ...selection];
      } else {
        state.name = action.payload.name;
        state.type = action.payload.type;
        state.filters = action.payload.filters;
      }

    },

    setFilters: (state, action: PayloadAction<FilterState[]>) => {
      state.filters = action.payload;
    },


    addFilter: (state, action: PayloadAction<FilterState>) => {
      const t = state.filters.filter(item => item.name !== action.payload.name);
      state.filters = [...t, action.payload];
    },

    removeFilter: (state, action: PayloadAction<string>) => {
      state.filters = state.filters.filter((concept) => concept.name != action.payload);
    },

    addOrUpdateFilters: (state, action: PayloadAction<FilterState>) => {
      if (state.filters.find((item) => item.name == action.payload.name) == undefined) {
        // 直接添加
        state.filters = [...state.filters, action.payload];
      } else {
        state.filters = state.filters.map((item) => item.name == action.payload.name ? action.payload : item);
      }
    }

  },
});

export default imageSetSlice.reducer;
export const { setImageSetName, setImageSetType, addFilter, removeFilter, addOrUpdateFilters, setImageSet, reloadImageSet } = imageSetSlice.actions;

