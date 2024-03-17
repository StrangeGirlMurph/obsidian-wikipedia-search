import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Obsidian Wikipedia Search",
  description: "An Obsidian plugin to search, link and open Wikipedia articles directly from the app.",
  lang: 'en-US',
  base: '/obsidian-wikipedia-search/',
  
  themeConfig: {
    nav: [
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Settings', link: '/settings' },
      { text: 'Commands', link: '/commands' },
    ],
    outline: [2,3],
    sidebar: [
      {
        text: '',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: "Installation", link: '/installation' },
          { text: "Settings", link: '/settings' },
          { text: "Commands", link: '/commands' },
          { text: "Help", link: '/help' },
          { text: "Roadmap", link: '/roadmap' },
          { text: "Changelog", link: '/changelog' },
          { text: "Support", link: '/support' },
          { text: "License", link: '/license' },
          
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/StrangeGirlMurph/obsidian-wikipedia-search' }
    ],

    editLink: {
      pattern: 'https://github.com/StrangeGirlMurph/obsidian-wikipedia-search/edit/master/docs/:path'
    },

   
  }
})
