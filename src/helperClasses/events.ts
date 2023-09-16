import ObsidianMochiPlugin from "src/main";
import Flashcards from "./flashcards";

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
			await this.plugin.db.read();
			console.log(this.plugin.db.data);
		});

	onFileDelete = () => {
		this.plugin.app.vault.on("delete", async (file) => {
			for (const flashcard of this.plugin.db.data.flashcards) {
				if (flashcard.filePath === file.path) {
					await this.plugin.flashcards.deleteFlashcard(flashcard.id);
				}
			}

			console.log(this.plugin.db.data);
		});
	};
}
