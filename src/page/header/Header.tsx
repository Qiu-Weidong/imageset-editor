import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import DeleteIcon from '@mui/icons-material/Delete';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';


// 数据集名称使用redux
export default function Header() {
  // header 需要selector到imageset.name和concept, 并且需要具备修改concept名称的能力
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 保存当前的 imagedir
  const ctl = useRef<{ loading: boolean, stop: boolean, init: boolean }>({ loading: false, stop: false, init: true });
  const [loading, setLoading] = useState(ctl.current.loading);
  const [disableTextField, setDisableTextField] = useState(true);




  // 不要在这里执行
  useEffect(() => {

  }, []);

  const imageWidth = useSelector((state: RootState) => state.setting.thumbnailWidth);


  async function loadImages(imagedir: string) {
  }

  function refresh(imagedir: string) {
    if (!ctl.current.loading && imagedir) {
      setLoading(true);
      ctl.current.loading = true;
      loadImages(imagedir).then(() => {
        setLoading(false);
        ctl.current.loading = false;
      }).catch(err => console.error(err));
    }
  }


  function stoploading() {
    ctl.current.stop = true;
  }




  return (<AppBar position="fixed" color="default"  >
    <Toolbar variant="dense" >

      <Typography
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
        Mikasa
      </Typography>
      <div style={{ flexGrow: 1, }}></div>


      {
        !loading ? <IconButton disabled={!disableTextField} onClick={() => {} }>
          <RefreshIcon />
        </IconButton> : <IconButton onClick={stoploading}>
          <CloseIcon />
        </IconButton>
      }


      <IconButton onClick={() => { stoploading(); navigate("/settings"); }}><CreateNewFolderIcon /></IconButton>
      <IconButton onClick={() => { stoploading(); navigate("/settings"); }}><FolderOpenIcon /></IconButton>
      <IconButton onClick={() => { stoploading(); navigate("/settings"); }}><SaveIcon /></IconButton>
      <IconButton onClick={() => { stoploading(); navigate("/settings"); }}><FileDownloadIcon /></IconButton>

      <IconButton onClick={() => { stoploading(); navigate("/settings"); }}><SettingsIcon /></IconButton>
      <IconButton onClick={() => { stoploading(); navigate("/help"); }}> <HelpIcon /> </IconButton>
      <IconButton onClick={() => {
        // 主页之间要先将没有加载完成的stop了
        stoploading();
        navigate("/");
      }}>
        <HomeIcon />
      </IconButton>
      <IconButton onClick={() => { }}> <DeleteIcon /> </IconButton>

    </Toolbar>
  </AppBar>);
}


