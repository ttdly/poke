const fs = require('fs')
const core = require('@actions/core')
const path = require('path')
const matter = require('gray-matter')
const YAML = require('yaml')
const util = require('./utils')
const mergeTwoArray = function (long, short) {
  for (let i of short) {
    if (long.indexOf(i) === -1) {
      long.push(i)
    }
  }
  return long
}
/**
 * 将对象转化为合适的格式
 * @param obj 对象
 * @returns {string} 准换后字符串
 */
const toYamlFront = function (obj) {
  const doc = new YAML.Document()
  doc.contents = obj
  return '---\n' + doc.toString() + '---'
}
/**
 * 处理标签文档内数据中的文章数组
 * @param items 原数组
 * @param current 现对象
 * @returns {[{time: string, title, url: string},...*]|*}
 */
const dealWithItems = function (items, current) {
  let left = 0,
    right = items.length,
    mid = -1
  while (left <= right) {
    mid = (left + right) >> 1
    if (items[mid].number === current.number) {
      return mid
    } else if (items[mid].number < current.number) {
      right = mid - 1
    } else {
      left = mid + 1
    }
  }
  return -1
}

/**
 * 将discussion对象转换成合适的格式
 * @param discussion
 * @param posts 文档存储路径
 * @returns {{time: string, title, url: string}}
 */
const convertToItem = function (discussion, posts) {
  return {
    time: discussion.createdAt,
    title: discussion.title,
    url: `/${posts}/${discussion.number}.html`,
    number: discussion.number
  }
}
/**
 * 创建标签页面文档
 * @param pages 标签文件存储路径
 * @param labels 标签
 */
const createLabelListPage = function (pages, labels) {
  try {
    let frontmatter = {
      page: 'labels',
      labels: []
    }
    const pagesDir = path.resolve(pages)
    util.isExitsMk(pagesDir)
    const file = path.join(pagesDir, 'labels.md')
    if (fs.existsSync(file)) {
      const rawLabelsData = fs.readFileSync(file, { encoding: 'utf-8' })
      frontmatter = matter(rawLabelsData).data
      frontmatter.labels = mergeTwoArray(frontmatter.labels, labels)
    } else {
      frontmatter.labels = labels
    }
    const newRawLabelsData = toYamlFront(frontmatter)
    fs.writeFileSync(file, newRawLabelsData, { encoding: 'utf-8' })
    core.info('[POKE|pages.js]生成分类文档成功')
  } catch (e) {
    core.setFailed('[POKE|pages.js]' + e.toString())
  }
}
/**
 * 创建各个分类的文档
 * @param pages 分类页所在文件夹
 * @param labels 该文档的所有标签
 * @param discussion 文档
 * @param posts 文档存储文件夹
 */
const createLabelPage = function (pages, labels, discussion, posts) {
  const pagesDir = path.resolve('pages')
  discussion = convertToItem(discussion, posts)
  let frontmatter = {
    page: 'label',
    label: '',
    item: []
  }
  for (const label of labels) {
    try {
      const file = path.join(pagesDir, label + '.md')
      if (fs.existsSync(file)) {
        const rawLabelPageData = fs.readFileSync(file, { encoding: 'utf-8' })
        frontmatter = matter(rawLabelPageData).data
        const index  = dealWithItems(frontmatter.item, discussion)
        if (index === -1) {
          frontmatter.item = [discussion, ...frontmatter.item]
        } else {
          frontmatter.item[index].title = discussion.title
        }
      } else {
        frontmatter.label = label
        frontmatter.item.push(discussion)
      }
      const newRaw = toYamlFront(frontmatter)
      fs.writeFileSync(file, newRaw, { encoding: 'utf-8' })
      core.info('[POKE|page.js]生成分类列表文档成功')
    } catch (e) {
      core.setFailed('[POKE|page.js]' + e.toString() + discussion)
    }
  }
}
/**
 * 创建index.md
 * @param discussion discussion对象
 * @param posts
 */
const createHomePage = function (discussion, posts) {
  const file = path.resolve('index.md')
  const item = convertToItem(discussion, posts)
  let frontmatter = {
    page: 'list',
    list: []
  }
  try {
    if (fs.existsSync(file)) {
      const rawHomePageData = fs.readFileSync(file, { encoding: 'utf-8' })
      frontmatter = matter(rawHomePageData).data
      const index  = dealWithItems(frontmatter.list, item)
      if (index === -1) {
        frontmatter.list = [item, ...frontmatter.list]
      } else {
        frontmatter.list[index].title = item.title
      }
    } else {
      frontmatter.list.push(item)
    }
    const newRaw = toYamlFront(frontmatter)
    fs.writeFileSync(file, newRaw, { encoding: 'utf-8' })
    core.info('[POKE|page.js]生成 index.md 成功')
  } catch (e) {
    core.setFailed('[POKE|page,js]' + e.toString())
  }
}

const lockPosts = function(labels,posts,pages,discussion){
  console.log(pages)
  // 先处理index.md文件
  const home = path.resolve('index.md')
  const rawHomePageData = fs.readFileSync(home, { encoding: 'utf-8' })
  const frontmatter = matter(rawHomePageData).data
  const item = convertToItem(discussion,posts);
  const index = dealWithItems(frontmatter.list,item)
  frontmatter.list.splice(index,1);
  fs.writeFileSync(home,toYamlFront(frontmatter),{encoding:'utf-8'})
  // 处理各个labels
}

module.exports = {
  createLabelListPage,
  createLabelPage,
  createHomePage,
  lockPosts
}
