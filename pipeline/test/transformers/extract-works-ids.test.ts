import {
  BodiesWithPossibleWorks,
  getWorksIdsFromDocumentBody,
} from '@weco/content-pipeline/src/transformers/addressables/helpers/extract-works-ids';
import {
  createEditorialImageGallerySlice,
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
      ] as BodiesWithPossibleWorks;

      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['p4bh9qca']);
    });

    it('extracts works IDs from editorialImage slice caption', () => {
      const documentBody = [
        createEditorialImageSlice({
          captionUrl: 'https://wellcomecollection.org/works/sgswqhrs',
        }),
      ] as BodiesWithPossibleWorks;

      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['sgswqhrs']);
    });

    it('extracts works IDs from editorialImage slice copyright', () => {
      const documentBody = [
        createEditorialImageSlice({
          copyright:
            'Title | | Wellcome Collection | https://wellcomecollection.org/works/atrvxkxg/items | CC-BY | |',
        }),
      ] as BodiesWithPossibleWorks;

      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['atrvxkxg']);
    });

    it('extracts works IDs from gifVideo slice caption', () => {
      const documentBody = [
        createGifVideoSlice({
          captionUrl: 'https://wellcomecollection.org/works/abc123def',
        }),
      ] as BodiesWithPossibleWorks;

      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['abc123def']);
    });

    it('extracts works IDs from gifVideo slice tasl', () => {
      const documentBody = [
        createGifVideoSlice({
          tasl: 'Percentage split of men aged 16-30 on the stem cell registers | Thomas SG Farnetti | Wellcome Collection | https://wellcomecollection.org/works/xyk8pu8p | CC-BY | |',
        }),
      ] as BodiesWithPossibleWorks;
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
      ] as BodiesWithPossibleWorks;

      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['duplicate123']);
    });

    it('extracts works IDs from editorialImageGallery slice captions', () => {
      const documentBody = [
        createEditorialImageGallerySlice({
          items: [
            {
              captionUrl: 'https://wellcomecollection.org/works/mtseafdk',
            },
            {
              captionUrl: 'https://wellcomecollection.org/works/v2xh6g4x',
            },
          ],
        }),
      ] as BodiesWithPossibleWorks;

      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['mtseafdk', 'v2xh6g4x']);
    });

    it('extracts works IDs from editorialImageGallery slice copyright fields', () => {
      const documentBody = [
        createEditorialImageGallerySlice({
          items: [
            {
              copyright:
                "Vases of flowers | O'Brien, Thomas | Wellcome Collection | https://wellcomecollection.org/works/me4wtyvb/images?id=wgy6h8a4 | PDM | |",
            },
            {
              copyright:
                'Treatment of acute pathologies | Unknown creator | Wellcome Collection | https://wellcomecollection.org/works/v2xh6g4x/items | CC-BY | |',
            },
          ],
        }),
      ] as BodiesWithPossibleWorks;

      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['me4wtyvb', 'v2xh6g4x']);
    });

    it('extracts works IDs from editorialImageGallery slice mixed captions and copyright', () => {
      const documentBody = [
        createEditorialImageGallerySlice({
          items: [
            {
              copyright:
                'Data and a mind | Anthony Whishaw | Wellcome Collection | | | Anthony Whishaw | https://wellcomecollection.org/works/yz53z3ff/images?id=j3y7f4t6',
              captionUrl: 'https://wellcomecollection.org/works/abc123',
            },
            {
              captionUrl: 'https://wellcomecollection.org/works/def456',
            },
          ],
        }),
      ] as BodiesWithPossibleWorks;

      const result = getWorksIdsFromDocumentBody(documentBody);
      expect(result).toEqual(['yz53z3ff', 'abc123', 'def456']);
    });

    it('preserves order of works IDs across multiple slice types', () => {
      const documentBody = [
        createTextSlice({
          url: 'https://wellcomecollection.org/works/first123',
        }),
        createEditorialImageSlice({
          copyright:
            'Title | Author | Wellcome Collection | https://wellcomecollection.org/works/second456/items | CC-BY | |',
          captionUrl: 'https://wellcomecollection.org/works/third789duplicate',
        }),
        createEditorialImageGallerySlice({
          items: [
            {
              copyright:
                'Gallery Image 1 | Creator | Wellcome Collection | https://wellcomecollection.org/works/fourth012/images | PDM | |',
            },
            {
              captionUrl: 'https://wellcomecollection.org/works/fifth345',
            },
          ],
        }),
        createGifVideoSlice({
          tasl: 'Video title | Creator | Wellcome Collection | https://wellcomecollection.org/works/sixth678 | CC-BY | |',
          captionUrl: 'https://wellcomecollection.org/works/seventh901',
        }),
        createTextSlice({
          url: 'https://wellcomecollection.org/works/eighth234',
        }),
        createTextSlice({
          url: 'https://wellcomecollection.org/works/third789duplicate',
        }),
      ] as BodiesWithPossibleWorks;

      const result = getWorksIdsFromDocumentBody(documentBody);

      expect(result).toEqual([
        'first123',
        'second456',
        'third789duplicate',
        'fourth012',
        'fifth345',
        'sixth678',
        'seventh901',
        'eighth234',
      ]);
    });
  });
});
