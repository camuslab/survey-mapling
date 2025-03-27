
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  SurveyStep, 
  SurveyData, 
  PersonalInfo, 
  Location, 
  getEmptySurveyData, 
  saveSurveyToServer,
  loadSurveyData,
  saveSurveyData
} from "@/utils/surveyStorage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import SurveyProgress from "./SurveyProgress";
import MapboxMap from "./MapboxMap";
import FormStepper from "./FormStepper";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";

const SurveyForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SurveyStep>(SurveyStep.PersonalInfo);
  const [surveyData, setSurveyData] = useState<SurveyData>(getEmptySurveyData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  // Load any existing survey data
  useEffect(() => {
    const savedData = loadSurveyData();
    // If there's saved data but it's already completed, start fresh
    if (savedData && !savedData.completedAt) {
      setSurveyData(savedData);
    }
  }, []);

  // Save survey data when it changes
  useEffect(() => {
    if (!isSubmitting) {
      saveSurveyData(surveyData);
    }
  }, [surveyData, isSubmitting]);

  // Update personal information
  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setSurveyData({
      ...surveyData,
      personalInfo: {
        ...surveyData.personalInfo,
        [field]: value
      }
    });
  };

  // Update home coordinates
  const updateHomeCoordinates = (coordinates: [number, number]) => {
    setSurveyData({
      ...surveyData,
      personalInfo: {
        ...surveyData.personalInfo,
        homeCoordinates: coordinates
      }
    });
  };

  // Update locations
  const updateLocations = (locations: Location[]) => {
    setSurveyData({
      ...surveyData,
      locations
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await saveSurveyToServer(surveyData);
      
      if (result.success) {
        toast.success(result.message);
        setCurrentStep(SurveyStep.Completion);
      } else {
        toast.error("Failed to submit survey: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle starting a new survey
  const startNewSurvey = () => {
    setSurveyData(getEmptySurveyData());
    setCurrentStep(SurveyStep.PersonalInfo);
    setHasAcceptedTerms(false);
    navigate("/");
  };

  // Age options
  const ageOptions = [
    "18-24", "25-34", "35-44", "45-54", "55-64", "65+"
  ];

  // Gender options
  const genderOptions = [
    "Male", "Female", "Non-binary", "Prefer not to say", "Other"
  ];

  // Education options
  const educationOptions = [
    "High School", "Associate's Degree", "Bachelor's Degree", 
    "Master's Degree", "Doctoral Degree", "Other"
  ];

  // Income options
  const incomeOptions = [
    "Under $25,000", "$25,000-$49,999", "$50,000-$74,999", 
    "$75,000-$99,999", "$100,000-$149,999", "$150,000+"
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {currentStep !== SurveyStep.Completion && (
        <SurveyProgress currentStep={currentStep} />
      )}
      
      <FormStepper 
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        personalInfo={surveyData.personalInfo}
        locations={surveyData.locations}
      >
        {/* Step 1: Personal Information */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Personal Information</h2>
            <p className="text-muted-foreground">
              Please provide some basic information about yourself.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="age">Age Group</Label>
              <Select 
                value={surveyData.personalInfo.age}
                onValueChange={(value) => updatePersonalInfo('age', value)}
              >
                <SelectTrigger id="age">
                  <SelectValue placeholder="Select your age group" />
                </SelectTrigger>
                <SelectContent>
                  {ageOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={surveyData.personalInfo.gender}
                onValueChange={(value) => updatePersonalInfo('gender', value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                placeholder="Your current occupation"
                value={surveyData.personalInfo.occupation}
                onChange={(e) => updatePersonalInfo('occupation', e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="education">Education Level</Label>
              <Select 
                value={surveyData.personalInfo.education}
                onValueChange={(value) => updatePersonalInfo('education', value)}
              >
                <SelectTrigger id="education">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {educationOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="income">Income Level</Label>
              <Select 
                value={surveyData.personalInfo.income}
                onValueChange={(value) => updatePersonalInfo('income', value)}
              >
                <SelectTrigger id="income">
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
                <SelectContent>
                  {incomeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-6">
            <div className="space-y-2 mb-4">
              <h3 className="text-lg font-medium">Home Location</h3>
              <p className="text-sm text-muted-foreground">
                Where do you currently live?
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="homeAddress">Street Address</Label>
                <Input
                  id="homeAddress"
                  placeholder="123 Main St"
                  value={surveyData.personalInfo.homeAddress}
                  onChange={(e) => updatePersonalInfo('homeAddress', e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="homeCity">City</Label>
                <Input
                  id="homeCity"
                  placeholder="City"
                  value={surveyData.personalInfo.homeCity}
                  onChange={(e) => updatePersonalInfo('homeCity', e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="homeState">State / Province</Label>
                <Input
                  id="homeState"
                  placeholder="State"
                  value={surveyData.personalInfo.homeState}
                  onChange={(e) => updatePersonalInfo('homeState', e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="homeZip">Zip / Postal Code</Label>
                <Input
                  id="homeZip"
                  placeholder="Postal code"
                  value={surveyData.personalInfo.homeZip}
                  onChange={(e) => updatePersonalInfo('homeZip', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Location Information */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Location Information</h2>
            <p className="text-muted-foreground">
              Mark locations you frequently visit on the map.
            </p>
          </div>
          
          <MapboxMap 
            locations={surveyData.locations}
            onChange={updateLocations}
            onHomeLocationChange={updateHomeCoordinates}
            homeCoordinates={surveyData.personalInfo.homeCoordinates}
          />
        </div>

        {/* Step 3: Review & Submit */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Review Your Information</h2>
            <p className="text-muted-foreground">
              Please review your information before submitting.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium mb-2">Personal Information</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm text-muted-foreground">Age Group</dt>
                  <dd className="text-sm font-medium">{surveyData.personalInfo.age || "—"}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm text-muted-foreground">Gender</dt>
                  <dd className="text-sm font-medium">{surveyData.personalInfo.gender || "—"}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm text-muted-foreground">Occupation</dt>
                  <dd className="text-sm font-medium">{surveyData.personalInfo.occupation || "—"}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm text-muted-foreground">Education</dt>
                  <dd className="text-sm font-medium">{surveyData.personalInfo.education || "—"}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm text-muted-foreground">Income Level</dt>
                  <dd className="text-sm font-medium">{surveyData.personalInfo.income || "—"}</dd>
                </div>
              </dl>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium mb-2">Home Location</h3>
              <p className="text-sm">
                {[
                  surveyData.personalInfo.homeAddress,
                  surveyData.personalInfo.homeCity,
                  surveyData.personalInfo.homeState,
                  surveyData.personalInfo.homeZip
                ].filter(Boolean).join(", ")}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Your Frequent Locations</h3>
              <MapboxMap 
                locations={surveyData.locations}
                onChange={updateLocations}
                homeCoordinates={surveyData.personalInfo.homeCoordinates}
                readOnly={true}
              />
              
              {surveyData.locations.length === 0 && (
                <p className="text-sm text-muted-foreground mt-4">
                  No locations added.
                </p>
              )}
            </div>
            
            <div className="flex items-start space-x-2 mt-6">
              <Checkbox
                id="terms"
                checked={hasAcceptedTerms}
                onCheckedChange={(checked) => 
                  setHasAcceptedTerms(checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the terms and conditions
                </label>
                <p className="text-xs text-muted-foreground">
                  Your data will be used for research purposes only.
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !hasAcceptedTerms}
              className="w-full mt-4"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Survey"
              )}
            </Button>
          </div>
        </div>

        {/* Step 4: Completion */}
        <div className="space-y-6 text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto" />
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Thank You!</h2>
            <p className="text-muted-foreground">
              Your survey has been submitted successfully.
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-muted/30 text-left max-w-md mx-auto">
            <h3 className="font-medium mb-2">What happens next?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your responses will help us understand how location influences lifestyle choices.
              This data will be used for research purposes only.
            </p>
            
            <Button onClick={startNewSurvey} variant="outline" className="w-full">
              Return Home
            </Button>
          </div>
        </div>
      </FormStepper>
    </div>
  );
};

export default SurveyForm;
