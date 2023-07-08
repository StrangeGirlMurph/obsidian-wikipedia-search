# Obsidian Wikipedia Search Plugin

An [Obsidian.md](https://obsidian.md/) plugin to quickly search for Wikipedia articles and link them in your notes.

*Don't worry about this project being "inactive". It's not inactive. It's done :)  
(at least until there aren't any new feature requests)*

## Key [Features](#features)

- Linking Wikipedia articles in all languages.
- Hyperlinking selected text.
- Pasting the articles extract.
- Using different templates for the insert.

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

1. Search under the Community Plugins in the settings for it and click install.
2. Enable the plugin (from the installed plugin list).  
   <img src="https://github.com/StrangeGirlMurph/obsidian-wikipedia-search/assets/62220780/c99cc357-a4cd-41fb-8dbb-58a37b9e32b4" width=600 />

### Manual Installation

1. Create the directory `[path-to-vault]/.obsidian/plugins/wikipedia-search`.
2. Download the `main.js` and `mainfest.json` from the [latest release](https://github.com/StrangeGirlMurph/obsidian-wikipedia-search/releases) and put them in the created directory.
3. Enable the plugin.

## Usage

What I mean with "*search*" in the following:

- In editing view open the command pallet with `CTRL+P` (that's the default hotkey) and run `Search Articles`.
- (Start typing, select one of the options and watch the magic happen and the link appear.)

### Getting Started

1. Install the plugin and enable it.
2. Set your language and the template for the insert in the settings.
3. Start *searching* :)

### Features

- Basic links  
   Just *search* from somewhere in your file.
- Hyperlinking  
   Select some text and *search*. The selected text will replace the `{title}` in your template (can be changed with a setting).
- Search different languages  
   In the *search* bar start with a valid Wikipedia language code followed by a semicolon (e.g. `da:albert einstein`). This will let you search articles in all kinds of languages. (spaces don't matter)
- Include the articles extract (the first paragraph)  
   Add `{extract}` somewhere in your template(s) in the settings. This will be replaced with the articles extract. (Note: It can be pretty long!)
- Multiple templates  
   Add multiple template options in the settings and dynamically select the one you want for your specific use case.
- Small workflow optimization settings  
   Go through the settings to optimize the plugin for your specific workflow.
  
## [Demo](https://user-images.githubusercontent.com/62220780/233829525-08684f49-31be-4064-a14c-cec9c0f671d8.mp4)

**Not up to date!**

Note: OBS didn't record the overlay dropdown menu in the settings. It's there when you use it. I promise :)

<img src="https://user-images.githubusercontent.com/62220780/233829525-08684f49-31be-4064-a14c-cec9c0f671d8.mp4" />

## Settings

The available settings and their default values:

<img src="https://github.com/StrangeGirlMurph/obsidian-wikipedia-search/assets/62220780/d112577b-2175-4e8d-86d2-bbf4d8e2ef41" width=600 />

## Questions & Contributions

Feel free to ask me and the community if you have and questions in the [discussion tab](https://github.com/StrangeGirlMurph/obsidian-wikipedia-search/discussions).
I am happy to hear your feature requests! Just create an issue if you have a good idea.

If you want to contribute you can do that but creating issues and creating pull requests :)

## License

This project is licensed under the [Humane Software License](https://github.com/StrangeGirlMurph/The-Humane-Software-License) see [LICENSE](LICENSE).
