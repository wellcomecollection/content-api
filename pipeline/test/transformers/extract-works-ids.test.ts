import { getWorksIdsFromDocumentBody } from '@weco/content-pipeline/src/transformers/addressables/helpers/extract-works-ids';
import {
  createEditorialImageSlice,
  createGifVideoSlice,
  createTextSlice,
} from '@weco/content-pipeline/test/fixtures/prismic-document-body';

describe('extract-works-ids', () => {
  describe('getWorksIdsFromDocumentBody', () => {
    it('extracts works IDs from text slice hyperlinks', () => {
      const documentBody = [
        createTextSlice({
          url: 'https://wellcomecollection.org/works/p4bh9qca',
        }),
      ];

      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['p4bh9qca']);
    });

    it('extracts works IDs from editorialImage slice caption', () => {
      const documentBody = [
        createEditorialImageSlice({
          captionUrl: 'https://wellcomecollection.org/works/sgswqhrs',
        }),
      ];

      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['sgswqhrs']);
    });

    it('extracts works IDs from editorialImage slice copyright', () => {
      const documentBody = [
        createEditorialImageSlice({
          copyright:
            'Title | | Wellcome Collection | https://wellcomecollection.org/works/atrvxkxg/items | CC-BY | |',
        }),
      ];

      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['atrvxkxg']);
    });

    it('extracts works IDs from gifVideo slice caption', () => {
      const documentBody = [
        createGifVideoSlice({
          captionUrl: 'https://wellcomecollection.org/works/abc123def',
        }),
      ];

      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['abc123def']);
    });

    it('extracts works IDs from gifVideo slice tasl', () => {
      const documentBody = [
        createGifVideoSlice({
          tasl: 'Percentage split of men aged 16-30 on the stem cell registers | Thomas SG Farnetti | Wellcome Collection | https://wellcomecollection.org/works/xyk8pu8p | CC-BY | |',
        }),
      ];
      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['xyk8pu8p']);
    });

    it('returns empty array when documentBody is empty', () => {
      const result = getWorksIdsFromDocumentBody([]);
      expect(result).toEqual([]);
    });

    it('deduplicates works IDs across multiple slices', () => {
      const documentBody = [
        createTextSlice({
          url: 'https://wellcomecollection.org/works/duplicate123',
        }),
        createEditorialImageSlice({
          captionUrl: 'https://wellcomecollection.org/works/duplicate123',
        }),
      ];

      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['duplicate123']);
    });
  });
});
