import { AppBar, IconButton, InputAdornment, TextField, Toolbar, Typography } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import FolderIcon from '@mui/icons-material/Folder';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import DeleteIcon from '@mui/icons-material/Delete';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CheckIcon from '@mui/icons-material/Check';
import { setImageSetName as setImageSetNameRedux } from "../../app/imageSetSlice";
import NewDialog from "../dialog/NewDialog";
import OpenDialog from "../dialog/OpenDialog";
import api from "../../api";


interface HeaderProps {
  onRenameImageset: (origin_name: string, new_name: string) => void,
  onLoad: () => Promise<void>,
  onStop?: () => Promise<void>,
  onDelete?: () => Promise<void>,
};


// 数据集名称使用redux
export default function Header(props: HeaderProps) {
  const location = useLocation();
  const { imageset_name } = location.state;

  const [newDialog, setNewDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // header 需要selector到imageset.name和concept, 并且需要具备修改concept名称的能力
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 保存当前的 imagedir
  const ctl = useRef<{ loading: boolean, stop: boolean, init: boolean }>({ loading: false, stop: false, init: true });



  const [loading, setLoading] = useState(ctl.current.loading);
  const [showInput, setShowInput] = useState(false);
  const [imagesetName, setImagesetName] = useState(imageset_name);

  function load() {
    setLoading(true);
    props.onLoad().catch((error: any) => console.error(error)).finally(() => setLoading(false));
  }

  function stoploading() {
    props.onStop?.().catch((error: any) => console.error(error)).finally(() => setLoading(false));
  }

  function renameImageset(name: string) {
    // 调用后端修改名字的函数
    api.rename_imageset(imageset_name, name).then(() => {
      // 修改 redux 中的数据集名称
      dispatch(setImageSetNameRedux(name));
      setShowInput(false);
      props.onRenameImageset(imageset_name, name);
    }).catch((error: any) => { console.error(error) });
  }

  // 不要在这里执行
  useEffect(() => {
    setNewDialog(false);
    setOpenDialog(false);
    setShowInput(false);
    setImagesetName(imageset_name);

    // 由 header 来执行加载
    load();

  }, [imageset_name]);





  const imageset_name_ui = (showInput ?
    <TextField
      variant="standard" size="small"
      value={imagesetName}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setImagesetName(event.target.value.trim());
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key.toLowerCase() === 'enter') {
          renameImageset(imagesetName)
        }
      }}
      slotProps={{
        input: {
          endAdornment: <InputAdornment position="end">
            <IconButton onClick={() => renameImageset(imagesetName)}><CheckIcon fontSize="inherit" /></IconButton>
          </InputAdornment>,
        },
      }}
    />
    : <Typography
      variant="h6"
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
    >
      {imagesetName}
      <IconButton aria-label="delete" size="small" onClick={() => setShowInput(true)}>
        <EditNoteIcon fontSize="inherit" />
      </IconButton>
    </Typography>);


  return (<AppBar position="fixed" color="default"  >
    <Toolbar variant="dense" >

      {imageset_name_ui}


      <div style={{ flexGrow: 1, }} />


      {
        !loading ? <IconButton onClick={load}>
          <RefreshIcon />
        </IconButton> : <IconButton onClick={stoploading}>
          <CloseIcon />
        </IconButton>
      }


      <IconButton onClick={() => setNewDialog(true)}><CreateNewFolderIcon /></IconButton>
      <IconButton onClick={() => setOpenDialog(true)}><FolderOpenIcon /></IconButton>
      <IconButton onClick={() => { api.open_in_file_explore(imagesetName) }}><FolderIcon /></IconButton>
      <IconButton onClick={() => { navigate("/settings"); }}><SaveIcon /></IconButton>
      <IconButton onClick={() => { navigate("/settings"); }}><FileDownloadIcon /></IconButton>

      <IconButton onClick={() => { navigate("/settings"); }}><SettingsIcon /></IconButton>
      
      <IconButton href="https://github.com/Qiu-Weidong/imageset-editor.git"> <HelpIcon /> </IconButton>
      <IconButton onClick={() => {
        // 主页之前要先将没有加载完成的stop了
        stoploading();
        navigate("/");
      }}>
        <HomeIcon />
      </IconButton>
      <IconButton onClick={() => {
        props.onDelete?.().catch((error: any) => console.error(error));
      } }> <DeleteIcon /> </IconButton>

    </Toolbar>



    <NewDialog open={newDialog} onClose={() => setNewDialog(false)} />
    <OpenDialog open={openDialog} onClose={() => setOpenDialog(false)} />
    {/* <DeleteDialog open={deleteDialog} onClose={() => setDeleteDialog(false)} concept={props.concept} imagesetName={imagesetName} /> */}
  </AppBar>);
}


