# Poke
<p align="center">
<img src="logo.svg" alt="logo" width="100" height="100"/><br>
<span>将GitHub Discussions同步到md文件中的工作流</span><br>
</p>


## 输入

| 名称            | 必需  | 默认          | 说明                    |
|---------------|-----|-------------|-----------------------|
| token         | 否   | 触发工作流的token | personal access token |
| discussionDir | 否   | `posts`     | 存放discussions文档的文件夹   |
| pagesDir      | 否   | `pages`     | 存放页面数据文档的文件夹          |



## 例子

```yaml
uses: ttdly/poke@main
```

## 注意
GitHub Discussion的各种接口还在测试，以后估计会有变更。  

