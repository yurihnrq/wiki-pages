import puppeteer from 'puppeteer';
import { ArgumentParser } from './class/ArgumentParser';
import { WikiGraph } from './class/WikiGraph';
import { WikiScraper } from './class/WikiScraper';

async function startBrowser() {
	console.log('Opening the browser...');

	const args = new ArgumentParser(process.argv);

	const browser = await puppeteer.launch({
		headless: args.hasArgument('-h'),
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

		await scraper.scrapData(100);

		await browser.close();

		const nodes = graph.getNodes();
		const recList: [string, number, number][] = [];

		for (let i = 0; i < nodes.length; i++) {
			if (nodes[i] !== startingUrl) {
				const [count, disjointPathSize] = graph.findDisjointPaths(
					startingUrl,
					nodes[i]
				);

				recList.push([nodes[i], count, disjointPathSize]);

				console.log(
					`Found ${count} disjoint paths from ${startingUrl} to ${nodes[i]}`
				);
			}
		}

		recList.sort(([, pathQnt1, pathSize1], [, pathQnt2, pathSize2]) => {
			if (pathQnt1 === pathQnt2) return pathSize1 - pathSize2;

			return pathQnt1 - pathQnt2;
		});

		recList.forEach(item => {
			console.log(item);
		});
	}
}

start()
	.catch(err => console.log(err))
	.finally(() => {
		console.log('Done!');

		process.exit(0);
	});
