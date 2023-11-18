import { App, Editor, Notice, SuggestModal, normalizePath } from "obsidian";
import { languages } from "../utils/languages";
import { getArticleIntros, getArticleThumbnails } from "../utils/wikipediaAPI";
import { Template, WikipediaSearchSettings } from "../settings";
import { Article } from "src/utils/searchModal";
import { SearchModal } from "src/utils/searchModal";

export class LinkingModal extends SearchModal {
	async onChooseSuggestion(article: Article) {
		if (this.settings.templates.length > 1) {
			new TemplateModal(app, this.settings, this.editor!, article).open();
		} else {
			insert(app, this.editor!, this.settings, article, this.settings.templates[0]);
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
		el.createEl("div", { text: `${template.name} ${template.createNote ? "(new note)" : "(inplace)"}` });
		el.createEl("small", {
			text: template.templateString.replaceAll("\n", "\\n"),
		});
	}

	async getSuggestions(query: string): Promise<Template[]> {
		return this.settings.templates.filter((template) =>
			template.name.toLowerCase().includes(query.toLowerCase())
		);
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
	const title = settings.prioritizeArticleTitle || selection === "" ? article.title : selection;
	let insert = templateString
		.replaceAll("{title}", title)
		.replaceAll("{url}", article.url)
		.replaceAll("{description}", article.description ?? "")
		.replaceAll("{language}", languages[article.languageCode])
		.replaceAll("{languageCode}", article.languageCode);

	if (templateString.includes("{intro}")) {
		const intro: string | null =
			(await getArticleIntros([article.title], settings.language, settings.cleanupIntros))?.[0] ?? null;
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

	if (template.createNote) {
		if (template.customPath === "") {
			template.customPath = settings.defaultNotePath;
		}
		const path = await createNoteInFolder(app, article.title, insert, template);
		if (path == null) return;

		insert = `[[${path}|${title}]]`;
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
	if (!(await app.vault.adapter.exists(normalizePath(template.customPath)))) {
		new Notice(
			"Aborted! The folder you specified in the settings to create this new note in does not exist. Please visit the plugin settings and change the path!",
			15000
		);
		return null;
	}
	const path = normalizePath(`${template.customPath}/${title}.md`);
	const file = app.vault.getAbstractFileByPath(path);

	if (file) {
		new Notice(`Aborted! '${path}' already exists.`);
		return null;
	}

	try {
		await app.vault.create(path, content);
		new Notice("New note created successfully.");
		return path;
	} catch (err) {
		new Notice("Error creating new note... Please check the console logs for more information.");
		console.error("Error creating new note:", err);
		return null;
	}
}
