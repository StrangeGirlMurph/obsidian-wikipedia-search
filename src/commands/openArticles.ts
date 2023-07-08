import {
	App,
	Notice,
	Workspace,
	ItemView,
	WorkspaceLeaf,
	ViewStateResult,
	sanitizeHTMLToDom,
} from "obsidian";
import { WikipediaSearchSettings } from "src/settings";
import { Article } from "src/utils/searchModal";
import { SearchModal } from "src/utils/searchModal";
import { getArticleContent } from "src/utils/wikipediaAPI";

export class OpenArticleModal extends SearchModal {
	workspace: Workspace;

	constructor(app: App, settings: WikipediaSearchSettings) {
		super(app, settings);
		this.workspace = app.workspace;
	}

	async onChooseSuggestion(article: Article) {
		const leaf = await this.workspace.getLeaf("tab");
		leaf.setViewState({
			type: WIKIPEDIA_VIEW,
			active: true,
			state: { input: article },
		});

		//this.workspace.revealLeaf(this.workspace.getLeavesOfType(WIKIPEDIA_VIEW)[0]);
	}
}

export const WIKIPEDIA_VIEW = "wikipedia-article-view";

export class WikipediaView extends ItemView {
	article: Article;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	async setState(state: { input: Article }, result: ViewStateResult) {
		await super.setState(state, result);
		this.article = state.input;

		const content = await getArticleContent(this.article.title, this.article.languageCode);

		if (!content) {
			new Notice("Something went wrong :(");
			return;
		}

		const container = this.containerEl;
		container.empty();
		container
			.createDiv(undefined, (el) =>
				el.addClasses([
					"markdown-preview-view",
					"markdown-rendered",
					"node-insert-event",
					"is-readable-line-width",
					"allow-fold-headings",
					"show-indentation-guide",
					"allow-fold-lists",
				])
			)
			.createDiv(undefined, (el) => {
				el.addClasses(["markdown-preview-sizer", "markdown-preview-section"]);
				el.append(sanitizeHTMLToDom(`<h1>${this.article.title}</h1>` + content));
			});
	}

	getState(): { input: Article } {
		return Object.assign(super.getState(), { input: this.article });
	}

	getIcon(): string {
		return "wikipedia";
	}

	getViewType() {
		return WIKIPEDIA_VIEW;
	}

	getDisplayText() {
		if (!this.article) return "";
		return `${this.article.title} - Wikipedia`;
	}

	async onOpen() {}
}
