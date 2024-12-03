import { useLocation } from "react-router-dom";




function CaptionEditor() {
  const location = useLocation();
  const { filter_name } = location.state;
  
  return (<>
    hello world!
  </>);
}

export default CaptionEditor;

