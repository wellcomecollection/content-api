import { FilledImageFieldImage } from "@prismicio/types";

export type ImageDimensions = {
  width?: number;
  height?: number;
};

// Currently the Prismic types only allow you to specify 1 image
type ThumbnailedImageField<Thumbnails extends Record<string, ImageDimensions>> =
  FilledImageFieldImage & {
    [Property in keyof Thumbnails]?: FilledImageFieldImage;
  };

export type PrismicImage = ThumbnailedImageField<{
  "32:15": {
    width: 3200;
    height: 1500;
  };
  "16:9": {
    width: 3200;
    height: 1800;
  };
  square: {
    width: 3200;
    height: 3200;
  };
}>;
