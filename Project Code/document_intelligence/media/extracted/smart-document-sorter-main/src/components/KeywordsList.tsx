import { motion } from "framer-motion";
import { Key } from "lucide-react";

interface KeywordsListProps {
  keywords: string[];
}

const KeywordsList = ({ keywords }: KeywordsListProps) => {
  if (keywords.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto rounded-xl border border-border bg-card p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Key className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Extracted Keywords</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <motion.span
            key={keyword}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-mono text-secondary-foreground"
          >
            {keyword}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

export default KeywordsList;
