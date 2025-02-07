import { Image, Series } from '.';

export type EventDocument = {
  type: 'Event';
  id: string;
  uid: string | null;
  title: string;
  image?: Image;
  times: EventDocumentTime[];
  format: EventDocumentFormat;
  locations: EventDocumentLocations;
  interpretations: EventDocumentInterpretation[];
  audiences: EventDocumentAudience[];
  series: Series;
  isAvailableOnline: boolean;
};

export type EventDocumentTime = {
  startDateTime?: Date;
  endDateTime?: Date;
  isFullyBooked: { inVenue: boolean; online: boolean };
};

export type EventDocumentFormat = {
  type: 'EventFormat';
  id: string;
  label?: string;
};

type OnlineAttendance = {
  id: 'online';
  label: 'Online';
};
type BuildingAttendance = {
  id: 'in-our-building';
  label: 'In our building';
};

export type EventDocumentLocations = {
  isOnline: boolean;
  places?: EventDocumentPlace[];
  attendance: ((BuildingAttendance | OnlineAttendance) & {
    type: 'EventAttendance';
  })[];
  type: 'EventLocations';
};

export type EventDocumentPlace = {
  type: 'EventPlace';
  id: string;
  label?: string;
};

export type EventDocumentInterpretation = {
  type: 'EventInterpretation';
  id: string;
  label?: string;
};

export type EventDocumentAudience = {
  type: 'EventAudience';
  id: string;
  label?: string;
};

// TODO ??
export type EventDocumentSchedule = {
  type: 'EventSchedule';
  id: string;
  label?: string;
};
