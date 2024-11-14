import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, InputAdornment, Stack, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import { useState } from "react";
import { eel } from "../..";



const default_workspace = 'D:\\train-dataset\\tmp';


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
            console.log(name);
            eel.create_imageset(default_workspace, name)()
              .then((res: any) => console.log(res))
              .catch((err: any) => console.log(err))
              .finally(() => {
                setNewDialog(false);
              });
            
            
          },
        }}
      >
        <DialogTitle>create new imageset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            input imageset name to create a new imageset.
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewDialog(false) }>Cancel</Button>
          <Button type="submit">CREATE</Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false) }
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const path = formJson.path;
            console.log(path);
            setNewDialog(false);
          },
        }}
      >
        <DialogTitle>open imageset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            please input the imageset path to open it. if it is not a imageset, it will create one in the path you input.                  
          </DialogContentText>
          <TextField 
            label="请输入文件夹路径"
            id="path"
            name="path"
            variant="standard"
            fullWidth
            autoFocus
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false) }>Cancel</Button>
          <Button type="submit">OPEN</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


export default Start;

