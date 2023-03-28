const GRAPH_URL = 'https://api.github.com/graphql'
const getInfo = async function(query, vars, token) {
  const result = await fetch(GRAPH_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(
      {
        query,
        variables: vars
      }
    )
  })
  return {
    state: result.status,
    ok: result.ok,
    data: await result.json()
  }
}

module.exports = {
  getInfo
}