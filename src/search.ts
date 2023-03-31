import { App, Editor, requestUrl, SuggestModal } from "obsidian";
import { languages } from "./languages";
import WikipediaSearch from "./main";

interface Article {
	title: string;
	url: string;
	description: string | null;
}

export class SearchModal extends SuggestModal<Article> {
	plugin: WikipediaSearch;
	editor: Editor;

	constructor(app: App, plugin: WikipediaSearch, editor: Editor) {
		super(app);
		this.plugin = plugin;
		this.editor = editor;
		this.setPlaceholder("Search Wikipedia...");
	}

	onOpen(): void {
		this.inputEl.value = this.editor.getSelection();
		//@ts-ignore - private method
		super.updateSuggestions();
	}

	async getSuggestions(query: string): Promise<Article[]> {
		if (!window.navigator.onLine) {
			this.emptyStateText = "You have to be connected to the internet to search!";
			return [];
		}

		let languageCode = this.plugin.settings.language;

		const queryArgs = query.split(":", 2);
		if (queryArgs.length > 1) {
			const queryCode = queryArgs[0]?.trim();
			const queryText = queryArgs[1]?.trim();
			if (queryCode && Object.keys(languages).includes(queryCode) && queryCode !== languageCode) {
				languageCode = queryCode;
				query = queryText;
			}
		}

		if (query.trim() === "") {
			this.emptyStateText = "What are you waiting for? Start typing :)";
			return [];
		}
		this.emptyStateText = "No results found.";

		const searchResponses = await searchWikipediaArticles(query, languageCode);
		const descriptions = await getWikipediaArticleDescription(
			searchResponses?.map((a) => a.title) ?? [],
			languageCode
		);

		if (!searchResponses || !descriptions) {
			this.emptyStateText = "An error occurred... Go check the logs and open a bug report!";
			return [];
		}

		return searchResponses.map((article, index) => ({
			title: article.title,
			url: article.url,
			description: descriptions[index],
		}));
	}

	renderSuggestion(article: Article, el: HTMLElement) {
		el.createEl("div", { text: article.title });
		el.createEl("small", {
			text: article.description || article.url.slice(8),
		});
	}

	async onChooseSuggestion(article: Article) {
		let extract: string | null = null;
		if (this.plugin.settings.format.includes("{extract}")) {
			extract =
				(await getWikipediaArticleExtracts([article.title], this.plugin.settings.language))?.[0] ?? null;
		}

		const link = this.plugin.settings.format
			.replace("{title}", this.editor.getSelection() || article.title)
			.replace("{url}", article.url)
			.replace("{extract}", extract ?? "[Could not fetch the extract...]");
		this.editor.replaceSelection(link);
	}
}

async function searchWikipediaArticles(
	query: string,
	languageCode: string
): Promise<{ title: string; url: string }[] | null> {
	// https://en.wikipedia.org/w/api.php?format=json&action=opensearch&profile=fuzzy&search=Wikipedia
	const response = (
		await requestUrl(
			getWikipediaBaseURL(languageCode) + `&action=opensearch&profile=fuzzy&search=${query}`
		).catch((e) => {
			console.error(e);
			return null;
		})
	)?.json;

	if (!response) return null;
	return response[1].map((title: string, index: number) => ({ title, url: response[3][index] }));
}

async function getWikipediaArticleDescription(
	titles: string[],
	languageCode: string
): Promise<(string | null)[] | null> {
	// https://en.wikipedia.org/w/api.php?format=json&&action=query&prop=description&titles=Wikipedia
	const response = (
		await requestUrl(
			getWikipediaBaseURL(languageCode) + `&action=query&prop=description&titles=${titles.join("|")}`
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

async function getWikipediaArticleExtracts(
	titles: string[],
	languageCode: string
): Promise<(string | null)[] | null> {
	// https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=Wikipedia
	const response = (
		await requestUrl(
			getWikipediaBaseURL(languageCode) +
				`&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${titles.join("|")}`
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

function getWikipediaBaseURL(languageCode: string) {
	return `https://${languageCode}.wikipedia.org/w/api.php?format=json`;
}
