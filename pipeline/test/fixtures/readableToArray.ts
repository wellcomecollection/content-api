import { Readable } from "node:stream";

const readableToArray = <T>(stream: Readable): Promise<T[]> =>
  new Promise((resolve, reject) => {
    const arr: T[] = [];
    if (!stream.readable) {
      resolve(arr);
    }

    stream.on("data", (doc: T) => arr.push(doc));
    stream.on("error", reject);
    stream.on("close", () => resolve(arr));
    stream.on("end", (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(arr);
      }
    });
  });

export default readableToArray;
