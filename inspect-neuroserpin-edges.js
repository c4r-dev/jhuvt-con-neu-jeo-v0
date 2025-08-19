#!/usr/bin/env node

/**
 * Script to inspect the Neuroserpin6 MongoDB document edges (connecting lines)
 * Shows current connections between nodes for planning updates
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env.local' });

// Define the CustomFlowchart schema
const customFlowchartSchema = new mongoose.Schema({
  flowchart: String,
  name: { type: String, required: true },
  description: { type: String, default: "" },
  submissionInstance: Number,
  createdDate: Date,
  version: Number,
}, {
  timestamps: true,
});

const CustomFlowchart = mongoose.models.CustomFlowchart || mongoose.model("CustomFlowchart", customFlowchartSchema);

async function inspectNeuroserpin6Edges() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the Neuroserpin6 document by exact ID
    console.log('Fetching Neuroserpin6 document...');
    const flowchartDoc = await CustomFlowchart.findById("682f33b87a6b41356cee7202");

    if (!flowchartDoc) {
      console.log('❌ Neuroserpin6 document not found with ID: 682f33b87a6b41356cee7202');
      return;
    }

    console.log('✅ Found document:', flowchartDoc.name);

    // Parse and display flowchart structure
    const flowchartData = JSON.parse(flowchartDoc.flowchart);
    
    // Create node lookup for better display
    const nodeLabels = {};
    flowchartData.nodes.forEach(node => {
      const label = node.data?.elements?.label?.text || 'No label';
      nodeLabels[node.id] = label;
    });

    console.log('\n🔗 Current Edge Connections:');
    console.log('=' .repeat(80));
    
    if (!flowchartData.edges || flowchartData.edges.length === 0) {
      console.log('❌ No edges found in the flowchart');
      return;
    }

    flowchartData.edges.forEach((edge, index) => {
      const sourceLabel = nodeLabels[edge.source] || edge.source;
      const targetLabel = nodeLabels[edge.target] || edge.target;
      
      console.log(`${index + 1}. Edge ID: "${edge.id}"`);
      console.log(`   From: "${edge.source}" (${sourceLabel})`);
      console.log(`   To:   "${edge.target}" (${targetLabel})`);
      console.log(`   Source Handle: ${edge.sourceHandle || 'default'}`);
      console.log(`   Target Handle: ${edge.targetHandle || 'default'}`);
      
      // Show additional edge properties if they exist
      console.log(`   Type: ${edge.type || 'default'}`);
      if (edge.label) console.log(`   Label: ${edge.label}`);
      
      // Always show style information (even if empty/default)
      console.log(`   Style:`, edge.style ? JSON.stringify(edge.style) : 'default');
      if (edge.style) {
        if (edge.style.stroke) console.log(`     - Stroke Color: ${edge.style.stroke}`);
        if (edge.style.strokeWidth) console.log(`     - Stroke Width: ${edge.style.strokeWidth}`);
        if (edge.style.strokeDasharray) console.log(`     - Dash Pattern: ${edge.style.strokeDasharray}`);
        if (edge.style.opacity) console.log(`     - Opacity: ${edge.style.opacity}`);
      }
      
      // Always show marker end information (even if empty/default)
      console.log(`   Marker End:`, edge.markerEnd ? JSON.stringify(edge.markerEnd) : 'none');
      if (edge.markerEnd) {
        if (edge.markerEnd.type) console.log(`     - Type: ${edge.markerEnd.type}`);
        if (edge.markerEnd.width) console.log(`     - Width: ${edge.markerEnd.width}`);
        if (edge.markerEnd.height) console.log(`     - Height: ${edge.markerEnd.height}`);
        if (edge.markerEnd.color) console.log(`     - Color: ${edge.markerEnd.color}`);
      }
      
      console.log('');
    });

    console.log('\n📝 Template for edge updates:');
    console.log('const edgeUpdates = [');
    flowchartData.edges.forEach(edge => {
      console.log(`  {`);
      console.log(`    id: '${edge.id}',`);
      console.log(`    source: '${edge.source}',`);
      console.log(`    target: '${edge.target}',`);
      console.log(`    sourceHandle: '${edge.sourceHandle || 'output'}',`);
      console.log(`    targetHandle: '${edge.targetHandle || 'input'}',`);
      console.log(`    type: '${edge.type || 'default'}',`);
      console.log(`    style: ${edge.style ? JSON.stringify(edge.style) : '{ stroke: "#333", strokeWidth: 2 }'},`);
      console.log(`    markerEnd: ${edge.markerEnd ? JSON.stringify(edge.markerEnd) : '{ type: "arrowclosed" }'},`);
      if (edge.label) console.log(`    label: '${edge.label}',`);
      console.log(`    // Common types: 'default', 'straight', 'step', 'smoothstep', 'bezier'`);
      console.log(`    // Common markers: 'arrowclosed', 'arrow', 'arrowopen'`);
      console.log(`  },`);
    });
    console.log('];');

    console.log('\n📊 Node Reference:');
    console.log('Available Node IDs and Labels:');
    flowchartData.nodes.forEach(node => {
      console.log(`  - "${node.id}" → "${nodeLabels[node.id]}"`);
    });

  } catch (error) {
    console.error('❌ Error inspecting edges:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the inspection
inspectNeuroserpin6Edges();