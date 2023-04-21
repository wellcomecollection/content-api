const query = `{
    articles {
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
        ...contributorsFields
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
    }
    webcomics {
      title
      format {
        title
      }
      promo
      contributors {
        ...contributorsFields
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
    }
  }`;

export default query;
