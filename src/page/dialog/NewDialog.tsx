import { Alert, AlertColor, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import { exception2string } from "../../utils";
import { useNavigate } from "react-router-dom";
import api from "../../api";


interface newDialogProps {
  open: boolean;
  onClose: () => void,
};



interface State extends SnackbarOrigin {
  open: boolean,
  msg: string,
  severity: AlertColor,
}

function NewDialog(props: newDialogProps) {
  const navigate = useNavigate();
  // const dispatch = useDispatch();
  
  const [state, setState] = useState<State>({
    open: false,
    vertical: 'top',
    horizontal: 'center',
    msg: '',
    severity: 'success',
  });

  const { vertical, horizontal, open } = state;

  return (
    <><Dialog
      open={props.open}
      onClose={props.onClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          const name = formJson.name;

          api.create_imageset(name)
            .then((res: any) => {
              setState({ ...state, msg: `create imageset '${res}' successful.`, open: true, severity: 'success' });
              // 应该在这里就设置 imageset_name
              navigate(`/overview`, { state: { imageset_name: name } });
            })
            .catch((err: any) => {
              setState({ ...state, msg: exception2string(err), open: true, severity: 'error' })
            })
            .finally(() => {
              props.onClose();
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
        <Button onClick={props.onClose}>Cancel</Button>
        <Button type="submit">CREATE</Button>
      </DialogActions>
    </Dialog>
    <Snackbar 
      anchorOrigin={{vertical, horizontal}} 
      open={open} 
      onClose={() => setState({...state, open: false})} 
      >
        <Alert onClose={() => setState({...state, open: false})} severity={state.severity}>
          {state.msg}
        </Alert>

      </Snackbar>
    </>
  );
}

export default NewDialog;



