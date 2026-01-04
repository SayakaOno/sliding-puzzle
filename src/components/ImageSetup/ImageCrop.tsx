import type {Ref} from 'react';
import ReactCrop, {
  type Crop,
  type PercentCrop,
  type PixelCrop,
} from 'react-image-crop';

interface ImageCropProps {
  src: string;
  crop?: Crop;
  setCrop: (crop: Crop) => void;
  getCroppedImage: (crop: PixelCrop, percentageCrop: PercentCrop) => void;
  originalImageRef: Ref<HTMLImageElement> | undefined;
  onDragEnd: () => void;
}

function ImageCrop({
  src,
  crop,
  setCrop,
  getCroppedImage,
  originalImageRef,
  onDragEnd,
}: ImageCropProps) {
  return (
    <ReactCrop
      crop={crop}
      onChange={(c) => setCrop(c)}
      onComplete={getCroppedImage}
      onDragEnd={onDragEnd}
      aspect={1}
      minWidth={50}
      minHeight={50}
    >
      <img ref={originalImageRef} src={src} />
    </ReactCrop>
  );
}

export default ImageCrop;
