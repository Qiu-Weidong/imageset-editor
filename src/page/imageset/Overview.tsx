import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { eel } from "../../App";
import { Card, CardContent, CardMedia, CircularProgress, Container, Fab, Typography } from "@mui/material";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { Carousel } from "../../componet/Carousel";
import { SwiperSlide, Swiper } from "swiper/react";


interface Meta {
  repeat: number,
  image_count: number,
  concept_count: number,
  cover: string | null,
};


// 展示训练集和正则集的基本信息, 点击即可进入
function Overview() {


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
    <Card  sx={{ width: '100%', height: '80%', }}>

      <Swiper 
        // 在这里设置宽度
        style={{ width: 100 }}
        spaceBetween={25}
        slidesPerView={1}
        navigation
        loop
      >
        <SwiperSlide>
          <img src="" alt="" width={100} />
        </SwiperSlide>
        <SwiperSlide>Slide 2</SwiperSlide>
      </Swiper>

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



  return (<Container fixed style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
    <h1>{imageset_name}</h1>
    {
      !loading ?
        <>
          <Container style={{ flex: 1, boxSizing: 'border-box', display: "flex" }}>
            {/* 分为两列 */}
            <Container style={{
              flex: 1,
              boxSizing: 'border-box',
              display: "flex",
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {train}
            </Container>

            <Container style={{
              flex: 1,
              boxSizing: 'border-box',
              display: "flex",
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {reg}
            </Container>
          </Container>
        </> : <div style={{ margin: "auto" }}><CircularProgress /></div>
    }
  </Container>);
}



export default Overview;


