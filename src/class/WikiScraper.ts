import puppeteer from 'puppeteer';
import { WikiGraph } from './WikiGraph';

export class WikiScraper {
	#urlsToVisit: string[] = [];
	#graph: WikiGraph;
	#browser: puppeteer.Browser;
	#baseUrl = 'https://pt.wikipedia.org';
	#visitedCount = 0;

	constructor(
		startingUrl: string,
		graph: WikiGraph,
		browser: puppeteer.Browser
	) {
		this.#browser = browser;
		this.#graph = graph;
		this.#urlsToVisit.push(startingUrl);
	}

	async scrapData(qntNodes: number) {
		this.#visitedCount = 0;
		const [page] = await this.#browser.pages();

		while (this.#visitedCount < qntNodes) {
			const currentUrl = this.#urlsToVisit.shift();
			if (!currentUrl) break;

			console.log(`Visiting`, currentUrl);

			await page.goto(currentUrl);

			const title = await this.getTitle(page);
			const urlsInPage = await this.getPageUrls(page);

			this.#graph.addNode(currentUrl, { title });

			urlsInPage.forEach(urlInPage => {
				if (!this.#graph.hasNode(urlInPage)) {
					this.#urlsToVisit.push(urlInPage);
				}

				this.#graph.addEdge(currentUrl, urlInPage);
			});

			this.#visitedCount++;
		}
	}

	private async getTitle(page: puppeteer.Page) {
		const selector = '#firstHeading > *';

		await page.waitForSelector(selector);

		return await page.$eval(selector, el => el.innerHTML);
	}

	private async getPageUrls(page: puppeteer.Page) {
		const selector =
			'div#mw-content-text div.mw-parser-output > p:first-of-type > a';

		await page.waitForSelector(selector);

		const urls = await page.$$eval(selector, anchors =>
			anchors.map(anchor => anchor.getAttribute('href'))
		);

		console.log(`Found ${urls.length} urls in page`);

		return urls.map(url => this.#baseUrl + url);
	}
}
