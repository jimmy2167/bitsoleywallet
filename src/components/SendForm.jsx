import { useState } from "react";
import { ethers } from "ethers";
import { ERC20_ABI } from "../lib/erc20Abi";
import Button from "./Button";

export default function SendForm({ provider, wallet, nativeSymbol, tokens }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("native");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!wallet) return;
    setSending(true);
    try {
      const signer = wallet.connect(provider);
      if (token === "native") {
        const tx = await signer.sendTransaction({ to, value: ethers.parseEther(amount || "0") });
        await tx.wait();
        alert("Sent! " + tx.hash);
      } else {
        const meta = tokens.find(t => t.address === token);
        if (!meta) throw new Error("Token not found");
        const c = new ethers.Contract(meta.address, ERC20_ABI, signer);
        const value = ethers.parseUnits(amount || "0", meta.decimals);
        const tx = await c.transfer(to, value);
        await tx.wait();
        alert("Sent token! " + tx.hash);
      }
      setAmount("");
      setTo("");
    } catch (e) {
      console.error(e);
      alert(e.message || "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="glass p-4 rounded-2xl flex flex-col gap-3">
      <div className="flex gap-2">
        <select className="input" value={token} onChange={e=>setToken(e.target.value)}>
          <option value="native">{nativeSymbol}</option>
          {tokens.map(t => <option key={t.address} value={t.address}>{t.symbol}</option>)}
        </select>
        <input className="input" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
      </div>
      <input className="input" placeholder="To address" value={to} onChange={e=>setTo(e.target.value)} />
      <Button onClick={send} disabled={sending}>{sending ? "Sending..." : "Send"}</Button>
    </div>
  );
}
