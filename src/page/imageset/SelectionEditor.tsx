import { useLocation } from "react-router-dom";
import SelectableImageList from "./SelectableImageList";
import { Container } from "@mui/material";


function SelectionEditor() {
  const location = useLocation();

  const { filter_name }: { imageset_name: string, is_regular: boolean, filter_name: string } = location.state;

  const height = '85vh';
  return (
    <Container fixed maxWidth="xl">
      <SelectableImageList height={height}
        selectable filter_name={filter_name} 
      ></SelectableImageList></Container>
  );

}


export default SelectionEditor;






