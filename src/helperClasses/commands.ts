import { Editor, MarkdownView } from "obsidian";

export default class Commands {
	addSingleLineFlashcard = {
		id: "add-single-line-flashcard",
		name: "Add a single-line flashcard",
		editorCallback: (editor: Editor, view: MarkdownView) => {
			editor.replaceSelection("(!#) Question :: Answer ");
		},
	};
}
