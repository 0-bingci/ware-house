// 引入自定义实例
import service from '@/utils/http';

// 1. 获取库存列表
// 实际请求 URL：baseURL + '/products' → http://localhost:3000/api/products
export const getStockList = async (params = {}) => {
  try {
    const res = await service.get('/products', { params });
    return res.data;
  } catch (error) {
    console.error('获取库存列表异常：', error);
    return Promise.reject(error);
  }
};

// 2. 新增商品
// 后端接口：POST /api/products
// 支持格式：A72-L-BLACK → 自动解析为 name:A72, size:L, color:BLACK, sku:A72-L-BLACK
export const createProduct = async (productData) => {
  try {
    // 1. 前端参数校验
    const { skuFormat, amount, versionSeqNo, description, globalVersion } = productData;
    // 校验必填字段
    if (!skuFormat || skuFormat.trim() === '') {
      return Promise.reject(new Error('SKU格式不能为空'));
    }
    if (amount === undefined || amount === null || isNaN(amount)) {
      return Promise.reject(new Error('数量必须为有效数字'));
    }
    if (amount < 0) {
      return Promise.reject(new Error('数量不能为负数'));
    }
    if (!globalVersion || globalVersion.trim() === '') {
      return Promise.reject(new Error('全局版本号不能为空'));
    }

    // 2. 发送 POST 请求
    // 接口完整地址：baseURL + '/products' → 即 http://localhost:3000/api/products
    const response = await service.post('/products', {
      skuFormat,
      amount,
      versionSeqNo,
      description,
      globalVersion // 传递全局版本号给后端
    });

    // 3. 返回接口响应数据（后端返回的 { message, productId, product }）
    return response.data;
  } catch (error) {
    // 4. 错误处理
    const errorMsg = error.response?.data?.error || error.message || '创建商品失败';
    console.error('创建商品接口异常：', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
};

// 3. 删除商品
// 后端接口：DELETE /api/products/:id
export const deleteProduct = async (productId) => {
  try {
    // 1. 前端参数校验
    if (!productId) {
      return Promise.reject(new Error('商品ID不能为空'));
    }

    // 2. 发送 DELETE 请求
    // 接口完整地址：baseURL + '/products/' + productId → 即 http://localhost:3000/api/products/:id
    const response = await service.delete(`/products/${productId}`);

    // 3. 返回接口响应数据
    return response.data;
  } catch (error) {
    // 4. 错误处理
    const errorMsg = error.response?.data?.error || error.message || '删除商品失败';
    console.error('删除商品接口异常：', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
};

// 4. 更新库存
// 后端接口：POST /api/stock/:productId/operation
export const updateStock = async (productId, updateData) => {
  try {
    // 1. 前端参数校验
    const { operation_type, changeAmount, after_qty, remark, created_by, updated_by, versionSeqNo, globalVersion } = updateData;
    
    // 校验必填字段
    if (!productId) {
      return Promise.reject(new Error('商品ID不能为空'));
    }
    if (!operation_type || operation_type.trim() === '') {
      return Promise.reject(new Error('操作类型不能为空'));
    }
    if (changeAmount === undefined || changeAmount === null || isNaN(changeAmount)) {
      return Promise.reject(new Error('改变值必须为有效数字'));
    }
    if (changeAmount < 0) {
      return Promise.reject(new Error('改变值不能为负数'));
    }
    if (after_qty === undefined || after_qty === null || isNaN(after_qty)) {
      return Promise.reject(new Error('操作后总数必须为有效数字'));
    }
    if (after_qty < 0) {
      return Promise.reject(new Error('操作后总数不能为负数'));
    }
    if (!globalVersion || globalVersion.trim() === '') {
      return Promise.reject(new Error('全局版本号不能为空'));
    }
    if (created_by === undefined || created_by === null || isNaN(created_by)) {
      return Promise.reject(new Error('创建人ID必须为有效数字'));
    }
    if (updated_by === undefined || updated_by === null || isNaN(updated_by)) {
      return Promise.reject(new Error('更新人ID必须为有效数字'));
    }

    // 2. 发送 POST 请求
    // 接口完整地址：baseURL + '/stock/' + productId + '/operation' → 即 http://localhost:3000/api/stock/:productId/operation
    const response = await service.post(`/stock/${productId}/operation`, {
      operation_type,
      changeAmount,
      after_qty,
      remark,
      created_by,
      updated_by,
      versionSeqNo,
      globalVersion
    });

    // 3. 返回接口响应数据（后端返回的 { message, after_qty, seq_no }）
    return response.data;
  } catch (error) {
    // 4. 错误处理
    const errorMsg = error.response?.data?.error || error.message || '更新库存失败';
    console.error('更新库存接口异常：', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
};

//5. 查询所有全局版本号
// 后端接口：GET /api/stock/global-versions
export const getGlobalVersions = async () => {
  try {
    // 发送 GET 请求
    // 接口完整地址：baseURL + '/stock/global-versions' → 即 http://localhost:3000/api/stock/global-versions
    const response = await service.get('/stock/global-versions');

    // 返回接口响应数据
    return response.data;
  } catch (error) {
    // 错误处理
    const errorMsg = error.response?.data?.error || error.message || '查询全局版本号失败';
    console.error('查询全局版本号接口异常：', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
};

//6. 根据全局版本号查询库存变动记录
// 后端接口：GET /api/stock/history/version/:globalVersion
export const getStockHistoryByGlobalVersion = async (globalVersion) => {
  try {
    // 1. 前端参数校验
    if (!globalVersion || globalVersion.trim() === '') {
      return Promise.reject(new Error('全局版本号不能为空'));
    }

    // 2. 发送 GET 请求
    // 接口完整地址：baseURL + '/stock/history/version/' + globalVersion → 即 http://localhost:3000/api/stock/history/version/:globalVersion
    const response = await service.get(`/stock/history/version/${globalVersion}`);

    // 3. 返回接口响应数据
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message || '查询库存变动记录失败';
    console.error('查询库存变动记录接口异常：', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
};

//7 pdf解析
// 后端接口：POST /api/pdf/parse
// stock.ts 中的 parsePDF 函数，完全重写，简化到极致
import axios from 'axios'; // 直接引入原生 Axios，不使用封装的 service（先排除封装干扰）

export const parsePDF = async (file) => {
  try {
    if (!file) {
      return Promise.reject(new Error('请选择要上传的PDF文件'));
    }

    const formData = new FormData();
    // 强制指定字段名和文件名，确保无遗漏
    formData.append('pdf', file, file.name);

    // 直接使用原生 Axios，不使用任何拦截器/封装
    const response = await axios.post('http://localhost:3000/api/pdf/parse', formData, {
      // 绝对不手动设置 Content-Type
      headers: {
        // 若前端有跨域凭证需求，添加此配置（可选）
        // 'Access-Control-Allow-Origin': 'http://localhost:3000',
        // withCredentials: true
      }
    });

    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message || 'PDF解析失败';
    console.error('PDF解析接口异常：', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
};