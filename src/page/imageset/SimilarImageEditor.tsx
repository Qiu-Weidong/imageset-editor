import { Container, Divider, Paper, Stack, Grid2 as Grid, IconButton, Chip, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import api from "../../api";


export interface SimilarImageState {
  src: string,
  thumbnail: string,
  filename: string,
  basename: string,
  path: string,
  size: number,
  width: number,
  height: number,
};




function SimilarImageEditor() {
  const location = useLocation();
  const navigate = useNavigate();

  const { similar_images }: { similar_images: SimilarImageState[][] } = location.state;

  const [similarImages, setSimilarImages] = useState(similar_images);
  useEffect(() => {
    setSimilarImages(similar_images);
  }, [similar_images]);


  function delete_image(image: SimilarImageState, i: number, j: number) {
    api.delete_images([{
      ...image,
      captions: [],
      concept: "",
      repeat: 0,
    }]).then(() => {
      // 删除 similarImages 的 i, j 这张图片
      const images = similarImages.map((li, index) => {
        if(index === i) {
          return li.filter((_, index) => index !== j);
        } else {
          return li;
        }
      });
      setSimilarImages(images.filter(li => li.length > 0));
    });
  }


  function SimilarImageList({
    images, index,
  }: { images: SimilarImageState[], index: number }) {
    return (<Paper elevation={3} style={{ overflowX: 'scroll', paddingBottom: 0, }}>
      <Stack direction={"row"} spacing={1}>
        {
          images.sort((a, b) => a.size - b.size).map((image, i) => <div style={{ position: 'relative', height: 256, overflow: 'hidden' }}>

            <img style={{ objectFit: 'contain', }} src={image.src} height={256}></img>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom,  rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.25) 30%, rgba(0,0,0,0) 75%)',
              pointerEvents: 'none',
            }} >
              <Grid spacing={1} container sx={{ margin: 1, position: 'absolute', bottom: 0, left: 0, }}>
                <Chip label={image.filename} size="small" variant="filled" color="success" />
                <Chip label={`${image.width}x${image.height}`} size="small" variant="filled" color="primary" />
                <Chip label={`${(image.size / 1024).toFixed(1)}KB`} size="small" variant="filled" color="secondary" />
              </Grid>


            </div>
            <IconButton
              sx={{ position: 'absolute', top: 0, right: 0, }}
              size="small"
              color="default"
              onClick={() => delete_image(image, index, i) }
            >
              <DeleteIcon />
            </IconButton>
          </div>

          )
        }
      </Stack>
    </Paper>);
  }


  return (<>
    <Container fixed maxWidth="xl">
      <Button onClick={() => navigate(-1) } variant="contained">return</Button>
      <Grid container spacing={2}>
        {
          similarImages.map((images, index) =>
            <SimilarImageList index={index} images={images} />
          )
        }</Grid>
    </Container>
  </>);
}

export default SimilarImageEditor;



