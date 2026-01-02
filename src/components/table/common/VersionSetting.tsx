import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function VersionSetting() {
  // 1. 定义核心状态
  // 是否处于编辑模式（控制 div/input、修改/保存按钮的切换）
  const [isEditing, setIsEditing] = useState(false);
  // 版本号数据（存储当前显示/编辑的版本号，可自定义初始值）
  const [version, setVersion] = useState("1.0.0");
  // 编辑时的临时版本号（避免未保存时直接修改原始版本号）
  const [tempVersion, setTempVersion] = useState(version);

  // 2. 切换到编辑模式
  const handleEdit = () => {
    setIsEditing(true);
    // 进入编辑时，将临时版本号同步为当前原始版本号
    setTempVersion(version);
  };

  // 3. 保存版本号并退出编辑模式
  const handleSave = () => {
    // 可添加版本号格式校验（可选，根据业务需求调整）
    if (!tempVersion.trim()) {
      alert("版本号不能为空！");
      return;
    }
    // 保存临时版本号到原始版本号
    setVersion(tempVersion);
    // 退出编辑模式
    setIsEditing(false);
  };

  return (
    <div className="h-16 border-b border-gray-200 bg-white flex items-center gap-2 px-4 justify-end">
      {/* 条件渲染：编辑模式显示 Input，非编辑模式显示 Div（新增灰色小字提示） */}
      {isEditing ? (
        <Input
          value={tempVersion}
          onChange={(e) => setTempVersion(e.target.value)}
          placeholder="请输入版本号"
          className="w-40"
          autoFocus // 进入编辑时自动聚焦输入框，提升体验
        />
      ) : (
        <div className="w-64 h-9 flex items-center">
          {/* 灰色小字：目前版本为： */}
          <span className="text-gray-500 text-sm mr-2">目前版本为：</span>
          {/* 版本号 */}
          <span className="text-gray-800">{version}</span>
        </div>
      )}

      {/* 条件渲染：编辑模式显示「保存」按钮，非编辑模式显示「修改」按钮 */}
      <Button
        onClick={isEditing ? handleSave : handleEdit}
        variant="default"
      >
        {isEditing ? "保存" : "修改"}
      </Button>
    </div>
  );
}