import { Backdrop, Box, CircularProgress, Container, Divider, IconButton, MenuItem, Paper, Select, Slider, Tooltip } from "@mui/material";
import ImageGallery from "./ImageGallery";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TransformIcon from '@mui/icons-material/Transform';
import SendIcon from '@mui/icons-material/Send';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import FlipIcon from '@mui/icons-material/Flip';
import Rotate90DegreesCcwIcon from '@mui/icons-material/Rotate90DegreesCcw';
import { useNavigate, useParams } from "react-router-dom";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FilterState, loadConcept, removeFilter } from "../../app/conceptSlice";
import api from "../../api";
import CreateDialog from "../dialog/CreateDialog";
import AddImageDialog from "../dialog/AddImagesDialog";
import TaggerDialog from "../dialog/TaggerDialog";
import { SimilarImageState } from "./SimilarImageEditor";


export const selectFilterNameList = createSelector(
  (state: RootState) => state.concept.filters,
  (filters) => filters.map(filter => filter.name),
);

export function getFilterByName(filters: FilterState[], filter_name: string): FilterState {
  return filters.find(filter => filter.name === filter_name) || { name: '<error>', images: [] };
}

function Editor({
  imageset_name, concept_name, repeat, is_regular
}: {
  imageset_name: string,
  concept_name: string,
  repeat: number,
  is_regular: boolean,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const filter_name_list = useSelector(selectFilterNameList);
  const images = useSelector((state: RootState) => state.concept.images);
  const filters = useSelector((state: RootState) => state.concept.filters);


  const [column, setColumn] = useState(10);



  const { filter_name = 'all' } = useParams();


  const [currentFilter, setCurrentFilter] = useState<FilterState>(getFilterByName(filters, `[${filter_name}]`));

  const [loading, setLoading] = useState(false);

  const [createDialog, setCreateDialog] = useState(false);
  const [addImageDialog, setAddImageDialog] = useState(false);
  const [taggerDialog, setTaggerDialog] = useState(false);
  const ty = is_regular ? "reg" : "src";

  useEffect(() => {
    const _filter_name = `[${filter_name}]`;
    setCurrentFilter(getFilterByName(filters, _filter_name));
  }, [filters, filter_name]);

  async function reload() {
    const result = await api.load_concept(imageset_name, is_regular, concept_name, repeat);
    dispatch(loadConcept(result));
  }
  const height = '85vh';

  return (<Container fixed maxWidth="xl">
    <Paper elevation={3}>
      <Box sx={{ display: 'flex', }}>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          label="concept or selection"
          variant="standard"
          size="small"
          value={currentFilter.name}
          sx={{ m: 1, minWidth: 180 }}
          onChange={(event) => {
            const filter_name = event.target.value;
            setCurrentFilter(getFilterByName(filters, filter_name));
          }}
        >
          {
            filter_name_list.map((name, index) => <MenuItem key={index} value={name}>
              {name}
            </MenuItem>)
          }
        </Select>

        <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          total images: <b>{images.length}</b>, current images: <b>{currentFilter.images.length}</b>
          <Box sx={{ flex: 1 }}></Box>
          {/* 直接在这里定义操作按钮 */}
          <Tooltip title="create selection"><IconButton color="success" size="small"
            onClick={() => {
              const filter_name = currentFilter.name.substring(1, currentFilter.name.length - 1);
              navigate(`/selection-editor/${imageset_name}/${ty}/${concept_name}/${repeat}/${filter_name}`);
            }}
          ><FilterAltIcon /></IconButton></Tooltip>
          <Divider orientation="vertical" flexItem />
          <Tooltip title="detect duplicate images"
            onClick={() => {
              setLoading(true);
              api.detect_similar_images(currentFilter.images, 0.9).then((similar_images: SimilarImageState[][]) => {
                if (similar_images.length > 0) {
                  navigate(`/concept/${imageset_name}/${ty}/${concept_name}/${repeat}/${currentFilter.name.substring(1, currentFilter.name.length - 1)}/similar-image-editor`, { state: { similar_images } });
                }
                else {
                  window.alert('did not found similar images.');
                }
              }).finally(() => setLoading(false));
            }}
          ><IconButton color="error" size="small"><ImageSearchIcon /></IconButton></Tooltip>
          <Divider orientation="vertical" flexItem />
          <Tooltip title="create new concept" onClick={() => setCreateDialog(true)}><IconButton color="info" size="small"><CreateNewFolderIcon /></IconButton></Tooltip>
          <Tooltip title="add images for current concept" onClick={() => setAddImageDialog(true)}><IconButton color="info" size="small"><AddIcon /></IconButton></Tooltip>
          <Divider orientation="vertical" flexItem />

          <Tooltip title="tag current images" onClick={() => setTaggerDialog(true)}><IconButton color="warning" size="small"><ClosedCaptionIcon /></IconButton></Tooltip>
          <Tooltip title="edit captions" onClick={() =>
            navigate(`/concept/${imageset_name}/${ty}/${concept_name}/${repeat}/${currentFilter.name.substring(1, currentFilter.name.length - 1)}/caption-editor`)}><IconButton color="warning" size="small"><EditNoteIcon /></IconButton></Tooltip>
          <Divider orientation="vertical" flexItem />

          <Tooltip title="convert image format and rename" onClick={() => {
            setLoading(true);
            api.rename_and_convert(imageset_name, is_regular, `${repeat}_${concept_name}`).finally(() => {
              reload().finally(() => {
                setLoading(false);
                window.alert('please restart the app after rename your images!');
              });
            });
          }}><IconButton color="secondary" size="small"><TransformIcon /></IconButton></Tooltip>
          {
            currentFilter.name !== "[all]" ? <>
              <Tooltip title="remove selection(keep the image)"
                onClick={() => {
                  const respone = window.confirm(`do you want to delete selection ${currentFilter.name}`);
                  if (respone) {
                    // 直接删除对应的 selection 即可
                    dispatch(removeFilter(currentFilter.name));
                    navigate(`/concept/${imageset_name}/${is_regular ? "reg" : "src"}/${concept_name}/${repeat}/all`, { replace: true });
                  }
                }}
              ><IconButton color="secondary" size="small"><DeleteIcon /></IconButton></Tooltip>
              <Tooltip title="delete images in current selection"
                onClick={() => {
                  const response = window.confirm(`do you want to delete all images in ${currentFilter.name}`);
                  if (response) {
                    setLoading(true);
                    const name = currentFilter.name;
                    dispatch(removeFilter(name));
                    api.delete_images(currentFilter.images).finally(() => {
                      api.load_concept(imageset_name, is_regular, concept_name, repeat).then(
                        (result) => {
                          dispatch(loadConcept(result));
                          navigate(`/concept/${imageset_name}/${is_regular ? "reg" : "src"}/${concept_name}/${repeat}/all`, { replace: true });
                          setLoading(false);
                        }
                      );
                    });

                  }
                }}
              ><IconButton color="secondary" size="small"><DeleteForeverIcon /></IconButton></Tooltip>
              {/* 使用一个对话框来选择一下要移动到的 concept */}
              <Tooltip title="move current images to"><IconButton color="secondary" size="small"><SendIcon /></IconButton></Tooltip>
            </> : <></>

          }
          <Divider orientation="vertical" flexItem />
          <Tooltip title="cut images"><IconButton color="primary" size="small"><ContentCutIcon /></IconButton></Tooltip>
          <Tooltip title="resize images"><IconButton color="primary" size="small"><ZoomInIcon /></IconButton></Tooltip>
          <Tooltip title="flip images"><IconButton color="primary" size="small"><FlipIcon /></IconButton></Tooltip>
          <Tooltip title="rotate images"><IconButton color="primary" size="small"><Rotate90DegreesCcwIcon /></IconButton></Tooltip>



          <Slider
            size="small"
            defaultValue={column}
            value={column}
            onChange={(_, value) => setColumn(value as number)}
            valueLabelDisplay="off"
            sx={{ maxWidth: 120, margin: 1, }}
            max={16}
            min={4}
          />
        </Box>

      </Box>
      <ImageGallery height={height} images={currentFilter.images} column={column} enableFullscreen badge></ImageGallery>
    </Paper>


    <CreateDialog open={createDialog} imageset_name={imageset_name} type={is_regular ? 'regular' : 'train'}
      onClose={() => { setCreateDialog(false); }} onSubmit={reload} />
    <AddImageDialog open={addImageDialog} imageset_name={imageset_name} is_regular={is_regular} concept_folder={`${repeat}_${concept_name}`}
      onClose={() => { setAddImageDialog(false); }} onSubmit={reload} />

    <TaggerDialog open={taggerDialog} filter={currentFilter}
      onClose={() => { setTaggerDialog(false); }} onSubmit={() => {
        reload();
        // 跳转到标签编辑页面
        const filter_name = currentFilter.name.substring(1, currentFilter.name.length - 1);
        navigate(`/concept/${imageset_name}/${is_regular ? "reg" : "src"}/${concept_name}/${repeat}/${filter_name}/caption-editor`);
      }} />

    <Backdrop
      sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 10 })}
      open={loading}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  </Container>);
}


export default Editor;


