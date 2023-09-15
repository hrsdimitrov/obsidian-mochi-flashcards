export interface PluginSettingsFields {
	mochiAPIKey: string;
	defaultDeckName: string;
}

export interface ExtractedFlashcard {
	id: number;
	filePath: string;
	deckName: string;
	question: string;
	answer: string;
}

export interface Flashcard {
	id: number;
	filePath: string;
	mochiId: string;
	deckName: string;
	question: string;
	answer: string;
}

export interface DBData {
	flashcards: Flashcard[];
	ids: number[];
}
