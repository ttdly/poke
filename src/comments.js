const fs = require('fs')
const path = require('path')
const utils = require('./utils.js')
const query = require('./query.js')
const core = require('@actions/core')
const github = require('@actions/github')
const { createMarkdownRenderer } = require('./markdown/markdown.js')

const baseAvatar = 'https://avatars.githubusercontent.com/u/'
const failed = function(nodeId, e) {
  core.setFailed('[POKE|comments.js]同步失败comments(' + nodeId + ')' + e.toString())
}
/**
 * 处理回复数据
 * @param nodes
 * @returns {*[]}
 */
const dealReplies = function(nodes, md) {
  const replies = []
  for (const elem of nodes) {
    replies.push({
      author: elem.author.login,
      avatar: elem.author.avatarUrl.replace(baseAvatar, ''),
      role: elem.authorAssociation,
      body: md.render(elem.body, {}),
      create: elem.createdAt
    })
  }
  return replies
}
const saveComment = function(dir, disId, nodeId, comment) {
  const rootDir = path.resolve(dir)
  const commentsDir = path.join(rootDir, ...['comments', String(disId)])
  const mapPath = path.join(commentsDir, 'map.json')
  let commentMap = {
    total: 0,
    page: 1,
    count: 1,
    sourceMap: {}
  }
  utils.isExitsMk(commentsDir)
  // 不存在映射图的时候说明啥也没有
  if (!fs.existsSync(mapPath)) {
    try {
      fs.writeFileSync(mapPath, JSON.stringify(commentMap))
      fs.writeFileSync(path.join(commentsDir, '1.json'), JSON.stringify([{}]))
    } catch (e) {
      failed(nodeId, e)
    }
  }
  // 读取映射图
  commentMap = JSON.parse(fs.readFileSync(mapPath, { encoding: 'utf-8' }))
  // 判断是否需要再加一页22为分界，实际上一页有效数据为20
  if (commentMap.count === 20) {
    try {
      const page = ++commentMap.page
      commentMap.count = 1
      // 新增页
      fs.writeFileSync(path.join(commentsDir, `${page}.json`), JSON.stringify([{}]))
    } catch (e) {
      failed(nodeId, e)
    }
  }
  try {
    // 读取页数据
    const pageRaw = fs.readFileSync(path.join(commentsDir, `${commentMap.page}.json`), { encoding: 'utf-8' })
    // 将新数据加入
    const newPage = pageRaw.substring(0, pageRaw.length - 1) + `,${comment}]`
    // 更新映射图
    commentMap.sourceMap[nodeId] = `${commentMap.page}:${commentMap.count}`
    commentMap.count++
    // 写回数据
    fs.writeFileSync(mapPath, JSON.stringify(commentMap))
    fs.writeFileSync(path.join(commentsDir, `${commentMap.page}.json`), newPage)
    core.info('[POKE|comments.js]同步comment(' + nodeId + ')成功')
  } catch (e) {
    failed(nodeId, e)
  }
}
const getComments = async function(token, dir) {
  const md = await createMarkdownRenderer()
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
    body: md.render(comment.body, {}),
    create: comment.createdAt,
    replies: dealReplies(comment.replies.nodes, md)
  }
  saveComment(dir, disId, nodeId, JSON.stringify(convertedComment))
}

module.exports = {
  getComments
}