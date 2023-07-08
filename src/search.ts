import { App, Editor, SuggestModal } from "obsidian";
import WikipediaSearch from "./main";
import { languages } from "./utils/languages";
import { getArticleDescription, getArticleIntro, getArticles } from "./utils/wikipediaAPI";
import { Template, WikipediaSearchSettings } from "./settings";

interface Article {
	title: string;
	url: string;
	languageCode: string;
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
		const descriptions = await getArticleDescription(
			searchResponses?.map((a) => a.title) ?? [],
			languageCode
		);

		if (!searchResponses || !descriptions) {
			this.emptyStateText = "An error occurred... Go check the logs and open a bug report!";
			return [];
		}

		if (this.plugin.settings.autoInsertSingleResponseQueries && searchResponses.length === 1) {
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

	async onChooseSuggestion(article: Article) {
		if (this.plugin.settings.additionalTemplatesEnabled) {
			new TemplateModal(app, this.plugin, this.editor, article).open();
		} else {
			insert(this.editor, this.plugin.settings, article, this.plugin.settings.defaultTemplate);
		}
	}
}

class TemplateModal extends SuggestModal<Template> {
	plugin: WikipediaSearch;
	editor: Editor;
	article: Article;

	constructor(app: App, plugin: WikipediaSearch, editor: Editor, article: Article) {
		super(app);
		this.plugin = plugin;
		this.editor = editor;
		this.article = article;
		this.setPlaceholder("Pick a template...");
	}

	renderSuggestion(template: Template, el: HTMLElement) {
		el.createEl("div", { text: template.name });
		el.createEl("small", {
			text: template.templateString,
		});
	}

	async getSuggestions(query: string): Promise<Template[]> {
		return [{ name: "Default", templateString: this.plugin.settings.defaultTemplate }]
			.concat(this.plugin.settings.additionalTemplates)
			.filter((template) => template.name.toLowerCase().includes(query.toLowerCase()));
	}

	async onChooseSuggestion(template: Template) {
		insert(this.editor, this.plugin.settings, this.article, template.templateString);
	}
}

async function insert(
	editor: Editor,
	settings: WikipediaSearchSettings,
	article: Article,
	templateString: string
) {
	const cursorPosition = editor.getCursor();
	let extract: string | null = templateString.includes("{extract}")
		? (await getArticleIntro([article.title], article.languageCode))?.[0] ?? null
		: null;

	const selection = editor.getSelection();
	const insert = templateString
		.replaceAll("{title}", settings.prioritizeArticleTitle || selection === "" ? article.title : selection)
		.replaceAll("{url}", article.url)
		.replaceAll("{language}", languages[article.languageCode])
		.replaceAll("{languageCode}", article.languageCode)
		.replaceAll("{extract}", extract ?? "[Could not fetch the extract...]");
	editor.replaceSelection(insert);

	if (settings.placeCursorInfrontOfInsert) editor.setCursor(cursorPosition);
}
