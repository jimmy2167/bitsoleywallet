
export async function fetchTxHistory(address, apiBase) {
  const url = `${apiBase}?module=account&action=txlist&address=${address}&sort=desc`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Explorer API error");
  const data = await res.json();
  const list = data.result || data.items || [];
  return list.map(x => ({
    hash: x.hash || x.tx_hash || x.transactionHash,
    from: x.from,
    to: x.to,
    value: x.value,
    timeStamp: x.timeStamp || x.timestamp || x.time,
    blockNumber: x.blockNumber || x.block_number || x.block,
    status: (x.isError === "0" || x.success === true) ? "ok" : "pending"
  }));
}
