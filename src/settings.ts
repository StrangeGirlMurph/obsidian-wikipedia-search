import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { languages } from "./utils/languages";
import WikipediaSearch from "./main";

export interface Template {
	name: string;
	templateString: string;
}

export interface WikipediaSearchSettings {
	language: string;
	defaultTemplate: string;
	additionalTemplates: Template[];
	additionalTemplatesEnabled: boolean;
	prioritizeArticleTitle: boolean;
	placeCursorInfrontOfInsert: boolean;
	autoInsertSingleResponseQueries: boolean;
	openArticleInFullscreen: boolean;
}

export const DEFAULT_SETTINGS: WikipediaSearchSettings = {
	language: "en",
	defaultTemplate: "[{title}]({url})",
	additionalTemplates: [],
	additionalTemplatesEnabled: false,
	prioritizeArticleTitle: false,
	placeCursorInfrontOfInsert: false,
	autoInsertSingleResponseQueries: false,
	openArticleInFullscreen: false,
};

export class WikipediaSearchSettingTab extends PluginSettingTab {
	plugin: WikipediaSearch;

	constructor(app: App, plugin: WikipediaSearch) {
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
				"The template for the insert. (all occurrences of '{title}', '{url}', '{language}', '{languageCode}', '{description} and '{intro}' will be replaced with the articles title (or the selection), url, language, language code, description (if available) and intro (first section) respectively)"
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

		if (settings.additionalTemplatesEnabled) {
			containerEl.createEl("h2", { text: "Additional Templates" });

			new Setting(containerEl)
				.setName("Add Template")
				.setDesc("Adds a new template option to choose from.")
				.addButton((button) =>
					button.setIcon("plus").onClick(async () => {
						if (settings.additionalTemplates.length == 20)
							return new Notice(
								"Easy buddy... I need to stop you right there. You can only have up to 20 additional templates. It's for your own good!"
							);

						settings.additionalTemplates.push({
							name: `Template #${settings.additionalTemplates.length + 1}`,
							templateString: DEFAULT_SETTINGS.defaultTemplate,
						});
						await this.plugin.saveSettings();
						this.display();
					})
				);

			for (const [i, val] of settings.additionalTemplates.entries()) {
				new Setting(containerEl)
					.setName(`Additional Template Nr. ${i + 1}`)
					.setDesc("Set the templates name and template for the insert.")
					.addText((text) =>
						text
							.setValue(val.name)
							.setPlaceholder("Name")
							.onChange(async (value) => {
								settings.additionalTemplates[i].name = value;
								await this.plugin.saveSettings();
							})
					)
					.addTextArea((text) =>
						text
							.setPlaceholder("Template")
							.setValue(val.templateString)
							.onChange(async (value) => {
								settings.additionalTemplates[i].templateString = value;
								await this.plugin.saveSettings();
							})
					)
					.addButton((button) =>
						button.setIcon("minus").onClick(async () => {
							settings.additionalTemplates.splice(i, 1);
							await this.plugin.saveSettings();
							this.display();
						})
					);
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
			.setName("Article Tab Placement")
			.setDesc("Whether or not to open articles in full screen instead of in a split view.")
			.addToggle((toggle) =>
				toggle.setValue(settings.openArticleInFullscreen).onChange(async (value) => {
					settings.openArticleInFullscreen = value;
					await this.plugin.saveSettings();
				})
			);

		containerEl.createEl("br");
		containerEl.createEl("hr");
		containerEl.createEl("h2", { text: "Feedback, Bug Reports and Feature Requests 🌿" });

		const feedbackParagraph = containerEl.createEl("p");
		feedbackParagraph.setText(
			"If you have any kind feedback, please let me know! I want to make this plugin as useful as possible for everyone. I love to hear about your ideas for new features and all the bugs you found. Don't be shy! Just create an issue "
		);
		feedbackParagraph.createEl("a", {
			text: "on GitHub",
			href: "https://github.com/StrangeGirlMurph/obsidian-wikipedia-search",
		});
		feedbackParagraph.appendText(" and I'll get back to you ASAP. ~ Murphy :)");

		containerEl.appendChild(feedbackParagraph);
	}
}
