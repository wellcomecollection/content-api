import { EmptyImageFieldImage } from "@prismicio/types";
import { PrismicImage } from "../types";

// when images have crops, event if the image isn't attached, we get e.g.
// { '32:15': {}, '16:9': {}, square: {} }
export function isImageLink(
  maybeImage: EmptyImageFieldImage | PrismicImage | undefined
): maybeImage is PrismicImage {
  return Boolean(maybeImage && maybeImage.dimensions);
}
