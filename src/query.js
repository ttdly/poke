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
      }
      comments{
        totalCount
      }`
const queryDiscussionNode = function (other) {
  return `query discussion($id: ID!){
  node(id: $id) {
    ... on Discussion {
      ${other}
    }
  }
}`
}

const queryDiscussionByNode = queryDiscussionNode(discussionBody)

module.exports = {
  queryDiscussionByNode
}
