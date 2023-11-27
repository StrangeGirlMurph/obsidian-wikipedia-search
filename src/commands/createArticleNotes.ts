import { App, TFile } from "obsidian";
import { Template, WikipediaSearchSettings } from "../settings";
import { Article } from "src/utils/searchModal";
import { SearchModal } from "src/utils/searchModal";
import { TemplateModal } from "src/utils/templateModal";
import { generateInsert } from "src/utils/generateInsert";
import { createNoteInFolder } from "src/utils/createNote";

export class CreateArticleNoteModal extends SearchModal {
	async onChooseSuggestion(article: Article) {
		const templates = this.settings.templates.filter((template) => template.createNote);
		if (templates.length > 1) {
			new CreateArticleNoteTemplateModal(this.app, this.settings, this.editor!, article).open();
		} else {
			createArticleNote(this.app, this.settings, article, templates[0]);
		}
	}
}

class CreateArticleNoteTemplateModal extends TemplateModal {
	renderSuggestion(template: Template, el: HTMLElement) {
		el.createEl("div", { text: `${template.name}` });
		el.createEl("small", {
			text: template.templateString.replaceAll("\n", "\\n"),
		});
	}

	async getSuggestions(query: string): Promise<Template[]> {
		return this.settings.templates
			.filter((template) => template.createNote)
			.filter((template) => template.name.toLowerCase().includes(query.toLowerCase()));
	}

	async onChooseSuggestion(template: Template) {
		createArticleNote(this.app, this.settings, this.article, template);
	}
}

async function createArticleNote(
	app: App,
	settings: WikipediaSearchSettings,
	article: Article,
	template: Template
) {
	const insert = await generateInsert(settings, article, template.templateString, "");
	const path = await createNoteInFolder(
		app,
		article.title,
		insert,
		template.customPath || settings.defaultNotePath
	);
	if (!path) return;
	if (settings.openCreatedNotes) {
		app.workspace
			.getLeaf(settings.openArticleInFullscreen ? "tab" : "split")
			.openFile(app.vault.getAbstractFileByPath(path)! as TFile);
	}
}
