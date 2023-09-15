import ObsidianMochiPlugin from "src/main";
import { Notice } from "obsidian";
import { DBData } from "../interfaces";

export default class DBAdapter {
	private plugin: ObsidianMochiPlugin;
	private basePath: string;
	private fileName: string;

	constructor(
		plugin: ObsidianMochiPlugin,
		basePath: string,
		fileName: string
	) {
		this.plugin = plugin;
		this.basePath = basePath;
		this.fileName = fileName;
	}

	async read() {
		try {
			const filePath = this.basePath + this.fileName;

			if (await this.plugin.app.vault.adapter.exists(filePath)) {
				const data = await this.plugin.app.vault.adapter.read(filePath);
				return JSON.parse(data);
			}

			return { flashcards: [], ids: [] } as DBData;
		} catch (error) {
			new Notice(`There was an error reading local database.`);
		}
	}

	async write(data: any) {
		const filePath = this.basePath + this.fileName;
		const content = JSON.stringify(data);
		await this.plugin.app.vault.adapter.write(filePath, content);
	}
}
