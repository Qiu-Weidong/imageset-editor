

// 包含一个header, header中包含数据集名称, 刷新按钮, 新建按钮, 保存按钮, 设置按钮, 帮助按钮

import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Divider, Grid2 as Grid, MenuItem, Select, Slider, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ImageState, removeFilter } from "../../app/imageSetSlice";
import api from "../../api";
import CreateDialog from "../dialog/CreateDialog";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { selectFilterNameList } from "./SelectableImageList";
import '@mantine/carousel/styles.css';
import ZoomableImageList from "./ZoomableImageList";
import AddImageDialog from "../dialog/AddImages";


const selectAllImages = createSelector(
  (state: RootState) => state.imageSet.filters,
  (filters) => {
    const image_list_map = new Map<string, ImageState[]>();
    for (const filter of filters) {
      // 第一步，根据所有的 concept 构造出 SelectableImageState.
      image_list_map.set(filter.name, filter.images);
    }
    return image_list_map;
  }
);



// 这个页面展示图片预览, 以及操作按钮, 点击操作按钮会跳转到对应的操作页面
function Detail(props: {
  onReload: () => void,
}) {
  const all_images = useSelector(selectAllImages);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // concept 的名称和重复次数共同定位到某个目录
  const { imageset_name, is_regular, filter_name, }: { imageset_name: string, is_regular: boolean, filter_name: string } = location.state;
  const filterNameList = useSelector(selectFilterNameList);
  const [images, setImages] = useState(all_images.get(filter_name) || []);
  const [filterName, setFilterName] = useState(filter_name);

  useEffect(() => {
    setFilterName(filter_name);
    setImages(all_images.get(filter_name) || []);
  }, [filter_name, all_images]);


  // 对话框
  const [createDialog, setCreateDialog] = useState(false);
  const [addImageDialog, setAddImageDialog] = useState(false);
  const [column, setColumn] = useState(8);
  const height = '80vh';



  return (<>
    {/* 正式内容 */}
    <Grid container spacing={2} >
      <Grid size={10}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            label="concept or selection"
            variant="standard"
            size="small"
            value={filterName}
            sx={{ m: 1, minWidth: 240 }}
            onChange={(event) => {
              setFilterName(event.target.value);
              setImages(all_images.get(event.target.value) || []);
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
        <ZoomableImageList images={images} height={height} enableFullscreen badge column={column} />
      </Grid>


      <Grid size={2} sx={{ height: '100%' }}>
        {/* 在这里定义相关按钮 */}
        <Stack spacing={1} divider={<Divider flexItem />}>
          <Grid container spacing={1}>
            <Button variant="contained" color="secondary"
              onClick={() => { navigate("/imageset/selection-editor", { state: { imageset_name, is_regular, filter_name: filterName } }) }}
            >create selection</Button>
            <Button variant="contained" color="secondary" onClick={() => setCreateDialog(true)}>add concept</Button>

            {
              filterName === '<all>' ? <></> : filterName.startsWith('<') ?
                (<>
                  <Button variant="contained" color="secondary"
                    onClick={() => {
                      const respone = window.confirm(`do you want to delete selection ${filterName}`);
                      if (respone) {
                        // 直接删除对应的 selection 即可
                        const name = filterName;
                        dispatch(removeFilter(name));
                        navigate("/imageset/detail", { replace: true, state: { ...location.state, filter_name: '<all>' } });
                      }
                    }}
                  >remove selection</Button>
                  <Button variant="contained" color="secondary"
                    onClick={() => {
                      const response = window.confirm(`do you want to delete all images in ${filterName}`);
                      if(response) {
                        const name = filterName;
                        dispatch(removeFilter(name));
                        // 删除图片
                        api.delete_images(images).then((result) => console.log(result)).finally(() => props.onReload());
                        navigate("/imageset/detail", { replace: true, state: { ...location.state, filter_name: '<all>' } });
                      }
                    }}
                  >delete images</Button>
                </>) :
                <>
                  <Button variant="contained" color="secondary"
                    onClick={() => {
                      const response = window.confirm(`this operation will delete the ${filterName} folder!`);
                      if (response) {
                        // 删除概念
                        api.delete_concept(imageset_name, is_regular, filterName).finally(() => {
                          // 已经将概念删除了, 我需要
                          dispatch(removeFilter(filterName));
                          navigate('/imageset/detail', { replace: true, state: { ...location.state, filter_name: '<all>' } });
                          props.onReload();
                        });
                      }
                    }}
                  >remove concept</Button>

                  <Button variant="contained" color="secondary" onClick={() => {
                    setAddImageDialog(true);
                  }}>add images</Button>
                </>
            }
          </Grid>
          <Grid spacing={1} container>
            <Button variant="contained" onClick={() => {
              api.interrogate(images, 'wd14-convnextv2.v1', 0.35).then((result) => console.log(result));
            }}>tagger</Button>
            <Button variant="contained">edit tag</Button>
            <Button variant="contained">detect similar images</Button>
          </Grid>

          <Grid spacing={1} container>
            <Button variant="contained" color="warning">convert</Button>
            <Button variant="contained" color="warning">rename</Button>
            <Button variant="contained" color="warning">move</Button>
          </Grid>

          <Grid spacing={1} container>
            <Button variant="contained" color="error">cut</Button>
            <Button variant="contained" color="error">resize</Button>
            <Button variant="contained" color="error">flip</Button>
            <Button variant="contained" color="error">rotate</Button>
          </Grid>

          <Grid spacing={1} container>
            <Button variant="contained" color="success">remove background</Button>
            <Button variant="contained" color="success">add background</Button>
          </Grid>
        </Stack>

      </Grid>
    </Grid>

    {/* 对话框 */}
    <CreateDialog open={createDialog} imageset_name={imageset_name} type={is_regular ? 'regular' : 'train'}
      onClose={() => { setCreateDialog(false); }} onSubmit={props.onReload} />
    <AddImageDialog open={addImageDialog} imageset_name={imageset_name} is_regular={is_regular} concept_folder={filterName} 
      onClose={() => { setAddImageDialog(false); }} onSubmit={props.onReload}
    />
  </>);
}

export default Detail;


