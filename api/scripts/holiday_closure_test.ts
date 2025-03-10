/*
Before the end-of-year closure, we test that the date picker dropdown in the Request item dialog is going to display the correct options
to ensure that users can only requests items when they can be available, on a day the library is open
Once the Modified opening times have been added to Prismic and published,
set dateNow as the date to be tested and run this script with
yarn check_holiday_closures
*/

import { DateTime } from 'luxon';

import { getNextOpeningDates } from '@weco/content-api/src/controllers/utils';
import { getElasticClient } from '@weco/content-common/services/elasticsearch';
import {
  ElasticsearchVenue,
  NextOpeningDate,
  Venue,
} from '@weco/content-common/types/venue';

// set this to the date to be tested, here and in utils.ts
// eg. if you want to see what the dates on the date picker will be on December 14, 2024 at 8:30am
// const dateNow = new Date("2024-12-14T08:30:00.000Z");
const dateNow = new Date();

const formatDate = (openingDay: NextOpeningDate) =>
  openingDay.open
    ? new Date(openingDay.open).toUTCString().slice(0, 11) + '\n'
    : '';

const compareDates = (library: NextOpeningDate, deepstore: NextOpeningDate) => {
  const libraryDate =
    library.open && DateTime.fromJSDate(new Date(library.open)).startOf('day');
  const deepstoreDate =
    deepstore.open &&
    DateTime.fromJSDate(new Date(deepstore.open)).startOf('day');
  if (libraryDate === undefined || deepstoreDate === undefined) {
    throw new Error('One of these dates is undefined!');
  } else {
    return libraryDate > deepstoreDate;
  }
};

// the 2 functions below reproduce the logic used in the catalogue-api/items to generate available dates

const applyItemsApiLibraryLogic = (openingTimes: NextOpeningDate[]) => {
  // the library is open today if the 1st date in NextOpeningDate[] is the same as today
  const isLibraryOpenToday =
    new Date(dateNow).getDate() ===
    (openingTimes[0].open && new Date(openingTimes[0].open).getDate());
  if (dateNow.getHours() < 10 || !isLibraryOpenToday) {
    return openingTimes.slice(1, -1).map(formatDate);
  } else {
    return openingTimes.slice(2, -1).map(formatDate);
  }
};

const applyItemsApiDeepstoreLogic = (
  libraryOpeningTimes: NextOpeningDate[],
  deepstoreOpeningTimes: NextOpeningDate[]
) => {
  const firstDeepstoreAvailability = deepstoreOpeningTimes.slice(10, -1)[0];
  const subsequentLibraryAvailabilities = libraryOpeningTimes.filter(
    libraryOpeningTime => {
      return compareDates(libraryOpeningTime, firstDeepstoreAvailability);
    }
  );
  return subsequentLibraryAvailabilities.map(formatDate);
};

const run = async () => {
  const elasticClient = await getElasticClient({
    serviceName: 'api',
    pipelineDate: '2025-02-26',
    hostEndpointAccess: 'public',
  });

  const searchResponse = await elasticClient.search<ElasticsearchVenue>({
    index: 'venues',
    _source: ['display'],
    query: {
      bool: {
        filter: [{ terms: { 'filter.title': ['library', 'deepstore'] } }],
      },
    },
  });
  const venuesData = searchResponse.hits.hits.flatMap(hit =>
    hit._source ? [hit._source.display] : []
  );

  const {
    regularOpeningDays: libraryRegularOpeningDays,
    exceptionalClosedDays: libraryHolidayclosures,
  } = venuesData.find(venue => venue.title === 'Library') as Venue;
  const {
    regularOpeningDays: deepstoreRegularOpeningDays,
    exceptionalClosedDays: deepstoreHolidayclosures,
  } = venuesData.find(venue => venue.title === 'Deepstore') as Venue;

  const onsiteItemsPickup = applyItemsApiLibraryLogic(
    getNextOpeningDates(libraryRegularOpeningDays, libraryHolidayclosures)
  ).slice(0, 12);
  const offsiteItemsPickup = applyItemsApiDeepstoreLogic(
    getNextOpeningDates(libraryRegularOpeningDays, libraryHolidayclosures),
    getNextOpeningDates(deepstoreRegularOpeningDays, deepstoreHolidayclosures)
  ).slice(0, 12);

  const library = `Onsite items requested on ${dateNow} will be available on: \n${onsiteItemsPickup.join('\r')}`;
  const deepstore = `Deepstore items requested on ${dateNow} will be available on: \n${offsiteItemsPickup.join('\r')}`;
  console.log(library);
  console.log(deepstore);
};

run();
