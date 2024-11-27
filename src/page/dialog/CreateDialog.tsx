import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid2 as Grid, TextField } from "@mui/material";


import '@mantine/dropzone/styles.css';
import api from "../../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


interface createDialogProps {
  open: boolean,
  imageset_name: string,
  type: 'train' | 'regular',
  onClose: () => void,
};


function capitalizeFirstLetter(str: string): string {
  if (str.length === 0) return str; // 检查空字符串
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function CreateDialog(props: createDialogProps) {
  const [conceptName, setConceptName] = useState('');
  const [repeat, setRepeat] = useState(1);
  const [loadDirectory, setLoadDirectory] = useState('');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  return (
    <>
      <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>Add {capitalizeFirstLetter(props.type)} Concept for <b>{props.imageset_name}</b></DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            {/* 输入名称和重复次数 */}
            <Grid size={8}>
              <TextField variant="standard" fullWidth label="concept name" size="small" value={conceptName} onChange={(event) => { setConceptName(event.target.value) }} /></Grid>
            <Grid size={4}>
              <TextField
                variant="standard"
                aria-label="repeat"
                label="repeat"
                size="small"
                value={repeat}
                onChange={(event) => setRepeat(parseInt(event.target.value))}
                inputProps={{
                  step: 1,
                  min: 1,
                  max: 0xffffffff,
                  type: 'number',
                }}
              /></Grid>
            <Grid size={12}>
              <TextField variant="standard" fullWidth label="load images from directory" size="small" value={loadDirectory} onChange={(event) => setLoadDirectory(event.target.value)} />
            </Grid>
          </Grid>

        </DialogContent>

        <DialogActions>
          <Button onClick={() => { props.onClose() }}>Cancel</Button>
          <Button disabled={loading} onClick={() => {
            setLoading(true);
            api.add_concept(props.imageset_name, conceptName, repeat, props.type, loadDirectory).then((cnt) => {
              // 跳转到新建的concept
              navigate('/imageset', { state: { imageset_name: props.imageset_name, is_regular: props.type === 'regular', filter_name: `${repeat}_${conceptName}` } });
            }).catch((error: any) => {
              console.error(error);
            }).finally(() => {
              setLoading(false);
              props.onClose()
            });
          }}>Finish
          </Button>

        </DialogActions>
        <Backdrop
          sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 10 })}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Dialog>


    </>
  );
}

export default CreateDialog;