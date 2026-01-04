import {useEffect, useMemo, useRef, useState, type RefObject} from 'react';
import {isSameRow, isSameRowOrColumn, shuffleOrder} from './utils';
import GameSuccessView from './GameSuccessView';
import './index.css';

interface GameProps {
  previewCanvasRef: RefObject<HTMLCanvasElement | null>;
  setIsCompleted: (isCompleted: boolean) => void;
  gridSize: number;
  isCompleted: boolean;
  containerWidth: number;
}

export default function Game({
  previewCanvasRef,
  setIsCompleted,
  gridSize,
  isCompleted,
  containerWidth,
}: GameProps) {
  const [order, setOrder] = useState<number[]>([]);
  const [timer, setTimer] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const slicedImagesRef = useRef<{url: string; id: number}[]>([]);
  const correctOrderRef = useRef<number[]>([]);
  const startTimeRef = useRef<number | null>(null);

  const boardSize = useMemo(() => {
    if (containerWidth >= 440) {
      return 420;
    }

    let maxSize = Math.floor(containerWidth - 20);
    while (maxSize % gridSize !== 0) {
      maxSize--;
    }
    return maxSize;
  }, [containerWidth]);

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
      const endTime = Date.now();
      setIsCompleted(true);

      setTimeout(() => {
        setTimer(endTime - startTimeRef.current!);
      }, 1000);
    }
  }, [order]);

  const onTileClick = (tileIndex: number) => {
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
    setTimer(null);
    setOrder(shuffleOrder(correctOrderRef.current, 0, gridSize));
    startTimeRef.current = null;
  };

  return (
    <div ref={wrapperRef}>
      <div className="board" style={{width: boardSize, height: boardSize}}>
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
                onClick={() => onTileClick(tileIndex)}
                style={tileStyle}
              >
                <img src={image.url} alt={`Piece ${image.id}`} width="100%" />
              </button>
            );
          }
          return <div key={0} style={tileStyle} />;
        })}
      </div>
      <canvas ref={canvasRef} style={{display: 'none'}} />
      {isCompleted && (
        <GameSuccessView
          timer={timer}
          contentRef={wrapperRef}
          handleRestart={handleRestart}
        />
      )}
    </div>
  );
}
