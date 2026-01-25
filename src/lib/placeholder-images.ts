import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

let images: ImagePlaceholder[] = [];

try {
    if (data?.placeholderImages) {
        images = data.placeholderImages;
    } else {
        console.warn("placeholder-images.json is missing the 'placeholderImages' array.");
    }
} catch (error) {
    console.error("Failed to load or parse placeholder-images.json", error);
}


export const PlaceHolderImages: ImagePlaceholder[] = images;
