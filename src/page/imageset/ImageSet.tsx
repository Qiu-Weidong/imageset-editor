import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import api from "../../api";
import { FilterState, ImageState, reloadImageSet } from "../../app/imageSetSlice";
import Header from "../header/Header";
import { Backdrop, Box, CircularProgress, Grid2 as Grid, MenuItem, Select, Slider, Toolbar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Editor } from "./Detail";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import ImageGallery from "./ImageGallery";
import CaptionEditor from "./CaptionEditor";


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

function ImageSet() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { imageset_name, is_regular, filter_name }:
    { imageset_name: string, is_regular: boolean, filter_name: string } = location.state;

  const filter_map = useSelector(selectAllFilter);
  const filterNameList = Array.from(filter_map.keys());
  function getFilterByName(name: string): FilterState {
    return filter_map.get(name) || {
      name, images: [], concept: null,
    }
  }

  // 所有显示都使用它
  const [filter, setFilter] = useState<FilterState>(getFilterByName(filter_name));


  const [loading, setLoading] = useState(false);

  async function load() {
    // 加载数据
    setLoading(true);
    let result = await api.load(imageset_name, is_regular);
    dispatch(reloadImageSet(result));
    setLoading(false);
    
    // 有些需要跳转，有些不需要跳转, 不要自动跳转
    // navigate('/imageset', { replace: true, state: { ...location.state, filter_name: filter.name } });
  }

  async function _delete() {
    if (is_regular) {
      let result = window.confirm(`Do you want to delete regular set for ${imageset_name}`);
      if (result) {
        await api.delete_regular(imageset_name);
      }
    } else {
      let result = window.confirm(`Do you want to delete train set for ${imageset_name}`);
      if (result) {
        await api.delete_train(imageset_name);
      }
    }
    // 这里之际跳转即可
    navigate("/overview", { state: { imageset_name } });
  }
  useEffect(() => {
    load();
  }, [imageset_name, is_regular]);

  useEffect(() => {
    const _filter = getFilterByName(filter_name);
    setFilter(_filter);
  }, [filter_name, filter_map]);



  const [column, setColumn] = useState(10);
  const height = '80vh';

  const [openImage, setOpenImage] = useState<ImageState | null>(null);
  function onImageClose(_image: ImageState) { setOpenImage(null); }
  function onImageOpen(image: ImageState) { setOpenImage(image); }

  return (<>
    <Header onRenameImageset={(_, new_name) => {
      navigate('/imageset', { replace: true, state: { ...location.state, imageset_name: new_name, filter_name: filter.name } })
    }}
      onLoad={() => load().finally(() => 
        navigate('/imageset', { replace: true, state: { ...location.state, filter_name: filter.name } })
      ) }
      onDelete={_delete}
    />

    <Backdrop
      sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 10 })}
      open={loading}
    >
      <CircularProgress color="inherit" />
    </Backdrop>

    <Toolbar />


    {/* 正式内容 */}
    <Grid container spacing={2} >
      <Grid size={10}>
        {/* 这里放置图片 */}
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
      </Grid>

      <Grid size={2} sx={{ height: '100%' }}>
        {/* 在这里路由 */}
        <Routes>
          {/* 这里就先不跳转, 在里面按照需要跳转 */}
          <Route path="/detail" element={<Editor filter={filter} onReload={load} />} />
          <Route path="/caption-editor" element={<CaptionEditor />} />
          <Route path="*" element={<Navigate to="/imageset/detail" replace state={location.state} />} />
        </Routes>
        
      </Grid>
    </Grid>


  </>);
}


export default ImageSet;

