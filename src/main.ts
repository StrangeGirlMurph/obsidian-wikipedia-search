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
		const response = await requestUrl(`https://${this.plugin.settings.language}.wikipedia.org/w/api.php?action=opensearch&search=${query}&profile=fuzzy`);

		return response["json"][1].map((title: string, index: number) => ({ title, url: response["json"][3][index] }));
	}

	renderSuggestion(article: Article, el: HTMLElement) {
		el.createEl("div", { text: article.title });
		el.createEl("small", { text: article.url.slice(8) });
	}

	onChooseSuggestion(article: Article) {
		const link = this.plugin.settings.format.replace("{title}", article.title).replace("{url}", article.url);
		this.editor.replaceRange(link, this.editor.getCursor());
	}
}
