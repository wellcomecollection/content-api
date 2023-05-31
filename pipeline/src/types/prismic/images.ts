import * as prismicT from "@prismicio/types";
import { ImageDimensions } from "..";

// Currently the Prismic types only allow you to specify 1 image
type ThumbnailedImageField<Thumbnails extends Record<string, ImageDimensions>> =
  prismicT.FilledImageFieldImage & {
    [Property in keyof Thumbnails]?: prismicT.FilledImageFieldImage;
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
