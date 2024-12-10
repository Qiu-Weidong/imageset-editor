import { ImageState } from "./imageSetSlice";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface FilterState {
  name: string, 
  images: ImageState[],
};

export interface ConceptState {
  name : string, 
  repeat: number,
  is_regular: boolean,
  imageset_name: string,
  images: ImageState[],

  // filter 过滤
  filters: FilterState[],
};

const initialState: ConceptState = {
  name: 'uninitialzed',
  repeat: 0, 
  is_regular: false, 
  imageset_name: 'uninitialzed',
  images: [],
  filters: [],
};


export const conceptSlice = createSlice({
  name: "concept",
  initialState,
  reducers: {
    loadConcept: (state, action: PayloadAction<ConceptState>) => {
      state.images = action.payload.images;
      state.name = action.payload.name;
      state.is_regular = action.payload.is_regular;
      state.imageset_name = action.payload.imageset_name;
      state.repeat = action.payload.repeat;
      // 同时添加 filter all
      state.filters = [ { name: "[all]", images: action.payload.images } ];
    },
  },
});


export default conceptSlice.reducer;
export const { loadConcept } = conceptSlice.actions;

