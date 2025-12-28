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
}

function ImageCrop({
  src,
  crop,
  setCrop,
  getCroppedImage,
  originalImageRef,
}: ImageCropProps) {
  return (
    <ReactCrop
      crop={crop}
      onChange={(c) => setCrop(c)}
      onComplete={getCroppedImage}
      aspect={1}
      // ruleOfThirds
    >
      <img ref={originalImageRef} src={src} />
    </ReactCrop>
  );
}

export default ImageCrop;
