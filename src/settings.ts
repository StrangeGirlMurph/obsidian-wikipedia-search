import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { languages } from "./languages";
import WikipediaSearch from "./main";

export interface WikipediaSearchSettings {
	language: string;
	format: string;
	placeCursorInfrontOfInsert: boolean;
	autoInsertSingleResponseQueries: boolean;
	alwaysUseArticleTitle: boolean;
}

export const DEFAULT_SETTINGS: WikipediaSearchSettings = {
	language: "en",
	format: "[{title}]({url})",
	placeCursorInfrontOfInsert: false,
	autoInsertSingleResponseQueries: false,
	alwaysUseArticleTitle: false,
};

export class WikipediaSearchSettingTab extends PluginSettingTab {
	plugin: WikipediaSearch;

	constructor(app: App, plugin: WikipediaSearch) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

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
					.setValue(this.plugin.settings.language)
					.onChange(async (value) => {
						this.plugin.settings.language = value;
						await this.plugin.saveSettings();
						new Notice(`Language set to ${languages[value]} (${value})!`);
					})
			);

		new Setting(containerEl)
			.setName("Format")
			.setDesc(
				"Format of the insert. (all occurrences of '{title}', '{url}' and '{extract}' will be replaced with the selection/articles title, URL and extract respectively)"
			)
			.addTextArea((text) =>
				text
					.setPlaceholder("Format")
					.setValue(this.plugin.settings.format)
					.onChange(async (value) => {
						this.plugin.settings.format = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h2", { text: "Workflow Optimizations" });

		new Setting(containerEl)
			.setName("Cursor Placement")
			.setDesc("Whether or not the cursor is placed infront of the insert instead of after it.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.placeCursorInfrontOfInsert).onChange(async (value) => {
					this.plugin.settings.placeCursorInfrontOfInsert = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Auto-Select Single Response Queries")
			.setDesc(
				"When hyperlinking: Whether or not to automatically select the response to a query when there is only one article to choose from."
			)
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.autoInsertSingleResponseQueries).onChange(async (value) => {
					this.plugin.settings.autoInsertSingleResponseQueries = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Use Article Title Instead Of Selection")
			.setDesc(
				"When hyperlinking: Whether or not to use the articles title instead of the selected text for '{title}' parameter."
			)
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.alwaysUseArticleTitle).onChange(async (value) => {
					this.plugin.settings.alwaysUseArticleTitle = value;
					await this.plugin.saveSettings();
				})
			);
	}
}
