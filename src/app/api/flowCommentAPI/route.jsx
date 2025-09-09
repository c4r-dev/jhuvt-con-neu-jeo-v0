import connectMongoDB from '../libs/mongodb';
import FlowComment from "../models/flowComment";
import { NextResponse } from "next/server";

// POST - Add a new comment
export async function POST(request) {
  const { flowId, sessionId, text, commentType, nodeIds, nodeLabels } = await request.json();
  
  try {
    await connectMongoDB();
    
    // Create comment data object, only include commentType if it's provided
    const commentData = {
      flowId, 
      sessionId,
      text, 
      nodeIds, 
      nodeLabels,
      timestamp: new Date()
    };
    
    // Only add commentType if it's defined and not null/empty
    if (commentType && commentType.trim()) {
      commentData.commentType = commentType;
    }
    
    await FlowComment.create(commentData);
    
    return NextResponse.json({ message: "Comment Added Successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ message: "Failed to add comment", error: error.message }, { status: 500 });
  }
}

// GET - Retrieve comments for a specific flow and session
export async function GET(request) {
  try {
    const url = new URL(request.url);
    // const flowId = url.searchParams.get("flowId");
    const flowId = '68bef748545973b916b70167';
    const sessionId = url.searchParams.get("sessionId");
    
    if (!flowId || !sessionId) {
      return NextResponse.json({ message: "Both Flow ID and Session ID are required" }, { status: 400 });
    }
    
    await connectMongoDB();
    
    // Get comments for the specified flow and session
    console.log(`API: Looking for comments with flowId=${flowId}, sessionId=${sessionId}`);
    const comments = await FlowComment.find({ flowId, sessionId }).sort({ timestamp: -1 });
    console.log(`API: Found ${comments.length} comments`);
    
    // Debug: Also check what other flowIds/sessionIds exist
    const allComments = await FlowComment.find({}).select('flowId sessionId text').limit(10);
    console.log('API: Sample of all comments in database:', allComments.map(c => ({ flowId: c.flowId, sessionId: c.sessionId, text: c.text?.substring(0, 50) })));
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ message: "Failed to fetch comments", error: error.message }, { status: 500 });
  }
}

// DELETE - Remove a comment
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const commentId = url.searchParams.get("commentId");
    
    if (!commentId) {
      return NextResponse.json({ message: "Comment ID is required" }, { status: 400 });
    }
    
    await connectMongoDB();
    
    // Find and delete the comment
    const result = await FlowComment.findByIdAndDelete(commentId);
    
    if (!result) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ message: "Failed to delete comment", error: error.message }, { status: 500 });
  }
} 