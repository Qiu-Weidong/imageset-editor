import { Box, Card, CardContent, Container, Typography } from "@mui/material";
import { Carousel } from '@mantine/carousel';

import '@mantine/carousel/styles.css';

// 展示训练集和正则集的基本信息, 点击即可进入
function Debug() {

  const images = [
    '/00001-766364056.png', "/00002-3026625078.png", "/00003-1370649249.png",
  ];
  return (

    <Container sx={{ minHeight: '100vh', }}>
      <Typography variant="h2" gutterBottom>
        Hello World
      </Typography>

      <Box style={{ display: 'flex', minHeight: '85vh', }}>
        <Container style={{ width: '50%', minHeight: '100%' }} >
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
              {/* 设置背景 */}
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
        
        <Container style={{ width: '50%', minHeight: '100%' }} >
        </Container>

      </Box>


    </Container>

  );
}



export default Debug;


