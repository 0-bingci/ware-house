/**
 * 解析 SKU 字符串，提取商品名称、尺寸、颜色等信息
 * @param {string} sku - 待解析的 SKU 字符串（示例：A72-L-BLACK、Phone14-M-WHITE）
 * @param {string} [separator='-'] - SKU 各部分的分隔符，默认是短横线 -
 * @returns {Object} 解析后的商品信息对象，包含 name、size、color
 */
export function parseSku(sku:string, separator = '-') {
  // 1. 边界值处理：空值、非字符串直接返回空对象
  if (!sku || typeof sku !== 'string') {
    console.warn('无效的 SKU 格式');
    return { name: '', size: '', color: '' };
  }

  // 2. 拆分 SKU 为数组（按分隔符分割，去除空值）
  const skuParts = sku.split(separator).filter(part => part.trim() !== '');

  // 3. 定义默认返回值
  const result = {
    name: '',
    size: '',
    color: ''
  };

  // 4. 针对 3 段式 SKU（name-size-color）进行解析（核心逻辑）
  if (skuParts.length === 3) {
    // 第 1 段：商品名称（A72、Phone14）
    result.name = skuParts[0].trim();
    // 第 2 段：尺寸（L、M、S、XL 等）
    result.size = skuParts[1].trim();
    // 第 3 段：颜色（BLACK、WHITE、RED 等，自动转为首字母大写+其余小写，优化展示）
    result.color = skuParts[2].trim().toLowerCase().replace(/^(\w)/, (match) => match.toUpperCase());
  } 
  // 兼容 2 段式 SKU（如 A72-BLACK → name + color，无尺寸）
  else if (skuParts.length === 2) {
    result.name = skuParts[0].trim();
    result.color = skuParts[1].trim().toLowerCase().replace(/^(\w)/, (match) => match.toUpperCase());
  }
  // 兼容 1 段式 SKU（仅名称）
  else if (skuParts.length === 1) {
    result.name = skuParts[0].trim();
  }
  // 超过 3 段的 SKU：取前 1 段为名称，倒数第 2 段为尺寸，最后 1 段为颜色
  else if (skuParts.length > 3) {
    // 名称：前 n-2 段拼接（如 A72-Pro-L-BLACK → 名称 A72-Pro）
    result.name = skuParts.slice(0, skuParts.length - 2).join(separator).trim();
    // 尺寸：倒数第 2 段
    result.size = skuParts[skuParts.length - 2].trim();
    // 颜色：最后 1 段
    result.color = skuParts[skuParts.length - 1].trim().toLowerCase().replace(/^(\w)/, (match) => match.toUpperCase());
  }

  return result;
}