const fs = require('fs')
const path = require('path')
const utils = require('./utils.js')
const query = require('./query.js')
const core = require('@actions/core')
const github = require('@actions/github')

const baseAvatar = 'https://avatars.githubusercontent.com/u/'

const dealReplies = function(nodes) {
  const replies = []
  nodes.forEach(elem => {
    replies.push({
      author: elem.author.login,
      avatar: elem.author.avatarUrl.replace(baseAvatar, ''),
      role: elem.authorAssociation,
      body: elem.body,
      create: elem.createdAt
    })
  })
  return replies
}
const getComments = async function(token, dir) {
  const payload = github.context.payload
  const nodeId = payload.comment.node_id
  const disId = payload.discussion.number
  const octokit = github.getOctokit(token)
  const graphqlWithAuth = octokit.graphql

  let convertedComment
  const data = await graphqlWithAuth(query.queryCommentByNode, {
    id: nodeId
  })
  const comment = data.node
  convertedComment = {
    author: comment.author.login,
    avatar: comment.author.avatarUrl.replace(baseAvatar, ''),
    role: comment.authorAssociation,
    body: comment.body,
    create: comment.createdAt,
    replies: dealReplies(comment.replies.nodes)
  }
  console.log(JSON.stringify(convertedComment))
  const rootDir = path.resolve(dir)
  const commentsDir = path.join(rootDir, ...['comments', String(disId)])
  const filePath = path.join(commentsDir, `${nodeId}.json`)
  utils.isExitsMk(commentsDir)
  try {
    fs.writeFileSync(filePath, JSON.stringify(convertedComment))
    core.info('[POKE|comments.js]同步comment(' + nodeId + ')成功')
  } catch (e) {
    core.setFailed('[POKE|comments.js]同步失败comments(' + nodeId + ')' + e.toString())
  }
}

module.exports = {
  getComments
}