import {useEffect, useRef, useState, type RefObject} from 'react';
import Modal from 'react-modal';
import '../App.css';

const findUp = (cell: number, numOfCell: number) => {
  return cell < numOfCell ? null : cell - numOfCell;
};

const findLeft = (cell: number, numOfCell: number) => {
  return cell % numOfCell ? cell - 1 : null;
};

const findRight = (cell: number, numOfCell: number) => {
  return cell % numOfCell === numOfCell - 1 ? null : cell + 1;
};

const findBottom = (cell: number, numOfCell: number) => {
  return cell / numOfCell >= numOfCell - 1 ? null : cell + numOfCell;
};

const isSameRow = (index: number, emptyIndex: number, numOfCell: number) => {
  return Math.floor(index / numOfCell) === Math.floor(emptyIndex / numOfCell);
};

const isSameColumn = (index: number, emptyIndex: number, numOfCell: number) => {
  return index % numOfCell === emptyIndex % numOfCell;
};

const isSameRowOrColumn = (
  index: number,
  emptyIndex: number,
  numOfCell: number
) => {
  return (
    isSameRow(index, emptyIndex, numOfCell) ||
    isSameColumn(index, emptyIndex, numOfCell)
  );
};

const getAvailableCells = (cell: number, numOfCell: number) => {
  return [findLeft, findRight, findUp, findBottom].flatMap((func) => {
    return func(cell, numOfCell) || [];
  });
};

const pickRandomItem = (options: number[]) => {
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
};

const shuffleOrder = (
  initialOrder: number[],
  emptyIndex: number,
  numOfCell: number,
  count: number = 40
) => {
  const newOrder = initialOrder.slice();
  let currentEmptyCellNumber = emptyIndex;
  let movedCellNumber: number;

  for (let i = 0; i < count; i++) {
    const availableCells = getAvailableCells(currentEmptyCellNumber, numOfCell);
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
}: {
  previewCanvasRef: RefObject<HTMLCanvasElement | null>;
  setIsCompleted: (isCompleted: boolean) => void;
}) {
  const [order, setOrder] = useState<number[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slicedImagesRef = useRef<{url: string; id: number}[]>([]);
  const correctOrderRef = useRef<number[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const sliceImage = (img: HTMLCanvasElement) => {
    const rows = 3;
    const cols = 3;

    const pieceWidth = img.width / cols;
    const pieceHeight = img.height / rows;

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

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
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

    const order = shuffleOrder(correctOrderRef.current, 0, 3);

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

  const onPuzzleClick = (index: number, numOfCell: number) => {
    handleStartGame();

    setOrder((prev) => {
      const emptyIndex = prev.findIndex((id) => id === 0);

      if (!isSameRowOrColumn(index, emptyIndex, numOfCell)) {
        return prev;
      }

      const newOrder = prev.slice();

      let step: number;

      if (isSameRow(index, emptyIndex, numOfCell)) {
        step = index < emptyIndex ? -1 : 1;
      } else {
        step = index < emptyIndex ? numOfCell * -1 : numOfCell;
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

  return (
    <div className="imageSlicer">
      <canvas ref={canvasRef} style={{display: 'none'}} />

      <div className="puzzle">
        {slicedImagesRef.current.map((image) => {
          const location = order.findIndex((id) => id === image.id);
          const cellStyle = {
            top: `calc(${Math.floor(location / 3)} * 200px)`,
            left: `calc(${location % 3} * 200px)`,
          };

          if (image.url) {
            return (
              <button
                key={image.id}
                onClick={() => onPuzzleClick(location, 3)}
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
          </div>
        </Modal>
      )}
    </div>
  );
}
