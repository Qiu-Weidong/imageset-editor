

// 包含一个header, header中包含数据集名称, 刷新按钮, 新建按钮, 保存按钮, 设置按钮, 帮助按钮

import { Autocomplete, Avatar, Box, Button, Chip, Divider, FormControl, Grid2 as Grid, IconButton, ImageList, ImageListItem, InputLabel, MenuItem, Paper, Select, Slider, TextField } from "@mui/material";
import { useRef, useState } from "react";
import { addFilter, ImageState } from "../../app/imageSetSlice";

import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { CheckCircle, CloseFullscreen, Fullscreen } from "@mui/icons-material";
import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import VisibilityIcon from '@mui/icons-material/Visibility';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearAllIcon from '@mui/icons-material/ClearAll';
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
    for (const [path, image] of images) {
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

interface LabelState {
  content: string,
  frequency: number,
};




function getAllLabelsFromImages(images: SelectableImageState[]) : LabelState[] {
  const label_count = new Map<string, number>();
  for (const image of images) {
    for (const caption of image.image.captions) {
      const cnt = label_count.get(caption);
      if (cnt) {
        label_count.set(caption, cnt + 1);
      } else {
        label_count.set(caption, 1);
      }
    }
  }

  const labels: LabelState[] = [];
  for (const [content, frequency] of label_count.entries()) {
    labels.push({ content, frequency, });
  }

  return labels;
}

function getAllImagesAndLabels(image_list_map: Map<string, SelectableImageState[]>, filtername: string) {
  const images = (filtername === "[selected images]" ?
    image_list_map.get('<all>')?.filter(image => image.is_selected) : image_list_map.get(filtername)) || [];

  const labels = getAllLabelsFromImages(images);

  return {
    images, labels,
  }
}


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

  const [filterName, setFilterName] = useState(filter_name);
  const [column, setColumn] = useState(12);


  // 获取到了所有的 concept 和 selection
  const image_list_map: Map<string, SelectableImageState[]> = useSelector(selectAllImages); // 所有图片
  const filterNameList = Array.from(image_list_map.keys());




  const data = useRef(getAllImagesAndLabels(image_list_map, filter_name));

  const [showCaptionFilter, setShowCaptionFilter] = useState(false);
  const [sortMethod, setSortMethod] = useState(0);
  const sortMethodList = [
    (a: LabelState, b: LabelState): number => b.frequency - a.frequency,
    (a: LabelState, b: LabelState): number => a.frequency - b.frequency,
    (a: LabelState, b: LabelState): number => b.content.localeCompare(a.content),
    (a: LabelState, b: LabelState): number => a.content.localeCompare(b.content),
  ];
  
  const [filteredImages, setFilteredImages] = useState<SelectableImageState[]>(data.current.images);
  const [selectedLabels, setSelectedLabels] = useState<LabelState[]>([]);
  const [selectableLabels, setSelectableLabels] = useState<LabelState[]>(data.current.labels.sort(sortMethodList[sortMethod]));

  
  const [openImageIndex, setOpenImageIndex] = useState(
    filteredImages.length <= 1 ? 0 : -1
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


  function updateImageListAndSelectableLabels(selectedLabels: LabelState[]) {
    // 注意, 是对所有的图片进行过滤, 提供一个反向过滤函数
    const images = data.current.images.filter(image => {
      for(const label of selectedLabels) {
        if(! image.image.captions.includes(label.content)) {
          return false;
        }
      }
      return true;
    });

    setFilteredImages(images);

    // 获取所有已选图片的标签, 如果是反向过滤,那么这里需要获取已选图片不包含的标签
    let caption_set = new Set<string>([]);
    for(const image of images) {
      caption_set = new Set([...caption_set, ...image.image.captions]);
    }
    // 去除所有已选标签
    for(const label of selectedLabels) {
      caption_set.delete(label.content);
    }

    // 最后计算得到可选标签
    const selectable_labels = data.current.labels.filter(label => caption_set.has(label.content)).sort(sortMethodList[sortMethod]);
    setSelectableLabels(selectable_labels);
  }

  function clearAllFilter() {
    // 清除所有过滤
    setSelectedLabels([]); // 删除所有已选标签
    setFilteredImages(data.current.images);
    setSelectableLabels(
      data.current.labels.sort(sortMethodList[sortMethod])
    );
  }

  function onLabelSelected(label: LabelState) {
    // 不要等state更新,先保存一份预先更新的 selectedLabels
    const _selectedLabels = [...selectedLabels, label].sort(sortMethodList[sortMethod]);
    // 将该标签标记为选中
    setSelectedLabels(_selectedLabels);

    updateImageListAndSelectableLabels(_selectedLabels);
  }

  function onLableUnselected(label: LabelState) {
    const _selectedLabels = selectedLabels.filter(_label => _label !== label);
    setSelectedLabels(_selectedLabels);
    updateImageListAndSelectableLabels(_selectedLabels);
  }



  function onChangeFilterName(name: string) {
    clearAllFilter();

    // 首先需要设置 filter name
    setFilterName(name);
    // 更新 data
    data.current = getAllImagesAndLabels(image_list_map, name);
    setFilteredImages(data.current.images);
    setSelectableLabels(data.current.labels.sort(sortMethodList[sortMethod]));
  }

  

  const filter = (<div style={{ marginBottom: 5, marginLeft: 2, marginRight: 2,}}>

    {/* 首先来一个 switch(正向过滤或负向过滤), 一个输入框(搜索标签, 自动补全),  一个下拉菜单(排序方式), 一个清除按钮(重置) */}
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>

      {/* 自动补全 */}
      <Autocomplete renderInput={(params) => <TextField {...params} label="检索标签" variant="standard" />}
        style={{ flexGrow: 0.8 }}
        options={selectableLabels}
        onChange={(_, value) => {
          /**注意检查是否为空, 如果不为空则选择 e.target.value 这个标签 */
          if (value) {
            onLabelSelected(value);
          }
        }}
        getOptionLabel={(label) => label.content} size='small'></Autocomplete>

      {/* 排序方式 */}
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-standard-label">排序方式</InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={sortMethod}

          onChange={(e) => {
            const index = e.target.value as number;
            setSortMethod(index);
            const sortMethod = sortMethodList[index];
            setSelectableLabels((labels) => labels.slice().sort(sortMethod));
            setSelectedLabels((labels) => labels.slice().sort(sortMethod));
          }}

          label="Age"
        >
          <MenuItem value={0}>频率(降序)</MenuItem>
          <MenuItem value={1}>频率(升序)</MenuItem>
          <MenuItem value={2}>字典(降序)</MenuItem>
          <MenuItem value={3}>字典(升序)</MenuItem>
        </Select>
      </FormControl>
      <IconButton size='small' onClick={clearAllFilter}
      > <ClearAllIcon /> </IconButton>
    </div>

    {
      // 已选标签
      selectedLabels.map((label, key) => <Chip avatar={<Avatar>{label.frequency}</Avatar>} key={key} color="primary"
        clickable variant='filled' size='small' label={label.content}
        onClick={() => onLableUnselected(label)} onDelete={() => onLableUnselected(label)} />)
    }
    {
      selectedLabels.length > 0 ? <Divider style={{ marginTop: 2 }} /> : ''
    }

    {
      // 可选标签
      selectableLabels.map((label, key) => <Chip avatar={<Avatar>{label.frequency}</Avatar>} key={key}
        clickable variant='outlined' size='small' label={label.content} onClick={() => onLabelSelected(label)} />)
    }
  </div>);

  return (<Paper elevation={3} sx={{ backgroundColor: 'rgba(255,255,255, 0.8)' }}>
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
          // 切换, 记得清除所有的过滤
          onChangeFilterName(event.target.value);
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
            onChangeFilterName('[selected images]');
          }}
        >查看已选图片</Button>
        <Button variant="contained" size="small" startIcon={<SelectAllIcon />}
          onClick={() => {
            const selected_images = filteredImages.map(image => {
              image.is_selected = true;
              return image;
            });
            setFilteredImages(selected_images);
          }}
        >全选以下图片</Button>

        <Button variant="contained" size="small" startIcon={<TabUnselectedIcon />}
          onClick={() => {
            const selected_images = filteredImages.map(image => {
              image.is_selected = false;
              return image;
            });
            setFilteredImages(selected_images);
          }}
        >将以下图片全部取消选择</Button>

        <Button variant="contained" size="small" startIcon={<FlipCameraAndroidIcon />}
          onClick={() => {
            const selected_images = filteredImages.map(image => {
              image.is_selected = !image.is_selected;
              return image;
            });
            setFilteredImages(selected_images);
          }}
        >反转选择</Button>

        <Button variant="contained" size="small" color="error" startIcon={<RestartAltIcon />}
          onClick={() => {
            image_list_map.get('<all>')?.forEach(image => image.is_selected = false);
            onChangeFilterName('<all>');
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
      <Button size="small" variant="text" onClick={() => setShowCaptionFilter((prev) => !prev)}
        endIcon={!showCaptionFilter ? <ExpandMoreIcon /> : <ExpandLessIcon />}>根据标签过滤</Button>
      <Slider
        size="small"
        defaultValue={column}
        value={column}
        onChange={(_, value) => setColumn(value as number)}
        valueLabelDisplay="off"
        sx={{  maxWidth: 120, m: 1 }}
        max={16}
        min={4}
      />
    </Box>
    <Box>
      {
        showCaptionFilter ? filter : <></>
      }
      {/* 应该将 carousel 盖在 paper 上面 */}
      <Box >
        {
          filteredImages.length > 0 ? <ImageList variant="masonry" cols={column} gap={4} style={{ marginTop: 0 }} >
            {
              filteredImages.map((image, index) => <ImageCard key={index} image={image} index={index} selectable={selectable} />)
            }
          </ImageList> : <>no images</>
        }
      </Box>
      {enableFullscreen && openImageIndex >= 0 ? <ImageCarousel images={filteredImages} openSlide={openImageIndex} /> : <></>}
    </Box>
  </Paper>);
}

export default SelectableImageList;


