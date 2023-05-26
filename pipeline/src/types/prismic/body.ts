import * as prismicT from "@prismicio/types";

type PrismicBody = {
  primary: {
    standfirst: { text: string };
    text: { text: string }[];
  };
  slice_type: string;
};

export type WithBody = {
  body?: prismicT.GroupField<PrismicBody>;
};
