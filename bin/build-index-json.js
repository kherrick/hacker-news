#!/usr/bin/env node

import { readFile, writeFile } from "fs/promises";

(async () => {
  const index = await readFile("index.json", "utf-8");

  writeFile(
    "index.json",
    JSON.stringify([
      ...JSON.parse(index),
    ]),
    "utf-8"
  );
})();
