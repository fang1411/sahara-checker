import { NextApiRequest, NextApiResponse } from "next";

// 模拟返回随机状态（部署时请替换为 puppeteer 查询真实网页）
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const address = req.query.address as string;
  if (!address) return res.status(400).json({ error: "缺少地址" });

  const eligible = Math.random() > 0.5;
  const allocation = eligible ? Math.floor(Math.random() * 1000) : 0;

  res.status(200).json({ eligible, allocation });
}
