import { Button, Divider, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import { useState } from "react";
import OpenDialog from "./OpenDialog";
import NewDialog from "./NewDialog";





function Start() {
  const navigate = useNavigate();
  const [newDialog, setNewDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

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
          <Button color="secondary" variant="contained" startIcon={<CreateNewFolderIcon />} 
            onClick={() => setNewDialog(true) }
          >New</Button>
          <Button color="success" variant="contained" startIcon={<FolderOpenIcon />} onClick={() => setOpenDialog(true) } >Open</Button>
          <Button color="primary" variant="contained" startIcon={<SettingsIcon />} onClick={() => navigate("/settings") }>Settings</Button>
          <Button color="warning" variant="contained" startIcon={<HelpIcon />} href="https://github.com/Qiu-Weidong/imageset-editor.git">Help</Button>
        </Stack>

      </div>
      <NewDialog open={newDialog} onClose={() => setNewDialog(false) }></NewDialog>

      <OpenDialog open={openDialog} onClose={() => setOpenDialog(false) }></OpenDialog>
    </div>
  );
}


export default Start;

