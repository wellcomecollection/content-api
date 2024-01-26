const query = `{
  events {
    title
    isOnline
    availableOnline
    format {
      ... on event-formats {
        title
      }
    }
    contributors {
      role {
        title
      }
      contributor {
        ... on people {
          name
        }
        ... on organisations {
          name
        }
      }
    }
    interpretations {
      interpretationType {
        title
      }
    }
    times {
      startDateTime
      endDateTime
      isFullyBooked
      onlineIsFullyBooked
    }
    audiences {
      audience {
        title
      }
    }
    schedule {
      event {
        title
        times {
          startDateTime
          endDateTime
        }
      }
      isNotLinked
    }
    locations {
      location {
        title
      }
    }
    promo {
      ... on editorialImage {
        non-repeat {
          caption
          image
        }
      }
    }
    series {
      series {
        title
        contributors {
          contributor {
            ... on people {
              name
            }
            ... on organisations {
              name
            }
          }
        }
      }
    }
  }
}`;

export default query;
