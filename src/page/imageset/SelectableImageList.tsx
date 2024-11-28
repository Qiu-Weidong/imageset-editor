

// 包含一个header, header中包含数据集名称, 刷新按钮, 新建按钮, 保存按钮, 设置按钮, 帮助按钮

import { Box, Chip, Grid2 as Grid, IconButton, ImageList, ImageListItem, MenuItem, Paper, Select, Slider } from "@mui/material";
import { useEffect, useState } from "react";
import { ImageState } from "../../app/imageSetSlice";

import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { CheckCircle, CloseFullscreen, Fullscreen } from "@mui/icons-material";
import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";


const selectFilterNameList = createSelector(
  (state: RootState) => state.imageSet.filters,
  (filters) => filters.map(item => item.name)
);


const selectAllImages = createSelector(
  (state: RootState) => state.imageSet.filters,
  (filters) => {
    const image_list_map = new Map<string, SelectableImageState[]>();
    for (const filter of filters) {
      // 第一步，根据所有的 concept 构造出 SelectableImageState.
      if (!filter.name.startsWith('<')) {
        const selectable_images = filter.images.map(item => ({ image: item, is_selected: false }));
        image_list_map.set(filter.name, selectable_images);
      }
    }

    for (const filter of filters) {
      if (filter.name.startsWith("<")) {
        const selectable_images = [];
        for (const image of filter.images) {
          const selectable_image = image_list_map.get(`${image.repeat}_${image.concept}`)?.find(item => item.image === image);
          if (selectable_image) {
            selectable_images.push(selectable_image);
          }
        }
        image_list_map.set(filter.name, selectable_images);
      }
    }
    // 并不会反复调用
    console.log('create image_list_map = ', image_list_map);
    return image_list_map;
  }
);

interface SelectableImageState {
  image: ImageState,
  is_selected: boolean,
};


// 这个页面展示图片预览, 以及操作按钮, 点击操作按钮会跳转到对应的操作页面
function SelectableImageList({
  height,
  selectable = false,
  enableFullscreen = false,
  badge = false,
  filter_name,
  onChange = (_, __) => { },
  onFilterNameChange = (_: string) => { },
}: {
  height: string | number,
  selectable?: boolean,
  enableFullscreen?: boolean,
  badge?: boolean,
  filter_name: string,
  onChange?: (clicked_image: number, all_selected_image: SelectableImageState[]) => void,
  onFilterNameChange?: (newName: string) => void
}) {

  // 获取到了所有的 concept 和 selection
  const filterNameList = useSelector(selectFilterNameList);
  const [column, setColumn] = useState(8);

  // 第一步，构建图片的 map

  // 用一个 state 来保存所有图片的 SelectableImageState，保存为一个map
  // 根据filter_name从map中选择当前要展示的图片，这是未过滤的 images
  // 根据过滤器对 images 进行过滤
  // 
  // interface SelectableImageState { image: ImageState, is_selected: boolean, }
  // 

  // 首先用一个 state 来保存要展示的图片，即过滤得到的图片

  // 使用这个来保存应该就可以了 ?
  const image_list_map = useSelector(selectAllImages);


  // 离开的时候清除所有选择即可。


  // 这个是用来显示的过滤的图片
  const [seletableImages, setSelectableImages] = useState<SelectableImageState[]>(
    image_list_map.get(filter_name) || []
  );


  const [openImageIndex, setOpenImageIndex] = useState(
    seletableImages.length <= 1 ? 0 : -1
  );


  function ImageCard(props: { image: SelectableImageState, index: number, selectable: boolean, }) {
    const [selected, setSelected] = useState(props.image.is_selected);
    const [hovered, setHovered] = useState(false);
    function click_handler() {
      if (!props.selectable) { return; }
      // 改不改无所谓
      props.image.is_selected = !props.image.is_selected;

      // 这是修改自己的状态
      setSelected(props.image.is_selected);
      // console.log(image_list_map);
      // 通知父组件
    }

    return (
      <>
        <ImageListItem key={props.image.image.path}
        >
          <img src={props.image.image.thumbnail} // 显示缩略图算了
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
            props.selectable && selected ? <IconButton onClick={click_handler}
              sx={{ position: 'absolute', top: 0, left: 0, }}
              size="small" color="error" > <CheckCircle /> </IconButton> : <></>
          }
          {
            enableFullscreen ? <IconButton sx={{
              position: 'absolute',
              top: 0,
              right: 0,
            }}
              size="small" color="info" onClick={() => {
                setOpenImageIndex(props.index)
              }}> <Fullscreen /> </IconButton> : <></>
          }

          {
            badge ?
              <Grid spacing={1} container sx={{ margin: 1, position: 'absolute', bottom: 0, left: 0, }}>
                <Chip label={props.image.image.filename} size="small" variant="filled" color="success" />
                <Chip label={props.image.image.concept} size="small" variant="filled" color="primary" />
                <Chip label={props.image.image.repeat} size="small" variant="filled" color="secondary" />
              </Grid> : <></>
          }



        </ImageListItem>
      </>
    );
  }

  const imagelist = (
    <ImageList variant="masonry" cols={column} gap={4} style={{ marginTop: 0 }} >
      {
        seletableImages.map((image, index) => <ImageCard key={index} image={image} index={index} selectable={selectable} />)
      }
    </ImageList>
  );

  function ImageSlider(props: { image: SelectableImageState, index: number, selectable: boolean, }) {
    const [selected, setSelected] = useState(props.image.is_selected);

    return (<Carousel.Slide key={props.index}>
      <div style={{
        height: '100%', backgroundImage: `url('${props.image.image.src}')`,
        backgroundSize: 'cover', position: 'relative',
      }}>

        <img src={props.image.image.src} style={{
          objectFit: 'contain', width: '100%', height: '100%',
          background: 'rgba(255, 255, 255, .47)',
          backdropFilter: 'blur(48px)',
        }}
          onClick={() => {
            if (!props.selectable) { return; }
            // 改不改无所谓
            props.image.is_selected = !props.image.is_selected;

            // 这是修改自己的状态
            setSelected(props.image.is_selected);
            // console.log(image_list_map);
            // 通知父组件
          }}
        />

        {
          selectable ? (
            selected ? <IconButton onClick={() => { }} sx={{
              position: 'absolute', top: 0, left: 0,
            }} color="error" size="small"> <CheckCircle /> </IconButton> : <></>) : <></>
        }
      </div></Carousel.Slide>
    );
  }

  const carousel = (
    <div style={{ position: 'absolute', top: 0, left: 0 }}>
      <Carousel loop height={height} withIndicators initialSlide={openImageIndex}>
        {
          seletableImages.map((image, index) => 
            <ImageSlider image={image} index={index} selectable={selectable} />

          )
        }

      </Carousel>
      <div style={{ position: 'absolute', top: 0, right: 0, }} >
        <IconButton color="error" size="small" onClick={() => setOpenImageIndex(-1)}> <CloseFullscreen /> </IconButton>
      </div>
    </div>
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

            // 记得切换 selectedImages
            setSelectableImages(
              image_list_map.get(event.target.value) || []
            );
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

        {/* {enableFullscreen ? (openImageIndex >= 0 ? carousel : paper) : paper} */}
        <Paper elevation={3} sx={{ maxHeight: height, overflow: 'scroll', backgroundColor: "rgba(255, 255, 255, 0.7)", }} >
          {imagelist}

        </Paper>
        {enableFullscreen && openImageIndex >= 0 ? carousel : <></>}

      </Box></>
  );
}

export default SelectableImageList;


