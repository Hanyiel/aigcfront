// 扩展浏览器类型定义
interface Window {
  ImageCapture: {
    prototype: ImageCapture;
    new (track: MediaStreamTrack): ImageCapture;
  };
}

interface ImageCapture {
  grabFrame(): Promise<ImageBitmap>;
  takePhoto(photoSettings?: PhotoSettings): Promise<Blob>;
  readonly track: MediaStreamTrack;
}

interface PhotoSettings {
  fillLightMode?: string;
  imageHeight?: number;
  imageWidth?: number;
  redEyeReduction?: boolean;
}
