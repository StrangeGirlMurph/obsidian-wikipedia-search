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
const DEFAULT_TEMPLATE_STRING_NOTE = "{thumbnail}\n[{title}]({url}): {intro}";

export const DEFAULT_TEMPLATE: Template = {
	name: "Default",
	templateString: DEFAULT_TEMPLATE_STRING_INLINE,
	createNote: false,
	customPath: "",
};

export interface WikipediaSearchSettings {
	language: string;
	searchLimit: number;
	thumbnailWidth: number;
	defaultNotePath: string;
	templates: Template[];
	placeCursorInfrontOfInsert: boolean;
	autoInsertSingleResponseQueries: boolean;
	prioritizeArticleTitle: boolean;
	cleanupIntros: boolean;
	openArticleInFullscreen: boolean;
	openArticlesInBrowser: boolean;
	openCreatedNotes: boolean;
	showedSurfingMessage: boolean;
}

export const DEFAULT_SETTINGS: WikipediaSearchSettings = {
	language: "en",
	searchLimit: 10,
	thumbnailWidth: NaN,
	defaultNotePath: "/",
	templates: [DEFAULT_TEMPLATE],
	placeCursorInfrontOfInsert: false,
	autoInsertSingleResponseQueries: false,
	prioritizeArticleTitle: false,
	cleanupIntros: true,
	openArticleInFullscreen: false,
	openArticlesInBrowser: false,
	openCreatedNotes: false,
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

		setting.addSearch((search: SearchComponent) => {
			new FolderSuggest(app, search.inputEl);
			search
				.setPlaceholder("custom note path")
				.setValue(item.customPath)
				.onChange(async (newFolder: string) => {
					item.customPath = newFolder;
					await this.plugin.saveSettings();
				});
		});

		setting.controlEl.children[2].setAttr("style", "flex-grow:1;width:170px;");
		return setting;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		const fragment = new DocumentFragment();
		fragment.createEl("span").innerHTML =
			"Wikipedia Search Settings > Read the <a href='https://strangegirlmurph.github.io/obsidian-wikipedia-search/'>documentation</a>!";
		new Setting(containerEl).setName(fragment).setHeading();

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
			.setName("Search limit")
			.setDesc("Maximum number of search results to show. (Between 1 and 500)")
			.addText((text) =>
				text
					.setPlaceholder("Limit")
					.setValue(this.settings.searchLimit ? this.settings.searchLimit.toString() : "")
					.onChange(async (value) => {
						const parsed = parseInt(value);
						if (parsed < 1 || parsed > 500) return;
						this.settings.searchLimit = parsed;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Thumbnail width")
			.setDesc("The width of the thumbnails in pixels. (Leave empty to use the original size.)")
			.addText((text) =>
				text
					.setPlaceholder("Width")
					.setValue(this.settings.thumbnailWidth ? this.settings.thumbnailWidth.toString() : "")
					.onChange(async (value) => {
						const parsed = parseInt(value);
						if (typeof parsed !== "number") return;
						this.settings.thumbnailWidth = parsed;
						await this.plugin.saveSettings();
					})
			);

		new Setting(this.containerEl)
			.setName("Default note path")
			.setDesc("Default folder where notes should be created.")
			.addSearch((search: SearchComponent) => {
				new FolderSuggest(this.app, search.inputEl);
				return search
					.setPlaceholder("Example: folder/subfolder")
					.setValue(this.settings.defaultNotePath)
					.onChange(async (newFolder: string) => {
						if (newFolder.length == 0) {
							this.settings.defaultNotePath = DEFAULT_SETTINGS.defaultNotePath;
							search.setValue(this.settings.defaultNotePath);
						} else {
							this.settings.defaultNotePath = newFolder;
						}
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Template guide")
			.setDesc("Get an explanation on how to configure templates.")
			.addButton((button) =>
				button.setButtonText("Guide").onClick(async () => {
					const modal = new Modal(app);
					modal.titleEl.setText("Template guide");
					modal.contentEl.innerHTML =
						"1. Start by giving your template a name in the text field at the left. <br/><br/> 2. Next you can use the toggle to make the template create a new note with it's content being the inserted template when linking an article instead of inserting directly in the current file. <br/><br/> 3. If that toggle is on, a search field appears which allows you to set a custom path for the new note. You can leave it empty if that template should just use the default note path. <br/><br/> 4. Lastly you can set the actual template for the insert. All occurrences of '{title}', '{url}', '{language}', '{languageCode}', '{description}', '{intro}' and '{thumbnail}' will be replaced with the articles title (or the selection), url, language, language code, description (if available), intro (the articles first section) and thumbnail embed (if available) respectively.<br/><br/>Note: You can't rename nor delete the default template.";
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
			setting.controlEl.children[0].setAttr("style", "width: 160px;");

			setting.addToggle((toggle) =>
				toggle
					.setTooltip("creates note")
					.setValue(template.createNote)
					.onChange(async (value) => {
						template.createNote = value;
						if (
							template.createNote &&
							(template.templateString == DEFAULT_TEMPLATE_STRING_INLINE || template.templateString === "")
						) {
							template.templateString = DEFAULT_TEMPLATE_STRING_NOTE;
						} else if (
							!template.createNote &&
							(template.templateString == DEFAULT_TEMPLATE_STRING_NOTE || template.templateString === "")
						) {
							template.templateString = DEFAULT_TEMPLATE_STRING_INLINE;
						}
						await this.plugin.saveSettings();
						this.display();
					})
			);

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
				button.extraSettingsEl.style.height = "min-content";
				return button
					.setTooltip("delete template")
					.setIcon("minus")
					.onClick(async () => {
						this.settings.templates.splice(i, 1);
						await this.plugin.saveSettings();
						this.display();
					});
			});

			const div = setting.controlEl.createDiv();
			div.setAttr("style", "display:flex;flex-grow:1;gap:var(--size-4-2);align-items:center;");

			div.appendChild(setting.controlEl.children[setting.controlEl.children.length - 3]);
			div.appendChild(setting.controlEl.children[setting.controlEl.children.length - 2]);
		}

		new Setting(containerEl).addExtraButton((button) =>
			button
				.setTooltip("create new template")
				.setIcon("plus")
				.onClick(async () => {
					if (this.settings.templates.length == 21)
						return new Notice(
							"Easy buddy... I need to stop you right there. You can only have up to 20 templates. It's for your own good! (I think) If you really need more come and talk to me on GitHub. If you convince me I'll let you have more.",
							15000
						);

					this.settings.templates.push({
						...DEFAULT_TEMPLATE,
						name: `Additional Template`,
					});
					await this.plugin.saveSettings();
					this.display();
				})
		);

		new Setting(containerEl).setName("Workflow optimizations").setHeading();

		new Setting(containerEl)
			.setName("Cursor placement")
			.setDesc("Whether or not the cursor is placed infront of the insert instead of after it.")
			.addToggle((toggle) =>
				toggle.setValue(this.settings.placeCursorInfrontOfInsert).onChange(async (value) => {
					this.settings.placeCursorInfrontOfInsert = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Auto-select single response queries")
			.setDesc(
				"Whether or not to automatically select the response to a query when there is only one article to choose from."
			)
			.addToggle((toggle) =>
				toggle.setValue(this.settings.autoInsertSingleResponseQueries).onChange(async (value) => {
					this.settings.autoInsertSingleResponseQueries = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Use article title instead of selection")
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
			.setName("Stop auto-cleanup of intros")
			.setDesc("Whether or not to stop auto-cleaning the articles intros for better readability.")
			.addToggle((toggle) =>
				toggle.setValue(!this.settings.cleanupIntros).onChange(async (value) => {
					this.settings.cleanupIntros = !value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Open article in browser")
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
			.setName("Article tab placement")
			.setDesc(
				"Whether or not to open articles in a fullscreen tab instead of a split view when using the Surfing plugin or creating an article note."
			)
			.addToggle((toggle) =>
				toggle.setValue(this.settings.openArticleInFullscreen).onChange(async (value) => {
					this.settings.openArticleInFullscreen = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Open created article notes")
			.setDesc("Whether or not to open the newly created article notes after creating them.")
			.addToggle((toggle) =>
				toggle.setValue(this.settings.openCreatedNotes).onChange(async (value) => {
					this.settings.openCreatedNotes = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl).setName("Feedback, bug reports and feature requests 🌿").setHeading();
		const appendix = `<p style="border-top:1px solid var(--background-modifier-border); padding: 0.75em 0; margin: unset;">If you have any kind of feedback, please let me know! No matter how small! I also obsess a lot about small details. I want to make this plugin as useful as possible for everyone. I love to hear about your ideas for new features, all the bugs you found and everything that annoys you. Don't be shy! Just create an issue on <a href="https://github.com/StrangeGirlMurph/obsidian-wikipedia-search">GitHub</a> and I'll get back to you ASAP. ~ Murphy :)</p>
		<p style="margin: unset;">PS: Wikipedia also has a dark mode for everyone with an account.</p>`;
		const div = containerEl.createEl("div");
		div.innerHTML = appendix;
	}
}
