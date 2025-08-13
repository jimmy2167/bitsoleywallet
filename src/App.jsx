
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import AnimatedBackground from "./components/AnimatedBackground";
import Card from "./components/Card";
import Button from "./components/Button";
import QRAddress from "./components/QRAddress";
import TokenList from "./components/TokenList";
import SendForm from "./components/SendForm";
import History from "./components/History";
import AddressBook from "./components/AddressBook";
import BackupPanel from "./components/BackupPanel";
import ImportModal from "./components/ImportModal";
import { DEFAULT_NETWORK, DEFAULT_TOKENS } from "./lib/config";
import { saveState, loadState, clearState } from "./lib/storage";
import { initWalletConnect, getWeb3Wallet, buildNamespaces } from "./lib/walletconnect";

export default function App() {
  const saved = loadState();
  const [network, setNetwork] = useState(saved.network || DEFAULT_NETWORK);
  const [mnemonic, setMnemonic] = useState(saved.mnemonic || "");
  const [address, setAddress] = useState(saved.address || "");
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState("0");
  const [tokens, setTokens] = useState(saved.tokens || DEFAULT_TOKENS);
  const [wcProjectId, setWcProjectId] = useState(saved.wcProjectId || "demo");
  const [wcUri, setWcUri] = useState("");
  const [wcStatus, setWcStatus] = useState("disconnected");
  const [addrBook, setAddrBook] = useState(saved.addrBook || []);
  const [importOpen, setImportOpen] = useState(false);

  const provider = useMemo(() => new ethers.JsonRpcProvider(network.rpcUrl), [network.rpcUrl]);

  useEffect(() => {
    saveState({ network, mnemonic, address, tokens, wcProjectId, addrBook });
  }, [network, mnemonic, address, tokens, wcProjectId, addrBook]);

  useEffect(() => {
    let stop = false;
    async function load() {
      if (!address) return;
      try {
        const bal = await provider.getBalance(address);
        if (!stop) setBalance(ethers.formatEther(bal));
      } catch {}
    }
    load();
    const iv = setInterval(load, 12000);
    return () => { stop = true; clearInterval(iv); };
  }, [provider, address]);

  function createWallet() {
    const w = ethers.Wallet.createRandom();
    setMnemonic(w.mnemonic?.phrase || "");
    setAddress(w.address);
    setWallet(w);
  }

  async function handleImport(payload) {
    try {
      if (payload.type === "mnemonic") {
        const w = ethers.Wallet.fromPhrase(payload.value.trim());
        setMnemonic(w.mnemonic?.phrase || payload.value.trim());
        setAddress(w.address);
        setWallet(w);
      } else if (payload.type === "privateKey") {
        const w = new ethers.Wallet(payload.value.trim());
        setMnemonic(""); setAddress(w.address); setWallet(w);
      } else if (payload.type === "keystore") {
        const w = await ethers.Wallet.fromEncryptedJson(payload.value, payload.password);
        setMnemonic(""); setAddress(w.address); setWallet(w);
      }
      setImportOpen(false);
    } catch (e) { alert(e.message || "Import failed"); }
  }

  function lock() {
    setMnemonic("");
    setAddress("");
    setWallet(null);
    clearState();
  }

  async function addNetworkDeepLink() {
    if (window?.ethereum?.request) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x" + Number(network.chainId).toString(16),
            rpcUrls: [network.rpcUrl],
            chainName: network.name,
            nativeCurrency: { name: network.symbol, symbol: network.symbol, decimals: 18 },
            blockExplorerUrls: [network.explorer]
          }]
        });
      } catch (e) { alert(e.message || "wallet_addEthereumChain failed"); }
    } else {
      const url = `https://metamask.app.link/dapp/${location.host}`;
      window.open(url, "_blank");
    }
  }

  async function pairWalletConnect() {
    try {
      setWcStatus("initializing");
      const w3w = await initWalletConnect(wcProjectId);
      setWcStatus("listening");
      w3w.on("session_proposal", async (proposal) => {
        if (!address) return;
        const { id } = proposal;
        const ns = buildNamespaces(network.chainId, address);
        const session = await w3w.approveSession({ id, namespaces: ns });
        setWcStatus("paired");
        console.log("WC session approved:", session);
      });
      await getWeb3Wallet().core.pairing.pair({ uri: wcUri });
    } catch (e) { console.error(e); setWcStatus("error"); alert(e.message || "WalletConnect error"); }
  }

  useEffect(() => {
    const w3w = getWeb3Wallet();
    if (!w3w || !wallet) return;
    const handler = async (event) => {
      const { id, topic, params } = event;
      try {
        const req = params.request;
        const method = req.method;
        const signer = wallet.connect(provider);
        let result;
        if (method === "personal_sign") {
          const msg = req.params[0] || req.params[1];
          result = await signer.signMessage(ethers.getBytes(msg));
        } else if (method === "eth_signTypedData" || method === "eth_signTypedData_v4") {
          const [addr, typedData] = req.params;
          result = await signer.signTypedData(typedData.domain, typedData.types, typedData.message);
        } else if (method === "eth_sendTransaction") {
          const txReq = req.params[0];
          const tx = await signer.sendTransaction({
            to: txReq.to,
            value: txReq.value ? BigInt(txReq.value) : 0n,
            data: txReq.data || "0x"
          });
          result = tx.hash;
        } else {
          throw new Error("Unsupported method: " + method);
        }
        await w3w.respondSessionRequest({ topic, response: { id, jsonrpc: "2.0", result } });
      } catch (e) {
        await w3w.respondSessionRequest({
          topic,
          response: { id, jsonrpc: "2.0", error: { code: 5000, message: e.message } }
        });
      }
    };
    w3w.on("session_request", handler);
    return () => w3w.off("session_request", handler);
  }, [wallet, provider]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground />
      <header className="px-4 py-4 md:px-8 md:py-6 flex items-center justify-between">
        <motion.h1 initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="text-2xl md:text-3xl font-extrabold tracking-wide">
          <span className="opacity-70">Bit</span><span className="text-luxe">Soley</span> Wallet
        </motion.h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addNetworkDeepLink}>Add Network</Button>
          {address ? <Button variant="danger" onClick={lock}>Lock</Button> : null}
        </div>
      </header>

      <main className="px-4 md:px-8 pb-24 grid gap-6 max-w-5xl mx-auto">
        {!address && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="grid gap-4">
            <Card title="Welcome">
              <p className="opacity-80">Create or import a wallet to get started on BitSoley. Back up your seed phrase securely.</p>
              <div className="mt-4 flex gap-3">
                <Button onClick={createWallet}>Create Wallet</Button>
                <Button variant="outline" onClick={()=>setImportOpen(true)}>Import Wallet</Button>
              </div>
            </Card>

            <Card title="Network">
              <div className="grid md:grid-cols-2 gap-3">
                <input className="input" value={network.name} onChange={e=>setNetwork({...network,name:e.target.value})} placeholder="Network Name"/>
                <input className="input" value={network.chainId} onChange={e=>setNetwork({...network,chainId: Number(e.target.value||0)})} placeholder="Chain ID"/>
                <input className="input" value={network.rpcUrl} onChange={e=>setNetwork({...network,rpcUrl:e.target.value})} placeholder="RPC URL"/>
                <input className="input" value={network.symbol} onChange={e=>setNetwork({...network,symbol:e.target.value})} placeholder="Symbol"/>
                <input className="input" value={network.explorer} onChange={e=>setNetwork({...network,explorer:e.target.value})} placeholder="Explorer URL"/>
                <input className="input" value={network.explorerApi} onChange={e=>setNetwork({...network,explorerApi:e.target.value})} placeholder="Explorer API URL"/>
              </div>
            </Card>

            <Card title="WalletConnect (optional)">
              <div className="grid md:grid-cols-3 gap-3">
                <input className="input" value={wcProjectId} onChange={e=>setWcProjectId(e.target.value)} placeholder="WalletConnect Project ID"/>
                <input className="input md:col-span-2" value={wcUri} onChange={e=>setWcUri(e.target.value)} placeholder="Paste wc: URI from a dApp"/>
              </div>
              <div className="mt-3">
                <Button onClick={pairWalletConnect}>Pair</Button>
                <span className="ml-3 opacity-70 text-sm">Status: {wcStatus}</span>
              </div>
            </Card>
          </motion.div>
        )}

        {address && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="grid gap-6">
            <Card title="Wallet" action={<span className="text-sm opacity-80">{network.name}</span>}>
              <div className="grid md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2">
                  <div className="label">Address</div>
                  <div className="mono break-all text-[13px]">{address}</div>
                  <div className="mt-3 text-3xl font-bold">{balance} {network.symbol}</div>
                </div>
                <QRAddress address={address} />
              </div>
            </Card>

            <Card title="Backup & Security">
              <BackupPanel mnemonic={mnemonic} address={address} wallet={wallet} />
            </Card>

            <Card title="Send">
              <SendForm provider={provider} wallet={wallet} nativeSymbol={network.symbol} tokens={tokens} addressBook={addrBook} />
            </Card>

            <Card title="Tokens">
              <TokenList provider={provider} address={address} tokens={tokens} setTokens={setTokens} />
            </Card>

            <Card title="Activity">
              <History address={address} explorerApi={network.explorerApi} explorer={network.explorer} />
            </Card>

            <Card title="Address Book">
              <AddressBook entries={addrBook} setEntries={setAddrBook} />
            </Card>
          </motion.div>
        )}
      </main>

      <footer className="px-4 md:px-8 py-8 opacity-60 text-xs text-center">
        © BitSoley Wallet — futuristic glass UI • Built with React, Tailwind, Framer Motion, Ethers, WalletConnect
      </footer>

      <ImportModal isOpen={importOpen} onRequestClose={()=>setImportOpen(false)} onImport={handleImport} />
    </div>
  );
}
