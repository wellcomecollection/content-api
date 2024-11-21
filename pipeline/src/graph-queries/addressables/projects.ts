const query = `
  projects {
    title
    promo {
      ...on editorialImage {
        non-repeat {
          caption
        }
      }
    }
    format {
      title
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
    }
    contributors {
      contributor {
        ...on people {
          name
        }
      }
    }
  }
`;

export default query;
