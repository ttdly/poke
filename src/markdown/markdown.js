const MarkdownIt = require('markdown-it')
const anchorPlugin = require('markdown-it-anchor')
const attrsPlugin = require('markdown-it-attrs')
const { preWrapperPlugin } = require('./preWrapper.js')
const { highlight } = require('./highlight.js')


const createMarkdownRenderer = async () => {
  const md = MarkdownIt({
    html: true,
    linkify: true,
    highlight:
      (await highlight(
        'vitesse-dark',
        [],
        '',
        {}
      ))
  })
  md.linkify.set({ fuzzyLink: false })
  md.use(preWrapperPlugin)
  md.use(attrsPlugin)
  md.use(anchorPlugin)

  return md
}

module.exports = {
  createMarkdownRenderer
}