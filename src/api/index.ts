// 将所有 eel 调用全部切换为 api 调用

import axios from "axios";
import { ImageSetMetadata } from "../page/imageset/Overview";


const port = window.api_port || 1420;


// 设置后端路径
axios.defaults.baseURL = `http://localhost:${port}`


async function delete_imageset(imageset_name: string) {
  await axios.delete('/imageset/delete', { params: { name: imageset_name } })
}

async function create_imageset(imageset_name: string) {
  // 注意 post 和 put 的第二个参数是 data
  await axios.post('/imageset/create', {}, { params: { name: imageset_name } })
}

async function find_imageset_list(): Promise<string[]> {
  let result: string[] = (await axios.get("/imageset")).data;
  return result;
}

async function rename_imageset(oldname: string, newname: string) {
  await axios.put("/imageset/rename", {}, { params: { origin_name: oldname, new_name: newname } })
}

type Metadata = { train: ImageSetMetadata, regular: ImageSetMetadata };
async function get_imageset_metadata(name: string): Promise<Metadata> {
  let result: Metadata = (await axios.get("/imageset/metadata", { params: { name } })).data
  return result;
}

async function add_concept(
  imageset_name: string, 
  concept_name: string, 
  repeat: number, 
  type: 'train' | 'regular',
  load_directory: string,
) {
  let result: number = (await axios.post("/imageset/add_concept", {}, {
    params: {imageset_name, concept_name, repeat, type, load_directory}
  })).data;
  return result;
}

const api = {
  delete_imageset,
  create_imageset,
  find_imageset_list,
  rename_imageset,
  get_imageset_metadata,
  add_concept,
};



export default api;


