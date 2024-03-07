// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes

import { TAbstractFile, TFolder } from "obsidian";
import { TextInputSuggest } from "./suggest";
import { createNoteInActiveNotesFolderMarker } from "../createNote";

export class FolderSuggest extends TextInputSuggest<string> {
	getSuggestions(inputStr: string): string[] {
		const abstractFiles = this.app.vault.getAllLoadedFiles();
		const folders: string[] = [];
		const lowerCaseInputStr = inputStr.toLowerCase();

		folders.push(createNoteInActiveNotesFolderMarker);

		abstractFiles.forEach((folder: TAbstractFile) => {
			if (folder instanceof TFolder) {
				const path = folder.path === "/" ? "/" : "/" + folder.path;
				if (path.toLowerCase().contains(lowerCaseInputStr)) {
					folders.push(path);
				}
			}
		});
		
		folders.sort((a, b) => a.localeCompare(b) )

		return folders;
	}

	renderSuggestion(folderPath: string, el: HTMLElement): void {
		el.setText(folderPath);
	}

	selectSuggestion(folderPath: string): void {
		this.inputEl.value = folderPath;
		this.inputEl.trigger("input");
		this.close();
	}
}
