
import React, { useState, useEffect } from "react";
import { SurveyStep, PersonalInfo, Location } from "@/utils/surveyStorage";

interface FormStepperProps {
  children: React.ReactNode[];
  currentStep: SurveyStep;
  onStepChange: (step: SurveyStep) => void;
  personalInfo: PersonalInfo;
  locations: Location[];
}

const FormStepper = ({ 
  children, 
  currentStep, 
  onStepChange,
  personalInfo,
  locations
}: FormStepperProps) => {
  const [canAdvance, setCanAdvance] = useState(false);

  // Determine if user can advance to next step
  useEffect(() => {
    if (currentStep === SurveyStep.PersonalInfo) {
      // Check if personal info is complete enough to proceed
      const { age, gender, homeAddress, homeCity, homeState, homeZip, homeCoordinates } = personalInfo;
      const requiredFields = [age, gender, homeAddress, homeCity, homeState, homeZip];
      const hasCoordinates = Array.isArray(homeCoordinates) && homeCoordinates.length === 2;
      
      // Check if all required string fields have values and homeCoordinates is valid
      setCanAdvance(
        requiredFields.every(field => typeof field === 'string' && field.trim() !== '') && 
        hasCoordinates
      );
    } 
    else if (currentStep === SurveyStep.LocationInfo) {
      // Can always proceed from location info (it's optional to add locations)
      setCanAdvance(true);
    }
    else if (currentStep === SurveyStep.Review) {
      // Can always proceed from review
      setCanAdvance(true);
    }
  }, [currentStep, personalInfo, locations]);

  // Handle back button
  const handleBack = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  // Handle next button
  const handleNext = () => {
    if (canAdvance && currentStep < children.length - 1) {
      onStepChange(currentStep + 1);
    }
  };

  return (
    <div className="w-full">
      {children[currentStep]}
      
      {currentStep !== SurveyStep.Completion && (
        <div className="flex justify-between mt-8">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
            >
              Back
            </button>
          ) : (
            <div></div> // Empty div for spacing
          )}
          
          {currentStep < SurveyStep.Review && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance}
              className={`px-4 py-2 rounded-md transition-colors ${
                canAdvance 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FormStepper;
