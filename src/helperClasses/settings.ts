import ObsidianMochiPlugin from "src/main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { PluginSettingsFields } from "../interfaces";

export const DEFAULT_SETTINGS: PluginSettingsFields = {
	defaultDeckName: "Obsidian Flashcards",
	mochiAPIKey: "",
};

export default class PluginSettings extends PluginSettingTab {
	plugin: ObsidianMochiPlugin;

	constructor(app: App, plugin: ObsidianMochiPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", {
			text: "Mochi Settings",
		});

		new Setting(containerEl)
			.setName("Default Deck Name")
			.setDesc(
				"The name of the Mochi deck that flashcards without a specified deck will be applied to."
			)
			.addText((text) =>
				text
					.setPlaceholder("Obsidian Flashcards")
					.setValue(this.plugin.settings.defaultDeckName)
					.onChange(async (value) => {
						this.plugin.settings.defaultDeckName = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Mochi API Key")
			.setDesc(
				"You will need create a Mochi API Key from the application (Account Settings > API Keys) and paste it here so that the plugin can operate."
			)
			.addText((text) =>
				text
					.setPlaceholder("***********")
					.setValue(this.plugin.settings.mochiAPIKey)
					.onChange(async (value) => {
						this.plugin.settings.mochiAPIKey = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
