import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import { DBData, PluginSettingsFields } from "./interfaces";
import PluginSettings, { DEFAULT_SETTINGS } from "./helperClasses/settings";
import { Low } from "lowdb";

// helper classes
import Flashcards from "./helperClasses/flashcards";
import Mochi from "./helperClasses/mochi";
import DBAdapter from "./helperClasses/db";
import Commands from "./helperClasses/commands";

export const dbName = "obsidian-mochi-plugin.db";
export const dbPath = ".obsidian/";

export default class ObsidianMochiPlugin extends Plugin {
	settings: PluginSettingsFields;
	flashcards: Flashcards;
	mochi: Mochi;
	db: Low<DBData>;
	commands: Commands;

	async onload() {
		await this.loadSettings();

		//initialize helper classes
		const adapter = new DBAdapter(this, dbPath, dbName);
		this.db = new Low(adapter, {});
		await this.db.read();

		this.flashcards = new Flashcards(this);
		this.mochi = new Mochi(this);
		this.commands = new Commands();

		// add commands
		this.addCommand(this.commands.addSingleLineFlashcard);

		// add events

		// add settings tabs
		this.addSettingTab(new PluginSettings(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
