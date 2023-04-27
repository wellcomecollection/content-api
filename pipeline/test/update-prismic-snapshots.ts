import fs from "node:fs/promises";
import path from "node:path";
import { createPrismicClient } from "../src/services/prismic";

const dataDir = path.resolve(__dirname, "prismic-snapshots");
const documentIds = [
  "YbjAThEAACEAcPYF",
  "Y0U4GBEAAA__16h6",
  "WcvPmSsAAG5B5-ox",
  "XUGruhEAACYASyJh",
  "XK9p2RIAAO1vQn__",
];

const main = async () => {
  console.log("Updating prismic snapshots for the following documents:");
  console.log(documentIds.join("\n"));
  const client = createPrismicClient();
  const docs = await client.getAllByIDs(documentIds);

  await Promise.all(
    docs.map((doc) => {
      const docJson = JSON.stringify(doc, null, 2);
      return fs.writeFile(
        path.resolve(dataDir, `${doc.id}.${doc.type}.json`),
        docJson
      );
    })
  );
  console.log("Done!");
};

main();
