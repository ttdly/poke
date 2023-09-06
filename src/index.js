const core = require('@actions/core')
const discussions = require('./discussions.js')

async function run() {
  try {
    const discussionDir = core.getInput('discussionDir')
    const pagesDir = core.getInput('pagesDir')
    const token = core.getInput('token')
    const homePage = core.getInput('homePage')
    await discussions.deal(token, discussionDir, pagesDir, homePage)
  } catch (error) {
    core.setFailed('[Poke]' + error.toString())
  }
}

run()
