import prettier from 'prettier';
import * as cheerio from 'cheerio';

const prettify = (html) => prettier.format(html, {
  parser: 'html', printWidth: Infinity, htmlWhitespaceSensitivity: 'ignore',
});

export default (html, origin, pathHolder) => {
  const $ = cheerio.load(html);
  const tags = ['img', 'link', 'script'];
  const links = [];

  tags.forEach((tag) => {
    const source = tag === 'link' ? 'href' : 'src';

    $(tag).each((_i, elem) => {
      const resourceUrl = new URL($(elem).attr(source), origin);

      if ($(elem).attr(source) && resourceUrl.origin === origin) {
        const resourceName = pathHolder.getResourseName(resourceUrl, tag);
        $(elem).attr(source, resourceName);
        links.push([resourceUrl, resourceName, tag]);
      }
    });
  });

  const changedHtml = prettify($.html());

  return { changedHtml, links };
};
