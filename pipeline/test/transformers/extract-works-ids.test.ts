import { getWorksIdsFromDocumentBody } from '@weco/content-pipeline/src/transformers/addressables/helpers/extract-works-ids';
import {
  createEditorialImageSlice,
  createTextSlice,
} from '@weco/content-pipeline/test/fixtures/prismic-document-body';

describe('extract-works-ids', () => {
  describe('getWorksIdsFromDocumentBody', () => {
    it('returns empty array when documentBody is empty', () => {
      const result = getWorksIdsFromDocumentBody({
        documentBody: [],
        supportedSliceTypes: ['text', 'editorialImage'],
      });
      expect(result).toEqual([]);
    });

    it('extracts works IDs from text slice hyperlinks', () => {
      const documentBody = [
        createTextSlice({
          url: 'https://wellcomecollection.org/works/p4bh9qca',
        }),
      ];

      const result = getWorksIdsFromDocumentBody({
        documentBody,
        supportedSliceTypes: ['text', 'editorialImage'],
      });
      expect(result).toEqual(['p4bh9qca']);
    });

    it('extracts works IDs from editorialImage captions', () => {
      const documentBody = [
        createEditorialImageSlice({
          captionUrl: 'https://wellcomecollection.org/works/sgswqhrs',
        }),
      ];

      const result = getWorksIdsFromDocumentBody({
        documentBody,
        supportedSliceTypes: ['text', 'editorialImage'],
      });
      expect(result).toEqual(['sgswqhrs']);
    });

    it('extracts works IDs from editorialImage copyright fields', () => {
      const documentBody = [
        createEditorialImageSlice({
          captionUrl: 'test.com',
          copyright:
            'Title | | Wellcome Collection | https://wellcomecollection.org/works/atrvxkxg/items | CC-BY | |',
        }),
      ];

      const result = getWorksIdsFromDocumentBody({
        documentBody,
        supportedSliceTypes: ['text', 'editorialImage'],
      });
      expect(result).toEqual(['atrvxkxg']);
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

      const result = getWorksIdsFromDocumentBody({
        documentBody,
        supportedSliceTypes: ['text', 'editorialImage'],
      });
      expect(result).toEqual(['duplicate123']);
    });
  });
});
