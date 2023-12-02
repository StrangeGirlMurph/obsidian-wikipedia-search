import { SuggestModal, Editor, App, TFile } from "obsidian";
import { Template, WikipediaSearchSettings } from "src/settings";
import { Article } from "./searchModal";

export abstract class TemplateModal extends SuggestModal<Template> {
	settings: WikipediaSearchSettings;
	editor: Editor;
	article: Article;
	noteTemplatesOnly: boolean;

	constructor(
		app: App,
		settings: WikipediaSearchSettings,
		editor: Editor,
		article: Article,
		noteTemplatesOnly = false
	) {
		super(app);
		this.settings = settings;
		this.editor = editor;
		this.article = article;
		this.noteTemplatesOnly = noteTemplatesOnly;
		this.setPlaceholder("Pick a template...");
	}

	renderSuggestion(template: Template, el: HTMLElement): any {
		el.createEl("div", {
			text: `${template.name} ${this.noteTemplatesOnly ? "" : template.createNote ? "(note)" : "(inline)"}`,
		});
		if (template.createNote && template.useTemplateFile) {
			const file = app.vault.getAbstractFileByPath(template.templateFilePath);
			if (file && file instanceof TFile) {
				el.createEl("small", {
					text: `File: ${template.templateFilePath}`,
				});
			} else {
				el.createEl("small", {
					text: `Template file '${template.templateFilePath}' not found!`,
				});
			}
		} else {
			el.createEl("small", {
				text: template.templateString.replaceAll("\n", "\\n"),
			});
		}
	}

	async getSuggestions(query: string): Promise<Template[]> {
		return (
			this.noteTemplatesOnly
				? this.settings.templates.filter((template) => template.createNote)
				: this.settings.templates
		).filter((template) => template.name.toLowerCase().includes(query.toLowerCase()));
	}

	abstract onChooseSuggestion(template: Template): any;
}
