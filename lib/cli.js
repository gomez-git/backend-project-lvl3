import { Command } from 'commander';
import PageLoader from './page-loader.js';

export default () => {
  const program = new Command();

  program
    .description('Page loader utility')
    .version('1.0.0')
    .option('-o, --output [dir]', 'output dir', `${process.cwd()}`);

  program
    .argument('<url>')
    .action((url) => {
      const { output: dir } = program.opts();
      const pageLoader = new PageLoader(url, dir);
      const { filepath } = pageLoader;
      pageLoader.getHtml()
        .then((response) => {
          pageLoader.writeFile(response.data);
        });
      console.log(filepath);
    });

  program.parse();
};
