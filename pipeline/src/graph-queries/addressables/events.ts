const query = `
  events {
    title
    body {
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
    format {
      title
    }
    promo {
      ...on editorialImage {
        non-repeat {
          caption
        }
      }
    }
    times {
      startDateTime
      endDateTime
    }
    contributors {
      contributor {
        ...on people {
          name
        }
        ...on organisations {
          name
        }
      }
    }
  }`;

export default query;
