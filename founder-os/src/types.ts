export type BuildVerdict = 'YES' | 'NO' | 'LATER';

export interface StartupIdea {
  id: string;
  title: string;
  oneSentenceDescription: string;
  problem: string;
  targetUsers: string;
  solution: string;
  whyNow: string;
  marketSize: string;
  competitors: string;
  competitiveAdvantage: string;
  businessModel: string;
  monetization: string;
  mvp: string;
  futureRoadmap: string;
  risks: string;
  whyCouldFail: string;
  personalMotivation: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  
  // AI Outputs
  analysis?: AnalysisResult;
  criticMode?: CriticMode;
  questions?: ChallengingQuestion[];
  projectPrompt?: ProjectPrompt;
}

export interface ScoreBreakdown {
  marketNeed: number; // 0 - 100
  originality: number;
  competition: number;
  difficulty: number;
  monetization: number;
  scalability: number;
  founderFit: number;
  technicalComplexity: number;
  goToMarketDifficulty: number;
  aiValue: number;
}

export interface AnalysisResult {
  overallScore: number;
  scores: ScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  hiddenRisks: string[];
  similarProducts: string[];
  possibleCompetitors: string[];
  potentialCustomers: string[];
  waysToImprove: string[];
  biggestMistake: string;
  mvpRecommendation: string;
  shouldBuild: BuildVerdict;
  verdictRationale: string;
  analyzedAt: string;
}

export interface AssumptionChallenge {
  id: string;
  assumption: string;
  challenge: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  founderResponse?: string;
  aiCritique?: string;
  critiqueVerdict?: 'VALIDATED' | 'WEAK' | 'COPIUM';
}

export interface CriticMode {
  investorPersona: string;
  openaiThreat: string;
  statusQuoThreat: string;
  first100UsersChallenge: string;
  monetizationHurdle: string;
  keyAssumptionsChallenged: AssumptionChallenge[];
  analyzedAt: string;
}

export interface ChallengingQuestion {
  id: number;
  question: string;
  category: string;
  founderAnswer?: string;
  aiFeedback?: string;
}

export interface ProjectPrompt {
  targetTool: string;
  fullPromptText: string;
  generatedAt: string;
  sections?: {
    productVision?: string;
    targetUsers?: string;
    features?: string;
    monetization?: string;
    marketPositioning?: string;
    mvpScope?: string;
    growthStrategy?: string;
    [key: string]: string | undefined;
  };
}

export type ViewMode = 'dashboard' | 'idea-detail' | 'compare';
