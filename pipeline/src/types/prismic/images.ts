import * as prismic from "@prismicio/client";

type ImageDimensions = {
  width?: number;
  height?: number;
};

// This type matches the one in the wc.org repo
// https://github.com/prismicio/prismic-client/pull/326
// These are new properties that are expected but not documented for yet or returned
type CustomPrismicFilledImage = Omit<
  prismic.FilledImageFieldImage,
  "id" | "edit"
>;

// Currently the Prismic types only allow you to specify 1 image
type ThumbnailedImageField<Thumbnails extends Record<string, ImageDimensions>> =
  CustomPrismicFilledImage & {
    [Property in keyof Thumbnails]?: CustomPrismicFilledImage;
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
