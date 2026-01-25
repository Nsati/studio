import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

let images: ImagePlaceholder[] = [];

try {
    // Check if the imported data and the placeholderImages property exist
    if (data && Array.isArray(data.placeholderImages)) {
        images = data.placeholderImages;
    } else {
        console.warn("Warning: `placeholder-images.json` is missing the 'placeholderImages' array or is malformed. No placeholder images will be loaded.");
    }
} catch (error) {
    console.error("Critical Error: Failed to load or parse `placeholder-images.json`. Check if the file exists and is valid JSON.", error);
}

export const PlaceHolderImages: ImagePlaceholder[] = images;
