import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { FilterState, ImageState } from "../../app/imageSetSlice";
import { Box, MenuItem, Select, Slider } from "@mui/material";
import ImageGallery from "./ImageGallery";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useSelector } from "react-redux";
import '@mantine/carousel/styles.css';

const selectAllFilter = createSelector(
  (state: RootState) => state.imageSet.filters,
  (filters) => {
    const filter_map = new Map<string, FilterState>();
    for (const filter of filters) {
      filter_map.set(filter.name, filter);
    }
    return filter_map;
  }
);


const ImageGalleryWithFilter = forwardRef(({
  filter_name, // 只是用于初始化
  height,
  onImageOpen,
  onImageClose, 
}: {
  filter_name: string, // 用于初始化
  height: string | number,
  onImageOpen?: (image: ImageState) => void,
  onImageClose?: (image: ImageState) => void,
}, ref) => {
  const filter_map = useSelector(selectAllFilter);
  const filterNameList = Array.from(filter_map.keys());
  function getFilterByName(name: string): FilterState {
    return filter_map.get(name) || {
      name, images: [], concept: null,
    }
  }

  const [filter, setFilter] = useState<FilterState>(getFilterByName(filter_name));
  

  useEffect(() => {
    const _filter = getFilterByName(filter_name);
    setFilter(_filter);
  }, [filter_name, filter_map]);

  useImperativeHandle(ref, () => ({
    getFilter: () => filter,
    updateFilter: (newFilter: FilterState) => setFilter(newFilter),
  }));

  const [column, setColumn] = useState(10);



  
  return (<>
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Select
        labelId="demo-simple-select-standard-label"
        id="demo-simple-select-standard"
        label="concept or selection"
        variant="standard"
        size="small"
        value={filter.name}
        sx={{ m: 1, minWidth: 240 }}
        onChange={(event) => {
          const _filter = getFilterByName(event.target.value);
          setFilter(_filter);
        }}
      >
        {
          filterNameList.map((name, index) => <MenuItem key={index} value={name}>
            {name}
          </MenuItem>)
        }
      </Select>
      <div style={{ flex: 1 }}></div>
      <Slider
        size="small"
        defaultValue={column}
        value={column}
        onChange={(_, value) => setColumn(value as number)}
        valueLabelDisplay="off"
        sx={{ maxWidth: 360 }}
        max={16}
        min={4}
      />
    </Box>
    <ImageGallery 
      images={filter.images} 
      height={height} 
      enableFullscreen 
      badge 
      column={column} 
      onImageClose={onImageClose}
      onImageOpen={onImageOpen}
    />
  </>);
});




export default ImageGalleryWithFilter;

