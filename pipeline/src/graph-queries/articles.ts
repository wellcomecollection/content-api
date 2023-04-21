const query = `articles {
    title
    body {
      ...on text {
        non-repeat {
          text
        }
      }
      ...on standfirst {
        non-repeat {
          text
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
