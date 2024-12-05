import { Backdrop, Button, Card, CardActions, CardContent, Chip, CircularProgress, IconButton, TextField, Typography } from "@mui/material";
import { FilterState, ImageState } from "../../app/imageSetSlice";
import { useEffect, useState } from "react";
import DoneIcon from '@mui/icons-material/Done';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useNavigate } from "react-router-dom";
import api from "../../api";



function EditableChip(props: {
  caption: string,
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning',
  editable: boolean, // 是否默认启动编辑(当需要添加的时候则默认启动编辑)

  onChange: (before: string, after: string) => void, // 将 before 标签修改为了 after 标签
  onRemove: (caption: string) => void, // 删除了 caption 标签
}) {
  const [inputValue, setInputValue] = useState(props.caption);
  const [edit, setEdit] = useState(props.editable);

  useEffect(() => { setInputValue(props.caption) }, [props.caption]);

  function finishEdit() {
    setEdit(false);
    if (!inputValue || !inputValue.trim()) {
      // 放弃修改
      setInputValue(props.caption);
    } else {
      // 触发修改事件
      props.onChange(props.caption, inputValue.trim())
    }
  }

  const label = edit ? (<div style={{ position: 'relative' }}>
    <span style={{ display: 'inline-block', width: '100%', height: '100%', visibility: 'hidden' }}>_{inputValue}</span>
    <input value={inputValue} style={{
      backgroundColor: 'transparent', outline: 'none',
      border: 'none', width: '100%', height: '100%', display: 'inline-block',
      position: 'absolute', left: 0, top: 0, color: 'inherit',
    }} autoFocus
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={finishEdit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          finishEdit();
          event.preventDefault();
        }
      }}
    />
  </div>) : inputValue;

  return (<Chip size="small" variant="filled" color={props.color} style={{ marginRight: 2 }}
    onDoubleClick={() => setEdit(true)}
    clickable={!edit}
    label={label}
    deleteIcon={edit ? <DoneIcon /> : undefined}
    onDelete={() => {
      if (edit) {
        // 完成编辑
        finishEdit();
      } else {
        // 执行删除操作
        props.onRemove(props.caption);
      }
    }}
  />);
}

function CaptionEditorBox(props: {
  // 将图片的标签取交集或者并集
  captions: string[], // 要编辑的所有标签
  addable?: boolean, // 通过父组件传入, 配合 onAddCaption 事件

  onAddCaption?: (caption: string) => void,
  onRemoveCaption?: (caption: string) => void,
  onChangeCaption?: (before: string, after: string) => void,
} = {
    addable: false,
    captions: [],
  }) {
  // 用于过滤标签
  const [filterText, setFilterText] = useState<string>('');
  const [filteredCaptions, setFilteredCaptions] = useState<string[]>(props.captions);

  useEffect(() => {
    setFilterText('');
    setFilteredCaptions(props.captions);
  }, [props.captions]);

  // 控制添加部分的显示
  const [adding, setAdding] = useState(false);

  const captionList = (filteredCaptions.map(caption =>
    <EditableChip editable={false} color="info" caption={caption}
      onRemove={(removedCaption: string) => {
        // 向上传递
        props.onRemoveCaption?.(removedCaption);
      }}

      onChange={(before, after) => {
        props.onChangeCaption?.(before, after);
      }} />));


  return (<div style={{ marginBottom: 2, marginTop: 2 }}>

    {/* 过滤器  */}
    <TextField fullWidth size="small" variant="standard" label="filter" value={filterText} onChange={(e) => {
      setFilterText(e.target.value);
      const filtered = props.captions.filter(caption => caption.toLocaleLowerCase().includes(e.target.value.toLocaleLowerCase()));
      setFilteredCaptions(filtered);
    }} />

    <div style={{ maxHeight: '30vh', overflowY: 'auto', }}>

      {
        captionList
      }
      {
        // 只有当可以添加标签的时候才显示添加按钮
        props.addable ? (adding ? <EditableChip editable={true} color="info" caption="add new label"
          onRemove={() => { }}
          onChange={(_, after) => {/**新建标签 */
            setAdding(false);
            props.onAddCaption?.(after);
          }} />
          : <IconButton color="primary" size="small" onClick={() => setAdding(true)}><AddIcon /></IconButton>) : ''
      }


    </div>
  </div>);
}



function intersection<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(element => array2.includes(element));
}

function union<T>(arr1: T[], arr2: T[]): T[] {
  return [...new Set([...arr1, ...arr2])];
}


function getAllCaptionsFromFilter(filter: FilterState): Map<string, string[]> {
  const result = new Map<string, string[]>();
  for (const image of filter.images) {
    result.set(image.path, image.captions);
  }
  return result;
}

function getTotalCaptionsAndCommonCaptionsFromImageCaptions(image_captions: Map<string, string[]>): { total_captions: string[], common_captions: string[] } {
  let total_captions: string[] = [];
  for (const captions of image_captions.values()) {
    total_captions = union(total_captions, captions);
  }

  let common_captions: string[] = [...total_captions];
  for (const captions of image_captions.values()) {
    common_captions = intersection(common_captions, captions);
  }

  return {
    total_captions, common_captions,
  };
}


interface CaptionState {
  total_captions: string[],
  common_captions: string[],
  image_captions: Map<string, string[]>,
}

