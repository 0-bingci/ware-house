import { StockList } from "@/components/table/stockList";
import { StockToolbar } from "@/components/table/common/stockToolbar";
import { AICard } from "@/components/ai-card";
import { Card } from "@/components/ui/card";
import { VersionSetting } from "@/components/table/common/VersionSetting";
import { useState } from "react";
function Stock() {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  // 版本号状态管理，初始值为 "1.0.0"
  const [currentVersion, setCurrentVersion] = useState<string>("1.0.0");
  // 刷新触发器，用于通知StockList组件重新获取数据
  const [refreshKey, setRefreshKey] = useState<number>(0);
  
  // 处理版本号变化
  const handleVersionChange = (newVersion: string) => {
    setCurrentVersion(newVersion);
  };
  
  // 处理商品添加成功后的刷新
  const handleProductAdded = () => {
    // 更新refreshKey，触发StockList组件重新获取数据
    setRefreshKey(prev => prev + 1);
    console.log("商品添加成功，当前版本：", currentVersion);
  };
  
  return (
    <div className="flex-1 flex">
      {/* 左侧 StockList：flex-1 自适应 */}
      <div className="flex-1 flex flex-col overflow-hidden p-8">
        {/* 版本设置组件，传递版本号和变化回调 */}
        <VersionSetting 
          initialVersion={currentVersion}
          onVersionChange={handleVersionChange}
        />

        {/* 顶部筛选区域：横向排列，固定在上方 */}
        <StockToolbar 
          searchKeyword={searchKeyword} 
          setSearchKeyword={setSearchKeyword} 
          onProductAdded={handleProductAdded}
          currentVersion={currentVersion} // 传递当前版本号给 StockToolbar
        />

        {/* 库存列表区域：占据剩余空间，独立滚动 */}
        <div className="flex-1 overflow-auto p-2">
          <StockList 
            searchKeyword={searchKeyword}
            refreshKey={refreshKey} // 传递刷新触发器
            currentVersion={currentVersion} // 传递当前全局版本号
          />
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
