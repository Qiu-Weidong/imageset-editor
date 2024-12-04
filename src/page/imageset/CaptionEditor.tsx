import { Button, Card, CardActions, CardContent, Chip, IconButton, TextField, Typography } from "@mui/material";
import { FilterState } from "../../app/imageSetSlice";
import { useEffect, useState } from "react";
import DoneIcon from '@mui/icons-material/Done';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";



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
      const filtered = props.captions.filter(caption => caption.includes(e.target.value));
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




function CaptionEditor({
  filter, 
}: {
  filter: FilterState,
}) {
  // 第一步, 计算所有标签的交集

  let total_captions: string[] = [];
  for (const image of filter.images) {
    total_captions = union(total_captions, image.captions);
  }

  let common_captions: string[] = [...total_captions];
  for (const image of filter.images) {
    common_captions = intersection(common_captions, image.captions);
  }

  const openImage = useSelector((state: RootState) => state.openImage.image);

  // 第二步, 计算所有标签的并集
  return (<Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.75)' }}>
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
      ! openImage ? <><CardContent>
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
        <CaptionEditorBox captions={common_captions} addable
          onRemoveCaption={(caption: string) => {
            // 所有图片都删除 caption 标签
            // 更新 common captions
          }}
          onAddCaption={(caption: string) => {
            // 所有图片都添加 caption 标签
            // 更新 common captions
          }}
          onChangeCaption={(before, after) => {
            // 所有图片都将 before 修改为 after
            // 更新 common captions
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
          <CaptionEditorBox captions={total_captions}

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
        <CaptionEditorBox addable captions={openImage.captions}
          onAddCaption={(caption) => {
            // 构造出新的字幕
            const captions = Array.from(new Set([...openImage.captions, caption]));

          }}
        ></CaptionEditorBox>
      </CardContent>
    }

    <CardActions>
      <Button size="small" color="primary" variant="contained">
        Save
      </Button>
      <Button size="small" color="secondary" variant="contained">
        Return
      </Button>
    </CardActions>

  </Card>);
}

export default CaptionEditor;

