
import QRCode from "qrcode.react";
export default function QRAddress({ address }) {
  if (!address) return null;
  return (
    <div className="flex flex-col items-center gap-2">
      <QRCode value={address} size={160} includeMargin />
      <code className="text-sm break-all opacity-80">{address}</code>
    </div>
  );
}
