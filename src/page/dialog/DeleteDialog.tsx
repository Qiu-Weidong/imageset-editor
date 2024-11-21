import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import { eel } from "../../App";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { exception2string } from "../../utils";


interface deleteDialogProps {
  open: boolean,
  onClose: () => void,
  concept?: { name: string, repeat: number, type: 'regular' | 'train', },
  imagesetName: string,
};




function DeleteDialog(props: deleteDialogProps) {
  const navigate = useNavigate();

  const [deleteRadio, setDeleteRadio] = useState(0);

  return (
    <>
      <Dialog
        open={props.open}
        onClose={props.onClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            // 根据用户选择的选项执行相关的删除操作 
            let promis = null;

            if(deleteRadio == 0) {
              // 删除整个数据集
              eel.delete_imageset(props.imagesetName)().then(() => {
                navigate("/");
              }).catch((error: any) => console.error(exception2string(error))).finally(() => props.onClose());
            } else if(deleteRadio == 1) {
              // 删除整个训练集
              promis = eel.delete_imageset(props.imagesetName, 'train')();
            } else if(deleteRadio == 2) {
              // 删除整个正则集
              promis = eel.delete_imageset(props.imagesetName, 'regular')();
            } else if(props.concept && deleteRadio == 3) {
              // 删除对应的concept
              promis = eel.delete_imageset(props.imagesetName, props.concept.type, props.concept.name)();
            } else if(props.concept && deleteRadio == 4) {
              // 删除重复次数为repeat的concept
              promis = eel.delete_imageset(props.imagesetName, props.concept.type, props.concept.name, props.concept.repeat)();
            }

            if(promis) {
              promis.then(() => {
                navigate("/overview", { replace: true, state: { imageset_name: props.imagesetName } });
              }).catch((error: any) => console.error(error)).finally(() => props.onClose());
            }

          },
        }}
      >
        <DialogTitle>Delete imageset</DialogTitle>
        <DialogContent>

          <DialogContentText>
            <FormControl>
              <FormLabel id="demo-radio-buttons-group-label">which one you want to delete?</FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                value={deleteRadio}
                onChange={(event) => { setDeleteRadio( parseInt(event.currentTarget.value) ) } }
                name="radio-buttons-group"
              >
                <FormControlLabel value={0} control={<Radio />} label="hole imageset" />
                <FormControlLabel value={1} control={<Radio />} label="hole trainset" />
                <FormControlLabel value={2} control={<Radio />} label="hole regularset" />
                {
                  props.concept ?
                    <>
                      <FormControlLabel value={3} control={<Radio />} label={ `concept ${props.concept.name}` } />
                      <FormControlLabel value={4} control={<Radio />} label={ `concept ${props.concept.name}, repeat ${props.concept.repeat}` } />
                    </> :
                    <></>
                }
              </RadioGroup>
            </FormControl>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose}>Cancel</Button>
          <Button type="submit">Delete</Button>
        </DialogActions>
      </Dialog>

    </>
  );
}

export default DeleteDialog;



