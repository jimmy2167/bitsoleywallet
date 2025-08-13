
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ERC20_ABI } from "../lib/erc20Abi";

export default function TokenList({ provider, address, tokens, setTokens }) {
  const [balances, setBalances] = useState({});
  const [newAddr, setNewAddr] = useState("");

  useEffect(() => {
    if (!provider || !address) return;
    let stop = false;
    async function load() {
      const out = {};
      for (const t of tokens) {
        try {
          const c = new ethers.Contract(t.address, ERC20_ABI, provider);
          const bal = await c.balanceOf(address);
          out[t.address] = ethers.formatUnits(bal, t.decimals);
        } catch {}
      }
      if (!stop) setBalances(out);
    }
    load();
    const iv = setInterval(load, 15000);
    return () => { stop = true; clearInterval(iv); };
  }, [provider, address, tokens]);

  async function addToken() {
    try {
      const c = new ethers.Contract(newAddr, ERC20_ABI, provider);
      const [name, symbol, decimals] = await Promise.all([c.name(), c.symbol(), c.decimals()]);
      const newT = { address: newAddr, name, symbol, decimals: Number(decimals) };
      if (!tokens.find(x => x.address.toLowerCase() === newAddr.toLowerCase())) {
        setTokens([newT, ...tokens]);
      }
      setNewAddr("");
    } catch {
      alert("Invalid token address or network error.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input className="input" placeholder="Add ERC-20 by address" value={newAddr} onChange={e=>setNewAddr(e.target.value)} />
        <button className="btn" onClick={addToken}>Add</button>
      </div>
      <div className="grid gap-3">
        {tokens.map(t => (
          <div key={t.address} className="glass p-3 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-semibold">{t.name} <span className="opacity-70">({t.symbol})</span></div>
              <div className="text-xs opacity-60 break-all">{t.address}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{balances[t.address] || "0"}</div>
              <div className="text-xs opacity-60">decimals: {t.decimals}</div>
            </div>
          </div>
        ))}
        {tokens.length === 0 && <div className="opacity-60 text-sm">No tokens yet — add one above.</div>}
      </div>
    </div>
  );
}
