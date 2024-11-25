

// 包含一个header, header中包含数据集名称, 刷新按钮, 新建按钮, 保存按钮, 设置按钮, 帮助按钮

import { useLocation, useNavigate } from "react-router-dom";
import Header from "../header/Header";

// 这个页面展示图片预览, 以及操作按钮, 点击操作按钮会跳转到对应的操作页面
function Detail() {
  // imageset name, train/reg
  const location = useLocation();
  // 进入 detail 的时候一定是进入某个 concept
  const { imageset_name, isRegular, concept } = location.state;

  const navigate = useNavigate();

  async function load() {

  }

  return (<>
    <Header onRenameImageset={(_, new_name) => {
      navigate('/detail', { replace: true, state: { ...location.state, imageset_name: new_name, } })
    }}
      onLoad={load}
    />

  </>);
}

export default Detail;


