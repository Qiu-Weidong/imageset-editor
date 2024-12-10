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
  name: string,
  images: ImageState[],
  concept: { name: string, repeat: number } | null,  // 简单一点, 通过是否存在repeat来判断是否是临时选择
};




export interface ImageSetState {
  name: string, // 图片集的名字

  type: 'regular' | 'train' | null, // 类型 数据集还是正则集合

  images: Map<string, ImageState>, 
  filters: FilterState[], 
};

const initialState: ImageSetState = {
  name: "<uninitiated>",
  images: new Map(),
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
      
      if (state.name === action.payload.name && state.type === action.payload.type) {
        // 保留 selection
        const selections: FilterState[] = state.filters.filter(filter => filter.name.startsWith('<') && filter.name !== '<all>');
        const filters = action.payload.filters;

        for(const selection of selections) {
          const filter: FilterState = {
            name: selection.name, 
            concept: null, 
            images: [],
          };
          for(const image of selection.images) {
            const new_image = action.payload.images.get(image.path);
            if(new_image) {
              filter.images.push(new_image);
            }
          }
          filters.push(filter);
        }
        state.filters = filters;
      } else {
        state.filters = action.payload.filters;
        state.name = action.payload.name;
        state.type = action.payload.type;
      }

      state.images = action.payload.images;

    },

    updateCaptions: (state, action: PayloadAction<{ image: ImageState, captions: string[] }>) => {
      const _image = state.images.get(action.payload.image.path);
      if(_image) {
        console.log('hhhhhh');
        _image.captions = action.payload.captions;
      }
      state.images = new Map(state.images);
      console.log(state.images);
    },



    setFilters: (state, action: PayloadAction<FilterState[]>) => {
      state.filters = action.payload;
    },

    addFilter: (state, action: PayloadAction<FilterState>) => {
      state.filters = [...state.filters, action.payload];
    },

    removeFilter: (state, action: PayloadAction<string>) => {
      state.filters = state.filters.filter((concept) => concept.name !== action.payload);
    },

  },
});

export default imageSetSlice.reducer;
export const { updateCaptions, setImageSetName, setImageSetType, addFilter, removeFilter, setImageSet, reloadImageSet } = imageSetSlice.actions;

