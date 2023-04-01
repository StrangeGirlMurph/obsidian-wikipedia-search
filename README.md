# Obsidian Wikipedia Search Plugin

An [Obsidian.md](https://obsidian.md/) plugin to quickly search for Wikipedia articles and link them in your notes.

## Key [Features](#features)

- Linking Wikipedia articles in all languages.
- Hyperlinking selected text.
- Pasting the articles extract.

## Table of contents

- [Installation](#installation)
  - [From the community plugins list](#from-the-community-plugins-list)
  - [Manual Installation](#manual-installation)
- [Usage](#usage)
  - [Getting Started](#getting-started)
  - [Features](#features)
- [Demo](#demo)
- [Questions \& Contributions](#questions--contributions)
- [License](#license)

## Installation

### From the community plugins list

Note: I am currently still waiting for the merge of my [PR](https://github.com/obsidianmd/obsidian-releases/pull/1764) for this plugin to be included in the community plugin list. For now you have to do a manual installation.

1. Search under the Community Plugins in the settings for it and click install.
2. Enable the plugin (from the installed plugin list).  
   <img src="https://user-images.githubusercontent.com/62220780/228493364-b4e8b3b1-e6df-4f8c-8d9b-db7f21e3099d.png" width=600 />

### Manual Installation

1. Create the directory `[path-to-vault]/.obsidian/plugins/wikipedia-search`.
2. Download the `main.js` and `mainfest.json` from the [latest release](https://github.com/StrangeGirlMurph/obsidian-wikipedia-search/releases) and put them in the created directory.
3. Enable the plugin.

## Usage

What I mean with "_search_" in the following:

- In editing view open the command pallet with `CTRL+P` and run `Search Articles`.
- (Start typing, select one of the options and watch the magic happen and the link appear.)

### Getting Started

1. Install the plugin and enable it.
2. Set your language and format in the settings.
3. Start _searching_ :)

### Features

- Basic links  
   Just _search_ from somewhere in your file.
- Hyperlinking  
   Select some text and _search_. The selected text will replace the `{title}` in your format.
- Search different languages  
   In the _search_ bar start with a valid Wikipedia language code followed by a semicolon (e.g. `da:albert einstein`). This will let you search a different Wikipedia than your default. (spaces don't matter)
- Include the articles extract (the first paragraph)  
   Add `{extract}` somewhere in your format in the settings. This will be replaced with the articles extract. (Note: It can be pretty long!)

## Demo

Note: OBS didn't record the overlay dropdown menu in the settings. It's there when you use it. I promise :)

<img src="https://user-images.githubusercontent.com/62220780/229159785-a2d462d6-1bb6-41ed-90a8-e5928f64d9f9.mp4" />

## Questions & Contributions

Feel free to ask me and the community if you have and questions in the [discussion tab](https://github.com/StrangeGirlMurph/obsidian-wikipedia-search/discussions).

If you want to contribute you can do that but creating issues and creating pull requests :)

## License

This project is licensed under the [Humane Software License](https://github.com/StrangeGirlMurph/The-Humane-Software-License) see [LICENSE](LICENSE).
