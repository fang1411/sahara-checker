import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Upload } from "lucide-react";

export default function SaharaBatchChecker() {
  const [addresses, setAddresses] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    const list = addresses
      .split("\n")
      .map((addr) => addr.trim())
      .filter((addr) => addr);

    setLoading(true);
    const newResults = [];

    for (const addr of list) {
      newResults.push({ address: addr, status: "查询中..." });
      setResults([...newResults]);

      try {
        const res = await fetch("/api/sahara-check?address=" + addr);
        const data = await res.json();

        if (data?.eligible !== undefined) {
          newResults[newResults.length - 1].status = data.eligible
            ? `✅ 有资格，分配: ${data.allocation}`
            : "❌ 无资格";
        } else {
          newResults[newResults.length - 1].status = "⚠️ 查询失败";
        }
      } catch (err) {
        newResults[newResults.length - 1].status = "❌ 网络错误";
      }

      setResults([...newResults]);
      await new Promise((r) => setTimeout(r, 1500));
    }

    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setAddresses(text);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const csvContent = "地址,状态\n" + results.map(r => `${r.address},${r.status}`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sahara_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Sahara Airdrop 批量查询工具</h1>
      <p className="text-sm mb-2 text-muted-foreground">
        粘贴或导入钱包地址，每行一个。例如：<br />0xabc123...<br />0xdef456...
      </p>
      <div className="flex flex-col gap-2 mb-4">
        <Input
          className="h-32 resize-y overflow-auto"
          as="textarea"
          value={addresses}
          onChange={(e) => setAddresses(e.target.value)}
          placeholder="在这里输入钱包地址，一行一个"
        />
        <div className="flex gap-2 items-center">
          <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" id="upload-input" />
          <label htmlFor="upload-input">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-1" /> 导入 .txt
            </Button>
          </label>
          <Button onClick={handleCheck} disabled={loading}>
            {loading ? "查询中..." : "开始查询"}
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={!results.length}>
            <Download className="w-4 h-4 mr-1" /> 导出结果
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {results.map((res, idx) => (
          <Card key={idx} className="bg-muted">
            <CardContent className="p-3">
              <div className="font-mono text-sm">{res.address}</div>
              <div className="text-sm text-muted-foreground">{res.status}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
