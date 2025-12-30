import type { Stock } from "@/types/stock";
import { DataTable } from "@/components/table/common/DataTable";
import { StockColumns } from "@/utils/columns";

const stockColumns: Stock[] = [
  {
    sku: "SKU-001",
    name: "Product 1",
    size: "Small",
    color: "Red",
    amount: 10,
  },
  {
    sku: "SKU-002",
    name: "Product 2",
    size: "Medium",
    color: "Blue",
    amount: 5,
  },
  {
    sku: "SKU-001",
    name: "Product 1",
    size: "Small",
    color: "Red",
    amount: 10,
  },
  {
    sku: "SKU-002",
    name: "Product 2",
    size: "Medium",
    color: "Blue",
    amount: 5,
  },
  {
    sku: "SKU-001",
    name: "Product 1",
    size: "Small",
    color: "Red",
    amount: 10,
  },
  {
    sku: "SKU-002",
    name: "Product 2",
    size: "Medium",
    color: "Blue",
    amount: 5,
  },
  {
    sku: "SKU-001",
    name: "Product 1",
    size: "Small",
    color: "Red",
    amount: 10,
  },
  {
    sku: "SKU-002",
    name: "Product 2",
    size: "Medium",
    color: "Blue",
    amount: 5,
  },
  {
    sku: "SKU-001",
    name: "Product 1",
    size: "Small",
    color: "Red",
    amount: 10,
  },
  {
    sku: "SKU-002",
    name: "Product 2",
    size: "Medium",
    color: "Blue",
    amount: 5,
  },
  {
    sku: "SKU-001",
    name: "Product 1",
    size: "Small",
    color: "Red",
    amount: 10,
  },
  {
    sku: "SKU-002",
    name: "Product 2",
    size: "Medium",
    color: "Blue",
    amount: 5,
  },
  {
    sku: "SKU-001",
    name: "Product 1",
    size: "Small",
    color: "Red",
    amount: 10,
  },
  {
    sku: "SKU-002",
    name: "Product 2",
    size: "Medium",
    color: "Blue",
    amount: 5,
  },
];
export const StockList = () => {
  return <DataTable columns={StockColumns} data={stockColumns} />;
};
