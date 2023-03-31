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
		if (query.trim() === "") return [];

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
		if (query.trim() === "") return [];

		const baseURL = `https://${languageCode}.wikipedia.org/w/api.php?format=json`;

		// https://en.wikipedia.org/w/api.php?format=json&action=opensearch&profile=fuzzy&search=Wikipedia
		const searchResponse = (
			await requestUrl(baseURL + `&action=opensearch&profile=fuzzy&search=${query}`).catch((e) => null)
		)?.json;
		if (searchResponse[1].length === 0) return [];

		// https://en.wikipedia.org/w/api.php?format=json&&action=query&prop=description&titles=Wikipedia
		const descriptionResponse = (
			await requestUrl(
				baseURL + `&action=query&prop=description&titles=${searchResponse[1].join("|")}`
			).catch((e) => null)
		)?.json;
		const descriptions = Object.values(descriptionResponse.query.pages).map((page: any) => ({
			title: page.title,
			description: page.description ?? null,
		}));

		if (!searchResponse || !descriptions)
			return [
				{
					title: "An error occurred. You should check your internet connection!",
					url: "",
					description: "",
				},
			];

		return searchResponse[1].map((title: string, index: number) => ({
			title,
			url: searchResponse[3][index],
			description: descriptions.find((val) => val.title === title)?.description,
		}));
	}

	renderSuggestion(article: Article, el: HTMLElement) {
		el.createEl("div", { text: article.title });
		el.createEl("small", {
			text: article.description || article.url.slice(8),
		});
	}

	onChooseSuggestion(article: Article) {
		const link = this.plugin.settings.format
			.replace("{title}", this.editor.getSelection() || article.title)
			.replace("{url}", article.url);
		this.editor.replaceSelection(link);
	}
}
