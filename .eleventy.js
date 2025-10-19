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

  // Nunjucks date filter (Luxon) to support templates using | date("...")
  const { DateTime } = require("luxon");
  eleventyConfig.addFilter("date", (value, fmt = "yyyy-MM-dd") => {
    // Map common Moment-style tokens to Luxon equivalents used in templates
    const mapTokens = (s) => s
      .replace(/ddd/g, "ccc") // short weekday
      .replace(/YYYY/g, "yyyy")
      .replace(/DD/g, "dd");
    const format = mapTokens(fmt);
    const dt = value === "now"
      ? DateTime.local()
      : (value instanceof Date ? DateTime.fromJSDate(value) : DateTime.fromISO(String(value)));
    return dt.isValid ? dt.toFormat(format) : "";
  });

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
