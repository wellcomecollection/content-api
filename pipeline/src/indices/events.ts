import { IndicesIndexSettings } from '@elastic/elasticsearch/lib/api/types';

export const index = 'events';

export const mappings = {
  dynamic: 'strict',
  properties: {
    id: {
      type: 'keyword',
    },
    uid: {
      type: 'keyword',
    },
    isChildScheduledEvent: {
      type: 'boolean',
    },
    display: {
      type: 'object',
      enabled: false,
    },
    query: {
      properties: {
        linkedIdentifiers: {
          type: 'keyword',
        },
        title: {
          type: 'text',
          fields: {
            shingles: {
              type: 'text',
              analyzer: 'english_shingle_analyzer',
            },
            cased: {
              type: 'text',
              analyzer: 'english_cased_analyzer',
            },
            keyword: {
              type: 'keyword',
              normalizer: 'keyword_lowercase',
            },
          },
        },
        caption: {
          type: 'text',
          fields: {
            shingles: {
              type: 'text',
              analyzer: 'english_shingle_analyzer',
            },
            cased: {
              type: 'text',
              analyzer: 'english_cased_analyzer',
            },
          },
        },
        series: {
          properties: {
            id: {
              type: 'keyword',
            },
            title: {
              type: 'text',
              fields: {
                shingles: {
                  type: 'text',
                  analyzer: 'english_shingle_analyzer',
                },
                cased: {
                  type: 'text',
                  analyzer: 'english_cased_analyzer',
                },
                keyword: {
                  type: 'keyword',
                  normalizer: 'keyword_lowercase',
                },
              },
            },
            contributors: {
              type: 'text',
              fields: {
                shingles: {
                  type: 'text',
                  analyzer: 'english_shingle_analyzer',
                },
                keyword: {
                  type: 'keyword',
                  normalizer: 'keyword_lowercase',
                },
              },
            },
          },
        },
        interpretations: {
          type: 'text',
          fields: {
            shingles: {
              type: 'text',
              analyzer: 'english_shingle_analyzer',
            },
            cased: {
              type: 'text',
              analyzer: 'english_cased_analyzer',
            },
            keyword: {
              type: 'keyword',
              normalizer: 'keyword_lowercase',
            },
          },
        },
        audiences: {
          type: 'text',
          fields: {
            shingles: {
              type: 'text',
              analyzer: 'english_shingle_analyzer',
            },
            cased: {
              type: 'text',
              analyzer: 'english_cased_analyzer',
            },
            keyword: {
              type: 'keyword',
              normalizer: 'keyword_lowercase',
            },
          },
        },
        format: {
          type: 'text',
          fields: {
            shingles: {
              type: 'text',
              analyzer: 'english_shingle_analyzer',
            },
            cased: {
              type: 'text',
              analyzer: 'english_cased_analyzer',
            },
            keyword: {
              type: 'keyword',
              normalizer: 'keyword_lowercase',
            },
          },
        },
        'times.startDateTime': {
          type: 'date',
          format: 'date_optional_time',
        },
      },
    },
    filter: {
      properties: {
        format: {
          type: 'keyword',
        },
        interpretations: {
          type: 'keyword',
        },
        audiences: {
          type: 'keyword',
        },
        locations: {
          type: 'keyword',
        },
        isAvailableOnline: {
          type: 'boolean',
        },
        times: {
          type: 'nested',
          properties: {
            startDateTime: {
              type: 'date',
            },
            endDateTime: {
              type: 'date',
            },
          },
        },
      },
    },
    aggregatableValues: {
      properties: {
        format: {
          type: 'keyword',
        },
        interpretations: {
          type: 'keyword',
        },
        audiences: {
          type: 'keyword',
        },
        locations: {
          type: 'keyword',
        },
        isAvailableOnline: {
          type: 'keyword',
        },
      },
    },
  },
} as const;

export const settings = {
  analysis: {
    normalizer: {
      keyword_lowercase: {
        type: 'custom',
        filter: ['lowercase'],
      },
    },
    filter: {
      shingle_filter: {
        type: 'shingle',
        min_shingle_size: 2,
        max_shingle_size: 4,
        output_unigrams: true,
      },
      english_stemmer: {
        type: 'stemmer',
        language: 'english',
      },
      english_possessive_stemmer: {
        type: 'stemmer',
        language: 'possessive_english',
      },
      punctuation_token_filter: {
        type: 'pattern_replace',
        pattern: '[^0-9\\p{L}\\s]',
        replacement: '',
      },
    },
    analyzer: {
      english_shingle_analyzer: {
        filter: [
          'lowercase',
          'asciifolding',
          'english_stemmer',
          'english_possessive_stemmer',
          'punctuation_token_filter',
          'shingle_filter',
        ],
        type: 'custom',
        tokenizer: 'standard',
      },
      english_cased_analyzer: {
        filter: [
          'asciifolding',
          'english_stemmer',
          'english_possessive_stemmer',
          'punctuation_token_filter',
        ],
        type: 'custom',
        tokenizer: 'standard',
      },
    },
  },
} as IndicesIndexSettings; // as const was not sufficient, here.
