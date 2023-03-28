const core = require('@actions/core');
const discussions = require('./discussions.js');
const comments = require('./comments.js')


async function run() {
    try {
        const type = core.getInput('type');
        const syncComments = Boolean(core.getInput('syncComments'));
        const discussionDir = core.getInput('discussionDir');
        const token = core.getInput('token');
        if (type === 'discussion') {
            await discussions.getDiscussion(token, discussionDir);
        }
        if (type === 'discussion_comment' && syncComments === true) {
            const commentsDir = core.getInput('commentsDir');
            await comments.getComments(token, commentsDir);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();