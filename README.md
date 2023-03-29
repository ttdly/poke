# Poke
<p align="center">
<img src="logo.svg" alt="logo" width="100" height="100"/><br>
<span>将GitHub Discussions同步到md文件中的工作流</span><br>
<img src="https://wakatime.com/badge/user/6db69406-3bcf-452c-8326-8bdda3bc3129/project/f9c9b883-b0d3-45f0-a50d-a9553192d8f6.svg" alt="wakatime">
</p>


## 输入

| 名称            | 必需  | 默认          | 说明                    |
|---------------|-----|-------------|-----------------------|
| token         | 否   | 触发工作流的token | personal access token |
| syncComments  | 否   | `true`      | 是否对评论进行同步             |
| discussionDir | 否   | `posts`     | 存放discussions的文件夹     |
| commentsDir   | 否   | `public`    | 存放comments的文件夹        |

注意：对于comments，最终会被存放在`<commentsDir>/comments/<discussion.number>/`目录中

## 例子

```yaml
uses: ttdly/poke@v1
with:
  syncComments: false
```

## 注意
GitHub Discussion的各种接口还在测试，以后估计会有变更。  

