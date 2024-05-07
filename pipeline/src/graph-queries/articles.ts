const query = `articles {
    title
    body {
      ...on text {
        variation {
          ... on default {
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
    format {
      title
    }
    promo
    contributors {
      role {
        title
      }
      contributor {
        ... on people {
          name
        }
        ... on organisations {
          name
        }
      }
    }
    series {
      series {
        title
        contributors {
          contributor {
            ... on people {
              name
            }
            ... on organisations {
              name
            }
          }
        }
      }
    }
  }`;

export default query;
