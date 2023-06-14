import { App, Editor, SuggestModal } from "obsidian";
import { languages } from "../utils/languages";
import { getArticleExtract } from "../utils/wikipediaAPI";
import { Template, WikipediaSearchSettings } from "../settings";
import { Article } from "src/utils/interfaces";
import { SearchModal } from "src/utils/searchModal";

export class LinkingModal extends SearchModal {
	async onChooseSuggestion(article: Article) {
		if (this.settings.additionalTemplatesEnabled) {
			new TemplateModal(app, this.settings, this.editor!, article).open();
		} else {
			insert(this.editor!, this.settings, article, this.settings.defaultTemplate);
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
		insert(this.editor, this.settings, this.article, template.templateString);
	}
}

async function insert(
	editor: Editor,
	settings: WikipediaSearchSettings,
	article: Article,
	templateString: string
) {
	const cursorPosition = editor.getCursor();
	let extract: string | null = templateString.includes("{extract}")
		? (await getArticleExtract([article.title], settings.language))?.[0] ?? null
		: null;

	const selection = editor.getSelection();
	const insert = templateString
		.replaceAll("{title}", settings.alwaysUseArticleTitle || selection === "" ? article.title : selection)
		.replaceAll("{url}", article.url)
		.replaceAll("{language}", languages[article.languageCode])
		.replaceAll("{languageCode}", article.languageCode)
		.replaceAll("{extract}", extract ?? "[Could not fetch the extract...]");
	editor.replaceSelection(insert);

	if (settings.placeCursorInfrontOfInsert) editor.setCursor(cursorPosition);
}
