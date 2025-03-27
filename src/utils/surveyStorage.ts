
// Data models
export interface SurveyData {
  personalInfo: PersonalInfo;
  locations: Location[];
  completedAt?: string;
}

export interface PersonalInfo {
  age: string;
  gender: string;
  occupation: string;
  income: string;
  education: string;
  homeAddress: string;
  homeCity: string;
  homeState: string;
  homeZip: string;
  homeCoordinates?: [number, number]; // [longitude, latitude]
}

export interface Location {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
  frequency?: string;
}

// Form steps
export enum SurveyStep {
  PersonalInfo = 0,
  LocationInfo = 1,
  Review = 2,
  Completion = 3,
}

// Local storage key
const SURVEY_STORAGE_KEY = 'lifestyle-survey-data';

// Initialize empty survey data
export const getEmptySurveyData = (): SurveyData => ({
  personalInfo: {
    age: '',
    gender: '',
    occupation: '',
    income: '',
    education: '',
    homeAddress: '',
    homeCity: '',
    homeState: '',
    homeZip: '',
  },
  locations: [],
});

// Save survey data to local storage
export const saveSurveyData = (data: SurveyData): void => {
  localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(data));
};

// Load survey data from local storage
export const loadSurveyData = (): SurveyData => {
  const savedData = localStorage.getItem(SURVEY_STORAGE_KEY);
  return savedData ? JSON.parse(savedData) : getEmptySurveyData();
};

// Clear survey data from local storage
export const clearSurveyData = (): void => {
  localStorage.removeItem(SURVEY_STORAGE_KEY);
};

// Simulate saving data to server
export const saveSurveyToServer = async (data: SurveyData): Promise<{ success: boolean; message: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Create a timestamped record
  const dataWithTimestamp = {
    ...data,
    completedAt: new Date().toISOString()
  };
  
  // In a real app, you would send data to your backend here
  console.log('Saved survey data:', dataWithTimestamp);
  
  // Save to local storage with completion timestamp
  saveSurveyData(dataWithTimestamp);
  
  return {
    success: true,
    message: 'Survey data successfully saved'
  };
};
