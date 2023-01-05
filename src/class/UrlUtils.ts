export class UrlUtils {
	static isWikiAndDateless(url: string): boolean {
		if (
			url?.startsWith('/wiki') &&
			isNaN(Number(url?.split('/')[2].split('_')[0]))
		) {
			return true;
		}

		return false;
	}

	static getFullUrl(base: string, route: string) {
		return base + route;
	}
}
