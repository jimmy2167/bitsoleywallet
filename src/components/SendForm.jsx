
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ERC20_ABI } from "../lib/erc20Abi";
import Button from "./Button";

export default function SendForm({ provider, wallet, nativeSymbol, tokens, addressBook }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("native");
  const [maxFeePerGas, setMaxFeePerGas] = useState("");
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState("");
  const [nonce, setNonce] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(()=>{
    (async()=>{
      if (!wallet || !provider) return;
      try {
        const n = await provider.getTransactionCount(wallet.address);
        setNonce(String(n));
        const fee = await provider.getFeeData();
        if (fee.maxFeePerGas) setMaxFeePerGas(ethers.formatUnits(fee.maxFeePerGas, "gwei"));
        if (fee.maxPriorityFeePerGas) setMaxPriorityFeePerGas(ethers.formatUnits(fee.maxPriorityFeePerGas, "gwei"));
      } catch {}
    })();
  }, [wallet, provider]);

  async function send() {
    if (!wallet) return;
    setSending(true);
    try {
      const signer = wallet.connect(provider);
      let tx;
      const overrides = {
        nonce: nonce ? Number(nonce) : undefined,
        maxFeePerGas: maxFeePerGas ? ethers.parseUnits(maxFeePerGas, "gwei") : undefined,
        maxPriorityFeePerGas: maxPriorityFeePerGas ? ethers.parseUnits(maxPriorityFeePerGas, "gwei") : undefined,
      };
      if (token === "native") {
        tx = await signer.sendTransaction({ to, value: ethers.parseEther(amount || "0"), ...overrides });
      } else {
        const meta = tokens.find(t => t.address === token);
        if (!meta) throw new Error("Token not found");
        const c = new ethers.Contract(meta.address, ERC20_ABI, signer);
        const value = ethers.parseUnits(amount || "0", meta.decimals);
        tx = await c.transfer(to, value, overrides);
      }
      await tx.wait();
      alert("Sent! " + tx.hash);
      setAmount(""); setTo("");
    } catch (e) {
      console.error(e); alert(e.message || "Send failed");
    } finally { setSending(false); }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <select className="input" value={token} onChange={e=>setToken(e.target.value)}>
          <option value="native">{nativeSymbol}</option>
          {tokens.map(t => <option key={t.address} value={t.address}>{t.symbol}</option>)}
        </select>
        <input className="input" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
      </div>
      <input className="input" placeholder="To address" value={to} onChange={e=>setTo(e.target.value)} list="addrbook" />
      <datalist id="addrbook">
        {addressBook.map((e,i)=>(<option key={i} value={e.addr}>{e.label}</option>))}
      </datalist>
      <div className="grid md:grid-cols-3 gap-2">
        <input className="input" placeholder="Max Fee (gwei)" value={maxFeePerGas} onChange={e=>setMaxFeePerGas(e.target.value)} />
        <input className="input" placeholder="Priority Fee (gwei)" value={maxPriorityFeePerGas} onChange={e=>setMaxPriorityFeePerGas(e.target.value)} />
        <input className="input" placeholder="Nonce (optional)" value={nonce} onChange={e=>setNonce(e.target.value)} />
      </div>
      <Button onClick={send} disabled={sending}>{sending ? "Sending..." : "Send"}</Button>
    </div>
  );
}
