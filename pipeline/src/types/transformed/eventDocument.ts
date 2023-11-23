import { Image } from ".";

export type EventDocument = {
  type: "Event";
  id: string;
  title: string;
  image?: Image;
  times: { startDateTime?: Date; endDateTime?: Date }[];
  format: EventDocumentFormat;
  locations: EventDocumentLocation[];
  interpretations: EventDocumentInterpretation[];
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
