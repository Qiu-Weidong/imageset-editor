import { Group, Text } from '@mantine/core';
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import ErrorIcon from '@mui/icons-material/Error';

export function Debug(props: Partial<DropzoneProps>) {
  return (
    <Dropzone
      // 这里的 file 是带数据的
      onDrop={(files) => console.log('accepted files', files)}
      onReject={(files) => console.log('rejected files', files)}
      maxSize={5 * 1024 ** 2}
      accept={IMAGE_MIME_TYPE} // 接受图片类型
      {...props}
    >
      <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <CloudUploadIcon/>
        </Dropzone.Accept>
        <Dropzone.Reject>
          <ErrorIcon/>
        </Dropzone.Reject>
        {/* 默认展示的是idle */}
        <Dropzone.Idle>
          <ImageIcon/>
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
  );
}


export default Debug;