import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { languages } from "./languages";
import WikipediaSearch from "./main";

export interface WikipediaSearchSettings {
	language: string;
	format: string;
	cursorAfter: boolean;
}

export const DEFAULT_SETTINGS: WikipediaSearchSettings = {
	language: "en",
	format: "[{title}]({url})",
	cursorAfter: false,
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
				"Format of the insert. (all '{title}', '{url}' and '{extract}' will be replaced with the selection/the articles title, URL and extract respectively)"
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
			.setDesc("Whether the cursor is placed infront of the insert instead of after it.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.cursorAfter).onChange(async (value) => {
					this.plugin.settings.cursorAfter = value;
					await this.plugin.saveSettings();
				})
			);
	}
}
