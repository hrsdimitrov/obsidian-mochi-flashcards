import ObsidianMochiPlugin from "src/main";

export default class Events {
	private plugin: ObsidianMochiPlugin;

	constructor(plugin: ObsidianMochiPlugin) {
		this.plugin = plugin;
	}

	onFileModify = () =>
		this.plugin.app.vault.on("modify", async (file) => {
			const currentFile = this.plugin.app.workspace.getActiveFile();
			if (currentFile === null) return;
			const markdown = await this.plugin.app.vault.read(currentFile);

			var newFlashcards =
				await this.plugin.flashcards.extractFlashcardsFromFile(
					currentFile.path,
					markdown
				);
			await this.plugin.flashcards.handleFlashcardsModification(
				currentFile.path,
				newFlashcards
			);

			console.log(this.plugin.db.data);
		});
}
