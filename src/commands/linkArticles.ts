import { App, Editor, Notice, SuggestModal, normalizePath } from "obsidian";
import { languages } from "../utils/languages";
import { getArticleIntros, getArticleThumbnails } from "../utils/wikipediaAPI";
import { DEFAULT_TEMPLATE, Template, WikipediaSearchSettings } from "../settings";
import { Article } from "src/utils/searchModal";
import { SearchModal } from "src/utils/searchModal";

export class LinkingModal extends SearchModal {
	async onChooseSuggestion(article: Article) {
		if (this.settings.additionalTemplatesEnabled) {
			new TemplateModal(app, this.settings, this.editor!, article).open();
		} else {
			insert(app, this.editor!, this.settings, article, DEFAULT_TEMPLATE(this.settings));
		}
	}
}

class TemplateModal extends SuggestModal<Template> {
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

	renderSuggestion(template: Template, el: HTMLElement) {
		el.createEl("div", { text: template.name });
		el.createEl("small", {
			text: template.templateString,
		});
	}

	async getSuggestions(query: string): Promise<Template[]> {
		return [DEFAULT_TEMPLATE(this.settings)]
			.concat(this.settings.templates)
			.filter((template) => template.name.toLowerCase().includes(query.toLowerCase()));
	}

	async onChooseSuggestion(template: Template) {
		insert(app, this.editor, this.settings, this.article, template);
	}
}

async function insert(
	app: App, 
	editor: Editor,
	settings: WikipediaSearchSettings,
	article: Article,
	template: Template
) {
	const selection = editor.getSelection();
	const templateString = template.templateString;
	const noteTitle = settings.prioritizeArticleTitle || selection === "" ? article.title : selection;
	let insert = templateString
		.replaceAll("{title}", noteTitle)
		.replaceAll("{url}", article.url)
		.replaceAll("{description}", article.description ?? "")
		.replaceAll("{language}", languages[article.languageCode])
		.replaceAll("{languageCode}", article.languageCode);

	if (templateString.includes("{intro}")) {
		const intro: string | null = (await getArticleIntros([article.title], settings.language))?.[0] ?? null;
		insert = insert.replaceAll("{intro}", intro ?? "");
		if (!intro) new Notice("Could not fetch the articles introduction.");
	}

	if (templateString.includes("{thumbnail}")) {
		const thumbnailUrl: string | null =
			(await getArticleThumbnails([article.title], settings.language))?.[0] ?? null;
		insert = insert.replaceAll(
			"{thumbnail}",
			thumbnailUrl
				? `![${article.title} Thumbnail${
						settings.thumbnailWidth ? ` | ${settings.thumbnailWidth}` : ""
				  }](${thumbnailUrl})`
				: ""
		);
		if (!thumbnailUrl) new Notice("Could not fetch the articles thumbnail.");
	}

	if (templateString.includes("{description}") && !article.description)
		new Notice("The article has no description.");

	if (template.createArticleNote) {
		if (!template.createArticleNoteUseCustomPath) {
			template.createArticleNoteCustomPath = settings.createArticleNotePath;
		}
		const createdNote = await createNoteInFolder(app, noteTitle, insert, template);
		if (createdNote == null) {
			return;
		}
		insert = `[[${createdNote}|${noteTitle}]]`;
	}

	const cursorPosition = editor.getCursor();
	editor.replaceSelection(insert);
	if (settings.placeCursorInfrontOfInsert) editor.setCursor(cursorPosition);
}

async function createNoteInFolder(
	app: App,
	title: string,
	content: string,
	template: Template
): Promise<string | null> {
	const newNotePath = normalizePath(`${template.createArticleNoteCustomPath}/${title}.md`);
	const existingFile = app.vault.getAbstractFileByPath(newNotePath);
	
	if (existingFile) {
		new Notice(`Aborted action, because file '${normalizePath(title)}.md' already exists in the set folder.`);
		return null;
	}

	try {
		await app.vault.create(newNotePath, `${content}\n`); 
		new Notice("New note created successfully.");
	} catch (err) {
		new Notice("Error creating new note.");
		console.error("Error creating new note:", err);
		return null;
	}
	return newNotePath;
}
