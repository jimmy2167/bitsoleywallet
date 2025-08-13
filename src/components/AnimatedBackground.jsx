
import { motion } from "framer-motion";
export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 lux-gradient">
      <motion.div
        className="absolute -top-32 -left-24 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(142,45,226,0.35), transparent 60%)" }}
        animate={{ x: [0, 30, -30, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -right-24 w-[700px] h-[700px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(74,0,224,0.30), transparent 60%)" }}
        animate={{ x: [0, -20, 10, 0], y: [0, -15, 15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
