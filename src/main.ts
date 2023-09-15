import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import { DBData, PluginSettingsFields } from "./interfaces";
import PluginSettings, { DEFAULT_SETTINGS } from "./helperClasses/settings";
import Flashcards from "./helperClasses/flashcards";
import Mochi from "./helperClasses/mochi";
import DBAdapter from "./helperClasses/db";
import { Low } from "lowdb";

export const dbName = "obsidian-mochi-plugin.db";
export const dbPath = ".obsidian/";

export default class ObsidianMochiPlugin extends Plugin {
	settings: PluginSettingsFields;
	flashcards: Flashcards;
	mochi: Mochi;
	db: Low<DBData>;

	async onload() {
		await this.loadSettings();

		//initialize helper classes
		const adapter = new DBAdapter(this, dbPath, dbName);
		this.db = new Low(adapter, {});
		await this.db.read();

		this.flashcards = new Flashcards(this);
		this.mochi = new Mochi(this);

		// add commands
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});

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
