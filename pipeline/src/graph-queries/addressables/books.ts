const query = `
  books {
    title
    subtitle
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
    promo {
      ...on editorialImage {
        non-repeat {
          caption
        }
      }
    }
    contributors {
      contributor {
        ...on people {
          name
        }
      }
    }
  }`;

export default query;
