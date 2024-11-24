import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2 as Grid, TextField } from "@mui/material";


import '@mantine/dropzone/styles.css';


interface createDialogProps {
  open: boolean,
  type: 'train' | 'regular',
  onClose: () => void,
};


function capitalizeFirstLetter(str: string): string {
  if (str.length === 0) return str; // 检查空字符串
  return str.charAt(0).toUpperCase() + str.slice(1);
}


function CreateDialog(props: createDialogProps) {




  return (
    <Dialog open={props.open} onClose={props.onClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          // 创建

          // 关闭对话框并跳转
          props.onClose();
        },
      }}
    >
      <DialogTitle>Add {capitalizeFirstLetter(props.type)} Concept</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          {/* 输入名称和重复次数 */}
          <Grid size={8}>
            <TextField variant="standard" fullWidth label="concept name" size="small" /></Grid>
          <Grid size={4}>
            <TextField
              variant="standard"
              aria-label="repeat"
              label="repeat"
              size="small"
              inputProps={{
                step: 1,
                min: 1,
                max: 0xffffffff,
                type: 'number',
              }}
            /></Grid>

          
        </Grid>

      </DialogContent>

      <DialogActions>
        <Button>Finish</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateDialog;