
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SurveyForm from "@/components/SurveyForm";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Survey = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Small delay to trigger entrance animation
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
        
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto bg-background rounded-xl shadow-sm border p-6 sm:p-8"
            >
              <SurveyForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Survey;
