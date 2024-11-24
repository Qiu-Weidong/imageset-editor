import { Box, Card, CardContent, Container, Typography } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from 'swiper/modules';

// 记得导入需要的样式
import 'swiper/css';
import 'swiper/css/navigation';

import 'swiper/css/pagination';
// import 'swiper/css/scrollbar';

// 展示训练集和正则集的基本信息, 点击即可进入
function Debug() {
  const _back = (
    <Container sx={{ minHeight: '100vh', }}>
      {/* 标题 */}
      <Typography variant="h2" gutterBottom>
        Hello World
      </Typography>

      {/* 内容 */}
      <Box style={{ display: 'flex', minHeight: '85vh', }}>
        <Container style={{ width: '50%', minHeight: '100%' }} >
        </Container>
        <Container style={{ width: '50%', minHeight: '100%' }} >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', height: '100%', }}>
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

              <Swiper
                spaceBetween={25}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                loop
                modules={[Navigation, Pagination]}
                style={{ height: 640, }}
              >
                <SwiperSlide>
                  <img
                    src="/00001-766364056.png"
                    alt="img" style={{ objectFit: 'contain', width: '100%', height: '100%', }} />
                </SwiperSlide>
                <SwiperSlide>
                  <img
                    src="/00002-3026625078.png"
                    alt="img" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                </SwiperSlide>
                <SwiperSlide>
                  <img
                    src="/00003-1370649249.png"
                    alt="img" style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                </SwiperSlide>
                <SwiperSlide>
                  <img
                    src="http://b.hiphotos.baidu.com/image/pic/item/e824b899a9014c08878b2c4c0e7b02087af4f4a3.jpg"
                    alt="img" width="100%" height="100%" style={{ objectFit: 'contain' }} />
                </SwiperSlide>

              </Swiper>

            </Card>
          </div>
        </Container>
      </Box>

    </Container>
  );



  return (

    <></>

  );
}



export default Debug;


