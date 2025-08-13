import { useEffect, useState } from "react";
import { fetchTxHistory } from "../lib/explorer";

export default function History({ address, explorerApi, explorer }) {
  const [items, setItems] = useState([]);
  useEffect(()=>{
    if (!address) return;
    let stop = false;
    async function load() {
      try {
        const list = await fetchTxHistory(address, explorerApi);
        if (!stop) setItems(list.slice(0, 25));
      } catch (e) { /* ignore */ }
    }
    load();
    const iv = setInterval(load, 15000);
    return () => { stop = true; clearInterval(iv); };
  }, [address, explorerApi]);
  return (
    <div className="flex flex-col gap-2">
      {items.map(tx => (
        <a key={tx.hash} href={`${explorer}/tx/${tx.hash}`} target="_blank" rel="noreferrer"
           className="glass p-3 rounded-xl hover:shadow-glow transition">
          <div className="text-xs opacity-60">Block {tx.blockNumber}</div>
          <div className="text-sm break-all mt-1">{tx.hash}</div>
          <div className="text-xs opacity-60 mt-1">{tx.from} → {tx.to}</div>
        </a>
      ))}
      {items.length === 0 && <div className="opacity-60 text-sm">No recent transactions.</div>}
    </div>
  );
}
