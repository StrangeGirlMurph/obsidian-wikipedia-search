import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { languages } from "./languages";
import WikipediaSearch from "./main";

export interface WikipediaSearchSettings {
	language: string;
	defaultTemplate: string;
	placeCursorInfrontOfInsert: boolean;
	autoInsertSingleResponseQueries: boolean;
	alwaysUseArticleTitle: boolean;
	additionalTemplatesEnabled: boolean;
	templates: Template[];
}

export interface Template {
	name: string;
	templateString: string;
}

export const DEFAULT_SETTINGS: WikipediaSearchSettings = {
	language: "en",
	defaultTemplate: "[{title}]({url})",
	placeCursorInfrontOfInsert: false,
	autoInsertSingleResponseQueries: false,
	alwaysUseArticleTitle: false,
	additionalTemplatesEnabled: false,
	templates: [],
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
			.setDesc("Default Wikipedia to search in. (type to search)")
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
						new Notice(`Language set to ${languages[value]} (${value})!`);
					})
			);

		new Setting(containerEl)
			.setName(`${settings.additionalTemplatesEnabled ? "Default " : ""}Template`)
			.setDesc(
				"Template for the insert. (all occurrences of '{title}', '{url}', '{language}', '{languageCode}' and '{extract}' will be replaced with the selection/articles title, URL, language, language code and extract respectively)"
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
						if (settings.templates.length == 20)
							return new Notice(
								"Easy buddy... I need to stop you right there. You can only have up to 20 additional templates. It's for your own good!"
							);

						settings.templates.push({
							name: `Template #${settings.templates.length + 1}`,
							templateString: DEFAULT_SETTINGS.defaultTemplate,
						});
						await this.plugin.saveSettings();
						this.display();
					})
				);

			for (const [i, val] of settings.templates.entries()) {
				new Setting(containerEl)
					.setName(`Additional Template Nr. ${i + 1}`)
					.setDesc("Set the templates name and template for the insert.")
					.addText((text) =>
						text
							.setValue(val.name)
							.setPlaceholder("Name")
							.onChange(async (value) => {
								settings.templates[i].name = value;
								await this.plugin.saveSettings();
							})
					)
					.addTextArea((text) =>
						text
							.setPlaceholder("Template")
							.setValue(val.templateString)
							.onChange(async (value) => {
								settings.templates[i].templateString = value;
								await this.plugin.saveSettings();
							})
					)
					.addButton((button) =>
						button.setIcon("minus").onClick(async () => {
							settings.templates.splice(i, 1);
							await this.plugin.saveSettings();
							this.display();
						})
					);
			}
		}

		containerEl.createEl("h2", { text: "Workflow Optimizations" });

		new Setting(containerEl)
			.setName("Use Additional Templates")
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
				"When hyperlinking: Whether or not to use the articles title instead of the selected text for '{title}' parameter."
			)
			.addToggle((toggle) =>
				toggle.setValue(settings.alwaysUseArticleTitle).onChange(async (value) => {
					settings.alwaysUseArticleTitle = value;
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
		feedbackParagraph.appendText(" and I'll get back to you ASAP ~ Murphy :)");

		containerEl.appendChild(feedbackParagraph);
	}
}
