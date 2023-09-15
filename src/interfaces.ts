export interface PluginSettingsFields {
	mochiAPIKey: string;
	defaultDeckName: string;
}

export interface Flashcard {
    id: number;
    mochiId: string;
    deckName: string;
    question: string;
    answer: string;
}

export interface DBData {
    flashcards: Flashcard[];
    ids: number[];
}