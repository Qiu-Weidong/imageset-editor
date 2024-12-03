import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import api from "../../api";
import { reloadImageSet } from "../../app/imageSetSlice";
import Header from "../header/Header";
import { Backdrop, CircularProgress, Toolbar } from "@mui/material";
import NotFound from "../notfound/NotFound";
import { useDispatch } from "react-redux";
import Detail from "./Detail";
import SelectionEditor from "./SelectionEditor";



// 注意这里不管 overview 算了, 只包含和 detail 相关的页面
// 这个页面的路由是 imageset
function ImageSet() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 传递过来了 imageset_name, is_regular, filter 
  const { imageset_name, is_regular }:
    { imageset_name: string, is_regular: boolean, filtername: string } = location.state;

  const [loading, setLoading] = useState(false);

  async function load() {
    // 加载数据
    setLoading(true);
    let result = await api.load(imageset_name, is_regular);
    dispatch(reloadImageSet(result));
    setLoading(false);
  }

  async function _delete() {
    if(is_regular) {
      let result = window.confirm(`Do you want to delete regular set for ${imageset_name}`);
      if(result) {
        await api.delete_regular(imageset_name);
      }
    } else {
      let result = window.confirm(`Do you want to delete train set for ${imageset_name}`);
      if(result) {
        await api.delete_train(imageset_name);
      }
    }

    navigate("/overview", { state: { imageset_name } });
  }

  useEffect(() => {
    load();
  }, [imageset_name, is_regular]);


  return (<>
    <Header onRenameImageset={(_, new_name) => {
      navigate('/imageset', { replace: true, state: { ...location.state, imageset_name: new_name, } })
    }}
      onLoad={load}
      onDelete={_delete}
    />

    <Backdrop
      sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 10 })}
      open={loading}
    >
      <CircularProgress color="inherit" />
    </Backdrop>

    <Toolbar />
    



    <Routes>
      <Route path="/detail" element={ <Detail onReload={load} /> } /> {/**默认是跳转到详情页面 */}
      <Route path="/selection-editor" element={ <SelectionEditor /> } />

      {/* 注意 redirect 需要写完整路径 */}
      <Route path="/" element={<Navigate to="/imageset/detail" replace state={location.state} />} />
      <Route path="*" element={ <NotFound /> }></Route>
    </Routes>


  </>);
}


export default ImageSet;

