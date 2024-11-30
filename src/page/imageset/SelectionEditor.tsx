import { useLocation } from "react-router-dom";
import SelectableImageList from "./SelectableImageList";


function SelectionEditor() {
  const location = useLocation();

  const {  filter_name } : { imageset_name: string, is_regular: boolean, filter_name: string }  = location.state;




  const height = '80vh';


  return (
    <SelectableImageList height={height} 
      enableFullscreen selectable filter_name={ filter_name } badge 
    ></SelectableImageList>
  );
  
}


export default SelectionEditor;






