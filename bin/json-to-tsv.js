#!/usr/bin/env node

(async (stream, encoding = "utf8") => {
  stream.setEncoding(encoding);

  JSON.parse(
    await new Promise((res) => {
      let data = "";

      stream.on("data", (chunk) => (data += chunk));
      stream.on("end", () => res(data));

      return data;
    })
  ).forEach(([[item_url, item_title], [comment_url, date]]) => {
    console.log(
      `${JSON.stringify(item_url)}\t${JSON.stringify(
        comment_url
      )}\t${JSON.stringify(item_title)}\t${JSON.stringify(date)}`
    );
  });
})(process.stdin);
