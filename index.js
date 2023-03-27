const core = require('@actions/core');
const getDiscussion = require('./scripts/discussions')


async function run() {
  try {
    const type = core.getInput('type');
    const path = core.getInput('path');
    const token = core.getInput('token');
    const number = parseInt(core.getInput('number'));
    const repository = core.getInput('repository');
    if (type === 'discussion') {
      getDiscussion(token, number, path, repository)
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

// async function run() {
//   try {
//     core.debug('???')
//     const type = core.getInput('type');
//     core.debug(String(type));
//     const path = core.getInput('path');
//     const token = core.getInput('token');
//     const number = core.getInput('number');
//     const repository = core.getInput('repository');
//     core.debug(String(type));
//     if (type === 'discussion') {
//       await getDiscussion(token,number,path,repository)
//     }
//   } catch (error) {
//     console.log(error);
//     core.setFailed(error.message);
//   }
// }

run();
