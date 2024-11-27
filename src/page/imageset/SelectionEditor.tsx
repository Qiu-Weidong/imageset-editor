import { useLocation } from "react-router-dom";






function SelectionEditor() {
  // 通过路由传入 selectionName
  const location = useLocation();

  const { imageset_name, is_regular, filter_name } : { imageset_name: string, is_regular: boolean, filter_name: string }  = location.state;

}


export default SelectionEditor;






