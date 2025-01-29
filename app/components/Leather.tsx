import { useRef, useEffect, useState } from 'react';
import { Textures } from '../lib/leather';

interface Props {
  type: keyof typeof Textures.Textures;
  color: string;
}
const ArmorCanvas = ({ type, color }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<'loading' | 'active'>('loading');

  useEffect(() => {
    const loadImages = async () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        const textureBase64 = Textures.Textures[type];
        const overlayBase64 = Textures.Overlay[type];

        const [textureImage, overlayImage] = await Promise.all([
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = textureBase64;
          }),
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = overlayBase64;
          }),
        ]);

        const width = textureImage.width;
        const height = textureImage.height;

        if (width === 0 || height === 0) {
          console.error(`Texture dimensions are invalid: ${width}x${height}`);
          return;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = false;

        // Draw base texture
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(textureImage, 0, 0);

        // Apply color
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);

        // Mask with texture
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(textureImage, 0, 0);

        // Draw overlay
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(overlayImage, 0, 0);

        setState('active');
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    loadImages();
  }, [color, type]);

  return <canvas ref={canvasRef} className="mx-auto w-7 h-7"></canvas>;
};

interface ColorProps {
  color: string;
}

export const Helmet = ({ color }: ColorProps) => {
  return (
    <div>
      <ArmorCanvas type="Helmet" color={color} />
    </div>
  );
};

export const Chestplate = ({ color }: ColorProps) => {
  return (
    <div>
      <ArmorCanvas type="Chestplate" color={color} />
    </div>
  );
};

export const Leggings = ({ color }: ColorProps) => {
  return (
    <div>
      <ArmorCanvas type="Leggings" color={color} />
    </div>
  );
};

export const Boots = ({ color }: ColorProps) => {
  return (
    <div>
      <ArmorCanvas type="Boots" color={color} />
    </div>
  );
};
