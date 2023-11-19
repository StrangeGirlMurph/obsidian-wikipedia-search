A list of all the available settings including detailed explanations for each one.

## General settings
### Language
Select the default Wikipedia (as in language of the Wikipedia) to search. See [languages.ts](https://github.com/StrangeGirlMurph/obsidian-wikipedia-search/blob/master/src/utils/languages.ts) for a list of all available languages.
Note: Some features might not work with all languages. (Some APIs might not have all the necessary functionality.)

Default: `en - English`

### Search limit
The maximum number of search results to return and show for any given query. The value must be between (and including) 1 and 500 and a number. Otherwise the last valid value will be kept.

Default: `10`

### Thumbnail width
The width of the inserted thumbnails in pixels. Leave this field empty to use the original size. Any other input must be a valid number. Otherwise the last valid value will be kept. The width will be inserted into the thumbnail embed like this: `![... Thumbnail | <thumbnailWidth>](...)`. The `|` followed by the width tells obsidian to show that image with the specified width.

Default: `‎` (empty)

### Default note path
The default vault folder where articles notes should be created. This only gets used when there is a template which creates notes and it's custom path empty i.e. not set.

Default: `/` (the root folder)

## Template settings
Each user has a list of templates for the inserts that this plugin creates when linking articles. "Linking" in this context might be a bit misdirecting though given the fact that this plugin can do more than just link the article with a url. The templates can be separated into one default template and multiple additional templates. Templates can be deleted with the `-` button at the end. The default template can't be deleted.

The settings for a template can be separated into the following three parts:

*Note: You can only have up to 20 templates. It's a limitation that isn't really justified. I just thought adding this would be a good idea for your own good. If you need more than 20 leave a message.*

### Template name
The first field of each template sets the name of the template.The name of the default template can't be changed (that's why that field is disabled) while the additional templates can have any name.

Default: `Additional Template`

### Creates note & Custom note path
The middle part of a templates settings is all about note creation. It consist of a toggle and a text field that appears when the toggle in the "on" state. The toggle controls whether or not the template should create a new note with the articles title as its name, paste the insert in there and link the newly created note instead of directly pasting the insert into the current note. This allows for creating notes for wikipedia articles. We call templates that create new notes "note templates" and templates that doesn't "inline templates".

