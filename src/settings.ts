import { App, Modal, Notice, PluginSettingTab, SearchComponent, Setting } from "obsidian";
import { languages } from "./utils/languages";
import WikipediaSearchPlugin from "./main";
import { FolderSuggest } from "./utils/suggesters/folderSuggest";

export interface Template {
	name: string;
	templateString: string;
	createNote: boolean;
	customPath: string; // use the default if empty
}

const DEFAULT_TEMPLATE_STRING_INLINE = "[{title}]({url})";
const DEFAULT_TEMPLATE_STRING_NOTE = "{thumbnail}\n[{title}]({url}): {intro}\n";

export const DEFAULT_TEMPLATE: Template = {
	name: "Default",
	templateString: DEFAULT_TEMPLATE_STRING_INLINE,
	createNote: false,
	customPath: "",
};

export interface WikipediaSearchSettings {
	language: string;
	thumbnailWidth: number | null;
	templates: Template[];
	defaultNotePath: string;
	prioritizeArticleTitle: boolean;
	placeCursorInfrontOfInsert: boolean;
	autoInsertSingleResponseQueries: boolean;
	openArticleInFullscreen: boolean;
	openArticlesInBrowser: boolean;
	showedSurfingMessage: boolean;
}

export const DEFAULT_SETTINGS: WikipediaSearchSettings = {
	language: "en",
	thumbnailWidth: null,
	templates: [DEFAULT_TEMPLATE],
	defaultNotePath: "/",
	prioritizeArticleTitle: false,
	placeCursorInfrontOfInsert: false,
	autoInsertSingleResponseQueries: false,
	openArticleInFullscreen: false,
	openArticlesInBrowser: false,
	showedSurfingMessage: false,
};

export class WikipediaSearchSettingTab extends PluginSettingTab {
	plugin: WikipediaSearchPlugin;
	settings: WikipediaSearchSettings;

	constructor(app: App, plugin: WikipediaSearchPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.settings = plugin.settings;
	}

	addNotePathSearch(item: Template, setting: Setting): Setting {
		if (!item.createNote) return setting;

		return setting.addSearch((search: SearchComponent) => {
			new FolderSuggest(app, search.inputEl);
			search.inputEl.style.flexGrow = "1";
			search
				.setPlaceholder("custom note path")
				.setValue(item.customPath)
				.onChange(async (newFolder: string) => {
					item.customPath = newFolder;
					await this.plugin.saveSettings();
				});
		});
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl).setName("Wikipedia Search Settings").setHeading();

