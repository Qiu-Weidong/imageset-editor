import { Group, Text } from '@mantine/core';
import { Dropzone, DropzoneProps, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import ErrorIcon from '@mui/icons-material/Error';
import { useState } from 'react';
import { IconButton, ImageList, ImageListItem } from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';

function ImageUploader({
  onChange: onChange, 
  dropZoneProps, 
  preview = false,
}: {
  onChange?: (files: FileWithPath[]) => void,
  dropZoneProps?: Partial<DropzoneProps>,
  preview: boolean,
}) {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  return (
    <>
      <Dropzone
        // 这里的 file 是带数据的
        onDrop={(_files) => setFiles([...files, ..._files]) }
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE} // 接受图片类型
        {...dropZoneProps}
      >
        <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <CloudUploadIcon />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <ErrorIcon />
          </Dropzone.Reject>
          {/* 默认展示的是idle */}
          <Dropzone.Idle>
            <ImageIcon />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag images here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Attach as many files as you like, each file should not exceed 5mb
            </Text>
          </div>
        </Group>
      </Dropzone>

      {
        preview ? <ImageList variant="masonry" cols={12} gap={4} sx={{ marginTop: 0, }}>
          {
            files.map((file, index) => {
              const imageUrl = URL.createObjectURL(file);
              return <ImageListItem>
                <img key={index} src={imageUrl} onLoad={() => URL.revokeObjectURL(imageUrl)} />
                <IconButton size='small' sx={{ position: 'absolute', top: 0, right: 0, }}
                  onClick={() => {
                    const _files = files.filter(f => f !== file);
                    setFiles(_files);
                    onChange?.(_files);
                  } }
                > <CloseOutlined /> </IconButton>
              </ImageListItem>
            })
          }
        </ImageList> : <></>
      }
    </>

  );
}




export function Debug() {
  return (
    <ImageUploader preview></ImageUploader>
  );
}


export default Debug;