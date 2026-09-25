/**
 * Client-Side Image Optimizer for Get Dress'd by Rissée
 * Resizes large camera/phone photos (5MB - 20MB) down to optimized, high-fidelity
 * web formats (150KB - 350KB) before saving or uploading.
 * This avoids localStorage quota issues and guarantees lightning-fast loading across Netlify & mobile.
 */

export interface OptimizeImageOptions {
  maxDimension?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp';
}

export async function optimizeImageFile(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<{ file: File; dataUrl: string; width: number; height: number; originalSize: number; optimizedSize: number }> {
  const { maxDimension = 1400, quality = 0.82, mimeType = 'image/jpeg' } = options;

  return new Promise((resolve, reject) => {
    // Check if it is an image
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale proportionally if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context unavailable.'));
        }

        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL
        const dataUrl = canvas.toDataURL(mimeType, quality);

        // Convert to Blob / File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Failed to compress image canvas to blob.'));
            }

            const cleanFileName = file.name.replace(/\.[^/.]+$/, '') + (mimeType === 'image/webp' ? '.webp' : '.jpg');
            const optimizedFile = new File([blob], cleanFileName, {
              type: mimeType,
              lastModified: Date.now(),
            });

            resolve({
              file: optimizedFile,
              dataUrl,
              width,
              height,
              originalSize: file.size,
              optimizedSize: blob.size,
            });
          },
          mimeType,
          quality
        );
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