		new Setting(containerEl)
			.setName("Language")
			.setDesc("The default Wikipedia to browse.")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(
						Object.entries(languages).reduce(
							(pre, lang) => ({
								...pre,
								[lang[0]]: `${lang[0]} - ${lang[1]}`,
							}),
							{}
						)
					)
					.setValue(this.settings.language)
					.onChange(async (value) => {
						this.settings.language = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Thumbnail Width")
			.setDesc("The width of the thumbnails in pixels. Leave empty to use the original size.")
			.addText((text) =>
				text
					.setPlaceholder("Width")
					.setValue(this.settings.thumbnailWidth ? this.settings.thumbnailWidth.toString() : "")
					.onChange(async (value) => {
						this.settings.thumbnailWidth = parseInt(value);
						await this.plugin.saveSettings();
					})
			);

		new Setting(this.containerEl)
			.setName("Default Note Path")
			.setDesc("Default folder where created notes should be saved.")
			.addSearch((search: SearchComponent) => {
				new FolderSuggest(this.app, search.inputEl);
				search
					.setPlaceholder("Example: folder/subfolder")
					.setValue(this.settings.defaultNotePath)
					.onChange(async (newFolder: string) => {
						if (newFolder.length == 0) {
							this.settings.defaultNotePath = DEFAULT_SETTINGS.defaultNotePath;
						} else {
							this.settings.defaultNotePath = newFolder;
						}
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Template Guide")
			.setDesc("Get an explanation on how to set templates.")
			.addButton((button) =>
				button.setButtonText("Guide").onClick(async () => {
					const modal = new Modal(app);
					modal.titleEl.setText("Template Guide");
					modal.contentEl.innerHTML =
						"1. Start by giving your template a name in the text field at the left. <br/><br/> 2. Next you can use the first toggle to make the template create a new note with it's content being the inserted template when linking an article instead of inserting directly in the current file. <br/><br/> 3. If that toggle is on a search field appears which allows you to set a custom path for the new note. You can leave it empty if you just want to use the default note path. <br/><br/> 4. Lastly you can set the actual template for the insert. All occurrences of '{title}', '{url}', '{language}', '{languageCode}', '{description}', '{intro}' and '{thumbnail}' will be replaced with the articles title (or the selection), url, language, language code, description (if available), intro (first section) and thumbnail embed (if available) respectively.";
					modal.open();
				})
			);

		new Setting(containerEl).setName("Templates").setHeading();

		for (const [i, template] of this.settings.templates.entries()) {
			const isDefaultTemplate = i == 0;

			let setting = new Setting(containerEl);
			setting.settingEl.removeChild(setting.infoEl);
			setting.controlEl.style.flexWrap = "wrap";
			setting.controlEl.style.justifyContent = "center";

			setting.addText((text) => {
				if (isDefaultTemplate) text.setDisabled(true);
				return text
					.setValue(isDefaultTemplate ? "Default Tempalte" : template.name)
					.setPlaceholder("Name")
					.onChange(async (value) => {
						template.name = value;
						await this.plugin.saveSettings();
					});
			});
			setting.controlEl.children[0].setAttr("style", "width: 180px;");

			setting.addToggle((toggle) =>
				toggle
					.setTooltip("creates note")
					.setValue(template.createNote)
					.onChange(async (value) => {
						template.createNote = value;
						if (template.templateString == DEFAULT_TEMPLATE_STRING_INLINE) {
							template.templateString = DEFAULT_TEMPLATE_STRING_NOTE;
						} else if (template.templateString == DEFAULT_TEMPLATE_STRING_NOTE) {
							template.templateString = DEFAULT_TEMPLATE_STRING_INLINE;
						}
						await this.plugin.saveSettings();
						this.display();
					})
			);

			//setting.controlEl.children[1].setAttr("style", "margin-right: auto;");

			setting = this.addNotePathSearch(template, setting);

			setting.addTextArea((text) => {
				text.inputEl.setAttr(
					"style",
					"white-space:pre;overflow-wrap:normal;overflow:hidden;resize:none;flex-grow:1;"
				);
				text.inputEl.setAttr("rows", "2");

				return text
					.setPlaceholder("Template")
					.setValue(template.templateString)
					.onChange(async (value) => {
						template.templateString = value;
						await this.plugin.saveSettings();
					});
			});

			setting.addExtraButton((button) => {
				if (isDefaultTemplate) button.setDisabled(true);
				return button
					.setTooltip("delete template")
					.setIcon("minus")
					.onClick(async () => {
						this.settings.templates.splice(i, 1);
						await this.plugin.saveSettings();
						this.display();
					});
			});
		}

		new Setting(containerEl).addExtraButton((button) =>
			button
				.setTooltip("create new template")
				.setIcon("plus")
				.onClick(async () => {
					if (this.settings.templates.length == 21)
						return new Notice(
							"Easy buddy... I need to stop you right there. You can only have up to 20 additional templates. It's for your own good! (I think)"
						);

					this.settings.templates.push({
						...DEFAULT_TEMPLATE,
						name: `Additional Template`,
					});
					await this.plugin.saveSettings();
					this.display();
				})
		);

		new Setting(containerEl).setName("Workflow Optimizations").setHeading();

		new Setting(containerEl)
			.setName("Cursor Placement")
			.setDesc("Whether or not the cursor is placed infront of the insert instead of after it.")
			.addToggle((toggle) =>
				toggle.setValue(this.settings.placeCursorInfrontOfInsert).onChange(async (value) => {
					this.settings.placeCursorInfrontOfInsert = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Auto-Select Single Response Queries")
			.setDesc(
				"When hyperlinking: Whether or not to automatically select the response to a query when there is only one article to choose from."
			)
			.addToggle((toggle) =>
				toggle.setValue(this.settings.autoInsertSingleResponseQueries).onChange(async (value) => {
					this.settings.autoInsertSingleResponseQueries = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Use Article Title Instead Of Selection")
			.setDesc(
				"When hyperlinking: Whether or not to use the articles title instead of the selected text for the '{title}' parameter of your template."
			)
			.addToggle((toggle) =>
				toggle.setValue(this.settings.prioritizeArticleTitle).onChange(async (value) => {
					this.settings.prioritizeArticleTitle = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Open Article In Browser")
			.setDesc(
				"Whether or not to open articles in the browser instead of in-app if the Surfing plugin is installed and enabled."
			)
			.addToggle((toggle) =>
				toggle.setValue(this.settings.openArticlesInBrowser).onChange(async (value) => {
					this.settings.openArticlesInBrowser = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Article Tab Placement")
			.setDesc(
				"Whether or not to open articles in a fullscreen tab instead of a split view when using the Surfing plugin."
			)
			.addToggle((toggle) =>
				toggle.setValue(this.settings.openArticleInFullscreen).onChange(async (value) => {
					this.settings.openArticleInFullscreen = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl).setName("Feedback, Bug Reports and Feature Requests 🌿").setHeading();
		const appendix = `<p style="border-top:1px solid var(--background-modifier-border); padding: 0.75em 0; margin: unset;">If you have any kind of feedback, please let me know! No matter how small! I also obsess a lot about small details. I want to make this plugin as useful as possible for everyone. I love to hear about your ideas for new features, all the bugs you found and everything that annoys you. Don't be shy! Just create an issue <a href="https://github.com/StrangeGirlMurph/obsidian-wikipedia-search">on GitHub</a> and I'll get back to you ASAP. ~ Murphy :)</p>
		<p>PS: Wikipedia also has a dark mode for everyone with an account.</p>`;
		const div = containerEl.createEl("div");
		div.innerHTML = appendix;
	}
}
