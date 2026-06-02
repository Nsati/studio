
import data from '@/app/lib/placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

let images: ImagePlaceholder[] = [];

try {
    // Import centrally managed placeholder images from the app directory
    if (data && Array.isArray(data.placeholderImages)) {
        images = data.placeholderImages;
    } else {
        console.warn("Warning: `placeholder-images.json` is missing the 'placeholderImages' array or is malformed.");
    }
} catch (error) {
    console.error("Critical Error: Failed to load placeholder image data.", error);
}

export const PlaceHolderImages: ImagePlaceholder[] = images;
