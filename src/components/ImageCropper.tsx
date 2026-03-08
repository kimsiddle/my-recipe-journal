import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ZoomIn, RotateCw, Check, X } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  aspect?: number;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    image.onerror = () => reject(new Error('Failed to load image'));
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
  });
}

export function ImageCropper({ imageSrc, aspect = 16 / 9, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropDone = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedUrl);
    } catch (err) {
      console.error('Crop failed:', err);
    }
  }, [imageSrc, croppedAreaPixels, onCropComplete]);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="max-w-3xl w-[95vw] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-lg">Adjust Photo</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Drag to reposition · Pinch or slide to zoom
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-[60vh] bg-muted/50">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropDone}
          />
        </div>

        <div className="px-4 py-3 space-y-3 border-t border-border">
          <div className="flex items-center gap-3">
            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground w-6 shrink-0">1×</span>
            <Slider
              value={[zoom]}
              min={1}
              max={4}
              step={0.05}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-6 shrink-0">4×</span>
            <span className="text-xs font-medium text-foreground w-10 text-right shrink-0">{zoomPercent}%</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={handleConfirm} className="flex-1 gap-1.5" size="sm">
              <Check className="h-4 w-4" />
              Apply Crop
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} size="sm" className="gap-1.5">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
