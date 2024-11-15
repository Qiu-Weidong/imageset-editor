// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';

export const Carousel = () => {
  const s1 = (
    <Swiper 
      spaceBetween={25} 
      slidesPerView={1}
      navigation
      loop
    >
      <SwiperSlide>Slide 1</SwiperSlide>
      <SwiperSlide><h3>Slide 2</h3></SwiperSlide>
      <SwiperSlide><h3>Slide 3</h3></SwiperSlide>
    </Swiper>
  );




  return (
    <> {s1} </>
  );
};

