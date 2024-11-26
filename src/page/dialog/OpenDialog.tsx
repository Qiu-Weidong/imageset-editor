import { CircularProgress, Dialog, DialogContent, DialogTitle, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";


interface OpenDialogProps {
  open: boolean,
  onClose: () => void,
};

function OpenDialog(props: OpenDialogProps) {
  const navigate = useNavigate();
  const [imagesetNames, setImagesetNames] = useState<string[] | null>(null);

  useEffect(() => {
    if (props.open) {
      setImagesetNames(null);
      api.find_imageset_list().then((names: string[]) => {
        // console.log('names = ', names);
        setImagesetNames(names);
      }).catch((err: any) => {
        setImagesetNames([]);
        console.error(err);
      });
    }

  }, [props.open]);

  const content = !imagesetNames ? (
    <CircularProgress />
  ) : imagesetNames?.length > 0 ? (<List>
    {
      imagesetNames.map((name) => <ListItem disablePadding key={name}>
        <ListItemButton onClick={() => {
          // console.log('open ', name);
          navigate(`/overview`, { state: { imageset_name: name } });
          // 不如强制刷新
        }}>
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



