
import Modal from "react-modal";
import { useState } from "react";
import Button from "./Button";

Modal.setAppElement("#root");

export default function ImportModal({ isOpen, onRequestClose, onImport }) {
  const [tab, setTab] = useState("mnemonic");
  const [mnemonic, setMnemonic] = useState("");
  const [priv, setPriv] = useState("");
  const [json, setJson] = useState("");
  const [password, setPassword] = useState("");

  const footer = (
    <div className="flex gap-2 justify-end mt-4">
      <Button variant="outline" onClick={onRequestClose}>Close</Button>
      {tab === "mnemonic" && <Button onClick={()=>onImport({ type:"mnemonic", value: mnemonic })}>Import</Button>}
      {tab === "privateKey" && <Button onClick={()=>onImport({ type:"privateKey", value: priv })}>Import</Button>}
      {tab === "keystore" && <Button onClick={()=>onImport({ type:"keystore", value: json, password })}>Import</Button>}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="max-w-2xl mx-auto mt-24 p-6 glass outline-none rounded-2xl" overlayClassName="fixed inset-0 bg-black/50">
      <div className="flex gap-2 mb-4">
        <button className={`btn-outline ${tab==="mnemonic"?"!bg-white/10":""}`} onClick={()=>setTab("mnemonic")}>Mnemonic</button>
        <button className={`btn-outline ${tab==="privateKey"?"!bg-white/10":""}`} onClick={()=>setTab("privateKey")}>Private Key</button>
        <button className={`btn-outline ${tab==="keystore"?"!bg-white/10":""}`} onClick={()=>setTab("keystore")}>Keystore JSON</button>
      </div>

      {tab==="mnemonic" && (
        <div className="grid gap-2">
          <div className="label">Mnemonic phrase</div>
          <textarea className="input min-h-[120px]" value={mnemonic} onChange={e=>setMnemonic(e.target.value)} placeholder="word1 word2 ... word12" />
        </div>
      )}
      {tab==="privateKey" && (
        <div className="grid gap-2">
          <div className="label">Private key (0x...)</div>
          <input className="input" value={priv} onChange={e=>setPriv(e.target.value)} />
        </div>
      )}
      {tab==="keystore" && (
        <div className="grid gap-2">
          <div className="label">Keystore JSON</div>
          <textarea className="input min-h-[160px]" value={json} onChange={e=>setJson(e.target.value)} />
          <div className="label">Password</div>
          <input className="input" value={password} onChange={e=>setPassword(e.target.value)} type="password" />
        </div>
      )}

      {footer}
    </Modal>
  );
}
