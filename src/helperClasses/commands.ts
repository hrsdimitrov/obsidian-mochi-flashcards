import { Editor, MarkdownView } from "obsidian";
import ObsidianMochiPlugin from "src/main";

export default class Commands {
	private plugin: ObsidianMochiPlugin;

	constructor(plugin: ObsidianMochiPlugin) {
		this.plugin = plugin;
	}

	addSingleLineFlashcard = {
		id: "add-single-line-flashcard",
		name: "Add a single-line flashcard",

		editorCallback: async (editor: Editor, view: MarkdownView) => {
			// get the markdown of the current file
			const currentFile = view.app.workspace.getActiveFile();
			if (currentFile === null) return;
			const markdown = await view.app.vault.read(currentFile);

			var id = await this.plugin.flashcards.generateFlashcardId();
			var deckName = await this.plugin.flashcards.extractDeckName(
				markdown
			);

			var flashcardContent = "(!#" + id + ") Question :: Answer";

			var selectionLine = editor.getLine(editor.getCursor().line);
			if (selectionLine.match(/\(!#\d*\)/) !== null) {
				flashcardContent = "\n" + flashcardContent;
			}

			editor.replaceSelection(flashcardContent);

			this.plugin.flashcards.createFlashcard(
				id,
				deckName,
				"Question",
				"Answer"
			);
		},
	};
}
