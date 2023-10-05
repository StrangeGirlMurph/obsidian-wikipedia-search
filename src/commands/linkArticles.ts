import { App, Editor, Notice, SuggestModal } from "obsidian";
import { languages } from "../utils/languages";
import { getArticleIntros, getArticleThumbnails } from "../utils/wikipediaAPI";
import { Template, WikipediaSearchSettings } from "../settings";
import { Article } from "src/utils/searchModal";
import { SearchModal } from "src/utils/searchModal";

export class LinkingModal extends SearchModal {
	async onChooseSuggestion(article: Article) {
		if (this.settings.additionalTemplatesEnabled) {
			new TemplateModal(app, this.settings, this.editor!, article).open();
		} else {
			insert(app, this.editor!, this.settings, article, this.settings.defaultTemplate);
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
		return [{ name: "Default", templateString: this.settings.defaultTemplate }]
			.concat(this.settings.templates)
			.filter((template) => template.name.toLowerCase().includes(query.toLowerCase()));
	}

	async onChooseSuggestion(template: Template) {
		insert(super.app, this.editor, this.settings, this.article, template.templateString);
	}
}

async function insert(
	app: App, 
	editor: Editor,
	settings: WikipediaSearchSettings,
	article: Article,
	templateString: string
) {
	const selection = editor.getSelection();
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

	if (settings.createArticleNote) {
		if ((await createNoteForArticle(app, settings, noteTitle, insert))) {
			insert = `[[${noteTitle}]]`;
		}
	}

	const cursorPosition = editor.getCursor();
	editor.replaceSelection(insert);
	if (settings.placeCursorInfrontOfInsert) editor.setCursor(cursorPosition);
}

async function createNoteForArticle(
	app: App, 
	settings: WikipediaSearchSettings, 
	title: string, 
	content: string
) {
	const normalizedTitle = normalizeTitle(title);
	const newNotePath = `${settings.createArticleNotePath}/${normalizedTitle}.md`;

	const existingFile = app.vault.getAbstractFileByPath(newNotePath);
	if (existingFile) {
		new Notice(`File '${normalizedTitle}.md' already exists in the set folder.`);
		return false;
	}

	try {
		await app.vault.create(newNotePath, `${content}\n`); 
		new Notice("New note created successfully.");
	} catch (err) {
		new Notice("Error creating new note.");
		console.error("Error creating new note:", err);
		return false;
	}
	return true;
}

function normalizeTitle(input: string): string {
    let normalized = input.replace(/[\\/:"*?<>|]+/g, '_');
    normalized = normalized.trim();
    return normalized;
}
