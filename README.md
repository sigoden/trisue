# Trisue

trisue是一款REST API调试及异常报告工具。

## 概述

前端会向后端开发人员报告一些接口错误。接口包含请求路径，方法，HTTP头，请求数据，返回数据等内容，要将这一堆东西完整的发送给相关人员并不容易。后端收到这些数据之后，也需要通过postman，curl等构造请求，这个过程也很麻烦。trisue就是为了解决简化这个过程而开发的。你可以在trisue中构造整个请求并测试，trisue会将请求相关的所有数据拼接到浏览器地址栏中。复制地址栏中的数据后发送给后端，后端打开该地址，将会再现整个请求过程。

## 特征

- 发送HTTP请求,包括GET, POST, DELETE, PUT
- 本地保存请求历史
- 浏览编辑请求历史
- 通过URL分享和重新请求
- 变量替换
- JSON自动格式化

## FAQ

1. 跨域报错怎么办?

   需要安装Chrome插件[扩展程序Allow-Control-Allow-Origin: *](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?hl=zh-CN)以处理跨域问题
