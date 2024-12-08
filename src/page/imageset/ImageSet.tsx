import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import api from "../../api";
import { FilterState, ImageSetState, reloadImageSet } from "../../app/imageSetSlice";
import Header from "../header/Header";
import { Backdrop, Box, CircularProgress, Grid2 as Grid, MenuItem, Paper, Select, Slider, Toolbar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Editor } from "./Detail";
import { RootState } from "../../app/store";
import ImageGallery from "./ImageGallery";
import CaptionEditor from "./CaptionEditor";


// filter 中保存的必须是引用, 这样在一个 filter 中修改了图片信息在另外的 filter 中才能够查看. 

function ImageSet() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { imageset_name, is_regular, filter_name }:
    { imageset_name: string, is_regular: boolean, filter_name: string } = location.state;

  const filter_list = useSelector((state: RootState) => state.imageSet.filters);
  const filterNameList = filter_list.map(filter => filter.name);
  function getFilterByName(name: string): FilterState {
    return filter_list.find((filter) => filter.name === name) || {
      name, images: [], concept: null,
    }
  }

  // 所有显示都使用它
  const [filter, setFilter] = useState<FilterState>(getFilterByName(filter_name));


  const [loading, setLoading] = useState(false);

  async function load() {
    // 加载数据
    let result: ImageSetState = await api.load(imageset_name, is_regular);
    dispatch(reloadImageSet(result));
  }

  async function _delete() {
    if (is_regular) {
      let result = window.confirm(`Do you want to delete regular set for ${imageset_name}`);
      if (result) {
        setLoading(true);
        await api.delete_regular(imageset_name);
      }
    } else {
      let result = window.confirm(`Do you want to delete train set for ${imageset_name}`);
      if (result) {
        setLoading(true);
        await api.delete_train(imageset_name);
      }
    }
    setLoading(false);
    navigate("/overview", { state: { imageset_name } });
  }
  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [imageset_name, is_regular]);

  useEffect(() => {
    const _filter = getFilterByName(filter_name);
    setFilter(_filter);
  }, [filter_name, filter_list]);



  const [column, setColumn] = useState(10);
  const height = '80vh';


  async function __load() {
    setLoading(true);
    await load();
    setLoading(false);

    // 这里是强行跳转到
    navigate(location.pathname, { replace: true, state: { ...location.state, filter_name: filter.name } });
  }



  return (<>
    <Header onRenameImageset={(_, new_name) => {
      navigate('/imageset', { replace: true, state: { ...location.state, imageset_name: new_name, filter_name: filter.name } })
    }}
      onLoad={__load}
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
      <Grid size={9}>
        <Paper elevation={3} sx={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }}>
          {/* 这里放置图片 */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="concept or selection"
              variant="standard"
              size="small"
              value={filter.name}
              sx={{ m: 1, minWidth: 180 }}
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
            <div style={{ flex: 1 }}>
              <b>{ filter.images.length }</b> images.
            </div>
            <Slider
              size="small"
              defaultValue={column}
              value={column}
              onChange={(_, value) => setColumn(value as number)}
              valueLabelDisplay="off"
              sx={{ maxWidth: 120, margin: 1, }}
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
          />
        </Paper>
      </Grid>

      <Grid size={3} sx={{ height: '100%' }}>
        {/* 在这里路由 */}
        <Routes>
          {/* 这里就先不跳转, 在里面按照需要跳转 */}
          <Route path="/detail" element={<Editor filter={filter} onReload={load} />} />
          <Route path="/caption-editor" element={<CaptionEditor filter={filter} onReload={load} />} />
          <Route path="*" element={<Navigate to="/imageset/detail" replace state={location.state} />} />
        </Routes>

      </Grid>
    </Grid>


  </>);
}


export default ImageSet;

