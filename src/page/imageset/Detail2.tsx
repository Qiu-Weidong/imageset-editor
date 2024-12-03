

// 包含一个header, header中包含数据集名称, 刷新按钮, 新建按钮, 保存按钮, 设置按钮, 帮助按钮

import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Chip, Divider, Grid2 as Grid, IconButton, ImageList, ImageListItem, MenuItem, Paper, Select, Slider, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ImageState, removeFilter } from "../../app/imageSetSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import api from "../../api";
import CreateDialog from "../dialog/CreateDialog";

import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { CloseFullscreen } from "@mui/icons-material";


// 这个页面展示图片预览, 以及操作按钮, 点击操作按钮会跳转到对应的操作页面
function Detail(props: {
  onReload: () => void,
}) {

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // concept 的名称和重复次数共同定位到某个目录
  const { imageset_name, is_regular, filter_name, }: { imageset_name: string, is_regular: boolean, filter_name: string } = location.state;


  const filterNameList = useSelector((state: RootState) => state.imageSet.filters.map(item => item.name));
  const [filterName, setFilterName] = useState(filter_name);
  // 渲染这里的 filter 中的所有图片即可
  const images = useSelector((state: RootState) => {
    return state.imageSet.filters.find((item) => item.name === filterName)?.images || [];
  });
  const [openImageIndex, setOpenImageIndex] = useState(
    images.length > 0 ? -1 : 0
  );


  function ImageCard(props: { image: ImageState, index: number }) {
    const [hovered, setHovered] = useState(false);

    return (

      <ImageListItem key={props.image.path}>
        <img src={props.image.src} alt="load fail"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          loading="lazy"
          onClick={() => {

            console.log('clicked image at ', props.index);
            setOpenImageIndex(props.index);


          }}
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


  const [column, setColumn] = useState(12);



  useEffect(() => {
    setFilterName(filter_name);
  }, [filter_name]);



  const [createDialog, setCreateDialog] = useState(false);


  const height = '88vh';


  const paper = (
    <Paper elevation={3} sx={{ maxHeight: height, overflow: 'scroll', backgroundColor: "rgba(255, 255, 255, 0.7)" }} >
      <ImageList variant="masonry" cols={column} gap={4} style={{ marginTop: 0 }} >
        {
          images.map((image, index) => <ImageCard image={image} index={index} />)
        }
      </ImageList>
    </Paper>
  );

  const carousel = (<>
    <div style={{ position: 'relative' }}>
      <Carousel loop height={height} withIndicators initialSlide={openImageIndex}>
        {
          images.map((image, index) => <Carousel.Slide key={index}>
            <div style={{
              height: '100%', backgroundImage: `url('${image.src}')`,
              backgroundSize: 'cover', position: 'relative',
            }}>
              <img src={image.src} alt="load fail" style={{
                objectFit: 'contain', width: '100%', height: '100%',
                background: 'rgba(255, 255, 255, .47)',
                backdropFilter: 'blur(48px)',
              }} />


              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
              }}>
                <Grid spacing={1} container sx={{ margin: 1, }}>
                  <Chip label={image.filename} size="small" variant="filled" color="success" />
                  <Chip label={image.concept} size="small" variant="filled" color="primary" />
                  <Chip label={image.repeat} size="small" variant="filled" color="secondary" />
                </Grid>

              </div>
            </div>


          </Carousel.Slide>
          )

        }

      </Carousel>
      <div id="close-button" style={{ position: 'absolute', top: 0, right: 0, }} >
        <IconButton color="error" size="small" onClick={() => setOpenImageIndex(-1)}> <CloseFullscreen /> </IconButton>
      </div>
    </div>
  </>);

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
              location.state.filter_name = event.target.value;
            }}
          >
            {
              filterNameList.map(name => <MenuItem value={name}>
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

        <Box sx={{ maxHeight: height, }}>
          {openImageIndex >= 0 ? carousel : paper}
        </Box>

      </Grid>



      <Grid size={2} sx={{ height: '100%' }}>
        {/* 在这里定义相关按钮 */}
        <Stack spacing={1} divider={<Divider flexItem />}>
          <Grid container spacing={1}>
            <Button variant="contained" color="secondary">edit selection</Button>
            <Button variant="contained" color="secondary" onClick={() => setCreateDialog(true)}>add concept</Button>
            {
              filterName === '<all>' ? <></> : filterName.startsWith('<') ?
                <Button variant="contained" color="secondary"
                  onClick={() => {
                    // 直接删除对应的 selection 即可
                    dispatch(removeFilter(filterName));
                    navigate("/imageset/detail", { replace: true, state: { ...location.state, filter_name: filterNameList[0], } });
                  }}
                >remove selection</Button> :
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
            }
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



    {/* 对话框 */}
    <CreateDialog open={createDialog} imageset_name={imageset_name} type={is_regular ? 'regular' : 'train'}
      onClose={() => { setCreateDialog(false); props.onReload() }} />
  </>);
}

export default Detail;


