export class UrlUtils {
	static isWikiAndDateless(url: string): boolean {
		if (url?.startsWith('/wiki') && this.hasDateOnUrlRoute(url)) {
			return true;
		}

		return false;
	}

	private static hasDateOnUrlRoute(url: string): boolean {
		return isNaN(Number(this.getFirstUrlRouteSplittedBy(url, '_')));
	}

	private static getFirstUrlRouteSplittedBy(url: string, byToken: string) {
		return this.getFirstUrlRoute(url).split(byToken);
	}

	private static getFirstUrlRoute(url: string) {
		return url?.split('/')[2];
	}

	static getFullUrl(base: string, route: string) {
		return base + route;
	}
}
