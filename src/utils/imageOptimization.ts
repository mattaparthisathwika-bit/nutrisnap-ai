/**
 * Image optimization utilities to reduce API token usage.
 * Automatically compresses images before sending to OpenAI.
 * 
 * Usage:
 *   const optimized = await optimizeImageForVision(imageUri);
 *   const result = await analyzeFoodImage(optimized);
 */

import { Platform } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";
import { imageToBase64 } from "./imageToBase64";

export async function optimizeImageForVision(
  uri: string,
  maxWidth: number = 512,
  maxHeight: number = 512,
  quality: number = 0.65
): Promise<string> {
  try {
    // Native platform uses expo-image-manipulator
    if (Platform.OS !== "web") {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth, height: maxHeight } }],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const base64 = await imageToBase64(result.uri);
      return base64;
    }

    // Web platform: use existing imageToBase64 which handles compression
    const base64 = await imageToBase64(uri);
    return base64;
  } catch (error) {
    console.error("Image optimization failed:", error);
    // Return original on error
    return imageToBase64(uri);
  }
}

