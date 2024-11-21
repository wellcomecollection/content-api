import { IndicesIndexSettings } from '@elastic/elasticsearch/lib/api/types';

export const index = 'addressables';

export const mappings = {
  dynamic: 'strict',
  properties: {
    id: {
      type: 'keyword',
    },
    uid: {
      type: 'keyword',
    },
    display: {
      type: 'object',
      enabled: false,
    },
    query: {
      properties: {
        type: {
          type: 'text',
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
        description: {
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
        body: {
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
