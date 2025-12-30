import {useEffect, useRef, useState, type RefObject} from 'react';
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

const canMove = (index: number, emptyIndex: number, numOfCell: number) => {
  return [findLeft, findRight, findUp, findBottom].some((func) => {
    const availableCell = func(index, numOfCell);

    return availableCell === emptyIndex;
  });
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

  for (let i = 0; i < count; i++) {
    const availableCells = getAvailableCells(currentEmptyCellNumber, numOfCell);
    const pickedCell = pickRandomItem(availableCells);

    newOrder[currentEmptyCellNumber] = newOrder[pickedCell];
    newOrder[pickedCell] = 0;

    currentEmptyCellNumber = pickedCell;
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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slicedImagesRef = useRef<{url: string; id: number}[]>([]);

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

    const order = shuffleOrder(
      newPieces.map(({id}) => id),
      0,
      3
    );

    setOrder(order);
  };

  useEffect(() => {
    if (previewCanvasRef.current) {
      sliceImage(previewCanvasRef.current);
    }
  }, [previewCanvasRef]);

  const onPuzzleClick = (index: number, imageId: number) => {
    let newOrder: number[] = [];

    setOrder((prev) => {
      const emptyIndex = prev.findIndex((id) => id === 0);

      if (!canMove(index, emptyIndex, 3)) {
        return prev;
      }

      newOrder = prev.slice();
      newOrder[emptyIndex] = imageId;
      newOrder[index] = 0;

      return newOrder;
    });

    const isCompleted = newOrder.every(
      (id, index) => slicedImagesRef.current[index].id === id
    );

    if (isCompleted) {
      setIsCompleted(true);
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
                onClick={() => onPuzzleClick(location, image.id)}
                style={cellStyle}
              >
                <img src={image.url} alt={`Piece ${image.id}`} width="100%" />
              </button>
            );
          }
          return <div key={0} style={cellStyle} />;
        })}
      </div>
    </div>
  );
}
