const github = require('@actions/github');
const fs = require('fs');
const core = require('@actions/core');
const path = require('path');
const query = require('./query.js')

const baseAvatar = 'https://avatars.githubusercontent.com/u/';
/**
 * 创建文件夹
 * @param dir 路径
 */
const createDir = function (dir){
  fs.mkdir(dir,(err)=>{
    if (err) {
      core.setFailed('[POKE:COMMENT]创建目录失败');
    }
  })
}
const dealReplies = function (nodes) {
  const replies = [];
  nodes.forEach(elem=>{
    replies.push({
      author: elem.author.login,
      avatar: elem.author.avatarUrl.replace(baseAvatar,''),
      role: elem.authorAssociation,
      body: elem.body,
      create: elem.createAt,
    })
  });
  return replies;
}
const getComments = async function (token,dir) {
  const payload = github.context.payload;
  const nodeId = payload.comment.node_id;
  const disId = payload.discussion.number;
  const octokit = github.getOctokit(token);
  const graphqlWithAuth = octokit.graphql;

  let convertedComment;
  const data = await graphqlWithAuth(query.queryCommentByNode,{
    id: nodeId
  });
  const comment = data.node;
  convertedComment = {
    author: comment.author.login,
    avatar: comment.author.avatarUrl.replace(baseAvatar,''),
    role: comment.authorAssociation,
    body: comment.body,
    create: comment.createAt,
    replies: dealReplies(comment.replies.nodes)
  }

  const rootDir = path.resolve(dir);
  const commentDir = path.join(dir,'comment');
  const disDir = path.join(commentDir,String(disId))
  const filePath = path.join(disDir,`${nodeId}.json`);
  fs.opendir(rootDir,(err)=>{
    if (err) {
      core.warning("[POKE:COMMENT]存放根目录不存在，将自动创建");
      createDir(rootDir);
    }
    fs.opendir(commentDir,(err)=>{
      if (err) {
        core.warning("[POKE:COMMENT]存放目录不存在，将自动创建");
        createDir(commentDir);
      }
      fs.opendir(disDir,(err)=>{
        if (err) {
          createDir(disDir);
        }
        fs.writeFile(filePath,JSON.stringify(convertedComment),(err)=>{
          if (err) {
            core.setFailed('[POKE:COMMENT]写入失败,ID:'+nodeId+err.toString());
          }
          core.info('[POKE:COMMENT]写入成功，ID:'+nodeId)
        })
      })
    })

  });
}

module.exports = {
  getComments
};