
import { useState } from "react";
import Button from "./Button";

export default function AddressBook({ entries, setEntries }) {
  const [label, setLabel] = useState("");
  const [addr, setAddr] = useState("");

  function add() {
    if (!label || !addr) return;
    setEntries([{ label, addr }, ...entries]);
    setLabel(""); setAddr("");
  }
  function del(i) {
    const copy = entries.slice(); copy.splice(i,1); setEntries(copy);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid md:grid-cols-3 gap-2">
        <input className="input" placeholder="Label" value={label} onChange={e=>setLabel(e.target.value)} />
        <input className="input md:col-span-2" placeholder="0x..." value={addr} onChange={e=>setAddr(e.target.value)} />
      </div>
      <Button onClick={add}>Add to Address Book</Button>
      <div className="grid gap-2">
        {entries.map((e,i)=>(
          <div className="glass p-3 rounded-xl flex items-center justify-between" key={i}>
            <div><div className="font-semibold">{e.label}</div><div className="text-xs opacity-60 break-all">{e.addr}</div></div>
            <Button variant="danger" onClick={()=>del(i)}>Delete</Button>
          </div>
        ))}
        {entries.length===0 && <div className="opacity-60 text-sm">No saved addresses.</div>}
      </div>
    </div>
  );
}
