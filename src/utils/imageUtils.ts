/**
 * Utility to process, center-crop, and compress user-uploaded profile photos
 * to a lightweight base64 DataURL (192x192 square JPEG at 85% quality).
 */
export function processProfilePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('الملف المختار ليس صورة صالحة'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') {
        reject(new Error('فشل في قراءة ملف الصورة'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const TARGET_SIZE = 192;
          const canvas = document.createElement('canvas');
          canvas.width = TARGET_SIZE;
          canvas.height = TARGET_SIZE;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('فشل معالجة أبعاد الصورة'));
            return;
          }

          // Center crop to a perfect square
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(
            img,
            sx,
            sy,
            minDim,
            minDim,
            0,
            0,
            TARGET_SIZE,
            TARGET_SIZE
          );

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedDataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('تعذر تحميل الصورة'));
      };

      img.src = result;
    };

    reader.onerror = () => {
      reject(new Error('حدث خطأ أثناء قراءة الصورة'));
    };

    reader.readAsDataURL(file);
  });
}
