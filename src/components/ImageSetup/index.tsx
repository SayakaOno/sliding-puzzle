import {useState} from 'react';
import ReactCrop, {type Crop, type PixelCrop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import ImageUploader from './ImageUploader';
import {canvasPreview} from './canvasPreview';
import {useDebounceEffect} from './useDebounceEffect';
import './index.css';

interface ImageSetupProps {
  completedCrop: PixelCrop | undefined;
  setCompletedCrop: (crop: PixelCrop | undefined) => void;
  setCanStartGame: () => void;
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  originalImageRef: React.RefObject<HTMLImageElement | null>;
}

function ImageSetup({
  completedCrop,
  setCompletedCrop,
  setCanStartGame,
  previewCanvasRef,
  originalImageRef,
}: ImageSetupProps) {
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [originalImageUrl, setOriginalImageUrl] = useState('');

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        originalImageRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          originalImageRef.current,
          previewCanvasRef.current,
          completedCrop
        );
      }
    },
    100,
    [completedCrop]
  );

  const handleImageUpload = (imgSrc: string) => {
    setOriginalImageUrl(imgSrc);
  };

  return (
    <div className="image-uploader">
      <ImageUploader onImageLoad={handleImageUpload} />
      {!!originalImageUrl && (
        <>
          <p>Draw a square on the picture. That part will be used.</p>
          <div className="image-crop-wrapper">
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              onComplete={setCompletedCrop}
              onDragEnd={setCanStartGame}
              aspect={1}
              minWidth={50}
              minHeight={50}
            >
              <img ref={originalImageRef} src={originalImageUrl} />
            </ReactCrop>
          </div>
        </>
      )}
    </div>
  );
}

export default ImageSetup;
