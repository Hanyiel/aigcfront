## 对于后端响应

```typescript
interface BaseResponse<T> {
  code: number;      // 状态码 (200=成功)
  message: string;   // 提示信息 ("success" 或错误描述)
  data: T;           // 业务数据
  timestamp: number; // 服务器时间戳
}
```
- 当登录成功的时候（code为200），会在message返回token,前端需要把token记录下来，之后每次发信息需要在报文头部加上token，具体为：
- Authorization: Bearer <token>
- 即可