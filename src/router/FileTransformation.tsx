import { useState, useRef } from "react";

// 导入PDF解析API和库存更新API
import { parsePDF, updateStockBySku } from '@/api/stock';

// 导入shadcn/ui的Card相关组件
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// 类型定义
interface BatchResult {
  successList: Array<{
    sku: string;
    changeAmount: number;
    message?: string;
    detail?: any;
  }>;
  failList: Array<{
    sku: string;
    changeAmount: number;
    errorMsg: string;
  }>;
}

interface ParseResultData {
  message: string;
  data: Array<{
    sku: string;
    count: number;
    operation_type: string;
  }>;
}

function FileTransformation() {
  // 使用ref引用文件输入元素
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 状态管理：富文本内容、上传的文件、解析结果、加载状态
  const [richTextContent, setRichTextContent] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResultData | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  // 新增：批量更新库存的加载状态
  const [isBatchUpdating, setIsBatchUpdating] = useState<boolean>(false);

  // 处理文件上传变更事件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setParseResult(null);
      
      // 检查是否为PDF文件
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // 清除之前的内容
        setRichTextContent("");
        // 开始解析PDF
        parsePDFContent(file);
      } else {
        // 非PDF文件，仅显示文件信息
        setRichTextContent(`# 已上传文件：${file.name}\n\n- 文件大小：${(file.size / 1024).toFixed(2)} KB\n\n请在此编辑内容...`);
      }
    }
  };

  // PDF解析函数
  const parsePDFContent = async (file: File) => {
    setIsParsing(true);
    try {
      // 调用PDF解析API
      const result = await parsePDF(file);
      setParseResult(result);
      
      // 将解析结果转换为富文本格式
      let markdownContent = `# PDF解析结果\n\n`;
      markdownContent += `## 请自己加入版本号：\n\n`;
      markdownContent += `| SKU | 数量 | 操作类型 |\n`;
      markdownContent += `|-----|------|----------|\n`;
      
      if (result.data && result.data.length > 0) {
        result.data.forEach((item: { sku: string; count: number; operation_type: string }) => {
          markdownContent += `| ${item.sku} | ${item.count} | ${item.operation_type} |\n`;
        });
      } else {
        markdownContent += `没有解析到数据\n\n`;
      }
      
      setRichTextContent(markdownContent);
    } catch (err: any) {
      console.error('PDF解析失败：', err);
      setRichTextContent(`# PDF解析结果\n\n## 解析状态：失败\n\n## 错误信息：${err.message || '未知错误'}\n\n`);
    } finally {
      setIsParsing(false);
    }
  };

  // 新增：从富文本解析数据并批量更新库存
  const batchUpdateStockFromRichText = async (content: string): Promise<BatchResult> => {
    if (!content || content.trim() === '') {
      return Promise.reject(new Error('富文本内容不能为空'));
    }

    try {
      // 1. 解析全局版本号 globalVersion（匹配 版本号：x.x.x 格式）
      const versionMatch = content.match(/版本号：(\d+\.\d+\.\d+)/);
      const globalVersion = versionMatch ? versionMatch[1].trim() : '';
      if (!globalVersion) {
        return Promise.reject(new Error('未从富文本中解析到版本号，请先填写版本号'));
      }

      // 2. 解析表格中的 SKU 和 数量（匹配 Markdown 表格行格式）
      const tableRowReg = /\| ([^\|]+) \| ([^\|]+) \| ([^\|]+) \|/g;
      const skuCountMap = new Map<string, number>(); // 用于去重并统计总数
      let matchResult: RegExpExecArray | null;

      // 遍历所有表格行，提取SKU和数量
      while ((matchResult = tableRowReg.exec(content)) !== null) {
        const [, sku, countStr] = matchResult;
        // 清洗数据
        const skuTrimmed = sku.trim();
        const count = parseInt(countStr.trim(), 10);

        // 校验当前行的SKU和数量有效性
        if (!skuTrimmed || isNaN(count) || count <= 0) {
          continue; // 无效数据跳过
        }

        // 合并相同SKU的数量
        if (skuCountMap.has(skuTrimmed)) {
          skuCountMap.set(skuTrimmed, skuCountMap.get(skuTrimmed)! + count);
        } else {
          skuCountMap.set(skuTrimmed, count);
        }
      }

      // 校验是否解析到有效SKU数据
      if (skuCountMap.size === 0) {
        return Promise.reject(new Error('未从富文本表格中解析到有效SKU和数量数据'));
      }

      // 3. 批量调用库存更新接口
      const batchResult: BatchResult = {
        successList: [], // 成功更新的SKU信息
        failList: []     // 更新失败的SKU信息
      };

      // 遍历去重后的SKUMap，逐个调用接口
      for (const [sku, changeAmount] of skuCountMap.entries()) {
        try {
          // 构造更新参数，填充默认值
          const updateData = {
            operation_type: 'SALE_OUT', // 默认操作类型
            changeAmount: changeAmount, // 解析后的总数量
            after_qty: 0, // 若需真实值，请先调用查询库存接口获取当前库存再计算
            remark: `批量更新库存-来自PDF解析，版本号：${globalVersion}`,
            created_by: 1000, // 默认system对应的ID，可根据实际系统配置调整
            updated_by: 1000, // 默认system对应的ID
            versionSeqNo: 0, // 版本序列号，无特殊要求填0
            globalVersion: globalVersion // 解析后的全局版本号
          };

          // 调用库存更新接口
          const updateResult = await updateStockBySku(sku, updateData);
          // 记录成功结果
          batchResult.successList.push({
            sku,
            changeAmount,
            message: updateResult.message || '库存更新成功',
            detail: updateResult
          });
        } catch (error: any) {
          const errorMsg = error.response?.data?.error || error.message || '更新失败';
          // 记录失败结果
          batchResult.failList.push({
            sku,
            changeAmount,
            errorMsg: errorMsg
          });
          console.error(`SKU【${sku}】库存更新失败：`, errorMsg);
        }
      }

      // 返回批量处理结果
      return batchResult;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || '批量更新库存异常';
      console.error('批量更新库存失败：', errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
  };

  // 清空富文本内容
  const handleClearContent = () => {
    // 重置状态
    setRichTextContent("");
    setUploadedFile(null);
    setParseResult(null);
    
    // 重置文件输入元素的值，允许再次选择相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 上传富文本编辑后的内容（集成批量更新库存逻辑）
  const handleUploadContent = () => {
    if (!richTextContent.trim()) {
      alert("富文本内容不能为空，请先编辑内容！");
      return;
    }

    // 调用批量更新库存函数
    setIsBatchUpdating(true);
    batchUpdateStockFromRichText(richTextContent)
      .then((result) => {
        const tipMsg = `批量更新完成！成功：${result.successList.length} 个，失败：${result.failList.length} 个`;
        alert(tipMsg);
        console.log('批量更新成功列表：', result.successList);
        console.log('批量更新失败列表：', result.failList);
        
        // 若有PDF解析结果，提示对应信息
        if (parseResult) {
          console.log("PDF解析结果辅助验证：", parseResult);
        }
      })
      .catch((error) => {
        alert(error.message);
        console.error('批量更新库存异常：', error);
      })
      .finally(() => {
        setIsBatchUpdating(false);
      });
  };

  return (
    <div className="m-8 w-full">
      <h1 className="text-2xl font-bold mb-8">File Transformation</h1>
      <Card>
        <CardHeader>
          <CardTitle>文件上传与富文本编辑</CardTitle>
          <CardDescription>上传文件后编辑内容，支持保存与清空操作</CardDescription>
          <CardAction>文件处理工具</CardAction>
        </CardHeader>
        <CardContent>
          {/* 横向三栏布局 */}
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* 左侧：文件上传区域 */}
            <div className="lg:w-1/4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-center w-full"
              >
                <span className="block text-gray-700 font-medium mb-2">
                  选择文件上传
                </span>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf, .txt, .md"
                />
                <div className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-md px-4 py-2 w-full max-w-xs">
                  <span className="text-blue-600 font-medium">
                    点击上传文件
                  </span>
                </div>
              </label>
              {/* 已上传文件信息 */}
              {uploadedFile && (
                <div className="mt-4 w-full text-center">
                  <p className="text-gray-800 text-sm">
                    已选择：<span className="font-medium">{uploadedFile.name}</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    大小：{(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                  {/* 加载状态 */}
                  {isParsing && (
                    <p className="text-amber-600 text-xs mt-2">
                      PDF解析中...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 中间：富文本编辑器（支持React 19） */}
            <div className="lg:w-2/4 w-full">
              <label className="block text-gray-700 font-medium mb-2">
                内容编辑
              </label>
              <div className="border border-gray-300 rounded-lg min-h-[300px]">
                {/* 替换为 textarea 多行输入框，保留原有样式和状态绑定 */}
                <textarea
                  value={richTextContent}
                  onChange={(e) => setRichTextContent(e.target.value)} // 实时更新内容状态
                  placeholder="请编辑内容（或等待文件上传后自动填充）...\n示例格式：\n# PDF解析结果\n## 请自己加入版本号：1.0.0\n\n| SKU | 数量 | 操作类型 |\n|-----|------|----------|\n| A72-L-BLACK | 1 | 出库 |"
                  className="w-full h-full min-h-[300px] p-3 outline-none resize-none bg-transparent"
                />
              </div>
            </div>

            {/* 右侧：功能按钮组 */}
            <div className="lg:w-1/4 flex flex-col gap-4 items-center justify-center">
              <button
                onClick={handleClearContent}
                className="w-full max-w-xs px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors duration-200"
                disabled={isBatchUpdating} // 批量更新时禁用
              >
                清空内容
              </button>
              <button
                onClick={handleUploadContent}
                className="w-full max-w-xs px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
                disabled={isParsing || isBatchUpdating} // 解析或批量更新时禁用
              >
                {isBatchUpdating ? "批量更新中..." : "上传/批量更新"}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-gray-500 text-sm">
            提示：1. 上传PDF自动生成表格 2. 手动补充版本号（格式：版本号：x.x.x） 3. 点击上传按钮批量更新库存
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default FileTransformation;