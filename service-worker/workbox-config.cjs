module.exports = {
  globDirectory: "./",
  globPatterns: ["index.html"],
  swDest: "service-worker.js",
  // define runtime caching rules
  runtimeCaching: [
    {
      // match any request
      urlPattern: new RegExp("^.*$"),

      // apply a cache-first strategy
      handler: "NetworkFirst",

      options: {
        // use a custom cache name
        cacheName: "hacker-news-cache",

        expiration: {
          // 365 days
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
  ],
};
