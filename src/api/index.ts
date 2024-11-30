// 将所有 eel 调用全部切换为 api 调用

import axios from "axios";
import { ImageSetMetadata } from "../page/imageset/Overview";
import { ImageSetState, ImageState } from "../app/imageSetSlice";


const port = window.api_port || 1420;
const host = window.api_host || 'localhost'


// 设置后端路径
axios.defaults.baseURL = `http://${host}:${port}`


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


async function load(imageset_name: string, is_regular: boolean): Promise<ImageSetState> {
  let result: ImageSetState = (await axios.get("/imageset/load", {
    params: { imageset_name, is_regular }
  })).data;
  // 记得添加一个 <all> 的标识
  const all_images: ImageState[] = []
  for(const filter of result.filters) {
    all_images.push(...filter.images);
  }
  result.filters.push({
    name: '<all>', 
    images: all_images,
    concept: null,
  });
  return result;
}


async function open_in_file_explore(imageset_name:string) {
  await axios.get("/imageset/open_in_file_explore", { params: { imageset_name } });
}

async function delete_concept(imageset_name: string, is_regular: boolean, concept_folder: string) {
  await axios.delete("/imageset/delete_concept", { params: { imageset_name, is_regular, concept_folder } });
}

async function interrogate(
  images: ImageState[], 
  model_name: string, 
  threshold: number, 
  additional_tags: string[] = [], 
  exclude_tags: string[] = []) {
  return (await axios.post("/tag/interrogate", {
    images: images.map(image => image.path), 
    model_name, 
    threshold,  additional_tags, exclude_tags, 
  })).data
}

const api = {
  delete_imageset,
  create_imageset,
  find_imageset_list,
  rename_imageset,
  get_imageset_metadata,
  add_concept,
  load,
  open_in_file_explore,
  delete_concept,
  interrogate,
};



export default api;


