import { Dialog, DialogContent, DialogTitle, List, ListItem, ListItemButton, ListItemText } from "@mui/material";


interface OpenDialogProps {
  open: boolean;
  onClose: () => void,
};

function OpenDialog(props: OpenDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>open imageset</DialogTitle>
        <DialogContent>
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary="Trash" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component="a" href="#simple-list">
              <ListItemText primary="Spam" />
            </ListItemButton>
          </ListItem>
        </List>
        </DialogContent>
      </Dialog>
  );
}

export default OpenDialog;



