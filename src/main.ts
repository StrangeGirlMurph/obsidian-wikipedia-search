import { Editor, Plugin } from "obsidian";
import { LinkingModal } from "./commands/linkArticles";
import { DEFAULT_SETTINGS, WikipediaSearchSettings, WikipediaSearchSettingTab } from "./settings";
import { OpenArticleModal } from "./commands/openArticles";

export default class WikipediaSearch extends Plugin {
	settings: WikipediaSearchSettings;

	async onload() {
		console.log("loading wikipedia-search plugin");

		await this.loadSettings();

		this.addCommand({
			id: "link-article",
			name: "Link Article",
			editorCallback: (editor: Editor) => {
				new LinkingModal(this.app, this.settings, editor).open();
			},
		});

		this.addCommand({
			id: "open-article",
			name: "Open Article",
			callback: () => {
				new OpenArticleModal(this.app, this.settings).open();
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
