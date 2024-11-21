const query = `
  visual-stories {
    title
    promo {
      ...on editorialImage {
        non-repeat {
          caption
        }
      }
    }
  }
`;

export default query;
