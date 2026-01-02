import type { Stock } from "@/types/stock";
import { DataTable } from "@/components/table/common/DataTable";
import { StockColumns } from "@/utils/columns";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStockList } from "@/api/stock";

// 定义 props 类型，接收搜索关键字
interface StockListProps {
  searchKeyword: string;
}


// 接收 props
export const StockList = ({ searchKeyword }: StockListProps) => {
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [originalAmount, setOriginalAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [operateType, setOperateType] = useState<"in" | "out">("in");
  const [operateAmount, setOperateAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [tableData, setTableData] = useState<Stock[]>(stockData);

  useEffect(() => {
    // 注意：useEffect 回调不能直接写 async，需内部定义异步函数
    const fetchStockData = async () => {
      setLoading(true); // 开启加载
      try {
        // 调用 getStockList，用 await 等待 Promise 解析结果
        const data = await getStockList();
        // 将获取到的数据更新到组件状态，用于渲染表格
        setStockData(data);
        setTableData(data)
        console.log('库存列表数据：', data);
      } catch (error) {
        console.error('组件内获取库存失败：', error);
        // 可选：给用户提示
        // alert('获取库存数据失败，请稍后重试');
      } finally {
        setLoading(false); // 无论成功失败，关闭加载
      }
    };

    fetchStockData(); // 执行异步函数
  }, []); // 空依赖数组：仅组件挂载时执行一次


  // ========== 核心：根据搜索关键字过滤数据 ==========
  const filteredTableData = tableData.filter((stock) => {
    // 若搜索关键字为空，返回所有数据
    if (!searchKeyword) return true;
    // 转为小写进行模糊匹配（不区分大小写），匹配 sku 或 name
    const lowerKeyword = searchKeyword.toLowerCase();
    return (
      stock.sku.toLowerCase().includes(lowerKeyword) ||
      stock.name.toLowerCase().includes(lowerKeyword)
    );
  });
  

  // 原有编辑逻辑（不变）
  const handleStartEdit = (rowId: string, currentAmount: number) => {
    setEditingRowId(rowId);
    setOriginalAmount(currentAmount);
    setTotalAmount(currentAmount);
    setOperateAmount(0);
    setOperateType("in");
  };

  const handleConfirmEdit = (rowId: string) => {
    if (totalAmount < 0) {
      alert("库存总数不能为负数！");
      return;
    }

    setTableData(prevData =>
      prevData.map((item, index) => {
        if (`row-${index}` === rowId) {
          return { ...item, amount: totalAmount };
        }
        return item;
      })
    );

    setEditingRowId(null);
    setOriginalAmount(0);
    setTotalAmount(0);
    setOperateAmount(0);
    setOperateType("in");
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setOriginalAmount(0);
    setTotalAmount(0);
    setOperateAmount(0);
    setOperateType("in");
  };

  // 原有列配置逻辑（不变）
  const columnsWithInlineEdit = StockColumns.map(col => {
    if (col.accessorKey === "amount") {
      return {
        ...col,
        cell: ({ row }) => {
          const rowId = row.id;
          const currentStock = row.original;

          if (editingRowId === rowId) {
            return (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTotalAmount(isNaN(val) ? 0 : val);
                  }}
                  className="w-20 h-8 text-sm"
                  autoFocus
                  min={0}
                  placeholder="总数"
                />
                <Select
                  value={operateType}
                  onValueChange={(value: "in" | "out") => setOperateType(value)}
                >
                  <SelectTrigger className="w-24 h-8 text-sm">
                    <SelectValue placeholder="操作类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">入库</SelectItem>
                    <SelectItem value="out">出库</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={operateAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setOperateAmount(isNaN(val) || val < 0 ? 0 : val);
                  }}
                  className="w-20 h-8 text-sm"
                  min={0}
                  placeholder="数量"
                />
              </div>
            );
          }

          return <span>{currentStock.amount}</span>;
        },
      };
    }

    if (col.accessorKey === "action") {
      return {
        ...col,
        cell: ({ row }) => {
          const rowId = row.id;
          const currentStock = row.original;

          if (editingRowId === rowId) {
            return (
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleConfirmEdit(rowId)}
                  className="h-8 px-2"
                >
                  确认
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-8 px-2"
                >
                  取消
                </Button>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStartEdit(rowId, currentStock.amount)}
                className="h-8 px-2"
              >
                修改
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm(`是否删除 SKU 为 ${currentStock.sku} 的库存？`)) {
                    setTableData(prevData =>
                      prevData.filter((_, index) => `row-${index}` !== rowId)
                    );
                  }
                }}
                className="h-8 px-2"
              >
                删除
              </Button>
            </div>
          );
        },
      };
    }

    return col;
  });

  // 注意：传给 DataTable 的是过滤后的数据 filteredTableData
  return (
    <div>
      <DataTable columns={columnsWithInlineEdit} data={filteredTableData} />
    </div>
  );
};