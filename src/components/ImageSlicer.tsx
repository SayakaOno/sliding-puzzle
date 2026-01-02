import {useEffect, useRef, useState, type RefObject} from 'react';
import Modal from 'react-modal';
import '../App.css';

const findUp = (cell: number, gridSize: number) => {
  return cell < gridSize ? null : cell - gridSize;
};

const findLeft = (cell: number, gridSize: number) => {
  return cell % gridSize ? cell - 1 : null;
};

const findRight = (cell: number, gridSize: number) => {
  return cell % gridSize === gridSize - 1 ? null : cell + 1;
};

const findBottom = (cell: number, gridSize: number) => {
  return cell / gridSize >= gridSize - 1 ? null : cell + gridSize;
};

const isSameRow = (index: number, emptyIndex: number, gridSize: number) => {
  return Math.floor(index / gridSize) === Math.floor(emptyIndex / gridSize);
};

const isSameColumn = (index: number, emptyIndex: number, gridSize: number) => {
  return index % gridSize === emptyIndex % gridSize;
};

const isSameRowOrColumn = (
  index: number,
  emptyIndex: number,
  gridSize: number
) => {
  return (
    isSameRow(index, emptyIndex, gridSize) ||
    isSameColumn(index, emptyIndex, gridSize)
  );
};

const getAvailableCells = (cell: number, gridSize: number) => {
  return [findLeft, findRight, findUp, findBottom].flatMap((func) => {
    return func(cell, gridSize) || [];
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
  let currentEmptyCellNumber = emptyIndex;
  let movedCellNumber: number;

  for (let i = 0; i < count; i++) {
    const availableCells = getAvailableCells(currentEmptyCellNumber, gridSize);
    const filteredAvailableCells = availableCells.filter(
      (cell) => cell !== movedCellNumber
    );
    movedCellNumber = pickRandomItem(filteredAvailableCells);

    newOrder[currentEmptyCellNumber] = newOrder[movedCellNumber];
    newOrder[movedCellNumber] = 0;

    currentEmptyCellNumber = movedCellNumber;
  }

  return newOrder;
};

export default function ImageSlicer({
  previewCanvasRef,
  setIsCompleted,
  gridSize,
}: {
  previewCanvasRef: RefObject<HTMLCanvasElement | null>;
  setIsCompleted: (isCompleted: boolean) => void;
  gridSize: number;
}) {
  const [order, setOrder] = useState<number[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      setIsSuccessModalOpen(true);
    }
  }, [order]);

  const onPuzzleClick = (index: number) => {
    handleStartGame();

    setOrder((prev) => {
      const emptyIndex = prev.findIndex((id) => id === 0);

      if (!isSameRowOrColumn(index, emptyIndex, gridSize)) {
        return prev;
      }

      const newOrder = prev.slice();

      let step: number;

      if (isSameRow(index, emptyIndex, gridSize)) {
        step = index < emptyIndex ? -1 : 1;
      } else {
        step = index < emptyIndex ? gridSize * -1 : gridSize;
      }

      for (let i = emptyIndex; i !== index; i += step) {
        newOrder[i] = prev[i + step];
      }

      newOrder[index] = 0;
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
    <div className="imageSlicer">
      <canvas ref={canvasRef} style={{display: 'none'}} />

      <div className="puzzle">
        {slicedImagesRef.current.map((image) => {
          const location = order.findIndex((id) => id === image.id);
          const cellStyle = {
            top: `calc(${Math.floor(location / gridSize)} * 200px)`,
            left: `calc(${location % gridSize} * 200px)`,
          };

          if (image.url) {
            return (
              <button
                key={image.id}
                onClick={() => onPuzzleClick(location, gridSize)}
                style={cellStyle}
              >
                <img src={image.url} alt={`Piece ${image.id}`} width="100%" />
              </button>
            );
          }
          return <div key={0} style={cellStyle} />;
        })}
      </div>
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
            <button onClick={handleRestart}>Restart</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
