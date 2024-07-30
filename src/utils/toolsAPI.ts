import { requestUrl } from "obsidian";

export function sortResponsesByTitle(titles: string[], responses: unknown[]) {
	return responses.sort((a: any, b: any) => titles.indexOf(a.title) - titles.indexOf(b.title));
}

export function titlesToURLParameter(titles: string[]) {
	return titles.map((title) => encodeURIComponent(title)).join("|");
}

export async function fetchData(url: string): Promise<any> {
	const response = await requestUrl(url).catch((e) => {
		return null;
	});

	// Request failed
	if (!response) return null;

	// Request failed with status
	if (response.status !== 200) {
		return null;
	}

	try {
		return response.json;
	} catch (e) {
		// The page wasn't in JSON. There probably isn't an API in this language.
		return null;
	}
}
