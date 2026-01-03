import {useEffect, useRef, useState, type RefObject} from 'react';
import Modal from 'react-modal';
import '../App.css';

const findUpTileIndex = (tileIndex: number, gridSize: number) => {
  return tileIndex < gridSize ? null : tileIndex - gridSize;
};

const findLeftTileIndex = (tileIndex: number, gridSize: number) => {
  return tileIndex % gridSize ? tileIndex - 1 : null;
};

const findRightTileIndex = (tileIndex: number, gridSize: number) => {
  return tileIndex % gridSize === gridSize - 1 ? null : tileIndex + 1;
};

const findBottomTileIndex = (tileIndex: number, gridSize: number) => {
  return tileIndex / gridSize >= gridSize - 1 ? null : tileIndex + gridSize;
};

const isSameRow = (tileIndex: number, emptyIndex: number, gridSize: number) => {
  return Math.floor(tileIndex / gridSize) === Math.floor(emptyIndex / gridSize);
};

const isSameColumn = (
  tileIndex: number,
  emptyIndex: number,
  gridSize: number
) => {
  return tileIndex % gridSize === emptyIndex % gridSize;
};

const isSameRowOrColumn = (
  tileIndex: number,
  emptyIndex: number,
  gridSize: number
) => {
  return (
    isSameRow(tileIndex, emptyIndex, gridSize) ||
    isSameColumn(tileIndex, emptyIndex, gridSize)
  );
};

const getAvailableTiles = (tile: number, gridSize: number) => {
  return [
    findLeftTileIndex,
    findRightTileIndex,
    findUpTileIndex,
    findBottomTileIndex,
  ].flatMap((func) => {
    return func(tile, gridSize) || [];
  });
};

const pickRandomItem = (options: number[]) => {
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
};

const shuffleOrder = (
  initialOrder: number[],
  emptyIndex: number,
  gridSize: number,
  count: number = 40
) => {
  const newOrder = initialOrder.slice();
  let currentEmptyTileNumber = emptyIndex;
  let movedTileNumber: number;

  for (let i = 0; i < count; i++) {
    const availableTiles = getAvailableTiles(currentEmptyTileNumber, gridSize);
    const filteredAvailableTiles = availableTiles.filter(
      (tile) => tile !== movedTileNumber
    );
    movedTileNumber = pickRandomItem(filteredAvailableTiles);

    newOrder[currentEmptyTileNumber] = newOrder[movedTileNumber];
    newOrder[movedTileNumber] = 0;

    currentEmptyTileNumber = movedTileNumber;
  }

  return newOrder;
};

export default function ImageSlicer({
  previewCanvasRef,
  setIsCompleted,
  gridSize,
  isCompleted,
  puzzleSize,
}: {
  previewCanvasRef: RefObject<HTMLCanvasElement | null>;
  setIsCompleted: (isCompleted: boolean) => void;
  gridSize: number;
  isCompleted: boolean;
  puzzleSize: number;
}) {
  const [order, setOrder] = useState<number[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const slicedImagesRef = useRef<{url: string; id: number}[]>([]);
  const correctOrderRef = useRef<number[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const sliceImage = (img: HTMLCanvasElement) => {
    const pieceWidth = img.width / gridSize;
    const pieceHeight = img.height / gridSize;

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    canvas.width = pieceWidth;
    canvas.height = pieceHeight;

    const newPieces: {url: string; id: number}[] = [];
    let id = 0;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let pieceDataUrl = '';

        if (y || x) {
          ctx.drawImage(
            img,
            x * pieceWidth,
            y * pieceHeight,
            pieceWidth,
            pieceHeight,
            0,
            0,
            pieceWidth,
            pieceHeight
          );

          pieceDataUrl = canvas.toDataURL();
        }

        newPieces.push({url: pieceDataUrl, id});
        id++;
      }
    }

    slicedImagesRef.current = newPieces;
    correctOrderRef.current = newPieces.map(({id}) => id);

    const order = shuffleOrder(correctOrderRef.current, 0, gridSize);

    setOrder(order);
  };

  useEffect(() => {
    if (previewCanvasRef.current) {
      sliceImage(previewCanvasRef.current);
    }
  }, [previewCanvasRef]);

  useEffect(() => {
    if (!order.length) {
      return;
    }

    const isCompleted = order.every(
      (id, index) => slicedImagesRef.current[index].id === id
    );

    if (isCompleted) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now();
      }
      setIsCompleted(true);

      setTimeout(() => {
        setIsSuccessModalOpen(true);
      }, 1000);
    }
  }, [order]);

  const onPuzzleClick = (tileIndex: number) => {
    if (isCompleted) {
      return;
    }

    handleStartGame();

    setOrder((prev) => {
      const emptyIndex = prev.findIndex((id) => id === 0);

      if (!isSameRowOrColumn(tileIndex, emptyIndex, gridSize)) {
        return prev;
      }

      const newOrder = prev.slice();

      let step: number;

      if (isSameRow(tileIndex, emptyIndex, gridSize)) {
        step = tileIndex < emptyIndex ? -1 : 1;
      } else {
        step = tileIndex < emptyIndex ? gridSize * -1 : gridSize;
      }

      for (let i = emptyIndex; i !== tileIndex; i += step) {
        newOrder[i] = prev[i + step];
      }

      newOrder[tileIndex] = 0;
      return newOrder;
    });
  };

  const handleStartGame = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  };

  const handleRestart = () => {
    setIsCompleted(false);
    setIsSuccessModalOpen(false);
    setOrder(shuffleOrder(correctOrderRef.current, 0, gridSize));
    startTimeRef.current = null;
    endTimeRef.current = null;
  };

  return (
    <div ref={wrapperRef}>
      <canvas ref={canvasRef} style={{display: 'none'}} />

      <div className="puzzle" style={{width: puzzleSize, height: puzzleSize}}>
        {slicedImagesRef.current.map((image) => {
          const tileIndex = order.findIndex((id) => id === image.id);
          const tileStyle = {
            top: `calc(${Math.floor(tileIndex / gridSize) / gridSize} * 100%)`,
            left: `calc(${(tileIndex % gridSize) / gridSize} * 100%)`,
            width: `calc(100% / ${gridSize})`,
            height: `calc(100% / ${gridSize})`,
          };

          if (image.url) {
            return (
              <button
                key={image.id}
                onClick={() => onPuzzleClick(tileIndex)}
                style={tileStyle}
              >
                <img src={image.url} alt={`Piece ${image.id}`} width="100%" />
              </button>
            );
          }
          return <div key={0} style={tileStyle} />;
        })}
      </div>
      {endTimeRef.current && startTimeRef.current && (
        <Modal
          className="success-modal"
          isOpen={isSuccessModalOpen}
          contentLabel="Success Modal"
          appElement={wrapperRef.current}
        >
          <div className="success-message">
            <h2>Congratulations!</h2>
            <p>
              You completed in{' '}
              {Math.round((endTimeRef.current - startTimeRef.current) / 1000)}{' '}
              seconds!
            </p>
            <button onClick={handleRestart}>Restart</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
