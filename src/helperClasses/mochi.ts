import ObsidianMochiPlugin from "src/main";
import { requestUrl, Notice } from "obsidian";
export default class Mochi {
	private plugin: ObsidianMochiPlugin;

	constructor(plugin: ObsidianMochiPlugin) {
		this.plugin = plugin;
	}

	getAuthKey(mochiKey: string) {
		return "Basic " + Buffer.from(mochiKey + ":" + "").toString("base64");
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
}
