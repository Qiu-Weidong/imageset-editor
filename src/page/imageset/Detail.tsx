

// 包含一个header, header中包含数据集名称, 刷新按钮, 新建按钮, 保存按钮, 设置按钮, 帮助按钮

import { useLocation, useNavigate } from "react-router-dom";
import { Backdrop, Button, CircularProgress, Divider, Grid2 as Grid, Stack } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { FilterState, removeFilter } from "../../app/imageSetSlice";
import api from "../../api";
import CreateDialog from "../dialog/CreateDialog";
import AddImageDialog from "../dialog/AddImagesDialog";
import TaggerDialog from "../dialog/TaggerDialog";
import { SimilarImageState } from "./SimilarImageEditor";


export function Editor({ filter, onReload }: { filter: FilterState, onReload: () => Promise<void>, }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();


  // concept 的名称和重复次数共同定位到某个目录
  const { imageset_name, is_regular, }: { imageset_name: string, is_regular: boolean, filter_name: string } = location.state;
  // 对话框
  const [createDialog, setCreateDialog] = useState(false);
  const [addImageDialog, setAddImageDialog] = useState(false);
  const [taggerDialog, setTaggerDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Stack spacing={1} divider={<Divider flexItem />}>

        {/* selection */}
        <Grid container spacing={1}>
          <Button variant="contained" color="info"
            onClick={() => { navigate("/selection-editor", { state: { imageset_name, is_regular, filter_name: filter.name } }) }}
          >create selection</Button>
          {
            filter.name.startsWith("<") && filter.name !== '<all>' ? <>
              <Button variant="contained" color="info"
                onClick={() => {
                  const respone = window.confirm(`do you want to delete selection ${filter.name}`);
                  if (respone) {
                    // 直接删除对应的 selection 即可
                    const name = filter.name;
                    dispatch(removeFilter(name));
                    navigate("/imageset/detail", { replace: true, state: { ...location.state, filter_name: '<all>' } });
                  }
                }}
              >remove selection</Button>
              <Button variant="contained" color="info"
                onClick={() => {
                  const response = window.confirm(`do you want to delete all images in ${filter.name}`);
                  if (response) {
                    setLoading(true);
                    const name = filter.name;
                    dispatch(removeFilter(name));
                    // 删除图片, 需要跳转到 <all>
                    api.delete_images(filter.images).finally(() => {
                      onReload().finally(() => {
                        setLoading(false);
                        navigate('/imageset/detail', { replace: true, state: { ...location.state, filter_name: '<all>' } });
                      });
                    });

                  }
                }}
              >delete images</Button>
              <Button variant="contained" color="info"
                onClick={() => {
                  const response = window.prompt("input concept name, such as 8_girl");
                  if (response) {
                    setLoading(true);
                    api.move_images(imageset_name, filter.images, is_regular, response).then(() => {

                      onReload().then(() => {
                        const name = filter.name;
                        dispatch(removeFilter(name));
                        navigate("/imageset/detail", { replace: true, state: { ...location.state, filter_name: response } });
                      }).finally(() => {
                        setLoading(false);
                      })
                    }).finally(() => {
                      setLoading(false);
                    });
                  }
                }}
              >save as concept</Button>
            </> : <></>
          }
        </Grid>

        {/* concept */}
        <Grid container spacing={1}>

          <Button variant="contained" color="secondary" onClick={() => setCreateDialog(true)}>add concept</Button>

          {
            filter.name.startsWith("<") ? <></> :
              <>
                <Button variant="contained" color="secondary"
                  onClick={() => {
                    const response = window.confirm(`this operation will delete the ${filter.name} folder!`);
                    if (response) {
                      setLoading(true);
                      // 删除概念
                      api.delete_concept(imageset_name, is_regular, filter.name).finally(() => {
                        // 已经将概念删除了, 我需要
                        dispatch(removeFilter(filter.name));
                        onReload().finally(() => {
                          setLoading(false);
                          navigate('/imageset/detail', { replace: true, state: { ...location.state, filter_name: '<all>' } });
                        });
                      });
                    }
                  }}
                >remove concept</Button>

                <Button variant="contained" color="secondary" onClick={() => {
                  setAddImageDialog(true);
                }}>add images</Button>
                <Button variant="contained" color="secondary" onClick={() => {
                  setLoading(true);
                  api.rename_and_convert(imageset_name, is_regular, filter.name).finally(() => {
                    onReload().finally(() => setLoading(false));
                  });
                }}>convert and rename</Button>
              </>
          }
        </Grid>



        {/* 打标 */}
        <Grid spacing={1} container>
          <Button variant="contained" onClick={() => setTaggerDialog(true)}>tagger</Button>
          <Button variant="contained" onClick={() => navigate("/imageset/caption-editor", { state: { ...location.state, filter_name: filter.name } })}>edit tag</Button>
          <Button variant="contained" onClick={() => {
            setLoading(true);
            api.detect_similar_images(filter.images, 0.9).then((similar_images: SimilarImageState[][]) => {
              if (similar_images.length > 0) {
                navigate("/similar-image-editor", { state: { similar_images } });
              }
              else {
                window.alert('did not found similar images.');
              }
            }).finally(() => setLoading(false));
          }}>detect similar images</Button>
        </Grid>

        {/* 图片操作 */}
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
      {/* 对话框 */}
      <CreateDialog open={createDialog} imageset_name={imageset_name} type={is_regular ? 'regular' : 'train'}
        onClose={() => { setCreateDialog(false); }} onSubmit={onReload} />
      <AddImageDialog open={addImageDialog} imageset_name={imageset_name} is_regular={is_regular} concept_folder={filter.name}
        onClose={() => { setAddImageDialog(false); }} onSubmit={onReload} />

      <TaggerDialog open={taggerDialog} filter={filter}
        onClose={() => { setTaggerDialog(false); }} onSubmit={() => {
          onReload();
          navigate("/imageset/caption-editor", { replace: true, state: { ...location.state, filter_name: filter.name } });
        }} />

      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 10 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

export default Editor;


