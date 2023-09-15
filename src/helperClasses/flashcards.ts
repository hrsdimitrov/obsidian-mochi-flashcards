import ObsidianMochiPlugin from "src/main";
import { Notice } from "obsidian";
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

	async extractFlashcardsFromFile(markdown: string) {
		var flashcards = [];
		var deckName = await this.extractDeckName(markdown);
		var markdownMatches = markdown.match(/\(!#\d*\).*/g);

		if (markdownMatches === null) return [];

		for (const flashcardMatch of markdownMatches) {
			var id, content;
			var idMatch = flashcardMatch.match(/(?<=\(!#)\d*/);
			var contentMatch = flashcardMatch.match(/(?<=\)).*/);

			if (idMatch === null || contentMatch === null) {
				new Notice(
					"An invalid flashcard was found in one of your files. It will not be added to the flashcards database."
				);
				continue;
			}

			id = parseInt(idMatch[0]);
			content = contentMatch[0];

			var splitContent = content.split("::");

			if (splitContent.length === 1) {
				new Notice(
					"An invalid flashcard was found in one of your files. It will not be added to the flashcards database."
				);
				continue;
			}

			var question = splitContent[0].trim();
			var answer = splitContent[1].trim();

			flashcards.push({
				id: id,
				deckName: deckName,
				question: question,
				answer: answer,
			});
		}

		return flashcards;
	}
}
