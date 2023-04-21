import { Editor, Plugin } from "obsidian";
import { SearchModal } from "./search";
import { DEFAULT_SETTINGS, WikipediaSearchSettings, WikipediaSearchSettingTab } from "./settings";

export default class WikipediaSearch extends Plugin {
	settings: WikipediaSearchSettings;

	async onload() {
		console.log("loading wikipedia-search plugin");

		await this.loadSettings();

		this.addCommand({
			id: "search-article",
			name: "Search Article",
			editorCheckCallback: (checking: boolean, editor: Editor) => {
				if (!checking) new SearchModal(this.app, this, editor).open();
				return true;
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
