import { Workspace, Modal, Platform, App } from "obsidian";
import WikipediaSearchPlugin, { Wiki } from "src/main";
import { WikipediaSearchSettings } from "src/settings";
import { Article } from "src/utils/searchModal";
import { SearchModal } from "src/utils/searchModal";

export class OpenArticleModal extends SearchModal {
	workspace: Workspace;
	plugin: WikipediaSearchPlugin;

	constructor(app: App, settings: WikipediaSearchSettings, wiki: Wiki, plugin: WikipediaSearchPlugin) {
		super(app, settings, wiki);
		this.workspace = app.workspace;
		this.plugin = plugin;
	}

	async onChooseSuggestion(article: Article) {
		if (
			// @ts-expect-error undocumented
			this.app.plugins.enabledPlugins.has("surfing") &&
			!this.settings.openArticlesInBrowser &&
			Platform.isDesktopApp
		) {
			this.app.workspace.getLeaf(this.settings.openArticleInFullscreen ? "tab" : "split").setViewState({
				type: "surfing-view",
				active: true,
				state: { url: article.url },
			});
		} else if (
			!this.settings.showedSurfingMessage &&
			Platform.isDesktopApp &&
			!this.settings.openArticlesInBrowser
		) {
			const modal = new Modal(this.app);
			modal.onClose = () => this.onChooseSuggestion(article);
			modal.titleEl.setText("Wikipedia Search plugin ♥ Surfing plugin");
			modal.contentEl.innerHTML = `The Wikipedia Search plugin integrates with the amazing Surfing plugin to enable you to open Wikipedia articles directly inside of Obsidian! You just need to install and enable it. It has tons of awesome features and does the heavy lifting of loading the website itself in Obsidian. In this case the Wikipedia Search plugin just provides the search functionality. Using the Surfing plugin is completely optional but I highly recommend you check it out! Note: This will only be shown to you once but you can always find the information later in the README on GitHub as well. ~ Murphy :)<br><br>
			<b>tl;dr: Install and enable the amazing <a href="obsidian://show-plugin?id=surfing">Surfing plugin</a> to open Wikipedia articles directly inside of Obsidian!</b>`;
			modal.open();

			this.settings.showedSurfingMessage = true;
			this.plugin.saveSettings();
		} else {
			window.open(article.url, "_blank");
		}
	}
}
