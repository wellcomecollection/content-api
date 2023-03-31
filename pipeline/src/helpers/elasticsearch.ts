import { Client } from "@elastic/elasticsearch";
import { Readable } from "stream";

const indexName = "articles";

export const addIndex = async (elasticClient: Client) => {
  const exists = await elasticClient.indices.exists({ index: indexName });

  if (!exists) {
    await elasticClient.indices.create({
      index: indexName,
      mappings: {
        dynamic: "strict",
        properties: {
          id: {
            type: "text",
          },
          display: {
            type: "object",
            enabled: false,
          },
          query: {
            properties: {
              title: {
                type: "text",
                fields: {
                  shingles: {
                    type: "text",
                  },
                  cased: {
                    type: "text",
                  },
                  keyword: {
                    type: "keyword",
                  },
                },
              },
              published: {
                type: "date",
                format: "date_optional_time",
              },
              contributors: {
                type: "text",
                fields: {
                  shingles: {
                    type: "text",
                  },
                  keyword: {
                    type: "keyword",
                  },
                },
              },
              promo_caption: {
                type: "text",
                fields: {
                  shingles: {
                    type: "text",
                    analyzer: "english_shingle_analyzer",
                  },
                  cased: {
                    type: "text",
                    analyzer: "english_cased_analyzer",
                  },
                },
              },
              standfirst: {
                type: "text",
                fields: {
                  shingles: {
                    type: "text",
                    analyzer: "english_shingle_analyzer",
                  },
                  cased: {
                    type: "text",
                    analyzer: "english_cased_analyzer",
                  },
                },
              },
              body: {
                type: "text",
                fields: {
                  shingles: {
                    type: "text",
                    analyzer: "english_shingle_analyzer",
                  },
                  cased: {
                    type: "text",
                    analyzer: "english_cased_analyzer",
                  },
                },
              },
            },
          },
        },
      },
      settings: {
        analysis: {
          normalizer: {
            keyword_lowercase: {
              type: "custom",
              filter: ["lowercase"],
            },
          },
          filter: {
            shingle_filter: {
              type: "shingle",
              min_shingle_size: 2,
              max_shingle_size: 4,
              output_unigrams: true,
            },
            english_stemmer: {
              type: "stemmer",
              language: "english",
            },
            english_possessive_stemmer: {
              type: "stemmer",
              language: "possessive_english",
            },
            asciifolding_token_filter: {
              type: "asciifolding",
              preserve_original: true,
            },
            punctuation_token_filter: {
              type: "pattern_replace",
              pattern: "[^\\w\\s]",
              replacement: "",
            },
          },
          analyzer: {
            english_shingle_analyzer: {
              filter: [
                "lowercase",
                "asciifolding_token_filter",
                "english_stemmer",
                "english_possessive_stemmer",
                "shingle_filter",
                "punctuation_token_filter",
              ],
              type: "custom",
              tokenizer: "standard",
            },
            english_cased_analyzer: {
              filter: [
                "asciifolding_token_filter",
                "english_stemmer",
                "english_possessive_stemmer",
                "punctuation_token_filter",
              ],
              type: "custom",
              tokenizer: "standard",
            },
          },
        },
      },
    });
    console.log(indexName, "was created");
  } else {
    console.log("Index", indexName, "already exists");
  }
};

type HasIdentifier = {
  id: string;
};

export const bulkIndexDocuments = async <T extends HasIdentifier>(
  elasticClient: Client,
  datasource: Readable
) => {
  await elasticClient.helpers.bulk<T>({
    datasource,
    onDocument(doc) {
      return {
        index: { _index: indexName, _id: doc.id },
      };
    },
    onDrop(fail) {
      console.log(fail);
    },
  });

  return await elasticClient.count({ index: indexName });
};
