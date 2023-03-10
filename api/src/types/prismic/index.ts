import { PrismicDocument, RichTextField } from "@prismicio/types";
import { ImageDimensions } from "..";

export type InferDataInterface<T> = T extends PrismicDocument<
  infer DataInterface
>
  ? DataInterface
  : never;

// This one was taken from the stories search, not from Content (as that one contains way more)
export type CommonPrismicFields = {
  title?: RichTextField;
  promo: {
    primary: {
      image: {
        url: string;
        dimensions: ImageDimensions;
        alt: string | null;
        copyright: string | null;
      };
      caption: {
        text: string;
      };
      link?: string;
    };
  };
};
