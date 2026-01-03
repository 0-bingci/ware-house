import type { Stock } from "@/types/stock";
import { DataTable } from "@/components/table/common/DataTable";
import { StockColumns } from "@/utils/columns";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStockList, deleteProduct, updateStock } from "@/api/stock";
import React from "react";

// 定义 props 类型，接收搜索关键字、刷新触发器和当前版本号
interface StockListProps {
  searchKeyword: string;
  refreshKey?: number; // 刷新触发器，当值变化时重新获取数据
  currentVersion?: string; // 当前全局版本号
}


// 接收 props
export const StockList = ({ searchKeyword, refreshKey = 0, currentVersion = "1.0.0" }: StockListProps) => {
  const [tableData, setTableData] = useState<Stock[]>([]);
  
  // 将编辑状态合并为一个对象，减少状态更新次数
  const [editingState, setEditingState] = useState<{
    productId: number | null;
    originalAmount: number;
    totalAmount: number;
    operateAmount: number;
    operateType: "in" | "out";
  }>({
    productId: null,
    originalAmount: 0,
    totalAmount: 0,
    operateAmount: 0,
    operateType: "in" as const,
  });

  // 将fetchStockData函数移到组件顶层，使其可被外部访问
  // 使用useCallback缓存该函数，确保引用稳定
  const fetchStockData = useCallback(async () => {
    try {
      // 调用 getStockList，用 await 等待 Promise 解析结果
      const data = await getStockList();
      // 将获取到的数据更新到组件状态，用于渲染表格
      setTableData(data);
      console.log('库存列表数据：', data);
    } catch (error) {
      console.error('组件内获取库存失败：', error);
      // 可选：给用户提示
      // alert('获取库存失败，请重试');
    }
  }, []);

  useEffect(() => {
    fetchStockData(); // 执行异步函数，组件挂载时获取初始数据
  }, [fetchStockData]); // 添加fetchStockData到依赖数组
  
  // 监听refreshKey变化，当refreshKey变化时重新获取数据
  useEffect(() => {
    fetchStockData(); // 当refreshKey变化时，重新获取数据
  }, [refreshKey, fetchStockData]); // 添加fetchStockData到依赖数组


  // ========== 核心：根据搜索关键字过滤数据 ==========
  // 使用useMemo缓存filteredTableData，只有当tableData或searchKeyword变化时才重新计算
  const filteredTableData = React.useMemo(() => {
    return tableData.filter((stock) => {
      // 若搜索关键字为空，返回所有数据
      if (!searchKeyword) return true;
      // 转为小写进行模糊匹配（不区分大小写），匹配 sku 或 name
      const lowerKeyword = searchKeyword.toLowerCase();
      return (
        stock.sku.toLowerCase().includes(lowerKeyword) ||
        stock.name.toLowerCase().includes(lowerKeyword)
      );
    });
  }, [tableData, searchKeyword]);
  

  // 原有编辑逻辑（修改为保存商品ID）
  const handleStartEdit = useCallback((currentAmount: number, productId: number) => {
    setEditingState({
      productId,
      originalAmount: currentAmount,
      totalAmount: currentAmount,
      operateAmount: 0,
      operateType: "in"
    });
  }, []);

  const handleConfirmEdit = useCallback(async () => {
    const { productId, totalAmount, originalAmount, operateType } = editingState;
    
    if (totalAmount < 0) {
      alert("库存总数不能为负数！");
      return;
    }

    if (!productId) {
      alert("商品ID无效！");
      return;
    }
    
    try {
      // 计算操作类型和变化量
      const operation_type = operateType === "in" ? "PURCHASE_IN" : "SALE_OUT";
      const changeAmount = Math.abs(totalAmount - originalAmount);
      
      // 调用后端更新库存接口
      await updateStock(productId, {
        operation_type,
        changeAmount,
        after_qty: totalAmount,
        remark: "手动调整库存",
        created_by: 1, // 默认为管理员
        updated_by: 1, // 默认为管理员
        versionSeqNo: 1, // 默认为1
        globalVersion: currentVersion // 使用从版本设置中获取的当前版本号
      });
      
      // 刷新数据
      await fetchStockData();
      
      // 重置编辑状态
      setEditingState({
        productId: null,
        originalAmount: 0,
        totalAmount: 0,
        operateAmount: 0,
        operateType: "in"
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "更新失败");
    }
  }, [editingState, currentVersion, fetchStockData]);

  const handleCancelEdit = useCallback(() => {
    setEditingState({
      productId: null,
      originalAmount: 0,
      totalAmount: 0,
      operateAmount: 0,
      operateType: "in"
    });
  }, []);

  // 联动更新逻辑：确保总数、操作类型和数量之间的自动计算
  // 修改总数时，自动计算操作数量和操作类型
  const handleTotalAmountChange = useCallback((val: number) => {
    setEditingState(prev => {
      const originalAmount = prev.originalAmount;
      const change = Math.abs(val - originalAmount);
      const newOperateType = val > originalAmount ? "in" : val < originalAmount ? "out" : prev.operateType;
      
      return {
        ...prev,
        totalAmount: val,
        operateAmount: change,
        operateType: newOperateType
      };
    });
  }, []);
  
  // 修改操作数量时，自动计算总数
  const handleOperateAmountChange = useCallback((val: number) => {
    setEditingState(prev => {
      const newTotal = prev.operateType === "in" 
        ? prev.originalAmount + val 
        : prev.originalAmount - val;
      
      return {
        ...prev,
        operateAmount: val,
        totalAmount: newTotal
      };
    });
  }, []);
  
  // 切换操作类型时，重新计算总数
  const handleOperateTypeChange = useCallback((value: "in" | "out") => {
    setEditingState(prev => {
      const newTotal = value === "in" 
        ? prev.originalAmount + prev.operateAmount 
        : prev.originalAmount - prev.operateAmount;
      
      return {
        ...prev,
        operateType: value,
        totalAmount: newTotal
      };
    });
  }, []);
  
  // 原有列配置逻辑（修改为支持联动更新）
  // 使用useMemo缓存columnsWithInlineEdit，只有当依赖项变化时才重新创建
  const columnsWithInlineEdit = useMemo(() => {
    return StockColumns.map((col: any) => {
      if (col.accessorKey === "amount") {
        return {
          ...col,
          cell: ({ row }: { row: any }) => {
            const currentStock = row.original;

            if (editingState.productId === currentStock.id) {
              return (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editingState.totalAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      handleTotalAmountChange(isNaN(val) ? 0 : val);
                    }}
                    className="w-20 h-8 text-sm"
                    autoFocus
                    min={0}
                    placeholder="总数"
                  />
                  <Select
                    value={editingState.operateType}
                    onValueChange={handleOperateTypeChange}
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
                    value={editingState.operateAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      handleOperateAmountChange(isNaN(val) || val < 0 ? 0 : val);
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
          cell: ({ row }: { row: any }) => {
            const currentStock = row.original;

            if (editingState.productId === currentStock.id) {
              return (
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleConfirmEdit}
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
                  onClick={() => handleStartEdit(currentStock.amount, currentStock.id)}
                  className="h-8 px-2"
                >
                  修改
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (window.confirm(`是否删除 SKU 为 ${currentStock.sku} 的库存？`)) {
                      try {
                        // 调用后端删除API
                        await deleteProduct(currentStock.id);
                        // 重新获取数据，刷新列表
                        await fetchStockData();
                      } catch (error) {
                        alert(error instanceof Error ? error.message : '删除失败');
                      }
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
  }, [StockColumns, editingState, handleTotalAmountChange, handleOperateTypeChange, handleOperateAmountChange, handleConfirmEdit, handleCancelEdit, handleStartEdit, deleteProduct, fetchStockData]);

  // 注意：传给 DataTable 的是过滤后的数据 filteredTableData
  return (
    <div>
      <DataTable columns={columnsWithInlineEdit} data={filteredTableData} />
    </div>
  );
};