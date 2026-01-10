import mongoose, { Schema, Document, Types } from 'mongoose'

export type ScriptPlatform = 'youtube' | 'instagram' | 'both'
export type ScriptStatus = 'draft' | 'final'

export interface IScript extends Document {
  title: string
  content: string
  platform: ScriptPlatform
  reportIds: Types.ObjectId[]
  prompt: string
  status: ScriptStatus
  createdAt: Date
  updatedAt: Date
}

const scriptSchema = new Schema<IScript>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    platform: {
      type: String,
      enum: ['youtube', 'instagram', 'both'],
      required: true,
    },
    reportIds: [{ type: Schema.Types.ObjectId, ref: 'Report' }],
    prompt: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'final'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
)

export const Script = mongoose.model<IScript>('Script', scriptSchema)
