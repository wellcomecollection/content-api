import { Readable } from "node:stream";
import { Observable, Subscription } from "rxjs";

// Copied from https://github.com/greguz/rxdable/tree/master
// In that package it is called getStreamByObservable
// (MIT License)
export function observableToStream<T>(observable: Observable<T>): Readable {
  let subscription: Subscription | undefined;

  return new Readable({
    objectMode: true,
    read() {
      if (!subscription) {
        subscription = observable.subscribe({
          next: (value) => {
            this.push(value);
          },
          error: (error) => {
            process.nextTick(() => this.emit("error", error));
          },
          complete: () => {
            this.push(null);
          },
        });
      }
    },
    destroy(error, callback) {
      if (subscription && !subscription.closed) {
        subscription.unsubscribe();
      }
      callback(error);
    },
  });
}
