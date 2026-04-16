import { Upload } from "lucide-react";
import { motion } from "framer-motion";

interface UploadButtonProps {
  onClick: () => void;
}

const UploadButton = ({ onClick }: UploadButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="group relative flex items-center gap-3 rounded-lg px-8 py-4 font-semibold text-primary-foreground transition-all"
      style={{ background: "var(--gradient-primary)" }}
    >
      <div className="absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100" style={{ boxShadow: "var(--shadow-glow)" }} />
      <Upload className="h-5 w-5" />
      <span>Upload .txt or .pdf Article</span>
    </motion.button>
  );
};

export default UploadButton;
