const github = require('@actions/github')
const fs = require('fs');
const query = require('./query.js')
const core = require('@actions/core');
const path = require('path');


const getDiscussion = async function (token, dir) {
    const octokit = github.getOctokit(token);
    const graphqlWithAuth = octokit.graphql;
    const payload = github.context.payload;
    const nodeId = payload.discussion.node_id;
    const data = await graphqlWithAuth(query.queryDiscussionByNode,{
        id:nodeId
    })
    const discussion = data.node;

    const reactionGroups = await graphqlWithAuth(query.queryDiscussionReactionGroups,{
        id:nodeId
    })
    let reaction = []
    reactionGroups.node.reactionGroups.forEach(elem=>{
        if(elem.reactors.totalCount !== 0) {
            reaction.push(`${elem.content}/${elem.reactors.totalCount}`);
        }
    });

    let labels = [];
    const labelCount = discussion.labels.totalCount;
    if (labelCount > 0) {
        labels = discussion.labels.nodes.map(ele => {
            return ele.name;
        })
    }

    const updateStr = discussion.lastEditedAt?"update: "+ discussion.lastEditedAt + '\n' : "";
    const labelsStr = (labelCount) ? 'labels: ["'+ labels.join('","') + '"]\n' : "";
    const reactionStr = (reaction.length) ? 'reactions: ["'+ reaction.join('","') +'"]\n' : "";

    const article = "---\n" +
        "title: " + discussion.title + '\n' +
        "create: " + discussion.createdAt + '\n'+
        updateStr +
        labelsStr +
        reactionStr +
        "---\n\n"+
        discussion.body;

    const dirPath = path.resolve(dir);
    const filePath = path.join(dirPath,discussion.number+'.md')

    fs.opendir(dirPath, (err) => {
        if (err) {
            core.warning("[POKE:DISCUSSION]:存放目录不存在，将自动创建"+ dirPath);
            fs.mkdir(dirPath, (err) => {
                if (err) {
                    core.setFailed("[POKE:DISCUSSION]:存放目录创建失败"+ err.toString())
                    process.exit(1);
                } else {
                    core.info("[POKE:DISCUSSION]:创建存放目录成功")
                }
            })
        }
        fs.writeFile(filePath, article, (err) => {
            if (err) {
                core.info("[POKE:DISCUSSION]:"+err.toString());
            } else {
                core.info(`[POKE:DISCUSSION]:写入${dir+'/'+discussion.number+'.md'}成功`)
            }
        })
    })
}

module.exports = {
    getDiscussion
};