By default all the notes will be created at the [default note path](#default-note-path). The appearing text field lets you customize the location for any given template. Leave it empty to use the default note path.

Default: `false` for the toggle (inline) and `‎` (empty) for the custom note path

### Template string
The last and most important part of any template is its template string. You can edit it over the big text field at the end. The template string is the blueprint for the insert. It can be any kind of string containing line breaks. The plugin recognizes the following character sequences and replaces all occurrences with the following:

- `{title}` The articles title or current selection (based on [this setting](#use-article-title-instead-of-selection)).
- `{description}` The articles description if available. If not all occurrences will be removed with a notice. 
- `{url}` The url of the Wikipedia article.
- `{language}` The name of the language of this article.
- `{languageCode}` The language code of the language of this article. 
- `{intro}` The articles intro (the first big paragraph). *Note: It can be pretty long!*
- `{thumbnail}` An embed to the articles thumbnail if available. If not all occurrences will be removed with a notice. This will look like `![{title} Thumbnail](<url-to-thumbnail>)` or `![{title} Thumbnail | <thumbnail-width>](<url-to-thumbnail>)` if the [thumbnail width](#thumbnail-width) is set. 

Default: `[{title}]({url})` for inline templates and `{thumbnail}\n[{title}]({url}): {intro}` for note templates

## Workflow optimization settings
### Cursor placement
Whether or not the cursor is placed infront of the insert instead of after it. For longer inserts it might make it easier to keep the cursor at the start of the insert.

Default: `false`

### Auto-select single response queries
Whether or not to automatically select the response to a query when there is only one article to choose from. For example when you select someones name and want to hyperlink it to the persons Wikipedia article this feature will automatically select the article when there is only one article related to that name. 

Default: `false`

### Use article title instead of selection
Whether or not to use the articles title instead of the selected text for the '{title}' parameter of your template when hyperlinking.

Default: `false`

### Stop auto-cleanup of intros
Whether or not to stop auto-cleaning the articles intros for better readability. Many articles intros and mostly intros that contain any math are very poorly formatted the way the Wikipedia API returns them in plain-text. For example the intro of the [Total order](https://en.wikipedia.org/w/api.php?format=json&redirects=1&action=query&prop=extracts&exintro&explaintext&titles=Total%20order) with lots of weirdly placed empty spaces and linebreakes. Therefor every response gets cleaned up a bit for better readability with the following code:
```ts
intro.replaceAll("\\displaystyle ", "") // removes all occurrences of '\displaystyle'
    .replaceAll("\n", "")       // removes all line breaks
    .replaceAll(/  +/g, " ")    // reduces all spaces to a single space
    .replaceAll(/\.\w/g, (e: string) => e.split("").join(" "));   // adds a space between any dot directly followed by a letter
```

<details>
  <summary>Example</summary>
  
  <pre style="white-space:pre-wrap;">In mathematics, a total order or linear order is a partial order in which any two elements are comparable.  That is, a total order is a binary relation \n  \n    \n      \n        ≤\n      \n    \n    {\\displaystyle \\leq }\n   on some set \n  \n    \n      \n        X\n      \n    \n    {\\displaystyle X}\n  , which satisfies the following for all \n  \n    \n      \n        a\n        ,\n        b\n      \n    \n    {\\displaystyle a,b}\n   and \n  \n    \n      \n        c\n      \n    \n    {\\displaystyle c}\n   in \n  \n    \n      \n        X\n      \n    \n    {\\displaystyle X}\n  :\n\n  \n    \n      \n        a\n        ≤\n        a\n      \n    \n    {\\displaystyle a\\leq a}\n   (reflexive).\nIf \n  \n    \n      \n        a\n        ≤\n        b\n      \n    \n    {\\displaystyle a\\leq b}\n   and \n  \n    \n      \n        b\n        ≤\n        c\n      \n    \n    {\\displaystyle b\\leq c}\n   then \n  \n    \n      \n        a\n        ≤\n        c\n      \n    \n    {\\displaystyle a\\leq c}\n   (transitive).\nIf \n  \n    \n      \n        a\n        ≤\n        b\n      \n    \n    {\\displaystyle a\\leq b}\n   and \n  \n    \n      \n        b\n        ≤\n        a\n      \n    \n    {\\displaystyle b\\leq a}\n   then \n  \n    \n      \n        a\n        =\n        b\n      \n    \n    {\\displaystyle a=b}\n   (antisymmetric).\n\n  \n    \n      \n        a\n        ≤\n        b\n      \n    \n    {\\displaystyle a\\leq b}\n   or \n  \n    \n      \n        b\n        ≤\n        a\n      \n    \n    {\\displaystyle b\\leq a}\n   (strongly connected, formerly called total).Reflexivity (1.) already follows from connectedness (4.), but is required explicitly by many authors nevertheless, to indicate the kinship to partial orders.\nTotal orders are sometimes also called simple, connex, or full orders.A set equipped with a total order is a totally ordered set; the terms simply ordered set, linearly ordered set, and loset are also used. The term chain is sometimes defined as a synonym of totally ordered set, but refers generally to some sort of totally ordered subsets of a given partially ordered set.\nAn extension of a given partial order to a total order is called a linear extension of that partial order.</pre>
  
  gets turned into

  <pre style="white-space:pre-wrap;">In mathematics, a total order or linear order is a partial order in which any two elements are comparable. That is, a total order is a binary relation ≤ {\\leq } on some set X {X} , which satisfies the following for all a , b {a,b} and c {c} in X {X} : a ≤ a {a\\leq a} (reflexive). If a ≤ b {a\\leq b} and b ≤ c {b\\leq c} then a ≤ c {a\\leq c} (transitive). If a ≤ b {a\\leq b} and b ≤ a {b\\leq a} then a = b {a=b} (antisymmetric). a ≤ b {a\\leq b} or b ≤ a {b\\leq a} (strongly connected, formerly called total). Reflexivity (1.) already follows from connectedness (4.), but is required explicitly by many authors nevertheless, to indicate the kinship to partial orders. Total orders are sometimes also called simple, connex, or full orders. A set equipped with a total order is a totally ordered set; the terms simply ordered set, linearly ordered set, and loset are also used. The term chain is sometimes defined as a synonym of totally ordered set, but refers generally to some sort of totally ordered subsets of a given partially ordered set. An extension of a given partial order to a total order is called a linear extension of that partial order.</pre>
  
</details>

Default: `false`

### Open article in browser
Whether or not to always open articles in the browser instead of in-app even if the Surfing plugin is installed and enabled.

Default: `false`

### Article tab placement
Whether or not to open articles in a fullscreen tab instead of a split view when using the Surfing plugin to open the articles directly in Obsidian.

Default: `false`