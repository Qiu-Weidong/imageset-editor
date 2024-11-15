import { CircularProgress, Dialog, DialogContent, DialogTitle, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useEffect, useState } from "react";
import { eel } from "../../App";
import { useNavigate } from "react-router-dom";


interface OpenDialogProps {
  open: boolean;
  onClose: () => void,
};

function OpenDialog(props: OpenDialogProps) {
  const navigate = useNavigate();
  const [imagesetNames, setImagesetNames] = useState<string[] | null>(null);

  useEffect(() => {
    eel.find_imageset_list()().then((names: string[]) => {
      setImagesetNames(names);
    }).catch((err: any) => {
      setImagesetNames([]);
      console.error(err);
    });
  }, []);

  const content = !imagesetNames ? (
    <CircularProgress />
  ) : imagesetNames?.length > 0 ? (<List>
    {
      imagesetNames.map((name) => <ListItem disablePadding>
        <ListItemButton onClick={() => navigate(`/home`, { state: { imageset_name: name } })}>
          <ListItemText primary={name} />
        </ListItemButton>
      </ListItem>)
    }
  </List>) : <>find no imageset.</>
  ;

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>open imageset</DialogTitle>
      <DialogContent>
        {content}
      </DialogContent>
    </Dialog>
  );
}

export default OpenDialog;



