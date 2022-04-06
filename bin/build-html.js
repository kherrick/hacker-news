#!/usr/bin/env node

import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { readFile, writeFile } from "fs/promises";
import fetch from "universal-fetch";
import htmlnano from "htmlnano";
import prettier from "prettier";
import sanitizeHtml from "sanitize-html";

import { buildNextItem } from "../lib/build-html-next-item.js";

const document = new DOMParser().parseFromString(
  await readFile(`index.html`, "utf8"),
  "text/html"
);

const currentLatest = document.getElementById("latest");
const latest = document.createElement("section");
latest.setAttribute("id", "latest");

const latestHeader = document.createElement("h2");
latestHeader.textContent = "Latest";
latest.appendChild(latestHeader);

const createElementWithInnerHTML = (tagName, innerHTML) => {
  const tmpTag = document.createElement("span");
  const container = document.createElement(tagName);
  container.appendChild(tmpTag);

  tmpTag.parentNode.replaceChild(
    new DOMParser().parseFromString(sanitizeHtml(innerHTML), "text/html"),
    tmpTag
  );

  return container;
};

for (const nextItem of await (
  await fetch("https://kherrick.github.io/hacker-news/index.json")
).json()) {
  const [[dateTime, itemComments], [itemTitle, itemLink]] = nextItem;
  const section = await buildNextItem({
    document,
    handleText: (text, itemSection) => {
      if (text) {
        const content = createElementWithInnerHTML(
          "div",
          text.replace(/\0/g, "")
        );
        content.setAttribute("class", "text");

        itemSection.appendChild(content);
      }
    },
    dateTime,
    itemComments,
    itemLink,
    itemTitle: sanitizeHtml(itemTitle),
    fetchItemDetails: true,
  });

  latest.appendChild(section);
}

// replace latest
currentLatest.parentNode.replaceChild(latest, currentLatest);

// populate archives
const currentArchives = document.getElementById("archives");

const archives = document.createElement("section");
archives.setAttribute("id", "archives");

const archivesHeaderLink = document.createElement("a");
archivesHeaderLink.textContent = "Archives";
archivesHeaderLink.setAttribute(
  "href",
  "https://github.com/kherrick/hacker-news/blob/main/archives/index.md"
);

const archivesHeader = document.createElement("h2");
archivesHeader.appendChild(archivesHeaderLink);
archives.appendChild(archivesHeader);

(
  await (
    await fetch(
      "https://raw.githubusercontent.com/kherrick/hacker-news/main/archives/index.md"
    )
  ).text()
)
  .split("\n")
  .filter((line) => line.match(new RegExp("^\\* \\[")))
  .forEach((line) => {
    const segment = line.replace("* ", "").split("](");
    const year = segment[0].slice(1);
    const indexPath = segment[1].slice(0, -1);

    const archiveYearLink = document.createElement("a");
    archiveYearLink.textContent = year;
    archiveYearLink.setAttribute(
      "href",
      "https://github.com/kherrick/hacker-news/blob/main/archives/" + indexPath
    );

    const header = document.createElement("h3");
    header.appendChild(archiveYearLink);

    const section = document.createElement("section");
    section.appendChild(header);

    archives.appendChild(section);
  });

// replace archives
currentArchives.parentNode.replaceChild(archives, currentArchives);

writeFile(
  "index.html",
  process?.argv[2] === "MINIFY"
    ? (
        await htmlnano.process(
          new XMLSerializer().serializeToString(document),
          {
            mergeScripts: false,
            mergeStyles: false,
          },
          htmlnano.presets.safe
        )
      ).html
    : prettier.format(new XMLSerializer().serializeToString(document), {
        parser: "html",
      }),
  "utf8"
);
