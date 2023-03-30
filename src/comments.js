const fs = require('fs')
const path = require('path')
const pako = require('pako')
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
/**
 * 存储评论数据
 * @param dir 目录
 * @param disId discussion ID
 * @param nodeId 评论ID
 * @param comment 评论数据
 * @param pageNum 分页数据
 */
const saveComment = function(dir, disId, nodeId, comment, pageNum) {
  const rootDir = path.resolve(dir)
  const commentsDir = path.join(rootDir, ...['comments', String(disId)])
  const mapPath = path.join(commentsDir, 'map.json')
  let newPage = false
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
      newPage = true
    } catch (e) {
      failed(nodeId, e)
    }
  }
  // 读取映射图
  commentMap = JSON.parse(fs.readFileSync(mapPath, { encoding: 'utf-8' }))
  let page = commentMap.page
  if (commentMap.count === pageNum + 2) {
    try {
      page = ++commentMap.page
      commentMap.count = 1
      // 新增页
      newPage = true;
    } catch (e) {
      failed(nodeId, e)
    }
  }
  try {
    let pageRaw,pageNew;
    if (newPage) {
      pageNew = `[${comment}]`
    } else {
      // // 读取页数据
      pageRaw = fs.readFileSync(path.join(commentsDir, `${page}.blob`))
      const pageStr = pako.inflate(pageRaw,{to:'string'})
      // 将新数据加入
      pageNew = pageStr.substring(0, pageRaw.length - 1) + `,${comment}]`
    }

    // 更新映射图
    commentMap.sourceMap[nodeId] = `${page}:${commentMap.count}`
    commentMap.count++
    commentMap.total++
    // 写回数据
    fs.writeFileSync(mapPath, JSON.stringify(commentMap))
    const compressedPage = pako.deflate(pageNew)
    fs.writeFileSync(path.join(commentsDir, `${page}.blob`), compressedPage)
    core.info('[POKE|comments.js]同步comment(' + nodeId + ')成功')
  } catch (e) {
    failed(nodeId, e)
  }
}

const updateComment = function(dir, disId, nodeId, comment){
  const rootDir = path.resolve(dir)
  const commentsDir = path.join(rootDir, ...['comments', String(disId)])
  const mapPath = path.join(commentsDir, 'map.json')
  try {
    const commentMap = JSON.parse(fs.readFileSync(mapPath, { encoding: 'utf-8' }))
    const commentPlace = commentMap.sourceMap[nodeId].split(':');
    let pageRaw = fs.readFileSync(path.join(commentsDir, `${commentPlace[1]}.blob`))
    const pageObj = JSON.parse(pako.inflate(pageRaw,{to:'string'}))
    pageObj[commentPlace[2]] = JSON.parse(comment);
    pageRaw = pako.deflate(JSON.stringify(pageObj));
    fs.writeFileSync(path.join(commentsDir, `${commentPlace[1]}.blob`),pageRaw)
  } catch (e){
    failed(nodeId,e)
  }
}
const getComments = async function(token, dir, pageNum) {
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
  if (payload.action === 'created') {
    saveComment(dir, disId, nodeId, JSON.stringify(convertedComment), pageNum)
  } else if (payload.action === 'edited') {
    updateComment(dir, disId, nodeId, JSON.stringify(convertedComment), pageNum)
  }
}

module.exports = {
  getComments
}