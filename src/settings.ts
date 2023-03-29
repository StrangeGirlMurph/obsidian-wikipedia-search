import { App, PluginSettingTab, Setting } from "obsidian";
import { languages } from "./languages";
import WikipediaSearch from "./main";

export interface WikipediaSearchSettings {
  language: string;
  format: string;
}

export const DEFAULT_SETTINGS: WikipediaSearchSettings = {
  language: "en",
  format: "[{title}]({url})",
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

    new Setting(containerEl)
      .setName("Language")
      .setDesc("Wikipedia to search in. (type to search)")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions(languages)
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Format")
      .setDesc(
        "Format of the insert. ('{title}' and '{url}' will be replaced with the article title and URL)"
      )
      .addText((text) =>
        text
          .setPlaceholder("Format")
          .setValue(this.plugin.settings.format)
          .onChange(async (value) => {
            this.plugin.settings.format = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
