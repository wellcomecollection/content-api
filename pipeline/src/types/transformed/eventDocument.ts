import { Image } from ".";
import { Series } from ".";

export type EventDocument = {
  type: "Event";
  id: string;
  title: string;
  image?: Image;
  times: {
    startDateTime?: Date;
    endDateTime?: Date;
    isFullyBooked: { inVenue: boolean; online: boolean };
  }[];
  format: EventDocumentFormat;
  locations: EventDocumentLocation[];
  interpretations: EventDocumentInterpretation[];
  audiences: EventDocumentAudience[];
  series: Series;
  isAvailableOnline: boolean;
};

export type EventDocumentFormat = {
  type: "EventFormat";
  id: string;
  label?: string;
};

export type EventDocumentLocation = {
  type: "EventLocation";
  id: string;
  label?: string;
};

export type EventDocumentInterpretation = {
  type: "EventInterpretation";
  id: string;
  label?: string;
};

export type EventDocumentAudience = {
  type: "EventAudience";
  id: string;
  label?: string;
};
