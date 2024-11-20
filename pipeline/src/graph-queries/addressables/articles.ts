const query = `
  articles {
    title
    format {
      title
    }
    contributors {
      role {
        title
      }
      contributor {
        ...on people {
          name
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
