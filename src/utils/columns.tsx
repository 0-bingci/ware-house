import type { ColumnDef } from "@tanstack/react-table";
import type { Stock } from "@/types/stock";
import { Button } from "@/components/ui/button"; // 引入按钮组件

export const StockColumns: ColumnDef<Stock>[] = [
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "color",
    header: "Color",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "action",
    header: "Action",
    // 核心：自定义 cell 渲染，添加修改和删除按钮
    cell: ({ row }) => {
      // 获取当前行的 Stock 数据（可用于后续修改/删除逻辑）
      const currentStock = row.original; // row.original 对应当前行的原始数据

      // 自定义修改按钮点击事件
      const handleEdit = () => {
        console.log("修改库存：", currentStock);
        // 后续可扩展：打开修改弹窗、携带当前行数据等
      };

      // 自定义删除按钮点击事件
      const handleDelete = () => {
        console.log("删除库存：", currentStock);
        // 后续可扩展：弹出确认弹窗、调用删除接口等
      };

      return (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleEdit}>
            修改
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            删除
          </Button>
        </div>
      );
    },
  },
];