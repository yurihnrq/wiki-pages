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

		await scraper.scrapData(50);

		await browser.close();

		const nodes = graph.getNodes();
		for (let i = 0; i < nodes.length; i++) {
			if (nodes[i] !== startingUrl) {
				const count = graph.findDisjointPaths(startingUrl, nodes[i]);

				console.log(
					`Found ${count} disjoint paths from ${startingUrl} to ${nodes[i]}`
				);
			}
		}
	}
}

start()
	.catch(err => console.log(err))
	.finally(() => {
		console.log('Done!');

		process.exit(0);
	});
