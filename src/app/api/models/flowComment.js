import mongoose, { Schema } from "mongoose";

const flowCommentSchema = new Schema(
  {
    flowId: { type: String, required: true },
    sessionId: { type: String, required: true },
    text: { type: String, required: true },
    commentType: { type: String, required: false },
    nodeIds: [String],
    nodeLabels: [String],
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);
  
// Delete the existing model if it exists to ensure schema changes take effect
if (mongoose.models.FlowComment) {
  delete mongoose.models.FlowComment;
}

export default mongoose.model("FlowComment", flowCommentSchema); 