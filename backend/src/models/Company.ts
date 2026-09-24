import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  id: string;
  user_id: string;
  name: string;
  industry: string;
  website?: string;
  description?: string;
  location?: string;
  logo_url?: string;
  company_size?: string;
  founded_year?: string;
  benefits: any[];
  social_links: Record<string, any>;
  verification_status: string;
  status: string;
  email?: string;
  phone?: string;
  culture_text?: string;
  rejection_reason?: string;
}

const CompanySchema = new Schema<ICompany>({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  name: { type: String, required: true },
  industry: { type: String, required: true },
  website: { type: String, default: null },
  description: { type: String, default: '' },
  location: { type: String, default: null },
  logo_url: { type: String, default: null },
  company_size: { type: String, default: null },
  founded_year: { type: String, default: null },
  benefits: { type: Schema.Types.Mixed, default: [] },
  social_links: { type: Schema.Types.Mixed, default: {} },
  verification_status: { type: String, default: 'pending' },
  status: { type: String, default: 'active' },
  email: { type: String, default: null },
  phone: { type: String, default: null },
  culture_text: { type: String, default: null },
  rejection_reason: { type: String, default: null },
});

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
