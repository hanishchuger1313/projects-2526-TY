import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UploadButton from "@/components/UploadButton";
import LoginModal from "@/components/LoginModal";
import ProcessingPipeline from "@/components/ProcessingPipeline";
import KeywordsList from "@/components/KeywordsList";
import CategoryResult from "@/components/CategoryResult";
import ModelTrainingViz from "@/components/ModelTrainingViz";

const MOCK_KEYWORDS = [
  "government", "policy", "election", "parliament", "legislation",
  "budget", "reform", "minister", "debate", "opposition",
  "campaign", "voter", "democratic", "constitution", "senate",
];

const Index = () => {
  const { toast } = useToast();
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fileName, setFileName] = useState("");
  const [currentPhase, setCurrentPhase] = useState(-1);
  const [showKeywords, setShowKeywords] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showTraining, setShowTraining] = useState(false);

  const handleUploadClick = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
    } else {
      triggerFileUpload();
    }
  };

  const triggerFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFileName(file.name);
        startProcessing();
      }
    };
    input.click();
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
    toast({ title: "Signed in successfully", description: "You can now upload documents." });
    triggerFileUpload();
  };

  const startProcessing = useCallback(() => {
    setCurrentPhase(0);
    setShowKeywords(false);
    setShowResult(false);
    setShowTraining(false);

    const delays = [1200, 2400, 3600, 5000, 6200];

    delays.forEach((delay, index) => {
      setTimeout(() => {
        setCurrentPhase(index + 1);
        if (index === 2) setShowTraining(true);
        if (index === 3) setShowKeywords(true);
        if (index === 4) {
          setShowResult(true);
          toast({
            title: "Document categorised successfully",
            description: "Your document has been classified using Naive Bayes.",
          });
        }
      }, delay);
    });
  }, [toast]);

  const isProcessing = currentPhase >= 0 && currentPhase < 5;
  const isDone = currentPhase >= 5;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">DocClassify</h1>
              <p className="text-xs text-muted-foreground font-mono">ML-Powered Document Categorization</p>
            </div>
          </div>
          {isLoggedIn && (
            <span className="text-xs font-mono text-muted-foreground rounded-md bg-secondary px-3 py-1.5">
              ● Logged In
            </span>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <AnimatePresence mode="wait">
          {currentPhase < 0 && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 20 }}
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                <Sparkles className="h-10 w-10 text-primary" />
              </motion.div>

              <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Classify Your Documents
              </h2>
              <p className="mb-2 max-w-lg text-lg text-muted-foreground">
                Upload a news article and our ML model will categorize it using supervised learning.
              </p>
              <p className="mb-8 text-sm font-mono text-muted-foreground">
                Powered by Naive Bayes · TF-IDF · 20 Newsgroups Dataset
              </p>

              <UploadButton onClick={handleUploadClick} />

              {/* Category chips */}
              <div className="mt-12 flex flex-wrap justify-center gap-2">
                {["Educational", "Entertainment", "Sports", "Business", "Financial", "Legal", "Technical", "Politics"].map(
                  (cat) => (
                    <span
                      key={cat}
                      className={`rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-mono text-secondary-foreground`}
                    >
                      {cat}
                    </span>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing View */}
        {(isProcessing || isDone) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {fileName && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-sm text-muted-foreground">
                  Processing: <span className="font-mono text-foreground">{fileName}</span>
                </p>
              </motion.div>
            )}

            <ProcessingPipeline currentPhase={currentPhase} />
            <ModelTrainingViz visible={showTraining} />
            <KeywordsList keywords={showKeywords ? MOCK_KEYWORDS : []} />
            {showResult && <CategoryResult category="Politics" confidence={87.4} />}

            {isDone && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-4"
              >
                <button
                  onClick={() => {
                    setCurrentPhase(-1);
                    setShowKeywords(false);
                    setShowResult(false);
                    setShowTraining(false);
                    setFileName("");
                  }}
                  className="rounded-lg border border-border bg-secondary px-6 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
                >
                  Classify Another Document
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />
    </div>
  );
};

export default Index;
