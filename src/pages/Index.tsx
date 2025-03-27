
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  const startSurvey = () => {
    navigate("/survey");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl w-full text-center space-y-6 md:space-y-8"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-2"
        >
          <p className="text-sm font-medium text-primary">Research Study</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Lifestyle & Location Survey</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-lg mx-auto">
            Help us understand how location influences lifestyle choices through this interactive survey.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="space-y-4 md:space-y-8"
        >
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center">
            <div className="bg-muted p-6 rounded-lg text-left flex items-start space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-medium">Share your information</h3>
                <p className="text-sm text-muted-foreground mt-1">Answer questions about yourself and your location</p>
              </div>
            </div>
            
            <div className="bg-muted p-6 rounded-lg text-left flex items-start space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-medium">Interactive map experience</h3>
                <p className="text-sm text-muted-foreground mt-1">Mark locations you frequently visit</p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg">
            <p className="text-sm text-muted-foreground">
              All data is securely stored. Your participation helps improve our understanding of location-based lifestyle patterns.
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg shadow-lg rounded-full transition-all hover:scale-105"
            onClick={startSurvey}
          >
            Start Survey
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
