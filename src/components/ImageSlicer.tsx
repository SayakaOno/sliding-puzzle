import {useEffect, useRef, useState, type RefObject} from 'react';
import '../App.css';

// [top, right, bottom, left]
const GRIDS = {
  0: [null, 1, 3, null],
  1: [null, 2, 4, 0],
  2: [null, null, 5, 1],
  3: [0, 4, 6, null],
  4: [1, 5, 7, 3],
  5: [2, null, 8, 4],
  6: [3, 7, null, null],
  7: [4, 8, null, 6],
  8: [5, null, null, 7],
};

const canMove = (index: keyof typeof GRIDS, emptyIndex: number) => {
  const adjacentGrids = GRIDS[index];
  return adjacentGrids.includes(emptyIndex);
};

export default function ImageSlicer({
  previewCanvasRef,
}: {
  previewCanvasRef: RefObject<HTMLCanvasElement | null>;
}) {
  const [pieces, setPieces] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const newPieces: string[] = [];

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

        newPieces.push(pieceDataUrl);
      }
    }

    setPieces(newPieces);
  };

  useEffect(() => {
    if (previewCanvasRef.current) {
      sliceImage(previewCanvasRef.current);
    }
  }, [previewCanvasRef]);

  const onPuzzleClick = (index: keyof typeof GRIDS) => {
    setPieces((prev) => {
      const emptyIndex = prev.findIndex((piece) => !piece);

      if (!canMove(index, emptyIndex)) {
        return prev;
      }

      const newOrder = prev.slice();
      newOrder[emptyIndex] = pieces[index];
      newOrder[index] = '';

      return newOrder;
    });
  };

  return (
    <div className="imageSlicer">
      <canvas ref={canvasRef} style={{display: 'none'}} />

      <div className="puzzle">
        {pieces.map((piece, index) => {
          if (piece) {
            return (
              <img
                key={index}
                src={piece}
                alt={`Piece ${index + 1}`}
                onClick={() => onPuzzleClick(index as keyof typeof GRIDS)}
              />
            );
          }
          return <div key={index} />;
        })}
      </div>
    </div>
  );
}
