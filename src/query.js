const reactionGroups = `
          reactionGroups {
            content
            reactors {
              totalCount
            }
          }
`
const commentBody = `author {
        avatarUrl
        login
      }
      authorAssociation
      body
      createdAt
      replies(first: 100) {
        nodes {
          author {
            avatarUrl
            login
          }
          authorAssociation
          createdAt
          body
        }
      }`
const discussionBody = `body
      createdAt
      title
      number
      lastEditedAt
      labels(last: 10) {
        nodes {
          name
        }
        totalCount
      }`
const queryCommentNode = function(other) {
  return `query comment($id: ID!){
  node(id: $id) {
    ... on DiscussionComment {
      ${other}
    }
  }
}`
}
const queryDiscussionNode = function(other) {
  return `query discussion($id: ID!){
  node(id: $id) {
    ... on Discussion {
      ${other}
    }
  }
}`
}
const queryCommentByNode = queryCommentNode(commentBody)
const queryDiscussionByNode = queryDiscussionNode(discussionBody)
const queryDiscussionReactionGroups = queryDiscussionNode(reactionGroups)

module.exports = {
  queryCommentByNode,
  queryDiscussionByNode,
  queryDiscussionReactionGroups
}