import { EOL } from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { createPrismicClient } from "../src/services/prismic";
import { asTitle } from "../src/helpers";
import { Writable } from "stream";
import {
  articlesQuery,
  webcomicsQuery,
  wrapQueries,
} from "../src/graph-queries";

const dataDir = path.resolve(__dirname, "prismic-snapshots");
const documentIds = [
  "YbjAThEAACEAcPYF", // articles	- The enigma of the medieval folding almanac
  "Y0U4GBEAAA__16h6", // articles	- Tracing the roots of our fears and fixations
  "WcvPmSsAAG5B5-ox", // articles	- The Key to Memory: Follow your nose
  "XUGruhEAACYASyJh", // webcomics	- Footpath
  "XK9p2RIAAO1vQn__", // webcomics	- Groan
];

const main = async () => {
  console.log("Updating prismic snapshots for the following documents:");
  console.log(documentIds.join("\n"));
  const client = createPrismicClient();
  const docs = await client.getAllByIDs(documentIds, {
    graphQuery: wrapQueries(articlesQuery, webcomicsQuery),
  });

  await Promise.all(
    docs.map((doc) => {
      const docJson = JSON.stringify(doc, null, 2);
      return fs.writeFile(
        path.resolve(dataDir, `${doc.id}.${doc.type}.json`),
        docJson
      );
    })
  );
  console.log("Done saving snapshots.");

  console.log("Adding comments to update script...");
  const comments = new Map(
    docs.map((doc) => [doc.id, `${doc.type}\t- ${asTitle(doc.data.title)}`])
  );
  const tmpFile = `${__filename}.tmp`;
  const thisScript = await fs.open(__filename, "r");
  const newScript = await fs.open(tmpFile, "w");
  const writeStream = newScript.createWriteStream();
  const writeLine = lineWriter(writeStream);
  for await (const line of thisScript.readLines()) {
    // This regex matches lines starting with an optional indent, followed by a string, followed by a comma, followed by an optional comment
    // eg:
    //   "blah", // hello world
    const stringArrayItemLine =
      /^(?<indent>\s*)"(?<id>.+)",(?<comment>\s*\/\/.*)?$/.exec(line);
    if (stringArrayItemLine) {
      const id = stringArrayItemLine.groups?.["id"];
      const indent = stringArrayItemLine.groups?.["indent"];
      const uncommentedLine = `${indent}"${id}",`;
      if (id && comments.has(id)) {
        await writeLine(uncommentedLine + `// ${comments.get(id)}`);
        continue;
      }
    }
    await writeLine(line);
  }

  await fs.rename(tmpFile, __filename);
  console.log("Done.");
};

const lineWriter = (stream: Writable) => (line: string) =>
  new Promise((resolve) => stream.write(line + EOL, "utf-8", resolve));

main();
