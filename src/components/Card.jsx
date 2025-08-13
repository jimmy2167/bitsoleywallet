export default function Card({ title, action, children, className="" }) {
  return (
    <div className={`glass p-4 md:p-6 shadow-card ${className}`}>
      <div className="flex items-center justify-between mb-3">
        {title && <h3 className="text-lg md:text-xl font-semibold tracking-wide">{title}</h3>}
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}
