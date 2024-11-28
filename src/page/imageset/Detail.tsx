

// 包含一个header, header中包含数据集名称, 刷新按钮, 新建按钮, 保存按钮, 设置按钮, 帮助按钮

import { useLocation, useNavigate } from "react-router-dom";
import { Button, Divider, Grid2 as Grid, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { removeFilter } from "../../app/imageSetSlice";
import api from "../../api";
import CreateDialog from "../dialog/CreateDialog";

import SelectableImageList from "./SelectableImageList";


// 这个页面展示图片预览, 以及操作按钮, 点击操作按钮会跳转到对应的操作页面
function Detail(props: {
  onReload: () => void,
}) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // concept 的名称和重复次数共同定位到某个目录
  const { imageset_name, is_regular, filter_name, }: { imageset_name: string, is_regular: boolean, filter_name: string } = location.state;
  const [filterName, setFilterName] = useState(filter_name);

  useEffect(() => {
    setFilterName(filter_name);
  }, [filter_name]);

  const [createDialog, setCreateDialog] = useState(false);
  const height = '83vh';

  return (<>
    {/* 正式内容 */}
    <Grid container spacing={2} >
      
      <Grid size={10}>
        <SelectableImageList height={height} selectable enableFullscreen filter_name={ filterName } onFilterNameChange={(name) => setFilterName(name) }
        ></SelectableImageList>
      </Grid>



      <Grid size={2} sx={{ height: '100%' }}>
        {/* 在这里定义相关按钮 */}
        <Stack spacing={1} divider={<Divider flexItem />}>
          <Grid container spacing={1}>
            <Button variant="contained" color="secondary"
              onClick={() => { navigate("/imageset/selection-editor", { state: { imageset_name, is_regular, filter_name } }) }}
            >edit selection</Button>
            <Button variant="contained" color="secondary" onClick={() => setCreateDialog(true)}>add concept</Button>
            {
              filterName === '<all>' ? <></> : filterName.startsWith('<') ?
                <Button variant="contained" color="secondary"
                  onClick={() => {
                    // 直接删除对应的 selection 即可
                    dispatch(removeFilter(filterName));
                    navigate("/imageset/detail", { replace: true, state: { ...location.state, filter_name: '<all>', } });
                  }}
                >remove selection</Button> :
                <Button variant="contained" color="secondary"
                  onClick={() => {
                    const response = window.confirm(`this operation will delete the ${filterName} folder!`);
                    if (response) {
                      // 删除概念
                      api.delete_concept(imageset_name, is_regular, filterName).finally(() => {
                        // 已经将概念删除了, 我需要
                        dispatch(removeFilter(filterName));
                        navigate('/imageset/detail', { replace: true, state: { ...location.state, filter_name: '<all>' } });
                        props.onReload();
                      });
                    }
                  }}
                >remove concept</Button>
            }
          </Grid>
          <Grid spacing={1} container>
            <Button variant="contained">tagger</Button>
            <Button variant="contained">edit tag</Button>
            <Button variant="contained">detect similar images</Button>
          </Grid>

          <Grid spacing={1} container>
            <Button variant="contained" color="warning">convert</Button>
            <Button variant="contained" color="warning">rename</Button>
            <Button variant="contained" color="warning">move</Button>
          </Grid>

          <Grid spacing={1} container>
            <Button variant="contained" color="error">cut</Button>
            <Button variant="contained" color="error">resize</Button>
            <Button variant="contained" color="error">flip</Button>
            <Button variant="contained" color="error">rotate</Button>
          </Grid>

          <Grid spacing={1} container>
            <Button variant="contained" color="success">remove background</Button>
            <Button variant="contained" color="success">add background</Button>
          </Grid>
        </Stack>

      </Grid>
    </Grid>



    {/* 对话框 */}
    <CreateDialog open={createDialog} imageset_name={imageset_name} type={is_regular ? 'regular' : 'train'}
      onClose={() => { setCreateDialog(false); props.onReload() }} />
  </>);
}

export default Detail;


