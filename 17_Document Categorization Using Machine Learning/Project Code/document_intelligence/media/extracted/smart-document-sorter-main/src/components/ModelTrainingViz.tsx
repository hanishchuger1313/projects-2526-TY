import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface ModelTrainingVizProps {
  visible: boolean;
}

const METRICS = [
  { label: "Training Accuracy", value: 94.2, color: "bg-primary" },
  { label: "Precision", value: 91.8, color: "bg-category-sports" },
  { label: "Recall", value: 89.5, color: "bg-category-business" },
  { label: "F1-Score", value: 90.6, color: "bg-accent" },
];

const ModelTrainingViz = ({ visible }: ModelTrainingVizProps) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto rounded-xl border border-border bg-card p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Model Training Metrics</h3>
        <span className="ml-auto rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono text-primary">
          Naive Bayes + 20 Newsgroups
        </span>
      </div>

      <div className="space-y-3">
        {METRICS.map((metric, index) => (
          <div key={metric.label}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <span className="text-sm font-mono font-semibold text-foreground">{metric.value}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 1.2, delay: index * 0.2, ease: "easeOut" }}
                className={`h-full rounded-full ${metric.color}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-secondary/50 p-3 font-mono text-xs text-muted-foreground">
        <p>{'>'} Loading 20 Newsgroups dataset... ✓</p>
        <p>{'>'} Vectorizing with TF-IDF (max_features=5000)... ✓</p>
        <p>{'>'} Training MultinomialNB classifier... ✓</p>
        <p>{'>'} Model ready for prediction</p>
      </div>
    </motion.div>
  );
};

export default ModelTrainingViz;
