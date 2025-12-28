import type {ChangeEvent} from 'react';

interface ImageUploaderProps {
  onImageLoad: (imgSrc: string) => void;
}

export default function ImageUploader({onImageLoad}: ImageUploaderProps) {
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // TODO: Makes crop preview update between images?

    // const img = new Image();
    // img.src = URL.createObjectURL(file);
    // img.onload = () => onImageLoad(img);

    const reader = new FileReader();
    reader.addEventListener('load', () =>
      onImageLoad(reader.result?.toString() || '')
    );
    reader.readAsDataURL(file);
  };

  return <input type="file" accept="image/*" onChange={handleImageUpload} />;
}
