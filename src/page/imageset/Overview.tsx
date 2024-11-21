import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { eel } from "../../App";
import { Box, Card, CardContent, CircularProgress, Container, Fab, Paper, Toolbar, Typography } from "@mui/material";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import Header from "../header/Header";
import { useDispatch } from "react-redux";
import { setImageSetName } from "../../app/imageSetSlice";
import CreateDialog from "../dialog/CreateDialog";



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


function ConceptCover(props: { concept: ConceptMetadata, onClick: () => void }) {
  return (<div style={{
    height: '100%', backgroundImage: `url('${props.concept.cover}')`,
    backgroundSize: 'cover', position: 'relative',
  }}
    onClick={props.onClick}>
    <img
      src={props.concept.cover || ''}
      alt="img" style={{
        objectFit: 'contain',
        width: '100%',
        height: '100%',
        background: 'rgba(255, 255, 255, .47)',
        backdropFilter: 'blur(48px)',
      }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', }} >
      <CardContent>
        <Typography variant="h4" component="div" color="success" style={{ fontWeight: 900 }} >
          {props.concept.name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {props.concept.image_count} images, {props.concept.repeat} repeat.
        </Typography>
      </CardContent>
    </div>
  </div>);
}


// 展示训练集和正则集的基本信息, 点击即可进入
function Overview() {
  const carousel_height = 480;

  const location = useLocation();
  const { imageset_name } = location.state;
  const dispatch = useDispatch();

  // 通过路由传参将打开的imageset名称传入
  const navigate = useNavigate();

  // imageset_name 可以直接使用 selector
  // const imageset_name = useSelector((state: RootState) => state.imageSet.name);
  const [trainDataset, setTrainDataset] = useState<ImageSetMetadata | null>(null);
  const [regularDataset, setRegularDataset] = useState<ImageSetMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  const [createDialog, setCreateDialog] = useState<'train' | 'regular' | null>(null);

  async function load() {
    setLoading(true);
    setTrainDataset(null);
    setRegularDataset(null);

    try {
      let result: { train: ImageSetMetadata, regular: ImageSetMetadata } = await eel.get_imageset_metadata(imageset_name)();
      // 这里的 load 是无法 stop 的
      if (result.train) {
        setTrainDataset(result.train);
      }
      if (result.regular) {
        setRegularDataset(result.regular);
      }
      // dispatch 以修改 redux 的状态 name 修改为
      dispatch(setImageSetName(imageset_name));
    } catch(error) {
      console.error(error);
      // 跳转到 404 页面
    } finally {
      setLoading(false);
    }
  }



  useEffect(() => {
    setImageSetName(imageset_name);
  }, [imageset_name]);

  // 还需要添加一个 concept 参数
  const jump2detail = (isRegular: boolean, concept: string) => {
    // 设置类型为 train | regular
    navigate("/detail", { state: { imageset_name, isRegular, concept } });
  };


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

      <Carousel withIndicators height={carousel_height} loop >
        {
          trainDataset.concepts.map((item: ConceptMetadata, index: number) =>
            <Carousel.Slide key={index}>
              <ConceptCover concept={item} onClick={() => jump2detail(false, item.name)} />
            </Carousel.Slide>)
        }
      </Carousel>

    </Card> : <Fab variant="extended" color="primary" onClick={() => setCreateDialog("train") }>
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

      <Carousel withIndicators height={carousel_height} loop >
        {
          regularDataset.concepts.map((item: ConceptMetadata, index: number) =>
            <Carousel.Slide key={index} style={{ height: '100%', backgroundImage: `url('${item.cover}')`, backgroundSize: 'cover' }}>
              <ConceptCover concept={item} onClick={() => jump2detail(false, item.name)} />
            </Carousel.Slide>)
        }
      </Carousel>

    </Card> : <Fab variant="extended" color="secondary" onClick={() => setCreateDialog('regular') }>
      <NoteAddIcon sx={{ mr: 1 }} />
      Create Regular Dataset
    </Fab>
    ;


  return (
    <Container sx={{ minHeight: '100vh', height: '100vh' }}>
      <Header onRenameImageset={(_, new_name) => {
        navigate('/overview', { replace: true, state: { imageset_name: new_name } });
      }}
        onLoad={load}
      ></Header>

      {/* tool bar 占位 */}
      <Toolbar></Toolbar>
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

      <CreateDialog open={createDialog} onClose={() => setCreateDialog(null) } />

    </Container>);
}



export default Overview;


