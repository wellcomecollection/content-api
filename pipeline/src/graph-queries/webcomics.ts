const query = `webcomics {
    title
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
