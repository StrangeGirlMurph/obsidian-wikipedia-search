import { timeStamp } from 'console';
import { App, Editor, MarkdownView, SuggestModal, Plugin, requestUrl } from 'obsidian';
import { DEFAULT_SETTINGS, WikipediaSearchSettings, WikipediaSearchSettingTab } from './settings';

export default class WikipediaSearch extends Plugin {
	settings: WikipediaSearchSettings;

	async onload() {
		console.log('loading wikipedia-search plugin');

		await this.loadSettings();

		this.addCommand({
			id: 'search-article',
			name: 'Search Article',
			editorCheckCallback: (checking: boolean, editor: Editor) => {
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) new SearchModal(this.app, this, editor).open();
					return true;
				}
			},
		});

		this.addSettingTab(new WikipediaSearchSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

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
	}

	async getSuggestions(query: string): Promise<Article[]> {
		if (query === "") return [];

		const baseURL = `https://${this.plugin.settings.language}.wikipedia.org/w/api.php?format=json`;

		// https://en.wikipedia.org/w/api.php?format=json&action=opensearch&profile=fuzzy&search=Wikipedia	
		const searchResponse = (await requestUrl(baseURL + `&action=opensearch&profile=fuzzy&search=${query}`).catch((e) => null))?.json;
		if (searchResponse[1].length === 0) return [];

		// https://en.wikipedia.org/w/api.php?format=json&&action=query&prop=description&titles=Wikipedia
		const descriptionResponse = (await requestUrl(baseURL + `&action=query&prop=description&titles=${searchResponse[1].join("|")}`).catch(e => null))?.json;
		const descriptions = Object.values(descriptionResponse.query.pages).map((page: any) => ({title: page.title, description: page.description ?? null}));

		if (!searchResponse || !descriptions) return [{title: "An error occurred. You should check your internet connection!", url: "", description: ""}]

		return searchResponse[1].map((title: string, index: number) => ({ title, url: searchResponse[3][index], description: descriptions.find((val) => val.title === title)?.description }));
	}

	renderSuggestion(article: Article, el: HTMLElement) {
		el.createEl("div", { text: article.title });
		el.createEl("small", { text: article.description ?? article.url.slice(8) });
	}

	onChooseSuggestion(article: Article) {
		const link = this.plugin.settings.format.replace("{title}", article.title).replace("{url}", article.url);
		this.editor.replaceRange(link, this.editor.getCursor());
	}
}
