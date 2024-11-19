const query = `
  exhibition-highlight-tours {
    title
    intro_text
    slices {
      ...on guide_stop {
        variation {
          ...on default {
            primary {
              title
              transcript
            }
          }
        }
      }
    }
  }`;

export default query;
