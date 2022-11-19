import puppeteer from 'puppeteer';
import { WikiGraph } from './class/WikiGraph';
import { WikiScraper } from './class/Scraper';

async function startBrowser() {
	let browser: puppeteer.Browser | undefined;
	try {
		console.log('Opening the browser......');
		browser = await puppeteer.launch({
			headless: false,
			args: ['--disable-setuid-sandbox'],
			ignoreHTTPSErrors: true
		});
	} catch (err) {
		console.log('Could not create a browser instance => : ', err);
	}

	return browser;
}

async function start() {
	const browser = await startBrowser();

	if (browser) {
		const graph = new WikiGraph();

		const initialUrl = 'https://pt.wikipedia.org/wiki/Wikip%C3%A9dia';

		const scraper = new WikiScraper(initialUrl, graph, browser);

		await scraper.scrapData();

		await browser.close();
	}
}

start();
