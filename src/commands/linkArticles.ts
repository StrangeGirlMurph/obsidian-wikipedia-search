import { App, Editor, Notice, TFile } from "obsidian";
import { Template, WikipediaSearchSettings } from "../settings";
import { Article } from "src/utils/searchModal";
import { SearchModal } from "src/utils/searchModal";
import { TemplateModal } from "src/utils/templateModal";
import { generateInsert } from "src/utils/generateInsert";
import { createNoteInActiveNotesFolderMarker, createNoteInFolder } from "src/utils/createNote";

export class LinkArticleModal extends SearchModal {
	async onChooseSuggestion(article: Article) {
		if (this.settings.templates.length > 1) {
			new LinkArticleTemplateModal(app, this.settings, this.editor!, article).open();
		} else {
			insertLink(app, this.editor!, this.settings, article, this.settings.templates[0]);
		}
	}
}

class LinkArticleTemplateModal extends TemplateModal {
	async onChooseSuggestion(template: Template) {
		insertLink(app, this.editor, this.settings, this.article, template);
	}
}

async function insertLink(
	app: App,
	editor: Editor,
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

	let insert = await generateInsert(settings, article, templateString, editor.getSelection());

	if (template.createNote) {
		let folderPath: string | null =
			template.customPath === "" ? settings.defaultNotePath : template.customPath;
		if (folderPath === createNoteInActiveNotesFolderMarker) {
			folderPath = app.workspace.getActiveFile()?.parent?.path || null;
			if (folderPath == null) {
				new Notice(
					"Aborted! You have to have an active file to create a note in the current files parent folder."
				);
				return;
			}
		}

		const notePath = await createNoteInFolder(app, article.title, insert, folderPath, settings.overrideFiles);
		if (notePath == null) return;

		insert = `[[${notePath}|${
			settings.prioritizeArticleTitle || editor.getSelection() === "" ? article.title : editor.getSelection()
		}]]`;
	}

	const cursorPosition = editor.getCursor();
	editor.replaceSelection(insert);
	if (settings.placeCursorInfrontOfInsert) editor.setCursor(cursorPosition);
}
