const preWrapperPlugin = function preWrapperPlugin(md) {
  const fence = md.renderer.rules.fence ? md.renderer.rules.fence :
    md.renderer.rules.fence = (...args) => {
      const [tokens, idx] = args
      const token = tokens[idx]
      // remove title from info
      token.info = token.info.replace(/\[.*\]/, '')

      const lang = extractLang(token.info)
      const rawCode = fence(...args)
      return `<div class='language-${lang}${
        / active( |$)/.test(token.info) ? ' active' : ''
      }'><button title='Copy Code' class='copy'></button><span class='lang'>${lang}</span>${rawCode}</div>`
    }
}

const extractTitle = function(info) {
  let matcher = info.match(/\[(.*)\]/)
  if (matcher) {
    matcher = matcher[1]
  }
  return matcher || extractLang(info) || 'txt'
}

const extractLang = (info) => {
  return info
    .trim()
    .replace(/:(no-)?line-numbers({| |$).*/, '')
    .replace(/(-vue|{| ).*$/, '')
    .replace(/^vue-html$/, 'template')
}

module.exports = {
  preWrapperPlugin,
  extractTitle
}