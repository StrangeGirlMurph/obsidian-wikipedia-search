import { Editor, Plugin, addIcon } from "obsidian";
import { LinkingModal } from "./commands/linkArticles";
import { DEFAULT_SETTINGS, WikipediaSearchSettings, WikipediaSearchSettingTab } from "./settings";
import { OpenArticleModal } from "./commands/openArticles";
import { wikipediaIcon } from "./utils/wikipediaIcon";

const originalOpen = window.open;

export default class WikipediaSearchPlugin extends Plugin {
	settings: WikipediaSearchSettings;

	async onload() {
		console.log("loading wikipedia-search plugin");

		await this.loadSettings();

		this.addCommand({
			id: "link-article",
			name: "Link Article",
			editorCallback: (editor: Editor) => {
				new LinkingModal(app, this.settings, editor).open();
			},
		});

		this.addCommand({
			id: "open-article",
			name: "Open Article",
			callback: () => new OpenArticleModal(this, this.settings).open(),
		});

		addIcon("wikipedia", wikipediaIcon);
		this.addRibbonIcon("wikipedia", "Open Article", () => new OpenArticleModal(this, this.settings).open());

		this.addSettingTab(new WikipediaSearchSettingTab(app, this));
	}

	onunload() {
		window.open = originalOpen;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
