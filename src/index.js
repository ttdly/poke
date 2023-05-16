const core = require('@actions/core')
const discussions = require('./discussions.js')

async function run() {
  try {
    const discussionDir = core.getInput('discussionDir')
    const pagesDir = core.getInput('pagesDir')
    const token = core.getInput('token')
    await discussions.getDiscussion(token, discussionDir, pagesDir)
  } catch (error) {
    core.setFailed('[Poke]' + error.toString())
  }
}

run()
