import { App, Editor, SuggestModal } from "obsidian";
import { languages } from "../utils/languages";
import { getArticleDescriptions, getArticles } from "../utils/wikipediaAPI";
import { WikipediaSearchSettings } from "../settings";

export interface Article {
	title: string;
	url: string;
	languageCode: string;
	description: string | null;
}

export abstract class SearchModal extends SuggestModal<Article> {
	settings: WikipediaSearchSettings;
	editor: Editor | undefined;

	constructor(app: App, settings: WikipediaSearchSettings, editor?: Editor) {
		super(app);
		this.settings = settings;
		this.editor = editor;
		this.setPlaceholder("Search Wikipedia...");
	}

	onOpen(): void {
		if (this.editor) {
			this.inputEl.value = this.editor.getSelection();
		}
		//@ts-ignore - private method
		super.updateSuggestions();
	}

	renderSuggestion(article: Article, el: HTMLElement) {
		el.createEl("div", { text: article.title });
		el.createEl("small", {
			text: article.description || article.url.slice(8),
		});
	}

	async getSuggestions(query: string): Promise<Article[]> {
		if (!window.navigator.onLine) {
			this.emptyStateText = "You have to be connected to the internet to search!";
			return [];
		}

		let languageCode = this.settings.language;

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
			this.emptyStateText = "An error occurred... Go check the logs and create a bug report!";
			return [];
		}

		if (this.settings.autoInsertSingleResponseQueries && searchResponses.length === 1) {
			this.close();
			this.onChooseSuggestion({
				title: searchResponses[0].title,
				url: searchResponses[0].url,
				description: descriptions[0],
				languageCode,
			});
		}

		return searchResponses.map((article, index) => ({
			title: article.title,
			url: article.url,
			description: descriptions[index],
			languageCode,
		}));
	}

	abstract onChooseSuggestion(article: Article): void;
}
