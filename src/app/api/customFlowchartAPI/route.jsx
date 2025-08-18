import connectMongoDB from '../libs/mongodb';
import CustomFlowchart from "../models/customFlowchart";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { flowchart, name, description, submissionInstance, version, createdDate } = await request.json();
  await connectMongoDB();
  await CustomFlowchart.create({ 
    flowchart, 
    name, 
    description, 
    submissionInstance, 
    version, 
    createdDate 
  });
  return NextResponse.json({ message: "Flowchart Submitted Successfully" }, { status: 201 });
}

export async function GET() {
  try {
    await connectMongoDB();
    // All results
    const flowchartData = await CustomFlowchart.find();
    
    return NextResponse.json(flowchartData);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch flowchart data" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, flowchart } = await request.json();
    
    if (!id || !flowchart) {
      return NextResponse.json({ message: "ID and flowchart data are required" }, { status: 400 });
    }
    
    await connectMongoDB();
    
    const updatedFlowchart = await CustomFlowchart.findByIdAndUpdate(
      id,
      { flowchart },
      { new: true }
    );
    
    if (!updatedFlowchart) {
      return NextResponse.json({ message: "Flowchart not found" }, { status: 404 });
    }
    
    console.log('=== CustomFlowchart API PATCH ===');
    console.log('Updated flowchart ID:', id);
    console.log('Updated flowchart data:', updatedFlowchart);
    
    return NextResponse.json({ message: "Flowchart updated successfully", data: updatedFlowchart }, { status: 200 });
  } catch (error) {
    console.error('Error in CustomFlowchart API PATCH:', error);
    return NextResponse.json({ message: "Failed to update flowchart" }, { status: 500 });
  }
}