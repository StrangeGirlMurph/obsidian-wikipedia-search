import { App, Workspace, ItemView, WorkspaceLeaf, ViewStateResult } from "obsidian";
import { WikipediaSearchSettings } from "src/settings";
import { Article } from "src/utils/searchModal";
import { SearchModal } from "src/utils/searchModal";

export async function openArticleView(
	workspace: Workspace,
	settings: WikipediaSearchSettings,
	article: Article | reducedArticle
) {
	const leaf = await workspace.getLeaf(settings.openArticleInFullscreen ? "tab" : "split");
	leaf.setViewState({
		type: WIKIPEDIA_VIEW,
		active: true,
		state: { input: article },
	});
}

export class OpenArticleModal extends SearchModal {
	workspace: Workspace;

	constructor(app: App, settings: WikipediaSearchSettings) {
		super(app, settings);
		this.workspace = app.workspace;
	}

	async onChooseSuggestion(article: Article) {
		openArticleView(this.workspace, this.settings, article);
	}
}

export const WIKIPEDIA_VIEW = "wikipedia-article-view";

type reducedArticle = { title: string; url: string };
export class WikipediaView extends ItemView {
	article: reducedArticle;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	async setState(state: { input: reducedArticle }, result: ViewStateResult) {
		await super.setState(state, result);
		this.article = state.input;

		const container = this.containerEl;
		container.empty();

		const frame_styles: string[] = ["height: 100%", "width: 100%"];
		const frame = document.createElement("iframe");
		frame.setAttr("style", frame_styles.join("; "));
		frame.setAttr("src", this.article.url);
		container.appendChild(frame);
	}

	getState(): { input: reducedArticle } {
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
