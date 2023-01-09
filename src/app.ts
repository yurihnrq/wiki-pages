import puppeteer from 'puppeteer';
import { ArgumentParser } from './class/ArgumentParser';
import { WikiGraph } from './class/WikiGraph';
import { WikiScraper } from './class/WikiScraper';
import { StartOptions } from './constants/StartOptions';

async function startBrowser() {
	console.log('Opening the browser...');

	const args = new ArgumentParser(process.argv);

	const browser = await puppeteer.launch({
		headless: args.hasArgument('-h'),
		args: ['--disable-setuid-sandbox'],
		ignoreHTTPSErrors: true
	});

	if (!browser) throw Error('No browser detected');

	return browser;
}

async function start({
	startingUrl,
	maxNodes
}: {
	startingUrl: string;
	maxNodes: number;
}) {
	const browser = await startBrowser();

	const graph = new WikiGraph();

	const scraper = new WikiScraper(startingUrl, graph, browser);

	try {
		graph.readFromFile('./out/source.json');
	} catch (error) {
		console.error(error);
		await scraper.scrapData(maxNodes);
	}

	await browser.close();

	const sugg = scraper.getSuggestions();

	sugg.forEach(item => console.log(item));

	graph.writeToFile('./out/source.json');
}

start(StartOptions)
	.catch(err => console.log(err))
	.finally(() => {
		console.log('Done!');

		process.exit(0);
	});
