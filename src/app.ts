import puppeteer from 'puppeteer';
import { WikiGraph } from './class/WikiGraph';
import { WikiScraper } from './class/WikiScraper';

async function startBrowser() {
	console.log('Opening the browser...');

	const browser = await puppeteer.launch({
		headless: false,
		args: ['--disable-setuid-sandbox'],
		ignoreHTTPSErrors: true
	});

	return browser;
}

async function start() {
	const browser = await startBrowser();

	if (browser) {
		const graph = new WikiGraph();

		const startingUrl = 'https://pt.wikipedia.org/wiki/Wikip%C3%A9dia';

		const scraper = new WikiScraper(startingUrl, graph, browser);

		await scraper.scrapData(20);

		scraper.writeGraphToFile('graph.json');

		await browser.close();
	}
}

start()
	.catch(err => console.log(err))
	.finally(() => {
		console.log('Done!');

		process.exit(0);
	});
