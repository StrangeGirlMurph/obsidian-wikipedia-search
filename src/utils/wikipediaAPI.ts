import { requestUrl } from "obsidian";

export async function getArticles(
	query: string,
	languageCode: string
): Promise<{ title: string; url: string }[] | null> {
	// https://en.wikipedia.org/w/api.php?format=json&action=opensearch&profile=fuzzy&search=Wikipedia
	const url = encodeURI(
		getAPIBaseURL(languageCode) + "&action=opensearch" + "&profile=fuzzy" + "&search=" + query
	);

	const response = await fetchData(url);
	return response[1].map((title: string, index: number) => ({ title, url: response[3][index] }));
}

export async function getArticleDescriptions(
	titles: string[],
	languageCode: string
): Promise<(string | null)[] | null> {
	// https://en.wikipedia.org/w/api.php?format=json&action=query&prop=pageprops&ppprop=wikibase-shortdesc&titles=Wikipedia
	const url = encodeURI(
		getAPIBaseURL(languageCode) + "&action=query" + "&prop=description" + "&titles=" + titles.join("|")
	);

	const response = await fetchData(url);
	if (!response.query) return [];

	return Object.values(response.query.pages)
		.sort((a: any, b: any) => titles.indexOf(a.title) - titles.indexOf(b.title))
		.map((page: any) => page.description || null);
}

export async function getArticleIntros(
	titles: string[],
	languageCode: string
): Promise<(string | null)[] | null> {
	// https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=Wikipedia
	const url = encodeURI(
		getAPIBaseURL(languageCode) +
			"&action=query" +
			"&prop=extracts" +
			"&exintro" +
			"&explaintext" +
			"&titles=" +
			titles.join("|")
	);

	const response = await fetchData(url);
	if (!response.query) return [];

	return Object.values(response.query.pages)
		.sort((a: any, b: any) => titles.indexOf(a.title) - titles.indexOf(b.title))
		.map((page: any) => page.extract ?? null);
}

export async function getArticleThumbnails(
	titles: string[],
	languageCode: string
): Promise<(string | null)[] | null> {
	//https://en.wikipedia.org/w/api.php?format=json&action=query&prop=pageimages&piprop=original|name&pilicense=any&titles=Wikipedia
	const url = encodeURI(
		getAPIBaseURL(languageCode) +
			"&action=query" +
			"&prop=pageimages" +
			"&piprop=original|name" +
			"&pilicense=any" +
			"&titles=" +
			titles.join("|")
	);

	const response = await fetchData(url);
	if (!response.query) return null;

	return Object.values(response.query.pages)
		.sort((a: any, b: any) => titles.indexOf(a.title) - titles.indexOf(b.title))
		.map((page: any) => page.original?.source ?? null);
}

function getAPIBaseURL(languageCode: string) {
	return `https://${languageCode}.wikipedia.org/w/api.php?format=json`;
}

async function fetchData(url: string) {
	const response = (
		await requestUrl(url).catch((e) => {
			console.error(e);
			return null;
		})
	)?.json;

	if (!response) return null;
	return response;
}
