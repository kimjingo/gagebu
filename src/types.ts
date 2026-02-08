import 'express-session';

// Express session augmentation
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
  }
}

// Express user augmentation for Passport
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      password_hash?: string;
      google_id?: string;
      email?: string;
      display_name?: string;
    }
  }
}

// Database entity types
export interface User {
  id: number;
  username: string;
  password_hash?: string;
  google_id?: string;
  email?: string;
  display_name?: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface TransactionRecord {
  id: number;
  user_id: number;
  amount: number;
  category_id: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  source: string;
  category_name?: string;
  category_color?: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  month: string;
  category_name?: string;
  category_color?: string;
}

export interface BudgetStatus {
  id: number;
  category_id: number;
  budget_amount: number;
  month: string;
  category_name: string;
  category_color: string;
  spent_amount: number;
}

export interface MonthlySummary {
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface CategoryBreakdown {
  name: string;
  color: string;
  type: string;
  total: number;
}

export interface DeploymentStep {
  step: string;
  success: boolean;
  output: string;
}

export interface DeploymentResult {
  success: boolean;
  message: string;
  error?: string;
  steps?: DeploymentStep[];
  timestamp: string;
}

export interface CategorizationRules {
  income_keywords: Record<string, string[]>;
  expense_keywords: Record<string, string[]>;
}

export interface BulkUploadResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}
