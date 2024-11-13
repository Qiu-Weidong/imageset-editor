import { Button, Divider, InputAdornment, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { push, setImageLoaded } from "../../app/imageDirSlice";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';

function Start() {
  const dispatch = useDispatch();

  const [path, setPath] = useState("");
  const [errinfo, setErrInfo] = useState({ error: false, helperText: "" });

  const navigate = useNavigate();

  // 进到首页就重新加载
  useEffect(() => { dispatch(setImageLoaded(false)) }, []);

  return (
    // 外层 div 负责将子元素居中
    <div className="container" >

      {/* 内层 div 放置实际元素 */}
      <div>

        {/* 先来一个标题 */}
        <h1>ImageSet Editor</h1>
        <Stack style={{ margin: "0 auto" }}
        direction="row" spacing={4}
        divider={<Divider orientation="vertical" flexItem />}
        >
          <Button color="secondary" variant="contained" startIcon={<CreateNewFolderIcon />}>New</Button>
          <Button color="success" variant="contained" startIcon={<FolderOpenIcon />} >Open</Button>
          <Button color="primary" variant="contained" startIcon={<SettingsIcon />}>Settings</Button>
          <Button color="warning" variant="contained" startIcon={<HelpIcon />}>Help</Button>
        </Stack>

      </div>

      {/* 背景图片 */}
      <img src="https://images.unsplash.com/photo-1549388604-817d15aa0110"
        style={{
          zIndex: -1,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }} />
      

    </div>
  );
}


export default Start;

