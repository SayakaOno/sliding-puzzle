import {useRef, useState} from 'react';
import Select from 'react-select';
import {type Crop, type PixelCrop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Particles from '@tsparticles/react';
import ImageCrop from './components/ImageCrop';
import ImageUploader from './components/ImageUploader';
import ImageSlicer from './components/ImageSlicer';
import {canvasPreview} from './utils/canvasPreview';
import {useDebounceEffect} from './hooks/useDebounceEffect';
import {PARTICLE_OPTIONS, useParticles} from './hooks/useParticles';
import './App.css';

const gridSizeOptions = [
  {value: 2, label: '2x2'},
  {value: 3, label: '3x3'},
  {value: 4, label: '4x4'},
  {value: 5, label: '5x5'},
  {value: 6, label: '6x6'},
  {value: 7, label: '7x7'},
  {value: 8, label: '8x8'},
  {value: 9, label: '9x9'},
  {value: 10, label: '10x10'},
  {value: 11, label: '11x11'},
  {value: 12, label: '12x12'},
];

function App() {
  const [gridSize, setGridSize] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCompleted, setIsCompleted] = useState(false);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const canStartGameRef = useRef(false);
  const blobUrlRef = useRef('');

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

  const onDragEnd = () => {
    if (!canStartGameRef.current) {
      canStartGameRef.current = true;
    }
  };

  return (
    <div ref={contentRef} className="content">
      <h1>PERFECT PUZZLE</h1>
      <Select
        className="react-select-container"
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary25: '#c99cffff',
            primary: '#8a21c6ff',
          },
        })}
        isDisabled={isPlaying}
        options={gridSizeOptions}
        defaultValue={gridSizeOptions[1]}
        name="gridSize"
        value={gridSizeOptions.find((option) => option.value === gridSize)}
        onChange={(option) => {
          if (option) {
            setGridSize(option.value);
          }
        }}
      />
      {isPlaying && previewCanvasRef.current && contentRef.current ? (
        <ImageSlicer
          previewCanvasRef={previewCanvasRef}
          isCompleted={isCompleted}
          setIsCompleted={setIsCompleted}
          gridSize={gridSize}
          containerWidth={contentRef.current.clientWidth}
        />
      ) : (
        <div className="image-uploader">
          <ImageUploader onImageLoad={handleImageUpload} />
          {!!originalImageUrl && (
            <>
              <p>Draw a square on the picture. That part will be used.</p>
              <div ref={wrapperRef} className="image-crop-wrapper">
                <ImageCrop
                  originalImageRef={originalImageRef}
                  src={originalImageUrl}
                  crop={crop}
                  setCrop={setCrop}
                  getCroppedImage={(c) => setCompletedCrop(c)}
                  onDragEnd={onDragEnd}
                />
              </div>
            </>
          )}
        </div>
      )}
      {canStartGameRef.current && !!completedCrop && (
        <div className="preview-canvas-wrapper">
          <div
            className="empty-tile-indicator"
            style={{
              width: `calc(100% / ${gridSize}`,
              height: `calc(100% / ${gridSize})`,
            }}
          />
          <canvas ref={previewCanvasRef} />
        </div>
      )}
      {!isPlaying && canStartGameRef.current && (
        <button onClick={onClickStart}>Start Game</button>
      )}
      {isCompleted && isParticlesLoaded && (
        <Particles id="tsparticles" options={PARTICLE_OPTIONS} />
      )}
    </div>
  );
}

export default App;
