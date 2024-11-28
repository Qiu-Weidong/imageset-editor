

// 包含一个header, header中包含数据集名称, 刷新按钮, 新建按钮, 保存按钮, 设置按钮, 帮助按钮

import { Box, Chip, Grid2 as Grid, IconButton, ImageList, ImageListItem, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { ImageState } from "../../app/imageSetSlice";

import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { CheckCircle, CloseFullscreen, Fullscreen } from "@mui/icons-material";



interface SelectableImageState extends ImageState {
  is_selected: boolean,
};


// 这个页面展示图片预览, 以及操作按钮, 点击操作按钮会跳转到对应的操作页面
function SelectableImageList({
  height,
  column = 8,
  selectable = false,
  enableFullscreen = false,
  badge = false,
  images,
  onChange = (_, __) => { }
}: {
  height: string | number,
  column: number,
  selectable?: boolean,
  images: ImageState[], // 传入一个图片列表
  enableFullscreen?: boolean,
  badge?: boolean,
  onChange?: (clicked_image: number, all_selected_image: ImageState[]) => void,
}) {

  const [openImageIndex, setOpenImageIndex] = useState(
    images.length <= 1 ? 0 : -1
  );

  // 这里必须要记录下来哪些图片是被选中了的
  const [seletableImages, setSelectableImages] = useState<SelectableImageState[]>(
    images.map(image => ({ ...image, is_selected: false }))
  );

  useEffect(() => {
    setSelectableImages(
      images.map(image => ({ ...image, is_selected: false }))
    );
  }, [images]);


  const click_handler = (index: number) => {
    // 如果不可选, 那么就直接返回即可
    if (!selectable) {
      return;
    }

    // 选择/取消选择图片
    const _images = seletableImages.map((image, i) =>
      i === index ? ({ ...image, is_selected: !image.is_selected }) : image
    );

    setSelectableImages(_images);
    const all_selected_images = _images.filter(image => image.is_selected);
    onChange(index, all_selected_images);
  };


  function ImageCard(props: { image: SelectableImageState, index: number, selectable: boolean, }) {
    const [hovered, setHovered] = useState(false);

    return (
      <ImageListItem key={props.image.path}
      >
        <img src={props.image.src}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          loading="lazy"
          onClick={() => click_handler(props.index)}
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
          props.selectable && props.image.is_selected ? <IconButton onClick={() => click_handler(props.index)}
            sx={{ position: 'absolute', top: 0, left: 0, }}
            size="small" color="error" > <CheckCircle /> </IconButton> : <></>
        }
        {
          enableFullscreen ? <IconButton sx={{
            position: 'absolute',
            top: 0,
            right: 0,
          }}
            size="small" color="info" onClick={() => setOpenImageIndex(props.index)}> <Fullscreen /> </IconButton> : <></>
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
    );
  }

  const paper = (
    <Paper elevation={3} sx={{ maxHeight: height, overflow: 'scroll', backgroundColor: "rgba(255, 255, 255, 0.7)" }} >
      <ImageList variant="masonry" cols={column} gap={4} style={{ marginTop: 0 }} >
        {
          seletableImages.map((image, index) => <ImageCard image={image} index={index} selectable={selectable} />)
        }
      </ImageList>
    </Paper>
  );

  const carousel = (
    <div style={{ position: 'relative' }}>
      <Carousel loop height={height} withIndicators initialSlide={openImageIndex}>
        {
          seletableImages.map((image, index) => <Carousel.Slide key={index}>
            <div style={{
              height: '100%', backgroundImage: `url('${image.src}')`,
              backgroundSize: 'cover', position: 'relative',
            }}>

              <img src={image.src} style={{
                objectFit: 'contain', width: '100%', height: '100%',
                background: 'rgba(255, 255, 255, .47)',
                backdropFilter: 'blur(48px)',
              }}
                onClick={() => click_handler(index)}
              />


              {/* <Grid spacing={1} container sx={{
                margin: 1,
                position: 'absolute',
                top: 0,
                left: 0,
              }}>
                <Chip label={image.filename} size="small" variant="filled" color="success" />
                <Chip label={image.concept} size="small" variant="filled" color="primary" />
                <Chip label={image.repeat} size="small" variant="filled" color="secondary" />
              </Grid> */}

              {
                selectable ? (
                  image.is_selected ? <IconButton onClick={() => click_handler(index) } sx={{
                  position: 'absolute', top: 0, left: 0,
                }} color="error" size="small"> <CheckCircle /> </IconButton> : <></>) : <></>
              }
            </div></Carousel.Slide>
          )
        }

      </Carousel>
      <div id="close-button" style={{ position: 'absolute', top: 0, right: 0, }} >
        <IconButton color="error" size="small" onClick={() => setOpenImageIndex(-1)}> <CloseFullscreen /> </IconButton>
      </div>
    </div>
  );

  return (<>
    <Box>
      {enableFullscreen ? (openImageIndex >= 0 ? carousel : paper) : paper}
    </Box>


  </>);
}

export default SelectableImageList;


