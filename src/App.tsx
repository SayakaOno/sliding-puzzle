import {useRef, useState} from 'react';
import {type Crop, type PixelCrop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Particles from '@tsparticles/react';
import Modal from 'react-modal';
import ImageCrop from './components/ImageCrop';
import ImageUploader from './components/ImageUploader';
import ImageSlicer from './components/ImageSlicer';
import {canvasPreview} from './utils/canvasPreview';
import {useDebounceEffect} from './hooks/useDebounceEffect';
import {PARTICLE_OPTIONS, useParticles} from './hooks/useParticles';
import './App.css';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const blobUrlRef = useRef('');
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const isParticlesLoaded = useParticles();

  async function onClickStart() {
    const image = originalImageRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error('Crop canvas does not exist');
    }

    // This will size relative to the uploaded image
    // size. If you want to size according to what they
    // are looking at on screen, remove scaleX + scaleY
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    );
    // You might want { type: "image/jpeg", quality: <0 to 1> } to
    // reduce image size
    const blob = await offscreen.convertToBlob({
      type: 'image/png',
    });

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = URL.createObjectURL(blob);

    setIsPlaying(true);
  }

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

  const handleStartGame = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  };

  const handleGameComplete = () => {
    setIsCompleted(true);
    setIsSuccessModalOpen(true);

    if (!endTimeRef.current) {
      endTimeRef.current = Date.now();
    }
  };

  return (
    <div className="content">
      <h1>PERFECT PUZZLE</h1>
      {isPlaying && previewCanvasRef.current ? (
        <ImageSlicer
          previewCanvasRef={previewCanvasRef}
          handleStartGame={handleStartGame}
          handleGameComplete={handleGameComplete}
        />
      ) : (
        <>
          <ImageUploader onImageLoad={handleImageUpload} />
          {!!originalImageUrl && (
            <div ref={wrapperRef} className="image-crop-wrapper">
              <ImageCrop
                originalImageRef={originalImageRef}
                src={originalImageUrl}
                crop={crop}
                setCrop={setCrop}
                getCroppedImage={(c) => setCompletedCrop(c)}
              />
            </div>
          )}
        </>
      )}
      {!!completedCrop && (
        <>
          <div>
            <canvas
              ref={previewCanvasRef}
              style={{
                border: '1px solid black',
                objectFit: 'contain',
                width: completedCrop.width,
                height: completedCrop.height,
                visibility: isPlaying ? 'hidden' : 'visible',
              }}
            />
          </div>
          {!isPlaying &&
            !!(crop && crop.x && crop.y && crop.width && crop.height) && (
              <button onClick={onClickStart}>Start Game</button>
            )}
        </>
      )}
      {isCompleted && isParticlesLoaded && (
        <Particles id="tsparticles" options={PARTICLE_OPTIONS} />
      )}
      {endTimeRef.current && startTimeRef.current && (
        <Modal
          className="success-modal"
          isOpen={isSuccessModalOpen}
          contentLabel="Success Modal"
        >
          <div className="success-message">
            <h2>Congratulations!</h2>
            <p>
              You completed in{' '}
              {Math.round((endTimeRef.current - startTimeRef.current) / 1000)}{' '}
              seconds!
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
