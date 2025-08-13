
import { useState } from "react";
import Button from "./Button";
import { downloadText } from "../lib/download";

export default function BackupPanel({ mnemonic, address, wallet }) {
  const [password, setPassword] = useState("");
  const hasMnemonic = Boolean(mnemonic);

  const downloadPlain = () => {
    const content = `BitSoley Wallet Backup\n\nAddress:\n${address}\n\nMnemonic Phrase:\n${mnemonic}\n\nKeep this file offline and never share it.`;
    downloadText(`bitsoley-backup-${address}.txt`, content);
  };

  const downloadKeystore = async () => {
    try {
      if (!password) return alert("Set a password");
      const json = await wallet.encrypt(password);
      downloadText(`bitsoley-keystore-${address}.json`, json);
    } catch (e) {
      alert(e.message || "Failed to encrypt");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="label">Mnemonic (write down offline)</div>
      <div className="mono bg-black/40 p-3 rounded-lg border border-white/10 break-all">{hasMnemonic ? mnemonic : "Hidden — lock/unlock to view"}</div>
      <div className="grid md:grid-cols-3 gap-2">
        <Button onClick={downloadPlain}>Download Plaintext</Button>
        <input className="input" placeholder="Keystore password" value={password} onChange={e=>setPassword(e.target.value)} />
        <Button onClick={downloadKeystore}>Download Encrypted Keystore</Button>
      </div>
      <div className="text-xs opacity-60">
        Never share your mnemonic or keystore. Prefer the encrypted keystore backup with a strong password.
      </div>
    </div>
  );
}
