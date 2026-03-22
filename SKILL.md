## 新增空返回函数时不要写void
```
// 正确
fetchTodos()
//错误
 void fetchTodos()
```


## 函数不使用function,使用const funcName = (...) => {...}
React组件也使用FC 而不用function
```
// 正确
const useTodos = (...) => {...}
//错误
 
export function useTodos(){}
```

## 编写新组件/功能时，如有需要请拆分以下文件
- types.ts 存放相关的TS定义
- constants.ts 存放有用到的常量

## `lib` 目录：避免「空壳」`index.ts`
- **不要**单独建一个只写 `export ... from './xxx'`、几乎没有模块说明或业务代码的 `index.ts`，再让真实实现落在 `init-*.ts`、`main.ts` 等平行文件里；这会增加跳转成本且 `index` 无实质内容。
- **推荐**：在 `index.ts` 中直接编写该子模块的入口实现（与对外 `export` 同文件），其它文件按职责拆分（如 `types.ts`、`collector.ts`）。
- **例外**：确需统一重导出多个子模块时，可保留薄 `index.ts`，但应写明文档注释说明包用途，并避免「仅 re-export 一行、无说明」的生成。