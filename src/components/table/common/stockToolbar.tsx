import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const StockToolbar = () => {
  return (
    <div className="p-4  bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      {/* 搜索栏（左侧，占满移动端宽度，桌面端自适应） */}
      <div className="w-full md:w-1/3">
        <Input
          type="text"
          placeholder="搜索库存名称/编号"
          className="w-full outline-none"
        />
      </div>

      {/* 库存筛选（右侧，占满移动端宽度，桌面端自适应） */}
      <div className="">
        <Button>添加</Button>
      </div>
    </div>
  );
};
