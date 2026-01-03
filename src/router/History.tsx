import { useState, useEffect } from 'react';
import { getGlobalVersions, getStockHistoryByGlobalVersion } from '@/api/stock';

// 定义库存变动记录类型
interface StockRecord {
  id: number;
  product_id: number;
  seq_no: number;
  global_version: string;
  operation_type: string;
  delta: number;
  before_qty: number;
  after_qty: number;
  remark: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  sku: string;
  current_quantity: number;
}

function History() {
  // 1. 定义状态
  const [versions, setVersions] = useState<string[]>([]); // 存储所有版本号
  const [selectedVersion, setSelectedVersion] = useState<string>(''); // 当前选中的版本号
  const [records, setRecords] = useState<StockRecord[]>([]); // 存储当前版本的库存变动记录
  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  const [error, setError] = useState<string | null>(null); // 错误信息

  // 2. 组件挂载时获取所有版本号
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const data = await getGlobalVersions();
        setVersions(data);
        // 初始化选中第一个版本
        if (data.length > 0) {
          setSelectedVersion(data[0]);
        }
        setError(null);
      } catch (err) {
        setError('获取版本列表失败');
        console.error('获取版本列表失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, []);

  // 3. 版本选择变更时获取对应记录
  useEffect(() => {
    const fetchRecords = async () => {
      if (!selectedVersion) return;
      
      try {
        setLoading(true);
        const data = await getStockHistoryByGlobalVersion(selectedVersion);
        setRecords(data);
        setError(null);
      } catch (err) {
        setError('获取库存变动记录失败');
        console.error('获取库存变动记录失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [selectedVersion]);

  // 4. 处理版本选择变更事件
  const handleVersionChange = (e) => {
    setSelectedVersion(e.target.value);
  };

  return (
    <div>
      <div className="container mx-auto my-10 p-10">
        {/* 版本选择 Select 组件 */}
        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">
            选择版本
          </label>
          <select
            value={selectedVersion}
            onChange={handleVersionChange}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            {versions.map((version) => (
              <option key={version} value={version}>
                版本 {version}
              </option>
            ))}
          </select>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center text-gray-500">
            正在加载数据...
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center text-red-500">
            {error}
          </div>
        )}

        {/* 商品操作记录展示区域 */}
        {!loading && !error && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              版本 {selectedVersion} - 商品出入库操作记录
            </h3>

            {/* 无记录时的提示 */}
            {records.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center text-gray-500">
                该版本暂无商品入库/出库操作记录
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {records.map((record, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
                      <h4 className="text-lg font-medium text-gray-800">{record.sku}</h4>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          record.operation_type.includes('IN')
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {record.operation_type.includes('IN') ? '入库' : '出库'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium text-gray-700">操作描述：</span>
                      {record.operation_type === 'PURCHASE_IN' ? '采购入库' : 
                       record.operation_type === 'RETURN_IN' ? '退货入库' :
                       record.operation_type === 'SALE_OUT' ? '销售出库' :
                       record.operation_type === 'LOSS_OUT' ? '损耗出库' :
                       record.operation_type === 'ADJUST' ? '库存调整' : record.operation_type}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium text-gray-700">变动数量：</span>
                      {record.delta > 0 ? '+' : ''}{record.delta} 件
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium text-gray-700">操作前数量：</span>
                      {record.before_qty} 件
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium text-gray-700">操作后数量：</span>
                      {record.after_qty} 件
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium text-gray-700">当前库存：</span>
                      {record.current_quantity} 件
                    </p>
                    <p className="text-gray-500 text-sm mb-2">
                      <span className="font-medium text-gray-600">操作时间：</span>
                      {new Date(record.created_at).toLocaleString()}
                    </p>
                    {record.remark && (
                      <p className="text-gray-500 text-sm">
                        <span className="font-medium text-gray-600">备注：</span>
                        {record.remark}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
