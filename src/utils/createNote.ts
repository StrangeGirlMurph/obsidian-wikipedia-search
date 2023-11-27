import { App, normalizePath, Notice } from "obsidian";

export async function createNoteInFolder(
	app: App,
	title: string,
	content: string,
	path: string
): Promise<string | null> {
	if (!(await app.vault.adapter.exists(path))) {
		new Notice(
			"Aborted! The folder you specified in the settings to create this new note in does not exist. Please visit the plugin settings and change the path!",
			15000
		);
		return null;
	}
	path = normalizePath(`${path}/${title}.md`);
	const file = app.vault.getAbstractFileByPath(path);

	if (file) {
		new Notice(`Aborted! '${path}' already exists.`);
		return null;
	}

	try {
		await app.vault.create(path, content);
		new Notice("New note created successfully.");
		return path;
	} catch (err) {
		new Notice("Error creating new note... Please check the console logs for more information.");
		console.error("Error creating new note:", err);
		return null;
	}
}
