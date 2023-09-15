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
			var id = await this.plugin.flashcards.generateFlashcardId();

			editor.replaceSelection("(!#" + id + ") Question :: Answer ");
		},
	};
}
