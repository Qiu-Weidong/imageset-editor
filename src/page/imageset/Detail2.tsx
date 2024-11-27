

// 包含一个header, header中包含数据集名称, 刷新按钮, 新建按钮, 保存按钮, 设置按钮, 帮助按钮

import { useLocation, useNavigate } from "react-router-dom";
import Header from "../header/Header";
import { Backdrop, Box, Button, Chip, CircularProgress, Divider, FormControl, Grid2 as Grid, ImageList, ImageListItem, MenuItem, Paper, Select, Slider, Stack, Toolbar } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api";
import { useDispatch } from "react-redux";
import { ImageState, setImageSet } from "../../app/imageSetSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";



function ImageCard(props: { image: ImageState }) {
  const [hovered, setHovered] = useState(false);

  return (

    <ImageListItem key={props.image.path}>
      <img src={props.image.src}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        loading="lazy"
      />
      {
        hovered ? <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom,  rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.25) 30%, rgba(0,0,0,0) 75%)',
          pointerEvents: 'none',
          // border: "3px solid purple",
        }}>
          <Grid spacing={1} container sx={{ margin: 1, }}>
            <Chip label={props.image.filename} size="small" variant="filled" color="success" />
            <Chip label={props.image.concept} size="small" variant="filled" color="primary" />
            <Chip label={props.image.repeat} size="small" variant="filled" color="secondary" />
          </Grid>

        </div> : <></>
      }


    </ImageListItem>
  );
}





// 这个页面展示图片预览, 以及操作按钮, 点击操作按钮会跳转到对应的操作页面
function Detail() {
  // imageset name, train/reg
  const location = useLocation();
  const dispatch = useDispatch();

  // concept 的名称和重复次数共同定位到某个目录
  const { imageset_name, isRegular, concept, repeat }: { imageset_name: string, isRegular: boolean, concept: string, repeat: number } = location.state;


  const filterNameList = useSelector((state: RootState) => state.imageSet.filters.map(item => item.name));
  const [filterName, setFilterName] = useState(`${repeat}_${concept}`);
  const [column, setColumn] = useState(12);

  // 渲染这里的 filter 中的所有图片即可
  const images = useSelector((state: RootState) => {
    return state.imageSet.filters.find((item) => item.name === filterName)
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 加载 ImageSet
    load();
  }, [imageset_name, isRegular]);

  const navigate = useNavigate();

  async function load() {
    // 加载数据
    setLoading(true);
    api.load(imageset_name, isRegular).then((result) => {
      // 设置 redux
      dispatch(setImageSet(result));
    }).catch((error: any) => {
      console.error(error);
    }).finally(() => {
      setLoading(false);
    });

  }

  return (<>
    <Header onRenameImageset={(_, new_name) => {
      navigate('/detail', { replace: true, state: { ...location.state, imageset_name: new_name, } })
    }}
      onLoad={load}
    />


    <Backdrop
      sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 10 })}
      open={loading}
    >
      <CircularProgress color="inherit" />
    </Backdrop>


    {/* 先占位 */}
    <Toolbar />

    {/* 正式内容 */}
    <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
              setFilterName(event.target.value)
            }}
          >
            {
              filterNameList.map(name => <MenuItem value={name}>{name}</MenuItem>)
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

        <Paper elevation={3} sx={{ maxHeight: '88vh', overflow: 'scroll', backgroundColor: "rgba(255, 255, 255, 0.7)" }} >
          {
            images ? <ImageList variant="masonry" cols={column} gap={4} style={{ marginTop: 0 }} >
              {
                images.images?.map(image => <ImageCard image={image} />)
              }
            </ImageList> : <></>
          }
        </Paper>

      </Grid>



      <Grid size={2} sx={{ height: '100%' }}>
        {/* 在这里定义相关按钮 */}
        <Stack spacing={1} divider={<Divider flexItem />}>
          <Grid container>
            <Button variant="contained" color="secondary">edit selection</Button>
          </Grid>
          <Grid spacing={1} container>
            <Button variant="contained">tagger</Button>
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

  </>);
}

export default Detail;


