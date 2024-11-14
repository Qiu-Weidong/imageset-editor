import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, InputAdornment, Stack, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import { useState } from "react";
import { eel } from "../..";

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
          <Button color="success" variant="contained" startIcon={<FolderOpenIcon />} >Open</Button>
          <Button color="primary" variant="contained" startIcon={<SettingsIcon />} onClick={() => navigate("/settings") }>Settings</Button>
          <Button color="warning" variant="contained" startIcon={<HelpIcon />} href="https://github.com/Qiu-Weidong/imageset-editor.git">Help</Button>
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
      
      <Dialog
        open={newDialog}
        onClose={() => setNewDialog(false) }
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const name = formJson.name;
            const path = formJson.path;
            console.log(name, path);
            
            
            eel.create_imageset(path, name);
            
            setNewDialog(false);
          },
        }}
      >
        <DialogTitle>create new imageset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            input dest path and imageset name to create a new imageset.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="ImageSet Name"
            type="text"
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="path"
            name="path"
            label="Path"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewDialog(false) }>Cancel</Button>
          <Button type="submit">CREATE</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


export default Start;