function CaptionEditor({
  filter, // filter 决定了要当前编辑的对象, 但是我不能直接在 filter 上面进行修改
  onReload, // 还是需要一个 onReload
}: {
  filter: FilterState,
  onReload: () => Promise<void>,
}) {
  // 点击保存会直接保存到磁盘, 然后直接从磁盘重新加载即可
  const navigate = useNavigate();

  // 第一步, 计算所有标签的交集
  const image_captions = getAllCaptionsFromFilter(filter);
  const { total_captions, common_captions } = getTotalCaptionsAndCommonCaptionsFromImageCaptions(image_captions);

  const [captionState, setCaptionState] = useState<CaptionState>({
    total_captions, common_captions, image_captions
  });

  const openImage = useSelector((state: RootState) => state.openImage.image);



  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);


  async function save() {
    setLoading(true);
    // 调用保存api
    await api.save_tags(captionState.image_captions);
    await onReload();
    setLoading(false);

    setDirty(false);
  }

  // 除非 filter 改变
  useEffect(() => {
    if (dirty) {
      const response = window.confirm("do you want to save your work?");
      if (response) { save(); }
    }
    const image_captions = getAllCaptionsFromFilter(filter);
    const { total_captions, common_captions } = getTotalCaptionsAndCommonCaptionsFromImageCaptions(image_captions);
    setCaptionState({
      image_captions, total_captions, common_captions,
    });
  }, [filter]);

  function updateImageCaptions(image: ImageState, captions: string[]) {
    setDirty(true);
    // 直接修改对应图片的字幕
    const image_captions = new Map(captionState.image_captions);
    image_captions.set(image.path, captions);
    const { total_captions, common_captions } = getTotalCaptionsAndCommonCaptionsFromImageCaptions(image_captions);
    setCaptionState({
      image_captions, total_captions, common_captions,
    });
  }

  function addCaption(caption: string) {
    setDirty(true);
    // 所有图片都添加一个 caption
    const image_captions = new Map<string, string[]>();
    for (const [key, value] of captionState.image_captions) {
      image_captions.set(key, Array.from(new Set([...value, caption])));
    }
    const { total_captions, common_captions } = getTotalCaptionsAndCommonCaptionsFromImageCaptions(image_captions);
    setCaptionState({
      image_captions, total_captions, common_captions,
    });
  }

  function removeCaption(caption: string) {
    setDirty(true);
    // 所有图片都删除一个 caption
    const image_captions = new Map<string, string[]>();
    for (const [key, value] of captionState.image_captions) {
      const captions = value.filter(item => item !== caption);
      image_captions.set(key, Array.from(new Set(captions)));
    }
    const { total_captions, common_captions } = getTotalCaptionsAndCommonCaptionsFromImageCaptions(image_captions);
    setCaptionState({
      image_captions, total_captions, common_captions,
    });
  }

  function changeCaption(before: string, after: string) {
    setDirty(true);
    // 所有图片都修改一个 caption
    const image_captions = new Map<string, string[]>();
    for (const [key, value] of captionState.image_captions) {
      const captions = value.map(item => {
        if (item === before) { return after; }
        else { return item; }
      });
      image_captions.set(key, Array.from(new Set(captions)));
    }
    const { total_captions, common_captions } = getTotalCaptionsAndCommonCaptionsFromImageCaptions(image_captions);
    setCaptionState({
      image_captions, total_captions, common_captions,
    });
  }



  // 第二步, 计算所有标签的并集
  return (
    <><Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.75)' }}>
      <CardContent>
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{
            mr: 2,
            display: { xs: 'none', md: 'flex' },
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >Tag Editor</Typography>
      </CardContent>
      {
        !openImage ? <><CardContent>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 400,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >Commom Tags</Typography>
          <CaptionEditorBox captions={captionState.common_captions} addable
            onRemoveCaption={(caption: string) => {
              removeCaption(caption);
            }}
            onAddCaption={(caption: string) => {
              addCaption(caption);
            }}
            onChangeCaption={(before, after) => {
              changeCaption(before, after);
            }}
          ></CaptionEditorBox>
        </CardContent>
          <CardContent>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 400,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >Total Tags</Typography>
            <CaptionEditorBox captions={captionState.total_captions}
              onRemoveCaption={(caption: string) => removeCaption(caption)}
              onChangeCaption={(before: string, after: string) => changeCaption(before, after)}
            ></CaptionEditorBox>
          </CardContent></> : <CardContent>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 400,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >Image Tags</Typography>
          <CaptionEditorBox addable captions={captionState.image_captions.get(openImage.path) || []}
            onAddCaption={(caption) => {
              // 构造出新的字幕
              const origin_captions = captionState.image_captions.get(openImage.path) || [];
              const captions = Array.from(new Set([...origin_captions, caption]));
              updateImageCaptions(openImage, captions);
            }}
            onRemoveCaption={(caption) => {
              const origin_captions = captionState.image_captions.get(openImage.path) || [];
              const captions = origin_captions.filter(item => item !== caption);
              updateImageCaptions(openImage, captions);
            }}
            onChangeCaption={(before, after) => {
              const origin_captions = captionState.image_captions.get(openImage.path) || [];
              const captions = origin_captions.map(item => {
                if (item === before) {
                  return after;
                } else {
                  return item;
                }
              });
              updateImageCaptions(openImage, captions);
            }}
          ></CaptionEditorBox>
        </CardContent>
      }

      <CardActions>
        <Button size="small" color="primary" variant="contained"
          onClick={() => {
            save().finally(() => {
              // 跳转
            });
          }}
        >
          Save
        </Button>
        <Button size="small" color="secondary" variant="contained"
          onClick={() => {
            if (dirty) {
              const response = window.confirm("do you want to save your work?");
              if (response) { save(); }
            }
            navigate(-1);
            
          }}
        >
          Return
        </Button>
      </CardActions>

    </Card>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 10 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>);
}

export default CaptionEditor;

