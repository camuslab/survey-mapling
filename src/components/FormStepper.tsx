
import React, { useState, useEffect } from "react";
import { PersonalInfo, Location, SurveyStep } from "@/utils/surveyStorage";
import { AnimatePresence, motion } from "framer-motion";

interface FormStepperProps {
  currentStep: SurveyStep;
  onStepChange: (step: SurveyStep) => void;
  children: React.ReactNode[];
  personalInfo: PersonalInfo;
  locations: Location[];
}

const FormStepper = ({ 
  currentStep, 
  onStepChange, 
  children, 
  personalInfo,
  locations
}: FormStepperProps) => {
  // State to track form validation
  const [canProceed, setCanProceed] = useState<boolean>(false);
  
  // Check if current step can proceed
  useEffect(() => {
    switch (currentStep) {
      case SurveyStep.PersonalInfo:
        // Check if essential personal info fields are filled
        const requiredFields: (keyof PersonalInfo)[] = [
          'age', 'gender', 'occupation', 'homeAddress', 'homeCity', 'homeState'
        ];
        const isPersonalInfoValid = requiredFields.every(
          field => personalInfo[field] && personalInfo[field].trim() !== ''
        );
        setCanProceed(isPersonalInfoValid);
        break;
      
      case SurveyStep.LocationInfo:
        // Check if home coordinates exist
        const hasHomeCoordinates = !!personalInfo.homeCoordinates;
        // We don't require locations, but we need home coordinates
        setCanProceed(hasHomeCoordinates);
        break;
        
      case SurveyStep.Review:
        // Always allow proceeding from review
        setCanProceed(true);
        break;
        
      default:
        setCanProceed(false);
    }
  }, [currentStep, personalInfo, locations]);

  // Navigation functions
  const goToNextStep = () => {
    if (canProceed && currentStep < children.length - 1) {
      onStepChange(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={currentStep}>
          <motion.div
            key={currentStep}
            custom={currentStep}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            {children[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
          className={`px-4 py-2 rounded-md transition-all 
            ${currentStep === 0 
              ? 'opacity-0 pointer-events-none' 
              : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
            }`}
        >
          Back
        </button>
        
        <button
          type="button"
          onClick={goToNextStep}
          disabled={!canProceed || currentStep === children.length - 1}
          className={`px-4 py-2 rounded-md transition-all
            ${!canProceed 
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }
            ${currentStep === children.length - 1 ? 'opacity-0 pointer-events-none' : ''}
          `}
        >
          {currentStep === SurveyStep.Review ? 'Submit' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default FormStepper;
