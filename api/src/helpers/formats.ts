import { FilledLinkToDocumentField } from "@prismicio/types";
import { asText } from ".";
import { ArticleFormat, ArticleFormatId, InferDataInterface, LabelField } from "../types";

export function transformLabelType(
    format: FilledLinkToDocumentField<
      'article-formats',
      'en-gb',
      InferDataInterface<ArticleFormat>
    > & { data: InferDataInterface<ArticleFormat> }
  ): LabelField {
    return {
        type: "ArticleFormat",
        id: format.id as ArticleFormatId,
        title: asText(format.data.title),
    };
  }