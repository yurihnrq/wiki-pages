import puppeteer from 'puppeteer';
import { UrlUtils } from './UrlUtils';
import { WikiGraph } from './WikiGraph';

export class WikiScraper {
	#startingUrl = '';
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
		this.#startingUrl = startingUrl;
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

				// console.log(urlsInPage);
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

		const pageUrls = await page.$$eval(selector, anchors =>
			anchors.map(anchor => anchor.getAttribute('href'))
		);

		const urls = pageUrls.filter(url => url !== null) as string[];

		console.log(`Found ${urls.length} urls in page`);

		const validUrls = urls.filter(url => UrlUtils.isWikiAndDateless(url));

		return validUrls.map(url => UrlUtils.getFullUrl(this.#baseUrl, url));
	}

	public getSuggestions() {
		const graph = this.#graph;
		const startingUrl = this.#startingUrl;
		const suggestionList: [string, number, number][] = [];

		// getting nodes without starting url
		const nodes = graph.getNodes();
		nodes.splice(nodes.indexOf(startingUrl), 1);

		for (const node of nodes) {
			const [count, disjointPathSize] = graph.findDisjointPaths(
				startingUrl,
				node
			);

			suggestionList.push([node, count, disjointPathSize]);

			console.log(
				`Found ${count} disjoint paths from ${startingUrl} to ${node}`
			);
		}

		suggestionList.sort(([, pathQnt1, pathSize1], [, pathQnt2, pathSize2]) => {
			if (pathQnt1 === pathQnt2) return pathSize1 - pathSize2;

			return pathQnt1 - pathQnt2;
		});

		return suggestionList;
	}
}
