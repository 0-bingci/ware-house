import { StockList } from "@/components/table/stockList";
import { StockToolbar } from "@/components/table/common/stockToolbar";
import { AICard } from "@/components/ai-card";
import { Card } from "@/components/ui/card";
import { VersionSetting } from "@/components/table/common/VersionSetting";
import { useState } from "react";
function Stock() {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  return (
    <div className="flex-1 flex">
      {/* 左侧 StockList：flex-1 自适应 */}
      <div className="flex-1 flex flex-col overflow-hidden p-8">
        <VersionSetting></VersionSetting>

        {/* 顶部筛选区域：横向排列，固定在上方 */}
        <StockToolbar 
        searchKeyword={searchKeyword} 
        setSearchKeyword={setSearchKeyword} 
      />

        {/* 库存列表区域：占据剩余空间，独立滚动 */}
        <div className="flex-1 overflow-auto p-2">
          <StockList searchKeyword={searchKeyword}/>
        </div>
      </div>

      {/* 右侧固定侧栏：w-64（16rem）固定宽度 */}
      <div className="w-64 shrink-0 bg-white border-l p-4 relative h-full overflow-hidden">
        {/* AICard：绝对定位，占上半部分（top:0, bottom:50%, 左右填满） */}
        <div className="absolute top-4 left-4 right-4 bottom-1/2 overflow-auto border-b border-gray-200">
          <AICard />
        </div>
        {/* Card：绝对定位，占下半部分（top:50%, bottom:0, 左右填满） */}
        <div className="absolute top-1/2 left-4 right-4 bottom-4 overflow-auto mt-2">
          <Card />
        </div>
      </div>
    </div>
  );
}

export default Stock;
