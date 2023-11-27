import { SuggestModal, Editor, App } from "obsidian";
import { Template, WikipediaSearchSettings } from "src/settings";
import { Article } from "./searchModal";

export abstract class TemplateModal extends SuggestModal<Template> {
	settings: WikipediaSearchSettings;
	editor: Editor;
	article: Article;

	constructor(app: App, settings: WikipediaSearchSettings, editor: Editor, article: Article) {
		super(app);
		this.settings = settings;
		this.editor = editor;
		this.article = article;
		this.setPlaceholder("Pick a template...");
	}

	abstract renderSuggestion(template: Template, el: HTMLElement): any;

	abstract getSuggestions(query: string): Promise<Template[]>;

	abstract onChooseSuggestion(template: Template): any;
}
