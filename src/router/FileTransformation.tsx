import { useState } from "react";

// 导入PDF解析API
import { parsePDF } from '@/api/stock';

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

function FileTransformation() {
  // 状态管理：富文本内容、上传的文件、解析结果、加载状态
  const [richTextContent, setRichTextContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState(null);

  // 处理文件上传变更事件
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setParseResult(null);
      setError(null);
      
      // 检查是否为PDF文件
      if (file.type === 'application/pdf') {
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
  const parsePDFContent = async (file) => {
    setIsParsing(true);
    setError(null);
    try {
      // 调用PDF解析API
      const result = await parsePDF(file);
      setParseResult(result.data);
      
      // 将解析结果转换为富文本格式
      let markdownContent = `# PDF解析结果\n\n`;
      
      if (result.data && result.data.length > 0) {
        result.data.forEach(item => {
          markdownContent += `| ${item.sku} | ${item.count} | ${item.operation_type} |\n`;
        });
      } else {
        markdownContent += `没有解析到数据\n\n`;
      }
      
      setRichTextContent(markdownContent);
    } catch (err) {
      console.error('PDF解析失败：', err);
      setError(err.message || 'PDF解析失败');
      setRichTextContent(`# PDF解析结果\n\n## 解析状态：失败\n\n## 错误信息：${err.message || '未知错误'}\n\n`);
    } finally {
      setIsParsing(false);
    }
  };

  // 清空富文本内容
  const handleClearContent = () => {
    setRichTextContent("");
    setUploadedFile(null);
    setParseResult(null);
    setError(null);
  };

  // 上传富文本编辑后的内容
  const handleUploadContent = () => {
    if (!richTextContent.trim()) {
      alert("富文本内容不能为空，请先编辑内容！");
      return;
    }
    
    console.log("待上传的富文本内容：", richTextContent);
    console.log("已上传的文件：", uploadedFile);
    console.log("PDF解析结果：", parseResult);
    
    // 这里可以添加实际的上传逻辑，根据parseResult是否存在来决定上传方式
    if (parseResult) {
      // 处理PDF解析结果的上传
      alert("PDF解析结果提交成功！（实际项目中请替换为真实接口请求）");
    } else {
      // 处理普通富文本内容的上传
      alert("内容提交成功！（实际项目中请替换为真实接口请求）");
    }
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
                  placeholder="请编辑内容（或等待文件上传后自动填充）..."
                  className="w-full h-full min-h-[300px] p-3 outline-none resize-none bg-transparent"
                />
              </div>
            </div>

            {/* 右侧：功能按钮组 */}
            <div className="lg:w-1/4 flex flex-col gap-4 items-center justify-center">
              <button
                onClick={handleClearContent}
                className="w-full max-w-xs px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors duration-200"
              >
                清空内容
              </button>
              <button
                onClick={handleUploadContent}
                className="w-full max-w-xs px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
              >
                上传内容
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-gray-500 text-sm">
            提示：上传文件后可编辑富文本内容，编辑完成后点击「上传内容」提交
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default FileTransformation;