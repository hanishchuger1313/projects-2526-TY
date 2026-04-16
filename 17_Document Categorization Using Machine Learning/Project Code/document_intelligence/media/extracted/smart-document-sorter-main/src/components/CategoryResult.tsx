import { motion } from "framer-motion";
import { Tag } from "lucide-react";

const CATEGORY_STYLES: Record<string, string> = {
  educational: "bg-category-educational/15 text-category-educational border-category-educational/30",
  entertainment: "bg-category-entertainment/15 text-category-entertainment border-category-entertainment/30",
  sports: "bg-category-sports/15 text-category-sports border-category-sports/30",
  business: "bg-category-business/15 text-category-business border-category-business/30",
  financial: "bg-category-financial/15 text-category-financial border-category-financial/30",
  legal: "bg-category-legal/15 text-category-legal border-category-legal/30",
  technical: "bg-category-technical/15 text-category-technical border-category-technical/30",
  politics: "bg-category-politics/15 text-category-politics border-category-politics/30",
};

interface CategoryResultProps {
  category: string;
  confidence: number;
}

const CategoryResult = ({ category, confidence }: CategoryResultProps) => {
  const style = CATEGORY_STYLES[category.toLowerCase()] || CATEGORY_STYLES.technical;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto rounded-xl border border-border bg-card p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Tag className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Classification Result</h3>
      </div>

      <div className="flex items-center gap-4">
        <span className={`inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-lg font-bold capitalize ${style}`}>
          {category}
        </span>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">Confidence</p>
          <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-primary"
            />
          </div>
          <p className="mt-1 text-xs font-mono text-muted-foreground">{confidence.toFixed(1)}%</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryResult;
