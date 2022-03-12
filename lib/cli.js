import { Command } from 'commander';
import Listr from 'listr';
import pageLoader from './index.js';

export default () => {
  const program = new Command();

  program
    .description('Page loader utility')
    .version('1.0.5')
    .option('-o, --output [dir]', 'output dir', `${process.cwd()}`);

  program
    .argument('<url>')
    .action((url) => {
      const { output: dirpath } = program.opts();
      pageLoader(url, dirpath)
        .then(([filepath, tasks]) => Promise.all([
          filepath,
          new Listr(tasks.map(([title, task]) => ({
            title,
            task: () => task,
          })), { concurrent: true }).run().catch(console.error),
        ]))
        .then(([filepath]) => {
          console.log(`Page was successfully downloaded into '${filepath}'`);
        })
        .catch((error) => {
          console.error(error);
          process.exit(1);
        });
    });

  program.parse();
};
