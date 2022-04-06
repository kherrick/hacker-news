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
  )
    .reduce(
      (acc, cur) => [
        ...acc.filter(
          (obj) =>
            // filter based on item_url and comment_url
            obj.item_url !== cur.item_url && obj.comment_url !== cur.comment_url
        ),
        cur,
      ],
      []
    )
    .forEach(({ item_url, item_title, comment_url, date }) => {
      const title = JSON.stringify(item_title).slice(1, -1);
      console.log(`${item_url}\t${comment_url}\t${title}\t${date}`);
    });
})(process.stdin);
