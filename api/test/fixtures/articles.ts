import { TransformedArticle } from "../../src/types";

export const article = (
  { id }: { id: string } = { id: "abcdefgh" }
): TransformedArticle => ({
  id,
  type: "Article",
  format: {
    type: "ArticleFormat",
    id: "W7TfJRAAAJ1D0eLK",
    label: "Article",
  },
  title: "Sick of being lonely",
  publicationDate: "2018-12-20T10:44:15+0000",
  caption:
    "When his relationship ended, Thom James first withdrew from the world, then began to suffer from illnesses with no apparent physical cause.",
  contributors: [
    {
      contributor: {
        id: "XAaGDRQAAPE_-ePY",
        label: "Thom James",
        type: "Person",
      },
      role: {
        id: "WcUWeCgAAFws-nGh",
        label: "Author",
        type: "EditorialContributorRole",
      },
      type: "Contributor",
    },
  ],
  image: {
    type: "PrismicImage",
    dimensions: {
      width: 4000,
      height: 2670,
    },
    alt: "Photograph of a gallery installation showing a bench with yellow cushions facing a large video projection. The projection shows the inside of a McDonalds restaurant looking down from a high viewpoint in which the restaurant floor is beginning to flood with water.",
    copyright: "Flooded McDonalds by Superflex | | Wellcome Collection | | | |",
    url: "https: //images.prismic.io/wellcomecollection/1c4a250965a3f9bd17e636f5fc008b88e1e4c649_ep_000832_027.jpg?auto=compress,format",
    "32:15": {
      dimensions: {
        width: 3200,
        height: 1500,
      },
      alt: "Photograph of a gallery installation showing a bench with yellow cushions facing a large video projection. The projection shows the inside of a McDonalds restaurant looking down from a high viewpoint in which the restaurant floor is beginning to flood with water.",
      copyright:
        "Flooded McDonalds by Superflex | | Wellcome Collection | | | |",
      url: "https://images.prismic.io/wellcomecollection/35e056eb53143a449cd612828899b160cb63b3a8_ep_000832_027.jpg?auto=compress,format",
    },
    "16:9": {
      dimensions: {
        width: 3200,
        height: 1800,
      },
      alt: "Photograph of a gallery installation showing a bench with yellow cushions facing a large video projection. The projection shows the inside of a McDonalds restaurant looking down from a high viewpoint in which the restaurant floor is beginning to flood with water.",
      copyright:
        "Flooded McDonalds by Superflex | | Wellcome Collection | | | |",
      url: "https://images.prismic.io/wellcomecollection/09b89fe1bcd0a3a3091bcda6b5f62e5e53d572ca_ep_000832_027.jpg?auto=compress,format",
    },
    square: {
      dimensions: {
        width: 3200,
        height: 3200,
      },
      alt: "Photograph of a gallery installation showing a bench with yellow cushions facing a large video projection. The projection shows the inside of a McDonalds restaurant looking down from a high viewpoint in which the restaurant floor is beginning to flood with water.",
      copyright:
        "Flooded McDonalds by Superflex | | Wellcome Collection | | | |",
      url: "https://images.prismic.io/wellcomecollection/9ed554ac496cb5238a50674c840b40df4fc43acd_ep_000832_027.jpg?auto=compress,format",
    },
  },
});
