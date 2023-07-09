import { Editor, Plugin, addIcon } from "obsidian";
import { LinkingModal } from "./commands/linkArticles";
import { DEFAULT_SETTINGS, WikipediaSearchSettings, WikipediaSearchSettingTab } from "./settings";
import { OpenArticleModal, WIKIPEDIA_VIEW, WikipediaView } from "./commands/openArticles";
import { wikipediaIcon } from "./utils/wikipediaIcon";

export default class WikipediaSearch extends Plugin {
	settings: WikipediaSearchSettings;

	async onload() {
		console.log("loading wikipedia-search plugin");

		await this.loadSettings();

		this.registerView(WIKIPEDIA_VIEW, (leaf) => new WikipediaView(leaf));

		this.registerDomEvent(activeWindow, "click", (event) => {
			const target = event.target;

			if (target instanceof HTMLAnchorElement) {
				const url = target.href;

				if (!url.match(/https?\:\/\/([\w]+).wikipedia.org\/wiki\//g)) {
					return;
				}

				event.preventDefault();

				const leaf = this.app.workspace.getLeaf(this.settings.openArticleInFullscreen ? "tab" : "split");
				leaf.setViewState({
					type: WIKIPEDIA_VIEW,
					active: true,
					state: { input: { title: decodeURIComponent(url.split("/").pop()!), url: url } },
				});
			}
		});

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

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
