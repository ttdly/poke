const fs = require('fs')
const path = require('path')
const utils = require('./utils.js')
const query = require('./query.js')
const core = require('@actions/core')
const github = require('@actions/github')
const panGu = require('pangu')
const page = require('./pages.js')

let discussion = {
  labels: {
    totalCount: 0
  },
  lastEditedAt: '',
  createdAt: '',
  number: 0,
  title: '',
  comments: {
    totalCount: 0
  }
}
const getDiscussion = async function (token, posts, pages) {
  const octokit = github.getOctokit(token)
  const graphqlWithAuth = octokit.graphql
  const payload = github.context.payload
  const nodeId = payload.discussion.node_id
  const data = await graphqlWithAuth(query.queryDiscussionByNode, {
    id: nodeId
  })
  discussion = data.node

  let labels = []
  const labelCount = discussion.labels.totalCount
  if (labelCount > 0) {
    labels = discussion.labels.nodes.map(ele => {
      return ele.name
    })
  }
  page.createLabelListPage(pages,labels);
  page.createLabelPage(pages, labels, discussion, posts)
  page.createHomePage(discussion,posts)
  const updateStr = discussion.lastEditedAt ? 'update: ' + discussion.lastEditedAt + '\n' : ''
  const labelsStr = labelCount ? 'labels: ["' + labels.join('","') + '"]\n' : ''
  const bodyWithPanGu = panGu.spacing(discussion.body)

  const article =
    '---\n' +
    'title: ' +
    panGu.spacing(discussion.title) +
    '\n' +
    'create: ' +
    discussion.createdAt +
    '\n' +
    updateStr +
    labelsStr +
    'comments: ' +
    discussion.comments.totalCount +
    '\n' +
    '---\n\n' +
    bodyWithPanGu

  const dirPath = path.resolve(posts)
  const filePath = path.join(dirPath, discussion.number + '.md')
  utils.isExitsMk(dirPath)
  try {
    fs.writeFileSync(filePath, article)
    core.info('[POKE|discussion.js]同步 discussion #' + discussion.number + ' 成功')
  } catch (e) {
    core.setFailed('[POKE|discussion.js]' + e.toString())
  }
}

module.exports = {
  getDiscussion
}
