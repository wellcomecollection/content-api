const query = `
  exhibition-texts {
    title
    intro_text
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
