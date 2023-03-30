const fs = require('fs')
const path = require('path')
const utils = require('./utils.js')
const query = require('./query.js')
const core = require('@actions/core')
const github = require('@actions/github')


const getDiscussion = async function(token, dir) {
  const octokit = github.getOctokit(token)
  const graphqlWithAuth = octokit.graphql
  const payload = github.context.payload
  const nodeId = payload.discussion.node_id
  const data = await graphqlWithAuth(query.queryDiscussionByNode, {
    id: nodeId
  })
  const discussion = data.node


  let labels = []
  const labelCount = discussion.labels.totalCount
  if (labelCount > 0) {
    labels = discussion.labels.nodes.map(ele => {
      return ele.name
    })
  }

  const updateStr = discussion.lastEditedAt ? 'update: ' + discussion.lastEditedAt + '\n' : ''
  const labelsStr = (labelCount) ? 'labels: ["' + labels.join('","') + '"]\n' : ''

  const article = '---\n' +
    'title: ' + discussion.title + '\n' +
    'create: ' + discussion.createdAt + '\n' +
    updateStr +
    labelsStr +
    '---\n\n' +
    discussion.body

  const dirPath = path.resolve(dir)
  const filePath = path.join(dirPath, discussion.number + '.md')
  utils.isExitsMk(dirPath)
  try {
    fs.writeFileSync(filePath, article)
    core.info('[POKE|discussion.js]同步discussion#' + discussion.number + '成功')
  } catch (e) {
    core.setFailed('[POKE|discussion.js]' + e.toString())
  }
}

module.exports = {
  getDiscussion
}