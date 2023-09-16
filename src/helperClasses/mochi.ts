import ObsidianMochiPlugin from "src/main";
import { requestUrl, Notice } from "obsidian";
import { MochiDeckItem, SimplifiedDeck } from "src/interfaces";
export default class Mochi {
	private plugin: ObsidianMochiPlugin;

	constructor(plugin: ObsidianMochiPlugin) {
		this.plugin = plugin;
	}

	getAuthKey(mochiKey: string) {
		return "Basic " + Buffer.from(mochiKey + ":" + "").toString("base64");
	}

	getMarkdown(question: string, answer: string) {
		return question + "\n---\n" + answer;
	}

	async createDeck(deckName: string, parentId?: string) {
		try {
			var res = await requestUrl({
				url: "https://app.mochi.cards/api/decks",
				headers: {
					Authorization: this.getAuthKey(
						this.plugin.settings.mochiAPIKey
					),
					"Content-Type": "application/json",
				},
				body: JSON.stringify(
					parentId
						? {
								name: deckName,
								"parent-id": parentId,
						  }
						: { name: deckName }
				),
				method: "POST",
			});

			return res.json.id;
		} catch (e) {
			new Notice(
				"There was an error with the Mochi server when creating a deck"
			);
		}
	}

	async getAllDecks(
		decks?: SimplifiedDeck[],
		bookmark?: string
	): Promise<SimplifiedDeck[]> {
		var decksArr: SimplifiedDeck[] = [];
		if (decks) decksArr.push(...decks);
		var res;

		try {
			res = await requestUrl({
				url: bookmark
					? "https://app.mochi.cards/api/decks?bookmark=" + bookmark
					: "https://app.mochi.cards/api/decks",
				headers: {
					Authorization: this.getAuthKey(
						this.plugin.settings.mochiAPIKey
					),
					"Content-Type": "application/json",
				},
				method: "GET",
			});
		} catch (e) {
			console.log(e);
			new Notice(
				"There was an error with the Mochi server when creating a deck"
			);
			return [];
		}

		if (!res) return [];

		if (res.json.docs.length !== 0) {
			for (const doc of res.json.docs) {
				if (doc["trashed?"] === undefined) {
					if (doc["parent-id"]) {
						decksArr.push({
							name: doc.name,
							parentId: doc["parent-id"],
							id: doc.id,
						});
					} else {
						decksArr.push({
							name: doc.name,
							id: doc.id,
						});
					}
				}
			}
			return this.getAllDecks(decksArr, res.json.bookmark);
		}

		return decksArr;
	}

	async checkIfDeckExists(deckName: string, parentId?: string) {
		var decks: SimplifiedDeck[] = await this.getAllDecks();
		var id: string | null = null;

		for (const deck of decks) {
			if (deck.parentId && !parentId) continue;
			if (parentId && deck.parentId !== parentId) continue;

			if (deck.name === deckName) {
				id = deck.id;
				break;
			}
		}

		return id;
	}

	async getDeckId(deckName: string) {
		var deckNames = deckName.split("/").map((deckName) => {
			return { name: deckName, id: "" };
		});

		var i = 0;
		for (const deckName of deckNames) {
			var exists = await this.checkIfDeckExists(deckName.name);

			if (exists) {
				deckNames[i].id = exists;
			} else {
				if (i > 0) {
					deckNames[i].id = await this.createDeck(
						deckName.name,
						deckNames[i - 1].id
					);
				}

				deckNames[i].id = await this.createDeck(deckName.name);
			}

			i++;
		}

		return deckNames[deckNames.length - 1].id;
	}

	async createMochiFlashcard(
		deckName: string,
		question: string,
		answer: string
	) {
		var deckId = await this.getDeckId(deckName);
		var markdown = this.getMarkdown(question, answer);

		try {
			var res = await requestUrl({
				url: "https://app.mochi.cards/api/cards",
				headers: {
					Authorization: this.getAuthKey(
						this.plugin.settings.mochiAPIKey
					),
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ content: markdown, "deck-id": deckId }),
				method: "POST",
			});

			return res.json.id;
		} catch (e) {
			new Notice(
				"There was an error with the Mochi server when creating a flashcard."
			);
		}
	}

	async updateMochiFlashcard(
		mochiId: string,
		deckName: string,
		question: string,
		answer: string
	) {
		var deckId = await this.getDeckId(deckName);
		var markdown = this.getMarkdown(question, answer);

		try {
			var res = await requestUrl({
				url: "https://app.mochi.cards/api/cards/" + mochiId,
				headers: {
					Authorization: this.getAuthKey(
						this.plugin.settings.mochiAPIKey
					),
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ content: markdown, "deck-id": deckId }),
				method: "POST",
			});

			return res.json.id;
		} catch (e) {
			new Notice(
				"There was an error with the Mochi server when updating a flashcard."
			);
		}
	}
}
