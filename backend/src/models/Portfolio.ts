import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolio extends Document {
  id: string;
  user_id: string;
  title: string;
  description: string;
  problem_solved?: string;
  skills_used: string[];
  github_url?: string;
  live_demo_url?: string;
  screenshot_url?: string;
  role_on_project?: string;
  duration?: string;
  project_status: string;
  sort_order: number;
  created_at: string;
}

const PortfolioSchema = new Schema<IPortfolio>({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  problem_solved: { type: String, default: '' },
  skills_used: { type: [String], default: [] },
  github_url: { type: String, default: '' },
  live_demo_url: { type: String, default: '' },
  screenshot_url: { type: String, default: null },
  role_on_project: { type: String, default: null },
  duration: { type: String, default: null },
  project_status: { type: String, default: 'completed' },
  sort_order: { type: Number, default: 0 },
  created_at: { type: String, required: true },
});

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
