

// 包含一个header, header中包含数据集名称, 刷新按钮, 新建按钮, 保存按钮, 设置按钮, 帮助按钮

import { useLocation, useNavigate } from "react-router-dom";
import Header from "../header/Header";
import { Toolbar } from "@mui/material";
import { useEffect, useState } from "react";

// 这个页面展示图片预览, 以及操作按钮, 点击操作按钮会跳转到对应的操作页面
function Detail() {
  // imageset name, train/reg
  const location = useLocation();

  // concept 的名称和重复次数共同定位到某个目录
  const { imageset_name, isRegular, concept, repeat }: { imageset_name: string, isRegular: boolean, concept: string, repeat: number } = location.state;

  const [filterName, setFilterName] = useState(`${repeat}_${concept}`);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    // 加载 ImageSet
    
  }, [imageset_name, isRegular]);

  const navigate = useNavigate();

  async function load() {
    // 加载数据
    setLoading(true);
    
  }

  return (<>
    <Header onRenameImageset={(_, new_name) => {
      navigate('/detail', { replace: true, state: { ...location.state, imageset_name: new_name, } })
    }}
      onLoad={load}
    />

    {/* 先占位 */}
    <Toolbar></Toolbar>

    {/* 正式内容 */}

  </>);
}

export default Detail;


