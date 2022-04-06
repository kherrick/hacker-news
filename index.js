import { DOMParser } from "@xmldom/xmldom";
import { writeFile } from "fs/promises";
import fetch from "universal-fetch";

const logReadmeMdContents = (title = "", link = "", items) => {
  console.log(`# [${title}](${link})`);
  console.log("");

  items.forEach(([[dateTime, itemComments], [itemTitle, itemLink]]) => {
    const title = JSON.stringify(itemTitle).slice(1, -1);
    console.log(`* [${dateTime}](${itemComments}) - [${title}](${itemLink})`);
  });
};

const writeIndexJson = (items, jsonOutputPath) => {
  writeFile(jsonOutputPath, JSON.stringify(items, null, 2), "utf-8");
};

const buildItems = (items, result = []) => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const itemTitle = item.getElementsByTagName("title")[0].textContent;
    const itemLink = item.getElementsByTagName("link")[0].textContent;
    const itemPubDate = item.getElementsByTagName("pubDate")[0].textContent;
    const itemComments = item.getElementsByTagName("comments")[0].textContent;
    const [dateTime] = itemPubDate.split(" +");

    result.push([
      [
        new Intl.DateTimeFormat("en-CA", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        })
          .format(new Date(dateTime))
          .replace(", 24", ", 00"),
        itemComments,
      ],
      [itemTitle, itemLink],
    ]);
  }

  return result.sort().reverse();
};

const handleRSS = (RSS, title, link, jsonOutputPath) => {
  const parsedXML = new DOMParser().parseFromString(RSS);
  const channel = parsedXML.getElementsByTagName("channel")[0];
  const items = buildItems(channel.getElementsByTagName("item"));

  writeIndexJson(items, jsonOutputPath);
  logReadmeMdContents(title, link, items);
};

const title = "Hacker News";
const link = "https://kherrick.github.io/hacker-news/";
const jsonOutputPath = "./index.json";

handleRSS(
  await (await fetch("https://news.ycombinator.com/rss")).text(),
  title,
  link,
  jsonOutputPath
);
