import mongoose, { Schema, Document } from 'mongoose'

export type ResearchType = 'book' | 'author' | 'topic'

export interface IReport extends Document {
  title: string
  researchType: ResearchType
  bookTitle?: string
  authorName?: string
  topic?: string
  content: string
  structuredContent?: Record<string, unknown>
  summary: string
  sources: string[]
  createdAt: Date
  updatedAt: Date
}

const reportSchema = new Schema<IReport>(
  {
    title: { type: String, required: true },
    researchType: {
      type: String,
      enum: ['book', 'author', 'topic'],
      required: true,
    },
    bookTitle: { type: String },
    authorName: { type: String },
    topic: { type: String },
    content: { type: String, required: true },
    structuredContent: { type: Schema.Types.Mixed },
    summary: { type: String, required: true },
    sources: [{ type: String }],
  },
  {
    timestamps: true,
  }
)

export const Report = mongoose.model<IReport>('Report', reportSchema)
