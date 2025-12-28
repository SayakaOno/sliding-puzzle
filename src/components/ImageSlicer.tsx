import {useEffect, useRef, useState, type RefObject} from 'react';
import '../App.css';

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

  return (
    <div className="imageSlicer">
      <canvas ref={canvasRef} style={{display: 'none'}} />

      <div className="puzzle">
        {pieces.map((piece, index) => {
          if (piece) {
            return <img key={index} src={piece} alt={`Piece ${index + 1}`} />;
          }
          return <div />;
        })}
      </div>
    </div>
  );
}
