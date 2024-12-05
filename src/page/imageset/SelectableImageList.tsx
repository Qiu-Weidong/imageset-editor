

// 包含一个header, header中包含数据集名称, 刷新按钮, 新建按钮, 保存按钮, 设置按钮, 帮助按钮

import { Box, Button, Chip, Grid2 as Grid, IconButton, ImageList, ImageListItem, MenuItem, Paper, Select, Slider } from "@mui/material";
import { useState } from "react";
import { addFilter, ImageState } from "../../app/imageSetSlice";

import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { CheckCircle, CloseFullscreen, Fullscreen } from "@mui/icons-material";
import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import VisibilityIcon from '@mui/icons-material/Visibility';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import TabUnselectedIcon from '@mui/icons-material/TabUnselected';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";


// 可以将这个选择器放到外面的页面中，将对应的 filter_name 的图片作为属性传入进来
const selectAllImages = createSelector(
  [
    (state: RootState) => state.imageSet.images,
    (state: RootState) => state.imageSet.filters,
  ],
  (images, filters) => {
    // 首先需要建立一个 image map
    const image_map = new Map<string, SelectableImageState>();
    for(const [path, image] of images) {
      image_map.set(path, { image, is_selected: false });
    }

    // 得到一个 SelectableImageState 的 filter
    const image_list_map = new Map<string, SelectableImageState[]>();
    

    for (const filter of filters) {
      const selectable_images: SelectableImageState[] = [];
      for (const image of filter.images) {
        const selectable_image = image_map.get(image.path);
        if (selectable_image) {
          selectable_images.push(selectable_image);
        }
      }
      image_list_map.set(filter.name, selectable_images);
    }
    return image_list_map;
  }
);


interface SelectableImageState {
  image: ImageState, // 必须包含一个指向原始图像的引用
  is_selected: boolean,
};


