/** Shrink photos before persisting in localStorage (5MB browser limit). */

const MAX_STORED_IMAGE_CHARS = 48_000;
const THUMB_MAX_PX = 240;
const THUMB_QUALITY = 0.55;

export async function prepareWebImageUri(imageUri?: string): Promise<string | undefined> {
  if (!imageUri) return undefined;

  if (imageUri.length <= MAX_STORED_IMAGE_CHARS && !imageUri.startsWith("blob:")) {
    return imageUri;
  }

  try {
    const thumbnail = await createThumbnailDataUrl(imageUri);
    if (thumbnail && thumbnail.length <= MAX_STORED_IMAGE_CHARS) {
      return thumbnail;
    }
  } catch (error) {
    console.warn("Could not compress image for web storage:", error);
  }

  return undefined;
}

async function createThumbnailDataUrl(uri: string): Promise<string | undefined> {
  if (typeof document === "undefined") return undefined;

  const blob = await loadImageBlob(uri);
  const objectUrl = URL.createObjectURL(blob);

  try {
    return await new Promise<string | undefined>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > THUMB_MAX_PX) {
              height = Math.round((height * THUMB_MAX_PX) / width);
              width = THUMB_MAX_PX;
            }
          } else if (height > THUMB_MAX_PX) {
            width = Math.round((width * THUMB_MAX_PX) / height);
            height = THUMB_MAX_PX;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(undefined);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", THUMB_QUALITY));
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error("Could not load image for thumbnail"));
      img.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function loadImageBlob(uri: string): Promise<Blob> {
  if (uri.startsWith("data:")) {
    const response = await fetch(uri);
    return response.blob();
  }

  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to read image (${response.status})`);
  }
  return response.blob();
}
