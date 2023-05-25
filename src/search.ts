import { App, Editor, SuggestModal } from "obsidian";
import WikipediaSearch from "./main";
import { languages } from "./languages";
import { getArticleDescriptions, getArticleExtracts, getArticles } from "./wikipediaAPI";

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

		const searchResponses = await getArticles(query, languageCode);
		const descriptions = await getArticleDescriptions(
			searchResponses?.map((a) => a.title) ?? [],
			languageCode
		);

		if (!searchResponses || !descriptions) {
			this.emptyStateText = "An error occurred... Go check the logs and open a bug report!";
			return [];
		}

		if (this.plugin.settings.autoInsert && searchResponses.length === 1) {
			this.close();
			this.onChooseSuggestion({
				title: searchResponses[0].title,
				url: searchResponses[0].url,
				description: descriptions[0],
			});
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
		const cursorPosition = this.editor.getCursor();
		let extract: string | null = this.plugin.settings.format.includes("{extract}")
			? (await getArticleExtracts([article.title], this.plugin.settings.language))?.[0] ?? null
			: null;

		const insert = this.plugin.settings.format
			.replaceAll("{title}", this.editor.getSelection() || article.title)
			.replaceAll("{url}", article.url)
			.replaceAll("{extract}", extract ?? "[Could not fetch the extract...]");
		this.editor.replaceSelection(insert);

		if (this.plugin.settings.cursorAfter) this.editor.setCursor(cursorPosition);
	}
}
