#!/usr/bin/env node

/**
 * Script to inspect the Neuroserpin6 MongoDB document structure
 * Shows current node positions and IDs for planning updates
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

async function inspectNeuroserpin6() {
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
    console.log('📄 Document details:');
    console.log('  - ID:', flowchartDoc._id);
    console.log('  - Name:', flowchartDoc.name);
    console.log('  - Description:', flowchartDoc.description);
    console.log('  - Created:', flowchartDoc.createdDate);

    // Parse and display flowchart structure
    const flowchartData = JSON.parse(flowchartDoc.flowchart);
    
    console.log('\n📊 Current Node Positions:');
    console.log('=' .repeat(50));
    
    flowchartData.nodes.forEach((node, index) => {
      const label = node.data?.elements?.label?.text || 'No label';
      console.log(`${index + 1}. ID: "${node.id}"`);
      console.log(`   Label: "${label}"`);
      console.log(`   Position: (${node.position.x}, ${node.position.y})`);
      console.log('');
    });

    console.log('📝 Copy these node IDs to update positions in the main script:');
    console.log('const positionUpdates = {');
    flowchartData.nodes.forEach(node => {
      console.log(`  '${node.id}': { x: ${node.position.x}, y: ${node.position.y} },`);
    });
    console.log('};');

  } catch (error) {
    console.error('❌ Error inspecting document:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the inspection
inspectNeuroserpin6();