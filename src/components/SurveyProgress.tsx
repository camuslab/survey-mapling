
import { motion } from "framer-motion";
import { SurveyStep } from "@/utils/surveyStorage";

interface SurveyProgressProps {
  currentStep: SurveyStep;
}

const SurveyProgress = ({ currentStep }: SurveyProgressProps) => {
  const steps = [
    { label: "Personal Info", step: SurveyStep.PersonalInfo },
    { label: "Location", step: SurveyStep.LocationInfo },
    { label: "Review", step: SurveyStep.Review },
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                backgroundColor: currentStep >= step.step 
                  ? "var(--primary)" 
                  : "var(--muted)"
              }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step.step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }`}
            >
              {index + 1}
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              className={`mt-2 text-xs ${
                currentStep >= step.step 
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </motion.span>
          </div>
        ))}
      </div>
      
      <div className="relative w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ 
            width: `${(currentStep / (steps.length - 1)) * 100}%` 
          }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-0 h-full bg-primary rounded-full"
        />
      </div>
    </div>
  );
};

export default SurveyProgress;
