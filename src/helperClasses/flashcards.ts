import ObsidianMochiPlugin from "src/main";

export default class Flashcards {
	private plugin: ObsidianMochiPlugin;

	constructor(plugin: ObsidianMochiPlugin) {
		this.plugin = plugin;
	}

	async extractDeckName(markdown: string) {
		await this.plugin.loadData();
		const deckName = this.plugin.settings.defaultDeckName;

		var customDeckName = markdown.match(/(?<=f-deck:).*/);
		if (customDeckName === null) return deckName;

		return customDeckName[0];
	}

	async createFlashcard(
		id: number,
		deckName: string,
		question: string,
		answer: string
	) {
		this.plugin.db.data.flashcards.push({
			mochiId: "",
			id: id,
			deckName: deckName,
			question: question,
			answer: answer,
		});
		this.plugin.db.data.ids.push(id);

		await this.plugin.db.write();
		await this.sortIds();
		await this.plugin.db.read();
	}

	async sortIds() {
		await this.plugin.db.read();

		const idsArray = [...this.plugin.db.data.ids];
		idsArray.sort((a, b) => a - b);

		this.plugin.db.data.ids = idsArray;

		await this.plugin.db.write();
	}

	async generateFlashcardId() {
		await this.plugin.db.read();

		var idsArray = [...this.plugin.db.data.ids];
		var id = 1;

		for (var i = 0; i < idsArray.length; i++) {
			if (i === 0 && idsArray[0] > 1) {
				id = idsArray[0] - 1;
				break;
			}

			if (i === idsArray.length - 1) {
				id = idsArray[i] + 1;
				break;
			}

			if (idsArray[i] !== idsArray[i + 1] - 1) {
				id = idsArray[i] + 1;
				break;
			}
		}

		return id;
	}
}
