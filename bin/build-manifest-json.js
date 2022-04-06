#!/usr/bin/env node

import { readFile, writeFile } from "fs/promises";

(async () => {
  const manifest = await readFile("manifest.json", "utf-8");

  writeFile(
    "manifest.json",
    JSON.stringify({
      ...JSON.parse(manifest),
      scope: "/hacker-news/",
      start_url: "/hacker-news/",
    }),
    "utf-8"
  );
})();
