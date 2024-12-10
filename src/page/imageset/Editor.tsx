import { Box, Container, Divider, IconButton, MenuItem, Paper, Select, Slider, Tooltip } from "@mui/material";
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


const selectImagesByFilterName = (filter_name: string) => createSelector(
  (state: RootState) => state.concept.filters,
  (filters) => filters.find(filter => filter.name === filter_name)?.images || [],
);

const selectFilterNameList = createSelector(
  (state: RootState) => state.concept.filters,
  (filters) => filters.map(filter => filter.name),
);


function Editor({
  imageset_name, concept_name, repeat, is_regular
}:{
  imageset_name: string, 
  concept_name: string, 
  repeat: number,
  is_regular: boolean,
}) {
  const navigate = useNavigate();

  const filter_name_list = useSelector(selectFilterNameList);
  const images = useSelector((state: RootState) => state.concept.images);
  const filters = useSelector((state: RootState) => state.concept.filters);
  

  const [column, setColumn] = useState(10);



  const { filter_name = 'all' } = useParams();

  const [filterName, setFilterName] = useState(`[${filter_name}]`);
  const [currentImages, setCurrentImages] = useState(filters.find(filter => filter.name === `[${filter_name}]`)?.images || []);
  const ty = is_regular ? "reg" : "src";

  useEffect(() => {
    setCurrentImages(filters.find(filter => filter.name === `[${filter_name}]`)?.images || []);
  }, [filters, filter_name]);

  const height = '85vh';
  
  return (<Container fixed maxWidth="xl">
    <Paper elevation={3}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          label="concept or selection"
          variant="standard"
          size="small"
          value={filterName}
          sx={{ m: 1, minWidth: 180 }}
          onChange={(event) => {
            const filter_name = event.target.value;
            setFilterName(filter_name);
            setCurrentImages(filters.find(filter => filter.name === filter_name)?.images || []);
          }}
        >
          {
            filter_name_list.map((name, index) => <MenuItem key={index} value={name}>
              {name}
            </MenuItem>)
          }
        </Select>

        <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          total images: <b>{images.length}</b>, current images: <b>{currentImages.length}</b>
          <Box sx={{ flex: 1 }}></Box>
          {/* 直接在这里定义操作按钮 */}
          <Tooltip title="create selection"><IconButton color="success" size="small"
            onClick={() => {
              navigate(`/selection-editor/${imageset_name}/${ty}/${concept_name}/${repeat}/${filter_name}`);
            }}
          ><FilterAltIcon /></IconButton></Tooltip>
          <Divider orientation="vertical" flexItem />
          <Tooltip title="detect duplicate images"><IconButton color="error" size="small"><ImageSearchIcon /></IconButton></Tooltip>
          <Divider orientation="vertical" flexItem />
          <Tooltip title="create new concept"><IconButton color="info" size="small"><CreateNewFolderIcon /></IconButton></Tooltip>
          <Tooltip title="add images for current concept"><IconButton color="info" size="small"><AddIcon /></IconButton></Tooltip>
          <Divider orientation="vertical" flexItem />

          <Tooltip title="tag current images"><IconButton color="warning" size="small"><ClosedCaptionIcon /></IconButton></Tooltip>
          <Tooltip title="edit captions"><IconButton color="warning" size="small"><EditNoteIcon /></IconButton></Tooltip>
          <Divider orientation="vertical" flexItem />

          <Tooltip title="convert image format and rename"><IconButton color="secondary" size="small"><TransformIcon /></IconButton></Tooltip>
          {
            filterName !== "[all]" ? <>
              <Tooltip title="remove selection(keep the image)"><IconButton color="secondary" size="small"><DeleteIcon /></IconButton></Tooltip>
              <Tooltip title="delete images in current selection"><IconButton color="secondary" size="small"><DeleteForeverIcon /></IconButton></Tooltip>
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
      <ImageGallery height={height} images={currentImages} column={column} enableFullscreen badge></ImageGallery>
    </Paper>
  </Container>);
}


export default Editor;


