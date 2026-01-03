import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { createProduct } from "@/api/stock";

// 定义 props 类型，接收父组件传递的参数
interface StockToolbarProps {
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  onProductAdded?: () => void; // 新增商品成功后的回调
  currentVersion?: string; // 当前版本号
}

// 接收 props
export const StockToolbar = ({ searchKeyword, setSearchKeyword, onProductAdded, currentVersion = "1.0.0" }: StockToolbarProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // 表单状态管理
  const [formData, setFormData] = useState({
    skuFormat: "",
    amount: "",
    description: ""
  });
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 错误信息
  const [error, setError] = useState<string | null>(null);

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除之前的错误
    setError(null);
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 转换amount为数字类型
      const submitData = {
        ...formData,
        amount: parseInt(formData.amount, 10),
        versionSeqNo: 1, // 默认版本号为1
        globalVersion: currentVersion // 使用当前版本号作为全局版本号
      };
      
      // 调用新增商品接口
      await createProduct(submitData);
      
      // 关闭弹窗
      setIsDialogOpen(false);
      
      // 重置表单
      setFormData({
        skuFormat: "",
        amount: "",
        description: ""
      });
      
      // 调用回调函数，通知父组件刷新数据
      if (onProductAdded) {
        onProductAdded();
      }
      
    } catch (err) {
      // 处理错误
      const errorMsg = err instanceof Error ? err.message : "创建商品失败";
      setError(errorMsg);
      console.error("新增商品失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      {/* 搜索栏：绑定搜索关键字和更新方法 */}
      <div className="w-full md:w-1/3">
        <Input
          type="text"
          placeholder="搜索库存名称/编号"
          className="w-full outline-none"
          value={searchKeyword} // 绑定搜索关键字（受控组件）
          // 输入变化时更新搜索关键字
          onChange={(e) => setSearchKeyword(e.target.value.trim())}
        />
      </div>

      {/* 库存筛选（添加弹窗，逻辑不变） */}
      <div className="">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild onClick={() => setIsDialogOpen(true)}>
            <Button variant="default">添加</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>新增库存</DialogTitle>
            </DialogHeader>
            
            {/* 错误提示 */}
            {error && (
              <div className="text-sm text-red-500 mb-3">{error}</div>
            )}
            
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">SKU格式</label>
                <Input
                  name="skuFormat"
                  placeholder="请输入SKU格式，例如：A72-L-BLACK"
                  className="w-full"
                  value={formData.skuFormat}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">库存数量</label>
                <Input
                  name="amount"
                  type="number"
                  placeholder="请输入库存数量"
                  className="w-full"
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">描述</label>
                <Input
                  name="description"
                  placeholder="请输入商品描述（可选）"
                  className="w-full"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="secondary">取消</Button>
              </DialogClose>
              <Button
                variant="default"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "添加中..." : "确认添加"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};