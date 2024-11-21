const query = `
  exhibitions {
    title
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
    start
    end
    contributors {
      contributor {
        ...on people {
          name
        }
      }
    }
  }`;

export default query;
