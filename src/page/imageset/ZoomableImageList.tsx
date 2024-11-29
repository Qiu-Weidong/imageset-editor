

// 包含一个header, header中包含数据集名称, 刷新按钮, 新建按钮, 保存按钮, 设置按钮, 帮助按钮

import { Box, Chip, Grid2 as Grid, ImageList, ImageListItem, MenuItem, Paper, Select, Slider } from "@mui/material";
import { useState } from "react";
import { ImageState } from "../../app/imageSetSlice";

import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";


const selectFilterNameList = createSelector(
  (state: RootState) => state.imageSet.filters,
  (filters) => filters.map(item => item.name)
);

// 创建 memoized 选择器
const selectImagesByFilterName = (filterName: string) =>
  createSelector(
    (state: RootState) => state.imageSet.filters,
    (filters) => {
      const filter = filters.find(item => item.name === filterName);
      return filter ? filter.images : [];
    }
  );



// 这个页面展示图片预览, 以及操作按钮, 点击操作按钮会跳转到对应的操作页面
function ZoomableImageList({
  height,
  enableFullscreen = false,
  badge = false,
  filter_name,
  onFilterNameChange = (_: string) => { },
}: {
  height: string | number,

  enableFullscreen?: boolean,
  badge?: boolean,
  filter_name: string,

  onFilterNameChange?: (newName: string) => void
}) {

  // 获取到了所有的 concept 和 selection
  const filterNameList = useSelector(selectFilterNameList);
  const [column, setColumn] = useState(8);

  const images = useSelector(selectImagesByFilterName(filter_name));


  const [openImageIndex, setOpenImageIndex] = useState(
    images.length <= 1 ? 0 : -1
  );


  function ImageCard(props: { image: ImageState, index: number, }) {
    const [hovered, setHovered] = useState(false);
    function click_handler() {
      setOpenImageIndex(props.index);
    }

    return (
      <>
        <ImageListItem key={props.image.path}
        >
          <img src={props.image.thumbnail} // 显示缩略图算了
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            loading="lazy"
            onClick={click_handler}
          />

          {/* 蒙版就只是蒙版 */}
          {
            hovered ? <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom,  rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.25) 30%, rgba(0,0,0,0) 75%)',
              pointerEvents: 'none',
            }} /> : <></>
          }

          {
            badge ?
              <Grid spacing={1} container sx={{ margin: 1, position: 'absolute', bottom: 0, left: 0, }}>
                <Chip label={props.image.filename} size="small" variant="filled" color="success" />
                <Chip label={props.image.concept} size="small" variant="filled" color="primary" />
                <Chip label={props.image.repeat} size="small" variant="filled" color="secondary" />
              </Grid> : <></>
          }



        </ImageListItem>
      </>
    );
  }

  const imagelist = (
    <ImageList variant="masonry" cols={column} gap={4} style={{ marginTop: 0 }} >
      {
        images.map((image, index) => <ImageCard key={index} image={image} index={index} />)
      }
    </ImageList>
  );

  function ImageCarousel({ images, openSlide }: { images: ImageState[], openSlide: number }) {
    return (
      <Carousel loop height={height} initialSlide={openSlide} style={{ marginTop: `-${height}` }}>
        {
          images.map((image, index) =>
            <Carousel.Slide key={index}>
              <img src={image.src} style={{
                objectFit: 'contain', width: '100%', height: '100%',
                background: 'rgba(255, 255, 255, .2)',
                backdropFilter: 'blur(4px)',
              }}
                onClick={() => setOpenImageIndex(-1)}
              />
            </Carousel.Slide>
          )
        }
      </Carousel>

    );
  }


  const carousel = (
    <ImageCarousel images={images} openSlide={openImageIndex} />
  );

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          label="concept or selection"
          variant="standard"
          size="small"
          value={filter_name}
          sx={{ m: 1, minWidth: 240 }}
          onChange={(event) => {

            onFilterNameChange(event.target.value);

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


      <Box sx={{ position: 'relative' }}>
        {/* 应该将 carousel 盖在 paper 上面 */}
        <Paper elevation={3} sx={{ maxHeight: height, overflow: 'scroll', backgroundColor: "rgba(255, 255, 255, 0.7)", }} >
          {imagelist}
        </Paper>
        {enableFullscreen && openImageIndex >= 0 ? carousel : <></>}

      </Box></>
  );
}

export default ZoomableImageList;


