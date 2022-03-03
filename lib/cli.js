import { Command } from 'commander';
import pageLoader from './index.js';

export default () => {
  const program = new Command();

  program
    .description('Page loader utility')
    .version('1.0.2')
    .option('-o, --output [dir]', 'output dir', `${process.cwd()}`);

  program
    .argument('<url>')
    .action((url) => {
      const { output: dir } = program.opts();
      pageLoader(url, dir)
        .then(console.log);
    });

  program.parse();
};
