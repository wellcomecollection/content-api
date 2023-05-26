import * as prismic from "@prismicio/client";

type PrismicBody = {
  primary: {
    standfirst: { text: string };
    text: { text: string }[];
  };
  slice_type: string;
};

export type WithBody = {
  body?: prismic.GroupField<PrismicBody>;
};
