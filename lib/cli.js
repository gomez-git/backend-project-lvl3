import { Command } from 'commander';
import pageLoader from './index.js';

export default () => {
  const program = new Command();

  program
    .description('Page loader utility')
    .version('1.0.4')
    .option('-o, --output [dir]', 'output dir', `${process.cwd()}`);

  program
    .argument('<url>')
    .action((url) => {
      const { output: dirpath } = program.opts();
      pageLoader(url, dirpath)
        .then(console.log)
        .catch((error) => {
          console.error(error);
          process.exit(1);
        });
    });

  program.parse();
};
