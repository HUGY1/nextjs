# Todo List 后端 API

基于 Gin 和 GORM 框架的待办事项 RESTful API 服务，使用 MySQL 存储数据。

## 项目结构

```
.
├── main.go              # 程序入口，初始化数据库、路由并启动服务
├── go.mod               # Go 模块定义
├── config/
│   └── database.go      # 数据库连接配置
├── models/
│   └── todo.go          # Todo 数据模型
├── handlers/
│   └── todo_handler.go  # API 请求处理函数
└── routes/
    └── routes.go        # 路由配置
```

## 数据库配置

- **主机**: test-db-mysql.ns-wzme3ot2.svc
- **端口**: 3306
- **用户**: root
- **密码**: lgzxp6qg
- **数据库**: todolist（需提前创建）
- **表名**: list（程序启动时自动创建）

## 安装与运行

### 1. 创建数据库

在 MySQL 中执行：

```sql
CREATE DATABASE IF NOT EXISTS todolist CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 下载依赖

```bash
go mod tidy
```

### 3. 启动服务

```bash
go run main.go
```

服务默认监听 `http://localhost:8080`。

## API 接口

### 1. 查询所有待办事项

- **接口**: `GET /api/get-todo`
- **参数**: 无
- **返回**: 待办事项数组

```bash
curl http://localhost:8080/api/get-todo
```

### 2. 添加待办事项

- **接口**: `POST /api/add-todo`
- **请求体**:
```json
{
  "value": "待办内容",
  "isCompleted": false
}
```
- **返回**: 新添加的待办对象（含 id）

```bash
curl -X POST http://localhost:8080/api/add-todo \
  -H "Content-Type: application/json" \
  -d '{"value":"学习 Go","isCompleted":false}'
```

### 3. 更新待办状态

- **接口**: `POST /api/update-todo/:id`
- **参数**: 路径参数 id
- **功能**: 将 isCompleted 取反
- **返回**: 更新后的待办对象

```bash
curl -X POST http://localhost:8080/api/update-todo/1
```

### 4. 删除待办

- **接口**: `POST /api/del-todo/:id`
- **参数**: 路径参数 id
- **返回**: 删除结果

```bash
curl -X POST http://localhost:8080/api/del-todo/1
```
