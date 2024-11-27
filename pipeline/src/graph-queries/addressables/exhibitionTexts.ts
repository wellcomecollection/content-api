const query = `
  exhibition-texts {
    title
    intro_text
    related_exhibition {
      promo {
        ...on editorialImage {
          non-repeat {
            caption
          }
        }
      }
    }
    slices {
      ...on guide_text_item {
        variation {
          ...on default {
            primary {
              title
              tombstone
              caption
              additional_notes
            }
          }
        }
      }
    }
  }`;

export default query;
