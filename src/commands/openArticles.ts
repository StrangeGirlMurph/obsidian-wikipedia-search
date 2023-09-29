import { Workspace, Modal, Platform } from "obsidian";
import WikipediaSearchPlugin from "src/main";
import { WikipediaSearchSettings } from "src/settings";
import { Article } from "src/utils/searchModal";
import { SearchModal } from "src/utils/searchModal";

export class OpenArticleModal extends SearchModal {
	workspace: Workspace;
	plugin: WikipediaSearchPlugin;

	constructor(plugin: WikipediaSearchPlugin, settings: WikipediaSearchSettings) {
		super(app, settings);
		this.workspace = app.workspace;
		this.plugin = plugin;
	}

	async onChooseSuggestion(article: Article) {
		if (
			// @ts-expect-error undocumented
			app.plugins.enabledPlugins.has("surfing") &&
			!this.settings.openArticlesInBrowser &&
			Platform.isDesktopApp
		) {
			app.workspace.getLeaf(this.settings.openArticleInFullscreen ? "tab" : "split").setViewState({
				type: "surfing-view",
				active: true,
				state: { url: article.url },
			});
		} else {
			if (this.settings.showedSurfingMessage || !Platform.isDesktopApp) {
				window.open(article.url, "_blank");
			} else {
				new SurfingInfoModal(article).open();
				this.settings.showedSurfingMessage = true;
				this.plugin.saveSettings();
			}
		}
	}
}

class SurfingInfoModal extends Modal {
	article: Article;

	constructor(article: Article) {
		super(app);
		this.article = article;
	}

	onOpen() {
		const surfingLink = `<a href="obsidian://show-plugin?id=surfing">Surfing plugin</a>`;

		const data = `<h2>Wikipedia Search plugin ♥ ${surfingLink}</h2>
			<p>The Wikipedia Search plugin integrates with the amazing Surfing plugin to enable you to open Wikipedia articles directly inside of Obsidian! You just need to install and enable it. It has tons of awesome features and does the heavy lifting of loading the website itself in Obsidian. In this case the Wikipedia Search plugin just provides the search functionality. Using the Surfing plugin is completely optional but I highly recommend you check it out! Note: This will only be shown to you once but you can always find the information later in the README on GitHub as well. ~ Murphy :)</p>
			<b>tl;dr: Install and enable the amazing ${surfingLink} to open Wikipedia articles directly inside of Obsidian!</b>`;

		this.contentEl.innerHTML = data;
	}

	onClose() {
		// @ts-expect-error undocumented
		if (app.plugins.enabledPlugins.has("surfing")) {
			app.workspace.getLeaf("split").setViewState({
				type: "surfing-view",
				active: true,
				state: { url: this.article.url },
			});
		} else {
			window.open(this.article.url, "_blank");
		}
	}
}
