import { requestUrl } from "obsidian";

export async function getArticles(
	query: string,
	languageCode: string,
	limit: number
): Promise<{ title: string; url: string }[] | null> {
	// https://en.wikipedia.org/w/api.php?format=json&action=opensearch&profile=fuzzy&redirects=resolve&search=Wikipedia
	const url =
		getAPIBaseURL(languageCode) +
		"&action=opensearch" +
		"&profile=fuzzy" +
		"&redirects=resolve" +
		`&limit=${limit ?? 10}` +
		"&search=" +
		encodeURIComponent(query);
	const response = await fetchData(url);
	return response[1].map((title: string, index: number) => ({ title, url: response[3][index] }));
}

export async function getArticleDescriptions(
	titles: string[],
	languageCode: string
): Promise<(string | null)[] | null> {
	// https://en.wikipedia.org/w/api.php?format=json&redirects=1&action=query&prop=pageprops&ppprop=wikibase-shortdesc&titles=Wikipedia
	const url =
		getAPIBaseURL(languageCode) +
		"&action=query" +
		"&prop=description" +
		"&titles=" +
		titlesToURLParameter(titles);

	const response = await fetchData(url);
	if (!response.query) return [];

	return sortResponsesByTitle(titles, Object.values(response.query.pages)).map(
		(page: any) => page.description || null
	);
}

export async function getArticleIntros(
	titles: string[],
	languageCode: string,
	cleanup: boolean
): Promise<(string | null)[] | null> {
	// https://en.wikipedia.org/w/api.php?format=json&redirects=1&action=query&prop=extracts&exintro&explaintext&titles=Wikipedia
	const url =
		getAPIBaseURL(languageCode) +
		"&action=query" +
		"&prop=extracts" +
		"&exintro" +
		"&explaintext" +
		"&titles=" +
		titlesToURLParameter(titles);

	const response = await fetchData(url);
	if (!response.query) return [];

	return sortResponsesByTitle(titles, Object.values(response.query.pages)).map((page: any) => {
		const extract: string = page.extract.trim() ?? null;
		if (extract && cleanup) {
			// auto-cleanup of intros
			return (
				extract
					// turns all "{\displaystyle ... }" occurrences into a proper LaTeX equation.
					.replaceAll(/{\\displaystyle [^\n]+}/g, (text: string) => "$" + text.slice(15, -1).trim() + "$")
					// removes the unicode characters that try to replace the LaTeX and all the unnecessary linebreakes
					.replaceAll("$\n  \n", "$")
					.replaceAll(/\n  \n    \n      \n[^\$]*      \n    \n    \$/g, "$")
					// take care of some other quirks that can occur
					.replaceAll("  ", " ")
					// escape some markdown syntax
					.replaceAll("`", "\\`")
			);
		}
		return extract;
	});
}

export async function getArticleThumbnails(
	titles: string[],
	languageCode: string
): Promise<(string | null)[] | null> {
	//https://en.wikipedia.org/w/api.php?format=json&redirects=1&action=query&prop=pageimages&piprop=original|name&pilicense=any&titles=Wikipedia
	const url =
		getAPIBaseURL(languageCode) +
		"&action=query" +
		"&prop=pageimages" +
		"&piprop=original|name" +
		"&pilicense=any" +
		"&titles=" +
		titlesToURLParameter(titles);

	const response = await fetchData(url);
	if (!response.query) return null;

	return sortResponsesByTitle(titles, Object.values(response.query.pages)).map(
		(page: any) => page.original?.source ?? null
	);
}

function getAPIBaseURL(languageCode: string) {
	return `https://${languageCode}.wikipedia.org/w/api.php?format=json`;
}

function sortResponsesByTitle(titles: string[], responses: unknown[]) {
	return responses.sort((a: any, b: any) => titles.indexOf(a.title) - titles.indexOf(b.title));
}

function titlesToURLParameter(titles: string[]) {
	return titles.map((title) => encodeURIComponent(title)).join("|");
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
