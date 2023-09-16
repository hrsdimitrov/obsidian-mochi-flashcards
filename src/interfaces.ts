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

export interface MochiDeckItem {
	id: string;
	name: string;
	"parent-id"?: string;
	sort: number;
	"trashed?"?: boolean;
	"sort-by-direction"?: boolean;
	"show-sides?"?: boolean;
	"cards-view"?: boolean;
	"review-reverse?"?: boolean;
	"sort-by"?: string;
	"archived?"?: boolean;
}

export interface SimplifiedDeck {
	name: string;
	parentId?: string;
	id: string;
}
