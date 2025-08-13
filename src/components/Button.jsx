import cn from "classnames";
export default function Button({ children, className="", variant="solid", ...props }) {
  const base = variant === "solid" ? "btn" : "btn-outline";
  return (
    <button className={cn(base, "disabled:opacity-50", className)} {...props}>
      {children}
    </button>
  );
}
