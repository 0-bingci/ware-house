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

// 定义 props 类型，接收父组件传递的参数
interface StockToolbarProps {
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
}

// 接收 props
export const StockToolbar = ({ searchKeyword, setSearchKeyword }: StockToolbarProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            <div className="space-y-4 py-2">
              <Input
                placeholder="请输入库存名称(sku)"
                className="w-full"
              />
              <Input
                type="number"
                placeholder="请输入库存数量"
                className="w-full"
              />
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="secondary">取消</Button>
              </DialogClose>
              <Button
                variant="default"
                onClick={() => {
                  console.log("提交库存数据");
                  setIsDialogOpen(false);
                }}
              >
                确认添加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};