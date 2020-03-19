import { FohmService } from './services/fohm.service';
import * as dotenv from 'dotenv';
import process from 'process';
declare const module: WebpackHotModule;
dotenv.config();

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => process.exit());
}

const fohmService = new FohmService();

console.log('initializing risk scraper...');
fohmService.setupScraper('risk');
console.log('risk scraper initialized')

console.log('initializing regions scraper...');
fohmService.setupScraper('regions');
console.log('regions scraper initialized')

console.log('initializing suggestions scraper...');
fohmService.setupScraper('suggestions');
console.log('suggestions scraper initialized')

process.on('beforeExit', code => {
  console.log(`Cleaning up before exit with code ${code}..`);
  // Clean up
});

process.on('exit', code => {
  console.log(`Exiting with code ${code}`)
  // Exit stuff
});