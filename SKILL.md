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