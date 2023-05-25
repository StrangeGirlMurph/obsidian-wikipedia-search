import { requestUrl } from "obsidian";

export async function getArticles(
	query: string,
	languageCode: string
): Promise<{ title: string; url: string }[] | null> {
	// https://en.wikipedia.org/w/api.php?format=json&action=opensearch&profile=fuzzy&search=Wikipedia
	const response = (
		await requestUrl(getAPIBaseURL(languageCode) + `&action=opensearch&profile=fuzzy&search=${query}`).catch(
			(e) => {
				console.error(e);
				return null;
			}
		)
	)?.json;

	if (!response) return null;
	return response[1].map((title: string, index: number) => ({ title, url: response[3][index] }));
}

export async function getArticleDescriptions(
	titles: string[],
	languageCode: string
): Promise<(string | null)[] | null> {
	// https://en.wikipedia.org/w/api.php?format=json&&action=query&prop=description&titles=Wikipedia
	const response = (
		await requestUrl(
			getAPIBaseURL(languageCode) +
				`&action=query&prop=description&titles=${encodeURIComponent(titles.join("|"))}`
		).catch((e) => {
			console.error(e);
			return null;
		})
	)?.json;

	if (!response) return null;
	if (!response.query) return [];
	return Object.values(response.query.pages)
		.sort((a: any, b: any) => titles.indexOf(a.title) - titles.indexOf(b.title))
		.map((page: any) => page.description ?? null);
}

export async function getArticleExtracts(
	titles: string[],
	languageCode: string
): Promise<(string | null)[] | null> {
	// https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=Wikipedia
	const response = (
		await requestUrl(
			getAPIBaseURL(languageCode) +
				`&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(
					titles.join("|")
				)}`
		).catch((e) => {
			console.error(e);
			return null;
		})
	)?.json;

	if (!response) return null;
	if (!response.query) return [];
	return Object.values(response.query.pages)
		.sort((a: any, b: any) => titles.indexOf(a.title) - titles.indexOf(b.title))
		.map((page: any) => page.extract ?? null);
}

export function getAPIBaseURL(languageCode: string) {
	return `https://${languageCode}.wikipedia.org/w/api.php?format=json`;
}
