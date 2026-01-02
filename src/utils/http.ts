// src/utils/request.js
import axios from 'axios';

// 创建实例
const service = axios.create({
  // 基础路径：所有请求的 URL 都会自动拼接该前缀
  baseURL: 'http://localhost:3000/api',
  // 统一超时时间
  timeout: 10000,
  // 统一请求头（如 JSON 格式、Token 等）
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

export default service; // 导出实例