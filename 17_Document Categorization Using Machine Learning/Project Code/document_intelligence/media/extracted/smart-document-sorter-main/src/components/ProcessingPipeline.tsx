import { motion } from "framer-motion";
import { Check, Loader2, FileText, Filter, BarChart3, Brain, Tags } from "lucide-react";

const PHASES = [
  { id: "upload", label: "Document Upload", description: "Reading .txt/.pdf file", icon: FileText },
  { id: "preprocess", label: "Text Preprocessing", description: "Tokenization, stopword removal, stemming", icon: Filter },
  { id: "tfidf", label: "TF-IDF Vectorization", description: "Converting text to numerical features", icon: BarChart3 },
  { id: "train", label: "Model Classification", description: "Naive Bayes / SVM / Logistic Regression", icon: Brain },
  { id: "categorize", label: "Category Assignment", description: "Assigning document to category", icon: Tags },
];

interface ProcessingPipelineProps {
  currentPhase: number; // -1 = not started, 0-4 = active phase, 5 = done
}

const ProcessingPipeline = ({ currentPhase }: ProcessingPipelineProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="mb-6 text-lg font-semibold text-foreground">Processing Pipeline</h3>
      <div className="space-y-3">
        {PHASES.map((phase, index) => {
          const Icon = phase.icon;
          const isCompleted = index < currentPhase;
          const isActive = index === currentPhase;
          const isPending = index > currentPhase;

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${
                isActive
                  ? "border-primary/50 bg-primary/5"
                  : isCompleted
                  ? "border-border bg-card"
                  : "border-border/50 bg-card/50 opacity-50"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  isCompleted
                    ? "bg-category-sports/20 text-category-sports"
                    : isActive
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : isActive ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${isPending ? "text-muted-foreground" : "text-foreground"}`}>
                  {phase.label}
                </p>
                <p className="text-xs text-muted-foreground font-mono">{phase.description}</p>
              </div>
              {isActive && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="absolute bottom-0 left-0 h-0.5 bg-primary rounded-full"
                />
              )}
              <span
                className={`text-xs font-mono px-2 py-1 rounded ${
                  isCompleted
                    ? "bg-category-sports/10 text-category-sports"
                    : isActive
                    ? "bg-primary/10 text-primary animate-pulse-glow"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {isCompleted ? "Done" : isActive ? "Running..." : "Pending"}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingPipeline;
