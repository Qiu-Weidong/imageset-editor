import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { eel } from "../../App";
import { Box, Card, CardContent, CircularProgress, Container, Fab, Typography } from "@mui/material";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';


interface Meta {
  repeat: number,
  image_count: number,
  concept_count: number,
  cover: string | null,
};


// 展示训练集和正则集的基本信息, 点击即可进入
function Overview() {

  const images = [
    '/00001-766364056.png', "/00002-3026625078.png", "/00003-1370649249.png",
  ];


  // 通过路由传参将打开的imageset名称传入
  const location = useLocation();
  const navigate = useNavigate();

  const { imageset_name } = location.state;

  const [trainset, setTrainset] = useState<Meta | null>(null);
  const [regset, setRegset] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 先简单一点, 加载一张预览图就好
    eel.get_imageset_cover(imageset_name)().then((result: any) => {
      if (result.train) {
        setTrainset(result.train);
      }
      if (result.regular) {
        setRegset(result.regular);
      }

      setLoading(false);
    }).catch((err: any) => {
      console.error(err);
    })

  }, []);


  const jump2detail = (isRegular: boolean) => {
    navigate("/detail", { state: { imageset_name, isRegular } });
  };

  const train = trainset ? (
    <Card sx={{ width: '100%', height: '80%', }}>
    </Card>
  ) : <Fab variant="extended" color="primary">
    <NoteAddIcon sx={{ mr: 1 }} />
    Create Train Dataset
  </Fab>
    ;


  const reg = regset ? (
    <Card >
      {/* 后端随机传一张 image 来, 如果一张图片都没有就不显示 */}

      <CardContent>
        <Carousel></Carousel>
      </CardContent>

      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Regular Dataset
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {regset.concept_count} concepts, {regset.image_count} images, {regset.repeat} repeat.
        </Typography>
      </CardContent>
    </Card>
  ) : <Fab variant="extended" color="secondary">
    <NoteAddIcon sx={{ mr: 1 }} />
    Create Regular Dataset
  </Fab>
    ;


  const loadingContent = (<div style={{
    margin: "auto",
    minWidth: '100%',
    minHeight: '80%',
    width: '100%',
    height: '80%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}><CircularProgress /></div>);


  return (
    <Container sx={{ minHeight: '100vh', height: '100vh' }}>
      <Typography variant="h2" gutterBottom>
        {imageset_name}
      </Typography>
      <Box style={{ display: 'flex', minHeight: '85vh', }}>
        <Container style={{ 
          width: '50%', 
          minHeight: '100%', 
          display: 'flex',  
          justifyContent: 'center',
          alignItems: 'center',
        }} >
          <Card sx={{ width: '100%', marginBottom: 1, }}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Train Dataset
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Lizards are a widespread group of squamate reptiles, with over 6,000
                species, ranging across all continents except Antarctica
              </Typography>
            </CardContent>

            <Carousel withIndicators height={640} loop >
            {
                images.map((url: string) => <Carousel.Slide style={{ height: '100%', backgroundImage: `url('${url}')`, backgroundSize: 'cover' }}>
                <img
                  src={url}
                  alt="img" style={{ objectFit: 'contain', width: '100%', height: '100%', background: 'rgba(255, 255, 255, .47)', backdropFilter: 'blur(48px)' }} />
              </Carousel.Slide>)
              }
            </Carousel>

          </Card>
        </Container>

        <Container style={{ 
          width: '50%', 
          minHeight: '100%', 
          display: 'flex',  
          justifyContent: 'center',
          alignItems: 'center',
        }} >

        </Container>
      </Box>



    </Container>);
}



export default Overview;


