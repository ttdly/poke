const fs = require('fs')
const path = require('path')
const core = require('@actions/core')
/**
 * 递归创建多级目录
 * @param dir 目录
 */
const isExitsMk = function (dir) {
  dir = path.resolve(dir)
  try {
    if (!fs.existsSync(dir)) {
      if (!fs.existsSync(path.dirname(dir))) {
        isExitsMk(path.dirname(dir))
      }
      fs.mkdirSync(dir)
    }
  } catch (e) {
    core.setFailed('[POKE|utils.js]' + e.toString())
  }
}

module.exports = {
  isExitsMk
}
