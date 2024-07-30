import { Wiki } from "src/main";
import { Article } from "../utils/searchModal";
import { fetchData } from "../utils/toolsAPI";

export async function getWikiArticles(
	query: string,
	languageCode: string,
	wiki: Wiki,
	limit: number
): Promise<Article[] | null> {
	// https://en.wiktionary.org/w/api.php?format=json&action=opensearch&profile=fuzzy&redirects=resolve&search=Wikipedia
	const url =
		`https://${languageCode}.${wiki.toLowerCase()}.org/w/api.php?format=json` +
		"&action=opensearch" +
		"&profile=fuzzy" +
		"&redirects=resolve" +
		`&limit=${limit ?? 10}` +
		"&search=" +
		encodeURIComponent(query);
	const response = await fetchData(url);
	if (!response) return null;
	return response[1].map((title: string, index: number) => ({
		title,
		url: response[3][index],
		languageCode,
	}));
}
