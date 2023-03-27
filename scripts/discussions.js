const octokit = require('@octokit/graphql');
const fs = require('fs');
const core = require('@actions/core');
const path = require('path');

const queryDiscussion = `query discussion($repo: String!, $owner: String!, $number: Int!){
  repository(name: $repo, owner: $owner) {
    discussion(number: $number) {
      body
      createdAt
      lastEditedAt
      title
      labels(first: 20) {
        nodes {
          name
        }
        totalCount
      }
    }
  }
}`

const getDiscussion = async function (token, number, rawPath, repository) {
    const graphql = octokit.graphql;
    const graphqlWithAuth = graphql.defaults({
        headers: {
            authorization: `token ${token}`,
        },
    });
    const [owner, repo] = repository.split('/');
    const repos = await graphqlWithAuth(queryDiscussion, {
        repo,
        owner,
        number
    });
    const {discussion} = repos.repository;
    let labels = [];
    if (discussion.labels.totalCount > 0) {
        labels = discussion.labels.nodes.map(ele => {
            return ele.name;
        })
    }
    const article = `---
title: ${discussion.title}
create: ${discussion.createdAt}
update: ${discussion.lastEditedAt}
labels: ["${labels.join('","')}"]
---

${discussion.body}
`
    const filePath = path.resolve(rawPath);
    const dirPath = path.parse(filePath).dir;

    fs.opendir(dirPath, (err) => {
        if (err) {
            core.warning("[POKE:DISCUSSION]:文件路径不存在，将自动创建"+ dirPath);
            fs.mkdir(dirPath, (err) => {
                if (err) {
                    core.warning("[POKE:DISCUSSION]:创建失败"+ err.toString());
                    process.exit(1);
                }
            })
        }
        fs.writeFile(filePath, article, (err) => {
            if (err) {
                core.info("[POKE:DISCUSSION]:"+err.toString());
            } else {
                core.info(`[POKE:DISCUSSION]:写入${rawPath}成功`)
            }
        })
    })
}

module.exports = getDiscussion;