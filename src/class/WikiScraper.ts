import puppeteer from 'puppeteer';
import { WikiGraph } from './WikiGraph';
import fs from 'fs';

export class WikiScraper {
	#url: string;
	#graph: WikiGraph;
	#browser: puppeteer.Browser;
	#baseUrl = 'https://pt.wikipedia.org';

	constructor(url: string, graph: WikiGraph, browser: puppeteer.Browser) {
		this.#browser = browser;
		this.#graph = graph;
		this.#url = url;
	}

	async scrapData() {
		const qntNodes = 20;
		const [page] = await this.#browser.pages();

		for (let i = 0; i < qntNodes; i++) {
			await page.goto(this.#url);

			await page.waitForSelector('div#mw-content-text div.mw-parser-output');

			const pageTitle = await this.getTitle(page);

			this.#graph.addNode(this.#url, { title: pageTitle });
			console.log({
				title: pageTitle,
				url: this.#url
			});

			const urls = await this.getPageUrls(page);

			const validUrls = urls.filter(url => {
				const isUrlVisited = this.#graph.hasNode(url);

				if (isUrlVisited) {
					this.#graph.addEdge(this.#url, url);
					return false;
				}

				return true;
			});

			const nextUrl = validUrls[0];

			if (validUrls.length > 0) {
				this.#graph.addEdge(this.#url, nextUrl);
				this.#url = nextUrl;
			} else {
				break;
			}
		}

		console.log('Writing data...');

		fs.mkdirSync('data', { recursive: true });

		fs.writeFileSync(
			'./data/graph.json',
			JSON.stringify(this.#graph.serialize(), null, 2)
		);
	}

	private async getTitle(page: puppeteer.Page) {
		return await page.$eval('.mw-page-title-main', span => span.innerHTML);
	}

	private async getPageUrls(page: puppeteer.Page) {
		const urls = await page.$$eval(
			'div#mw-content-text div.mw-parser-output > p:first-of-type > a',
			anchors => anchors.map(anchor => anchor.getAttribute('href'))
		);

		return urls.map(url => this.#baseUrl + url);
	}
}