// 这个页面展示图片预览, 以及操作按钮, 点击操作按钮会跳转到对应的操作页面
function SelectableImageList({
  height,
  selectable = false,
  enableFullscreen = false,
  badge = false,
  filter_name,
}: {
  height: string | number,
  selectable?: boolean,
  enableFullscreen?: boolean,
  badge?: boolean,
  filter_name: string,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 获取到了所有的 concept 和 selection
  const image_list_map = useSelector(selectAllImages);
  const filterNameList = Array.from(image_list_map.keys());


  const [filterName, setFilterName] = useState(filter_name);
  const [column, setColumn] = useState(12);


  // 这个是用来显示的过滤的图片
  const [selectableImages, setSelectableImages] = useState<SelectableImageState[]>(
    image_list_map.get(filter_name) || []
  );
  const [openImageIndex, setOpenImageIndex] = useState(
    selectableImages.length <= 1 ? 0 : -1
  );


  function ImageCard(props: { image: SelectableImageState, index: number, selectable: boolean, }) {
    const [selected, setSelected] = useState(props.image.is_selected);
    const [hovered, setHovered] = useState(false);

    function click_handler() {
      if (!props.selectable) { return; }
      props.image.is_selected = !props.image.is_selected;
      // 这是修改自己的状态
      setSelected(props.image.is_selected);

    }

    return (
      <ImageListItem key={props.image.image.path}
      >
        <img src={props.image.image.thumbnail} // 显示缩略图算了
          alt={props.image.image.filename}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          loading="lazy"
          onClick={click_handler}
        // onDoubleClick={() => setOpenImageIndex(props.index)}
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
          }} >
            {
              badge ?
                <Grid spacing={1} container sx={{ margin: 1, position: 'absolute', bottom: 0, left: 0, }}>
                  <Chip label={props.image.image.filename} size="small" variant="filled" color="success" />
                  <Chip label={props.image.image.concept} size="small" variant="filled" color="primary" />
                  <Chip label={props.image.image.repeat} size="small" variant="filled" color="secondary" />
                </Grid> : <></>
            }

          </div> : <></>
        }



        {
          props.selectable && selected ? <IconButton onClick={click_handler}
            sx={{ position: 'absolute', top: 0, left: 0, }}
            size="small" color="error" > <CheckCircle /> </IconButton> : <></>
        }

        {
          enableFullscreen ? <IconButton
            onClick={() => setOpenImageIndex(props.index)}
            sx={{ position: 'absolute', top: 0, right: 0, }}
            size="small"
            color="info"
          >
            <Fullscreen />
          </IconButton> : <></>
        }
      </ImageListItem>
    );
  }


  function ImageSlider({ image, index }: { image: SelectableImageState, index: number }) {
    const [selected, setSelected] = useState(image.is_selected);
    return (
      <Carousel.Slide key={index}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <img src={image.image.src}
            alt={image.image.filename}
            style={{
              objectFit: 'contain', width: '100%', height: '100%',
              background: 'rgba(255, 255, 255, .27)',
              backdropFilter: 'blur(7px)',
            }}
            onClick={() => {
              image.is_selected = !image.is_selected;
              setSelected(image.is_selected);
            }}
          // onDoubleClick={() => setOpenImageIndex(-1)}
          />
          {selected ? <IconButton sx={{ position: 'absolute', top: 0, left: 0, }} color="error"> <CheckCircle /> </IconButton> : <></>}
        </div>

      </Carousel.Slide>
    );
  }


  function ImageCarousel({ images, openSlide }: { images: SelectableImageState[], openSlide: number }) {
    return (
      <div style={{ position: 'relative' }}>
        <Carousel loop height={height} initialSlide={openSlide} withIndicators style={{ marginTop: `-${height}` }}
        >
          {
            images.map((image, index) =>
              <ImageSlider image={image} index={index} />
            )
          }
        </Carousel>

        {/* 添加一个缩小按钮 */}
        <IconButton sx={{ position: 'absolute', top: 0, right: 0 }} color="success" onClick={() => setOpenImageIndex(-1)}> <CloseFullscreen /> </IconButton>
      </div>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          label="concept or selection"
          variant="standard"
          size="small"
          value={filterName}
          sx={{ m: 1, minWidth: 160 }}
          onChange={(event) => {
            setFilterName(event.target.value);
            // 记得切换 selectedImages
            const _images = image_list_map.get(event.target.value) || [];
            setSelectableImages(_images);
          }}
        >
          {
            filterNameList.map((name, index) => <MenuItem key={index} value={name}>
              {name}
            </MenuItem>)
          }

          <MenuItem value="[selected images]" disabled key={filterName.length + 5}  >[selected images]</MenuItem>
        </Select>

        <Grid container spacing={1} sx={{ flex: 1, }}>
          <Button variant="contained" size="small" startIcon={<VisibilityIcon />}
            onClick={() => {
              const selected_images = image_list_map.get('<all>')?.filter(image => image.is_selected) || [];
              setSelectableImages(selected_images);
              setFilterName('[selected images]');
            }}
          >查看已选图片</Button>
          <Button variant="contained" size="small" startIcon={<SelectAllIcon />}
            onClick={() => {
              const selected_images = selectableImages.map(image => {
                image.is_selected = true;
                return image;
              });
              setSelectableImages(selected_images);
            }}
          >全选以下图片</Button>

          <Button variant="contained" size="small" startIcon={<TabUnselectedIcon />}
            onClick={() => {
              const selected_images = selectableImages.map(image => {
                image.is_selected = false;
                return image;
              });
              setSelectableImages(selected_images);
            }}
          >将以下图片全部取消选择</Button>

          <Button variant="contained" size="small" startIcon={<FlipCameraAndroidIcon />}
            onClick={() => {
              const selected_images = selectableImages.map(image => {
                image.is_selected = !image.is_selected;
                return image;
              });
              setSelectableImages(selected_images);
            }}
          >反转选择</Button>

          <Button variant="contained" size="small" color="error" startIcon={<RestartAltIcon />}
            onClick={() => {
              image_list_map.get('<all>')?.forEach(image => image.is_selected = false);
              setFilterName('<all>');
              setSelectableImages(image_list_map.get('<all>') || []);
            }}
          >重置</Button>
          <Button variant="contained" size="small" color="secondary" startIcon={<ChevronLeftIcon />}
            onClick={() => {
              image_list_map.get('<all>')?.forEach(image => image.is_selected = false);
              navigate(-1);
            }}
          >返回</Button>
          <Button variant="contained" size="small" color="success" startIcon={<AddCircleIcon />}
            onClick={() => {
              const images: ImageState[] = image_list_map.get('<all>')?.filter(image => image.is_selected).map(image => image.image) || [];
              if (images.length <= 0) {
                // 警告
                window.alert('you have not select any images');
                return;
              }

              let input = window.prompt('create a new selection', 'input your selection name');
              while (input && input === 'all') {
                input = window.prompt('create a new selection', 'input your selection name, can not be "all"');
              }


              if (input) {
                const name = `<${input}>`;

                dispatch(addFilter({
                  name,
                  images,
                  concept: null,
                }));
                navigate("/imageset/detail", { replace: true, state: { ...location.state, filter_name: name } });
              }
            }}
          >创建</Button>
        </Grid>
        <Slider
          size="small"
          defaultValue={column}
          value={column}
          onChange={(_, value) => setColumn(value as number)}
          valueLabelDisplay="off"
          sx={{ maxWidth: 120 }}
          max={16}
          min={4}
        />
      </Box>


      <Box>
        {/* 应该将 carousel 盖在 paper 上面 */}
        <Paper elevation={3} sx={{ maxHeight: height, height: height, overflow: 'scroll', backgroundColor: "rgba(255, 255, 255, 0.7)", }} >
          {
            selectableImages.length > 0 ? <ImageList variant="masonry" cols={column} gap={4} style={{ marginTop: 0 }} >
              {
                selectableImages.map((image, index) => <ImageCard key={index} image={image} index={index} selectable={selectable} />)
              }
            </ImageList> : <>no images</>
          }
        </Paper>

        {enableFullscreen && openImageIndex >= 0 ? <ImageCarousel images={selectableImages} openSlide={openImageIndex} /> : <></>}

      </Box></>
  );
}

export default SelectableImageList;


