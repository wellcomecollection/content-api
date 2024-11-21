const query = `
  pages {
    title
    promo {
      ...on editorialImage {
        non-repeat {
          caption
        }
      }
    }
    introText
    body {
      ...on text {
        variation {
          ...on default {
            primary {
              text
            }
          }
        }
      }
    }
  }
`;

export default query;
