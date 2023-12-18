import { EOL } from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { Client, PrismicDocument } from "@prismicio/client";
import { createPrismicClient } from "../src/services/prismic";
import { asTitle, asText } from "../src/helpers/type-guards";
import { Writable } from "stream";
import {
  articlesQuery,
  webcomicsQuery,
  wrapQueries,
  eventDocumentsQuery,
} from "../src/graph-queries";

const dataDir = path.resolve(__dirname, "prismic-snapshots");

const articleDocumentIds = [
  "YbjAThEAACEAcPYF", // articles - The enigma of the medieval folding almanac
  "Y0U4GBEAAA__16h6", // articles - Tracing the roots of our fears and fixations
  "WcvPmSsAAG5B5-ox", // articles - The Key to Memory: Follow your nose
  "XUGruhEAACYASyJh", // webcomics - Footpath
  "XK9p2RIAAO1vQn__", // webcomics - Groan
  "YvtXgxAAACMA9j5d", // people - Kate Summerscale
];

const eventDocumentIds = [
  "ZSPXJBAAACIAiERm", // discussion - Recipes for Early Modern Beauty
  "ZQgdkREAAAbr6cRR", // Format undefined - Lights Up on The Cult of Beauty
  "ZTevFxAAACQAyHEk", // workshop - Sexing Up the Internet
  "ZJLZoRAAACIARz42", // gallery-tour - Perspective Tour With Jess Dobkin
  "ZFt0WhQAAHnPEH7P", // festival - Land Body Ecologies Festival Day Two
  "ZRrijRIAAJNSARgG", // performance - Standards, My Right to Beauty
  "Wn3Q3SoAACsAIeFI", // event-formats - Performance
];

const main = async () => {
  const client = createPrismicClient();
  const articleDocs = await updateArticleSnapshots(client);
  const eventDocs = await updateEventDocumentSnapshots(client);
  console.log("Done saving snapshots.");

  console.log("Adding comments to update script...");
  await addCommentsToUpdateScript([...articleDocs, ...eventDocs]);

  console.log("Done.");
};

const updateArticleSnapshots = async (client: Client) => {
  console.log("Updating prismic snapshots for the following articles:");
  console.log(articleDocumentIds.join("\n"));
  const docs = await client.getAllByIDs(articleDocumentIds, {
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
  return docs;
};

const updateEventDocumentSnapshots = async (client: Client) => {
  console.log("Updating prismic snapshots for the following eventDocuments:");
  console.log(eventDocumentIds.join("\n"));
  const docs = await client.getAllByIDs(eventDocumentIds, {
    graphQuery: eventDocumentsQuery,
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
  return docs;
};

const addCommentsToUpdateScript = async (docs: PrismicDocument[]) => {
  const comments = new Map(
    docs.map((doc) => {
      switch (doc.type) {
        case "events":
          return [
            doc.id,
            `${doc.data.format?.slug || "Format undefined"} - ${
              asTitle(doc.data.title) || asText(doc.data.name)
            }`,
          ];
        default:
          return [
            doc.id,
            `${doc.type} - ${asTitle(doc.data.title) || asText(doc.data.name)}`,
          ];
      }
    })
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
        await writeLine(uncommentedLine + ` // ${comments.get(id)}`);
        continue;
      }
    }
    await writeLine(line);
  }

  await fs.rename(tmpFile, __filename);
};

const lineWriter = (stream: Writable) => (line: string) =>
  new Promise((resolve) => stream.write(line + EOL, "utf-8", resolve));

main();
