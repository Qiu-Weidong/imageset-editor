import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { eel } from "../../App";
import { Box, Card, CardContent, CircularProgress, Container, Fab, Typography } from "@mui/material";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';


interface ConceptMetadata {
  name: string,
  repeat: number,
  image_count: number,
  cover: string | null, // 封面 base64
};

interface ImageSetMetadata {
  image_count: number, // 总图片数量
  total_repeat: number, // 总重复次数
  concepts: ConceptMetadata[], // 概念的metadata
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
  const [trainDataset, setTrainDataset] = useState<ImageSetMetadata | null>(null);
  const [regularDataset, setRegularDataset] = useState<ImageSetMetadata | null>(null);



  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 先简单一点, 加载一张预览图就好

    eel.get_imageset_metadata(imageset_name)().then((result: any) => {
      if (result.train) {
        setTrainDataset(result.train);
      }
      if (result.regular) {
        setRegularDataset(result.regular);
      }
      setLoading(false);
    }).catch((error: any) => {
      console.error(error);
    });

  }, []);

  // 还需要添加一个 concept 参数
  const jump2detail = (isRegular: boolean, concept: string) => {
    navigate("/detail", { state: { imageset_name, isRegular, concept } });
  };

  const button = <Fab variant="extended" color="primary">
    <NoteAddIcon sx={{ mr: 1 }} />
    Create Train Dataset
  </Fab>;


  const loadingContent = (<div style={{
    margin: "auto",
    minWidth: '100%',
    minHeight: '80%',
    width: '100%',
    height: '80%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}><CircularProgress size={128} /></div>);


  const train = trainDataset ?
    <Card sx={{ width: '100%', marginBottom: 1, }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Train Dataset
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {trainDataset.concepts.length} concepts, {trainDataset.image_count} images, {trainDataset.total_repeat} repeat.
        </Typography>
      </CardContent>

      <Carousel withIndicators height={640} loop >
        {
          trainDataset.concepts.map((item: ConceptMetadata, index: number) =>
            <Carousel.Slide key={index} style={{ height: '100%', backgroundImage: `url('${item.cover}')`, backgroundSize: 'cover' }}>
              <img
                src={item.cover || ''}
                alt="img" style={{
                  objectFit: 'contain',
                  width: '100%',
                  height: '100%',
                  background: 'rgba(255, 255, 255, .47)',
                  backdropFilter: 'blur(48px)',
                }} />
            </Carousel.Slide>)
        }
      </Carousel>

    </Card> : <Fab variant="extended" color="primary">
      <NoteAddIcon sx={{ mr: 1 }} />
      Create Train Dataset
    </Fab>
    ;


  const regular = regularDataset ?
    <Card sx={{ width: '100%', marginBottom: 1, }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Regular Dataset
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {regularDataset.concepts.length} concepts, {regularDataset.image_count} images, {regularDataset.total_repeat} repeat.
        </Typography>
      </CardContent>

      <Carousel withIndicators height={640} loop >
        {
          regularDataset.concepts.map((item: ConceptMetadata, index: number) =>
            <Carousel.Slide key={index} style={{ height: '100%', backgroundImage: `url('${item.cover}')`, backgroundSize: 'cover' }}>
              <img
                src={item.cover || ''}
                alt="img" style={{
                  objectFit: 'contain',
                  width: '100%',
                  height: '100%',
                  background: 'rgba(255, 255, 255, .47)',
                  backdropFilter: 'blur(48px)',
                }} />
            </Carousel.Slide>)
        }
      </Carousel>

    </Card> : <Fab variant="extended" color="primary">
      <NoteAddIcon sx={{ mr: 1 }} />
      Create Regular Dataset
    </Fab>
    ;


  return (
    <Container sx={{ minHeight: '100vh', height: '100vh' }}>
      <Typography variant="h2" gutterBottom>
        {imageset_name}
      </Typography>
      <Box style={{ display: 'flex', minHeight: '85vh', }}>
        {
          loading ? <>{loadingContent}</> :
            <><Container style={{
              width: '50%',
              minHeight: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }} >
              {train}
            </Container>

              <Container style={{
                width: '50%',
                minHeight: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }} >
                {regular}
              </Container>
            </>
        }

      </Box>



    </Container>);
}



export default Overview;


