import { App, Notice, Workspace } from "obsidian";
import { WikipediaSearchSettings } from "src/settings";
import { Article } from "src/utils/interfaces";
import { SearchModal } from "src/utils/searchModal";
import { getArticleContent } from "src/utils/wikipediaAPI";

export class OpenArticleModal extends SearchModal {
	workspace: Workspace;

	constructor(app: App, settings: WikipediaSearchSettings) {
		super(app, settings);
		this.workspace = app.workspace;
	}

	async onChooseSuggestion(article: Article) {
		const content = await getArticleContent(article.title, article.languageCode);

		if (!content) {
			new Notice("Something went wrong :(");
			return;
		}

		const leaf = this.workspace.getLeaf("split", "vertical");
		this.workspace.setActiveLeaf(leaf);
		leaf.view.icon = article.title;
		console.log(leaf.view.getIcon());

		const container = leaf.view.containerEl;
		container.createEl("h1", { text: article.title });
		container.innerHTML = content;
	}
}
