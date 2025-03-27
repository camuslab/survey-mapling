
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SurveyForm from "@/components/SurveyForm";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Map } from "lucide-react";

const Survey = () => {
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Small delay to trigger entrance animation
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSurveyComplete = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              홈으로
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
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">생활양식 설문조사</h1>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Map className="h-4 w-4 mr-1" />
                  <span>위치 시각화에 맵박스 사용</span>
                </div>
              </div>
              <SurveyForm onComplete={handleSurveyComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Survey;
