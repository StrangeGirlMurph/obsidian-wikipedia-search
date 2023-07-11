import { Editor, Notice, Plugin, addIcon, requestUrl } from "obsidian";
import { LinkingModal } from "./commands/linkArticles";
import { DEFAULT_SETTINGS, WikipediaSearchSettings, WikipediaSearchSettingTab } from "./settings";
import { OpenArticleModal, WIKIPEDIA_VIEW, WikipediaView, openArticleView } from "./commands/openArticles";
import { wikipediaIcon } from "./utils/wikipediaIcon";

const originalOpen = window.open;

export default class WikipediaSearch extends Plugin {
	settings: WikipediaSearchSettings;

	async onload() {
		console.log("loading wikipedia-search plugin");

		window.open = (URL?: string | URL | undefined): Window | null => {
			if (this.settings.openArticleLinksInBrowser) return originalOpen(URL);
			if (!URL) return null;

			const url = URL.toString() || "";

			// Check if the url is a wikipedia url
			if (!url.match(/https?\:\/\/([\w]+).wikipedia.org\/wiki\//g)) {
				originalOpen(URL);
				return null;
			}

			// Check if the article exists
			requestUrl({ url: url, method: "HEAD" })
				.catch((e) => e)
				.then((res) => {
					if (res.status != 200) {
						new Notice("Article doesn't exist...");
					} else {
						openArticleView(this.app.workspace, this.settings, {
							title: decodeURIComponent(url.split("/").pop()!.replaceAll("_", " ")),
							url: url,
						});
					}
				});

			return null;
		};

		await this.loadSettings();

		this.registerView(WIKIPEDIA_VIEW, (leaf) => new WikipediaView(leaf));

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

		addIcon("wikipedia", wikipediaIcon);
		this.addRibbonIcon("wikipedia", "Open Article", () =>
			new OpenArticleModal(this.app, this.settings).open()
		);

		this.addSettingTab(new WikipediaSearchSettingTab(this.app, this));
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
