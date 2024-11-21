const query = `
  seasons {
    title
    promo {
      ...on editorialImage {
        non-repeat {
          caption
        }
      }
    }
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
      ...on standfirst {
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
