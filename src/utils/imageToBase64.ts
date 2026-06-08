import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

/** Compress image to reduce token usage (max 1024px, 70% quality) */
async function compressImage(uri: string): Promise<string> {
  if (Platform.OS === "web") {
    return compressImageWeb(uri);
  }

  try {
    const result = await ImageManipulator.manipulateAsync(uri, [
      { resize: { width: 1024, height: 1024 } },
    ], {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    return FileSystem.readAsStringAsync(result.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (error) {
    console.warn("Image compression failed, using original:", error);
    return FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
}

/** Compress image on web using Canvas API */
async function compressImageWeb(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        const comma = compressed.indexOf(",");
        resolve(comma >= 0 ? compressed.slice(comma + 1) : compressed);
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(blob);
  });
}

/** Convert an image URI (or data URL) to compressed base64 for OpenAI Vision. */
export async function imageToBase64(uri: string, pickerBase64?: string | null): Promise<string> {
  if (pickerBase64) {
    return pickerBase64;
  }

  if (uri.startsWith("data:")) {
    const comma = uri.indexOf(",");
    return comma >= 0 ? uri.slice(comma + 1) : uri;
  }

  return compressImage(uri);
}
