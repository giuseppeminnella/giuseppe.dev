module.exports = function(eleventyConfig) {
  const pluginRss = require("@11ty/eleventy-plugin-rss");
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addPassthroughCopy({"src/assets": "assets"});

  // Markdown settings
  let md = require("markdown-it")({
    html: true,
    linkify: true,
    typographer: true
  }).use(require("markdown-it-footnote")).use(require("markdown-it-anchor"));
  eleventyConfig.setLibrary("md", md);

  // Collections: posts sorted by date desc
  eleventyConfig.addCollection("posts", (collection) =>
    collection.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );

  return {
    dir: { input: "src", includes: "_includes", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md"]
  };
};

