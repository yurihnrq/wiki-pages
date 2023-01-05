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

			let urlsInPage: string[] = [];
			try {
				urlsInPage = await this.getPageUrls(page);

				console.log(urlsInPage);
			} catch (error) {
				console.log(error);
				continue;
			}

			this.#graph.addNode(currentUrl);

			urlsInPage.forEach(urlInPage => {
				if (!this.#graph.hasNode(urlInPage)) {
					this.#urlsToVisit.push(urlInPage);
				}

				this.#graph.addEdge(currentUrl, urlInPage);
			});

			this.#visitedCount++;
		}
	}

	writeGraphToFile(path: string) {
		this.#graph.writeToFile(path);
	}

	private async getPageUrls(page: puppeteer.Page) {
		const selector =
			'div#mw-content-text div.mw-parser-output > p:first-of-type > a';

		await page.waitForSelector(selector, {
			timeout: 5000
		});

		const urls = await page.$$eval(selector, anchors =>
			anchors.map(anchor => anchor.getAttribute('href'))
		);

		console.log(`Found ${urls.length} urls in page`);

		const validUrls = urls.filter(url => {
			if (
				url?.startsWith('/wiki') &&
				isNaN(Number(url?.split('/')[2].split('_')[0]))
			) {
				return true;
			}

			return false;
		});

		return validUrls.map(url => this.#baseUrl + url);
	}

	private async getTitle(page: puppeteer.Page) {
		const selector = '#firstHeading > *';

		await page.waitForSelector(selector);

		return await page.$eval(selector, el => el.innerHTML);
	}
}
