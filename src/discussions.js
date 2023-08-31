const fs = require('fs')
const path = require('path')
const utils = require('./utils.js')
const query = require('./query.js')
const core = require('@actions/core')
const github = require('@actions/github')
const page = require('./pages.js')

const deal = async function (token, posts, pages) {
  let discussion
  const octokit = github.getOctokit(token)
  const graphqlWithAuth = octokit.graphql
  const payload = github.context.payload
  const action = payload.action
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

  if (action === 'created' || action === 'edited' || action === 'unlocked') {
    await getDiscussion(posts, pages, labels, labelCount, discussion)
  } else if (action === 'locked') {
    page.lockPosts(labels, posts, pages, discussion)
  }
}
/**
 * 同步discussion
 * @param posts 文档存储路径
 * @param pages 标签文件存储路径
 * @param labels 标签
 * @param labelCount 标签数
 * @param discussion 文章对象
 * @returns null
 */
const getDiscussion = function (posts, pages, labels, labelCount, discussion) {
  page.createLabelListPage(pages, labels)
  page.createLabelPage(pages, labels, discussion, posts)
  page.createHomePage(discussion, posts)
  const updateStr = discussion.lastEditedAt ? 'update: ' + discussion.lastEditedAt + '\n' : ''
  const labelsStr = labelCount ? 'labels: ["' + labels.join('","') + '"]\n' : ''
  const article =
    '---\n' +
    'title: ' +
    discussion.title +
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
    discussion.body
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
  deal
}
