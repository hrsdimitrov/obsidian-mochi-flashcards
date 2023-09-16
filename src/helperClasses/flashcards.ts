import ObsidianMochiPlugin from "src/main";
import {  ExtractedFlashcard } from "src/interfaces";
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
		filePath: string,
		deckName: string,
		question: string,
		answer: string
	) {
		var mochiId = await this.plugin.mochi.createMochiFlashcard(
			deckName,
			question,
			answer
		);

		this.plugin.db.data.flashcards.push({
			mochiId: mochiId,
			filePath: filePath,
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

	async updateFlashcard(
		id: number,
		deckName: string,
		question: string,
		answer: string
	) {
		// update db instance
		await this.plugin.db.read();

		var flashcardIndex = this.plugin.db.data.flashcards.findIndex(
			(flashcard) => (flashcard.id = id)
		);

		this.plugin.db.data.flashcards[flashcardIndex].deckName = deckName;
		this.plugin.db.data.flashcards[flashcardIndex].question = question;
		this.plugin.db.data.flashcards[flashcardIndex].answer = answer;

		//update mochi instance
		var mochiId = this.plugin.db.data.flashcards[flashcardIndex].mochiId;
		await this.plugin.mochi.updateMochiFlashcard(
			mochiId,
			deckName,
			question,
			answer
		);

		await this.plugin.db.write();
		await this.plugin.db.read();
	}

	async deleteFlashcard(id: number) {
		await this.plugin.db.read();

		var flashcardIndex = this.plugin.db.data.flashcards.findIndex(
			(flashcard) => (flashcard.id = id)
		);

		var mochiId = this.plugin.db.data.flashcards[flashcardIndex].mochiId;
		await this.plugin.mochi.deleteMochiFlashcard(mochiId);

		this.plugin.db.data.flashcards.splice(flashcardIndex, 1);

		var idsIndex = this.plugin.db.data.ids.findIndex(
			(idItem) => idItem === id
		);
		this.plugin.db.data.ids.splice(idsIndex, 1);

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

	async extractFlashcardsFromFile(filePath: string, markdown: string) {
		var flashcards: ExtractedFlashcard[] = [];
		var deckName = await this.extractDeckName(markdown);
		var markdownMatches = markdown.match(/\(!#\d+\).*::.*/g);

		if (markdownMatches === null) return [];

		for (const flashcardMatch of markdownMatches) {
			var id, content;
			var idMatch = flashcardMatch.match(/(?<=\(!#)\d*/);
			var contentMatch = flashcardMatch.match(/(?<=\)).*/);

			if (idMatch === null || contentMatch === null) continue;

			id = parseInt(idMatch[0]);
			content = contentMatch[0];

			var splitContent = content.split("::");

			var question = splitContent[0].trim();
			var answer = splitContent[1].trim();

			flashcards.push({
				id: id,
				filePath: filePath,
				deckName: deckName,
				question: question,
				answer: answer,
			});
		}

		return flashcards;
	}

	async handleFlashcardsModification(
		filePath: string,
		newFlashcards: ExtractedFlashcard[]
	) {
		await this.plugin.db.read();
		var oldFlashcards = [...this.plugin.db.data.flashcards];
		oldFlashcards = oldFlashcards.filter(
			(flashcard) => flashcard.filePath === filePath
		);

		for (const oldFlashcard of oldFlashcards) {
			var found = false;
			var changedFlashcard: ExtractedFlashcard | undefined = undefined;

			for (const newFlashcard of newFlashcards) {
				if (oldFlashcard.id == newFlashcard.id) {
					found = true;
				}

				if (
					oldFlashcard.deckName !== newFlashcard.deckName ||
					oldFlashcard.question !== newFlashcard.question ||
					oldFlashcard.answer !== newFlashcard.answer
				) {
					changedFlashcard = newFlashcard;
				}
			}

			if (!found) {
				await this.deleteFlashcard(oldFlashcard.id);
			}

			if (changedFlashcard !== undefined) {
				await this.updateFlashcard(
					changedFlashcard.id,
					changedFlashcard.deckName,
					changedFlashcard.question,
					changedFlashcard.answer
				);
			}
		}
	}
}
