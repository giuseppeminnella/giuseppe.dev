module.exports = function(eleventyConfig) {
  const pluginRss = require("@11ty/eleventy-plugin-rss");
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addPassthroughCopy({"src/assets": "assets"});
  eleventyConfig.addPassthroughCopy({"src/llm.txt": "llm.txt"});
  eleventyConfig.addPassthroughCopy({"src/robots.txt": "robots.txt"});

  // Markdown settings
  let md = require("markdown-it")({
    html: true,
    linkify: true,
    typographer: true
  }).use(require("markdown-it-footnote")).use(require("markdown-it-anchor"));

  // Open external links in new tabs
  const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex('href');
    if (hrefIndex >= 0) {
      const href = token.attrs[hrefIndex][1];
      // Open external links (http/https) in new tab
      if (href.startsWith('http://') || href.startsWith('https://')) {
        token.attrSet('target', '_blank');
        token.attrSet('rel', 'noopener noreferrer');
      }
    }
    return defaultRender(tokens, idx, options, env, self);
  };

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

  // Utility: take first N items of an array
  eleventyConfig.addFilter("take", (arr, n = 10) => Array.isArray(arr) ? arr.slice(0, n) : arr);

  // (Removed) lightbox shortcode — images are plain and responsive

  // Collections: posts sorted by date desc
  eleventyConfig.addCollection("posts", (collection) => {
    const items = collection.getAll().filter((item) =>
      item.inputPath && item.inputPath.includes("/src/posts/")
    );
    return items.sort((a, b) => (b.date || 0) - (a.date || 0));
  });

  return {
    dir: { input: "src", includes: "_includes", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md"]
  };
};
