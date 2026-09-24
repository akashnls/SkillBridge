import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillTaxonomy extends Document {
  id: string;
  name: string;
  category: string;
  description?: string;
  synonyms: string[];
  aliases: string[];
  difficulty_level: string;
  is_active: boolean;
}

const SkillTaxonomySchema = new Schema<ISkillTaxonomy>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  synonyms: { type: [String], default: [] },
  aliases: { type: [String], default: [] },
  difficulty_level: { type: String, default: 'Intermediate' },
  is_active: { type: Boolean, default: true },
});

export const SkillTaxonomy = mongoose.model<ISkillTaxonomy>('SkillTaxonomy', SkillTaxonomySchema);
