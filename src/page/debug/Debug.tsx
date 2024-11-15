import { Box, Card, Container } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from 'swiper/modules';

// 记得导入需要的样式
import 'swiper/css';
import 'swiper/css/navigation';

import 'swiper/css/pagination';
// import 'swiper/css/scrollbar';

// 展示训练集和正则集的基本信息, 点击即可进入
function Debug() {
  const child = (
    <div style={{   display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div style={{ height: '80%', width: '100%' }}>
        <Card sx={{ width: '100%', height: '100%', }}>
          <Swiper
            spaceBetween={25}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            loop
            style={{ height: '100%' }}

            modules={[Navigation, Pagination]}
          >
            <SwiperSlide>
              <img src="http://e.hiphotos.baidu.com/image/pic/item/a1ec08fa513d2697e542494057fbb2fb4316d81e.jpg"
                alt="" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </SwiperSlide>
            <SwiperSlide>
              <img src="http://c.hiphotos.baidu.com/image/pic/item/30adcbef76094b36de8a2fe5a1cc7cd98d109d99.jpg"
                alt="" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </SwiperSlide>
            <SwiperSlide>
              <img src="http://h.hiphotos.baidu.com/image/pic/item/7c1ed21b0ef41bd5f2c2a9e953da81cb39db3d1d.jpg"
                alt="" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </SwiperSlide>
            <SwiperSlide>
              <img src="http://g.hiphotos.baidu.com/image/pic/item/55e736d12f2eb938d5277fd5d0628535e5dd6f4a.jpg"
                alt="" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </SwiperSlide>
            <SwiperSlide>
              <img src="http://e.hiphotos.baidu.com/image/pic/item/4e4a20a4462309f7e41f5cfe760e0cf3d6cad6ee.jpg"
                alt="" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </SwiperSlide>
          </Swiper>
        </Card>
      </div>
    </div>
  );



  return (
    // 首先竖着排, 名称和内容
    <Container fixed style={{ display: 'flex', flexDirection: 'column', height: '100vh',  }}>
      
      <h1>Hello World</h1>

      <Box style={{ display: 'flex',  flex: 1, }}>

        <Container style={{ width: '50%' }} >
          {child}
        </Container>
        <Container style={{ width: '50%' }} >
          {child}
        </Container>
      </Box>

    </Container>

  );
}



export default Debug;


