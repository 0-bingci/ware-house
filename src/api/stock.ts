// 引入自定义实例
import service from '@/utils/http';

// 1. 获取库存列表（URL 无需再写完整路径，自动拼接 baseURL）
export const getStockList = async () => {
  try {
    // 实际请求 URL：http://localhost:3000/api/products
    const res = await service.get('/products', {
      params: { sku: 'SKU-001' }
    });
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

// 2. 新增库存
export const createProduct = async (productData) => {
  try {
    // 1. 前端参数校验（避免空值提交，提前拦截错误，减少无效接口请求）
    const { id, name, sku } = productData;
    // 校验必填字段
    if (!id || id.toString().trim() === '') {
      return Promise.reject(new Error('商品ID不能为空'));
    }
    if (!name || name.trim() === '') {
      return Promise.reject(new Error('商品名称不能为空'));
    }
    if (!sku || sku.trim() === '') {
      return Promise.reject(new Error('商品SKU不能为空'));
    }

    // 2. 发送 POST 请求（对应后端 router.post('/') 接口）
    // 接口完整地址：baseURL + '/' → 即 http://localhost:3000/
    const response = await service.post('/', productData);

    // 3. 返回接口响应数据（后端返回的 { message, productId }）
    return response.data;
  } catch (error) {
    // 4. 错误处理（前端提示 + 抛出错误供调用处捕获）
    const errorMsg = error.response?.data?.error || error.message || '创建商品失败';
    console.error('创建商品接口异常：', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
};