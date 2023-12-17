import { App, Notice, TFile } from "obsidian";
import { Template, WikipediaSearchSettings } from "../settings";
import { Article } from "src/utils/searchModal";
import { SearchModal } from "src/utils/searchModal";
import { TemplateModal } from "src/utils/templateModal";
import { generateInsert } from "src/utils/generateInsert";
import { createNoteInActiveNotesFolderMarker, createNoteInFolder } from "src/utils/createNote";

export class CreateArticleNoteModal extends SearchModal {
	async onChooseSuggestion(article: Article) {
		const templates = this.settings.templates.filter((template) => template.createNote);
		if (templates.length > 1) {
			new CreateArticleNoteTemplateModal(this.app, this.settings, this.editor!, article, true).open();
		} else {
			createArticleNote(this.app, this.settings, article, templates[0]);
		}
	}
}

class CreateArticleNoteTemplateModal extends TemplateModal {
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
	let templateString = template.templateString;
	if (template.useTemplateFile) {
		const templateFile = app.vault.getAbstractFileByPath(template.templateFilePath);
		if (!templateFile || !(templateFile instanceof TFile)) {
			new Notice(`Aborting! Template file '${template.templateFilePath}' not found!`);
			return;
		}
		templateString = await app.vault.read(templateFile);
	}

	let folderPath: string | null = template.customPath === "" ? settings.defaultNotePath : template.customPath;
	if (folderPath === createNoteInActiveNotesFolderMarker) {
		folderPath = app.workspace.getActiveFile()?.parent?.path || null;
		if (folderPath == null) {
			new Notice(
				"Aborted! You have to have an active file to create a note in the current files parent folder."
			);
			return;
		}
	}

	const insert = await generateInsert(settings, article, templateString, "");
	const filePath = await createNoteInFolder(app, article.title, insert, folderPath, settings.overrideFiles);
	if (!filePath) return;
	if (settings.openCreatedNotes) {
		app.workspace
			.getLeaf(settings.openArticleInFullscreen ? "tab" : "split")
			.openFile(app.vault.getAbstractFileByPath(filePath)! as TFile);
	}
}
