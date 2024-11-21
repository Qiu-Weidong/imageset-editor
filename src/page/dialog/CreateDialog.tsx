import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, ListItem, Radio, RadioGroup } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import '@mantine/dropzone/styles.css';


interface createDialogProps {
  open: 'train' | 'regular' | null | undefined,
  onClose: () => void,
};



function ConceptCreator(props: { key: number, }) {
  // state
  
  return (<ListItem key={props.key}>

  </ListItem>);
}


function CreateDialog(props: createDialogProps) {
  const navigate = useNavigate();
  const [type, setType] = useState(props.open || 'train');

  useEffect(() => {
    if (props.open) {
      setType(props.open);
    }

  }, [props.open]);



  return (
    <Dialog open={props.open == 'train' || props.open == 'regular'} onClose={props.onClose}
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
      <DialogTitle>Create Train/Regular Set</DialogTitle>
      <DialogContent>
        {/* 首先选择要创建的类型 */}
        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">type</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            defaultValue={props.open}
            value={type}
            onChange={(event) =>  {  
              if(event.currentTarget.value == "train") {
                setType(event.currentTarget.value);
              } else if(event.currentTarget.value == "regular") {
                setType(event.currentTarget.value );
              }
            } }
          >
            <FormControlLabel value="train" control={<Radio />} label="Train" />
            <FormControlLabel value="regular" control={<Radio />} label="Regular" />
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button type="submit">Finish</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateDialog;