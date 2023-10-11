import { App, Notice, PluginSettingTab, SearchComponent, Setting, ToggleComponent } from "obsidian";
import { languages } from "./utils/languages";
import WikipediaSearchPlugin from "./main";
import { FolderSuggest } from "./utils/suggesters/folderSuggest";

export interface Template {
	name: string;
	templateString: string;
	createArticleNote: boolean;
	createArticleNoteUseCustomPath: boolean;
	createArticleNoteCustomPath: string;
}

export interface WikipediaSearchSettings {
	language: string;
	defaultTemplate: string;
	thumbnailWidth: number | null;
	templates: Template[];
	createArticleNotePath: string;
	additionalTemplatesEnabled: boolean;
	prioritizeArticleTitle: boolean;
	placeCursorInfrontOfInsert: boolean;
	autoInsertSingleResponseQueries: boolean;
	openArticleInFullscreen: boolean;
	openArticlesInBrowser: boolean;
	showedSurfingMessage: boolean;
}

export const DEFAULT_TEMPLATE = (settings: WikipediaSearchSettings): Template => {
	return {
		name: "Default",
		templateString: settings.defaultTemplate,
		createArticleNote: false,
		createArticleNoteUseCustomPath: false,
		createArticleNoteCustomPath: settings.createArticleNotePath
	};
};

export const DEFAULT_SETTINGS: WikipediaSearchSettings = {
	language: "en",
	defaultTemplate: "[{title}]({url})",
	thumbnailWidth: null,
	templates: [],
	createArticleNotePath: "/",
	additionalTemplatesEnabled: false,
	prioritizeArticleTitle: false,
	placeCursorInfrontOfInsert: false,
	autoInsertSingleResponseQueries: false,
	openArticleInFullscreen: false,
	openArticlesInBrowser: false,
	showedSurfingMessage: false,
};

export class WikipediaSearchSettingTab extends PluginSettingTab {
	plugin: WikipediaSearchPlugin;

	constructor(app: App, plugin: WikipediaSearchPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		const settings = this.plugin.settings;

		containerEl.empty();

		containerEl.createEl("h1", { text: "Wikipedia Search Settings" });
		containerEl.createEl("h2", { text: "General" });

		new Setting(containerEl)
			.setName("Language")
			.setDesc("The default Wikipedia to browse. (type to search)")
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
					.setValue(settings.language)
					.onChange(async (value) => {
						settings.language = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(`${settings.additionalTemplatesEnabled ? "Default " : ""}Template`)
			.setDesc(
				"The template for the insert. All occurrences of '{title}', '{url}', '{language}', '{languageCode}', '{description}', '{intro}' and '{thumbnail}' will be replaced with the articles title (or the selection), url, language, language code, description (if available), intro (first section) and thumbnail embed (if available) respectively."
			)
			.addTextArea((text) =>
				text
					.setPlaceholder("Template")
					.setValue(settings.defaultTemplate)
					.onChange(async (value) => {
						settings.defaultTemplate = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Thumbnail Width")
			.setDesc("The width of the thumbnail in pixels. Leave empty to use the original size.")
			.addText((text) =>
				text
					.setPlaceholder("Width")
					.setValue(settings.thumbnailWidth ? settings.thumbnailWidth.toString() : "")
					.onChange(async (value) => {
						settings.thumbnailWidth = parseInt(value);
						await this.plugin.saveSettings();
					})
			);

		if (settings.additionalTemplatesEnabled) {
			containerEl.createEl("h2", { text: "Additional Templates" });

			new Setting(this.containerEl)
				.setName("Default path for created notes")
				.setDesc("Folder where created notes should be saved. (type to search)")
					.addSearch((search: SearchComponent) => {
                		new FolderSuggest(this.app, search.inputEl);
                		search.setPlaceholder("Example: folder1/folder2")
							.setValue(settings.createArticleNotePath)
							.onChange(async (newFolder: string) => {
								if (newFolder.length == 0) {
									settings.createArticleNotePath = DEFAULT_SETTINGS.createArticleNotePath;
								} else {
									settings.createArticleNotePath = newFolder;
								}
								await this.plugin.saveSettings();
							});
            });

			new Setting(containerEl)
				.setName("Add Template")
				.setDesc("Adds a new template option to choose from.")
				.addButton((button) =>
					button.setIcon("plus").onClick(async () => {
						if (settings.templates.length == 20)
							return new Notice(
								"Easy buddy... I need to stop you right there. You can only have up to 20 additional templates. It's for your own good!"
							);

						settings.templates.push({
							name: `Template #${settings.templates.length + 1}`,
							templateString: DEFAULT_SETTINGS.defaultTemplate,
							createArticleNote: false,
							createArticleNoteUseCustomPath: false,
							createArticleNoteCustomPath: settings.createArticleNotePath
						});
						await this.plugin.saveSettings();
						this.display();
					})
				);

			for (const [i, val] of settings.templates.entries()) {
				containerEl.createEl("h4", { text: `Additional Template Nr. ${i + 1}` });

				new Setting(containerEl)
					.setName(`Name`)
					.setDesc("Set the templates name. ")
					.addText((text) =>
						text
							.setValue(val.name)
							.setPlaceholder("Name")
							.onChange(async (value) => {
								settings.templates[i].name = value;
								await this.plugin.saveSettings();
							})
					);
				
				new Setting(containerEl)
					.setName(`Create Note`)
					.setDesc(`Enable to create a new note for the article, instead of just linking it. By activating this option, the template will change to a preferred setup. After activating you can change the template for your needs.`)
					.addToggle((toggle) =>
						toggle
							.setValue(val.createArticleNote)
							.onChange(async (value) => {
								settings.templates[i].createArticleNote = value;
								if (settings.templates[i].createArticleNote && settings.templates[i].templateString == DEFAULT_SETTINGS.defaultTemplate) {
									settings.templates[i].templateString = "{thumbnail}\n{intro}\n\n{url}";
								}
								await this.plugin.saveSettings();
								this.display();
							})
					);
				
				if (val.createArticleNote) {
					new Setting(this.containerEl)
						.setName("Custom path for created notes")
						.setDesc("Custom folder where created notes should be saved. Activate to use custom template path. (type to search)")
						.addSearch((search: SearchComponent) => {
							new FolderSuggest(this.app, search.inputEl);
							search.setPlaceholder("Example: folder1/folder2")
								.setValue(val.createArticleNoteCustomPath)
								.setDisabled(!val.createArticleNoteUseCustomPath)
								.onChange(async (newFolder: string) => {
									if (newFolder.length == 0) {
										settings.templates[i].createArticleNoteCustomPath = settings.createArticleNotePath;
									} else {
										settings.templates[i].createArticleNoteCustomPath = newFolder;
									}
									await this.plugin.saveSettings();
								});
						})
						.addToggle((toggle: ToggleComponent) => {
							toggle
								.setValue(settings.templates[i].createArticleNoteUseCustomPath)
								.onChange(async (newValue) => {
									settings.templates[i].createArticleNoteUseCustomPath = newValue;
									await this.plugin.saveSettings();
									this.display();
								})
						});
				}

				new Setting(containerEl)
					.setName("Template")
					.setDesc("Set the template for the insert. All occurrences of '{title}', '{url}', '{language}', '{languageCode}', '{description}', '{intro}' and '{thumbnail}' will be replaced with the articles title (or the selection), url, language, language code, description (if available), intro (first section) and thumbnail embed (if available) respectively.")
					.addTextArea((text) =>
						text
							.setPlaceholder("Template")
							.setValue(val.templateString)
							.onChange(async (value) => {
								settings.templates[i].templateString = value;
								await this.plugin.saveSettings();
							})
					);
					
				new Setting(containerEl)
					.setName(`Remove template`)
					.addButton((button) =>
						button.setIcon("minus").onClick(async () => {
							settings.templates.splice(i, 1);
							await this.plugin.saveSettings();
							this.display();
						})
					);
				
				containerEl.createEl("hr");
			}
		}

		containerEl.createEl("h2", { text: "Workflow Optimizations" });
		
		new Setting(containerEl)
			.setName("Additional Templates")
			.setDesc("Enable additional templating options for the insert.")
			.addToggle((toggle) =>
				toggle.setValue(settings.additionalTemplatesEnabled).onChange(async (value) => {
					settings.additionalTemplatesEnabled = value;
					await this.plugin.saveSettings();
					this.display();
				})
			);

		new Setting(containerEl)
			.setName("Cursor Placement")
			.setDesc("Whether or not the cursor is placed infront of the insert instead of after it.")
			.addToggle((toggle) =>
				toggle.setValue(settings.placeCursorInfrontOfInsert).onChange(async (value) => {
					settings.placeCursorInfrontOfInsert = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Auto-Select Single Response Queries")
			.setDesc(
				"When hyperlinking: Whether or not to automatically select the response to a query when there is only one article to choose from."
			)
			.addToggle((toggle) =>
				toggle.setValue(settings.autoInsertSingleResponseQueries).onChange(async (value) => {
					settings.autoInsertSingleResponseQueries = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Use Article Title Instead Of Selection")
			.setDesc(
				"When hyperlinking: Whether or not to use the articles title instead of the selected text for the '{title}' parameter of your template."
			)
			.addToggle((toggle) =>
				toggle.setValue(settings.prioritizeArticleTitle).onChange(async (value) => {
					settings.prioritizeArticleTitle = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Open Article In Browser")
			.setDesc(
				"Whether or not to open articles in the browser instead of in-app if the Surfing plugin is installed and enabled."
			)
			.addToggle((toggle) =>
				toggle.setValue(settings.openArticlesInBrowser).onChange(async (value) => {
					settings.openArticlesInBrowser = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Article Tab Placement")
			.setDesc(
				"Whether or not to open articles in a fullscreen tab instead of a split view when using the Surfing plugin."
			)
			.addToggle((toggle) =>
				toggle.setValue(settings.openArticleInFullscreen).onChange(async (value) => {
					settings.openArticleInFullscreen = value;
					await this.plugin.saveSettings();
				})
			);

		const appendix = `
		<h2>Feedback, Bug Reports and Feature Requests 🌿</h2>
		<p>If you have any kind of feedback, please let me know! No matter how small! I also obsess a lot about small details. I want to make this plugin as useful as possible for everyone. I love to hear about your ideas for new features, all the bugs you found and everything that annoys you. Don't be shy! Just create an issue <a href="https://github.com/StrangeGirlMurph/obsidian-wikipedia-search">on GitHub</a> and I'll get back to you ASAP. ~ Murphy :)</p>
		<p>PS: Wikipedia also has a dark mode for everyone with an account.</p>`;
		containerEl.createEl("div").innerHTML = appendix;
	}
}
