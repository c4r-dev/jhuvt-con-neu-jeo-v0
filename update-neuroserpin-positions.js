#!/usr/bin/env node

/**
 * Script to update MongoDB document positions for Neuroserpin6 flowchart
 * This updates the initial positions that users see when the flowchart loads
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

// New position mappings for better layout
const positionUpdates = {
  'WFgunJwZz89Ngb89ixw4p': { x: 400, y: 20 },   // Top center - likely "Rat embryos"
  'mgLU4ZtExIeo0oXA3yVay': { x: 350, y: 175 },  // Second level center
  'qoK3O0-sWd_nC8sIeCy_n': { x: 100, y: 200 },  // Left branch
  'yLCcPE2zfUyKmGQPa0mg7': { x: 700, y: 125 },  // Right branch
  '1WU9oGExEstpRY1dlhDvK': { x: 200, y: 400 },  // Left path continues
  'ZnuLNxIO6uZHIVnra0nMf': { x: 600, y: 400 },  // Right path continues
  'FR6R_kJhNWVezT0pm-hck': { x: 400, y: 650 },  // Center merge point
  'h2k8msBE3eQSCilEKi0xg': { x: 315, y: 950 },  // Final steps
  'r_Zy2OhKDXK31u79uYAeP': { x: 350, y: 800 },  // End node
};

async function updateNeuroserpin6Positions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the Neuroserpin6 document by exact ID
    console.log('Searching for Neuroserpin6 document...');
    const flowchartDoc = await CustomFlowchart.findById("682f33b87a6b41356cee7202");

    if (!flowchartDoc) {
      console.log('❌ Neuroserpin6 document not found');
      console.log('Available documents:');
      const allDocs = await CustomFlowchart.find({}, 'name');
      allDocs.forEach(doc => console.log('  -', doc.name));
      return;
    }

    console.log('✅ Found document:', flowchartDoc.name);

    // Parse the flowchart JSON
    const flowchartData = JSON.parse(flowchartDoc.flowchart);
    let updatedCount = 0;

    // Update node positions
    flowchartData.nodes.forEach(node => {
      if (positionUpdates[node.id]) {
        const oldPosition = { ...node.position };
        node.position = positionUpdates[node.id];
        console.log(`📍 Updated ${node.id}: (${oldPosition.x}, ${oldPosition.y}) → (${node.position.x}, ${node.position.y})`);
        updatedCount++;
      }
    });

    if (updatedCount === 0) {
      console.log('ℹ️  No position updates needed');
      return;
    }

    // Save back to MongoDB
    console.log(`\n💾 Saving ${updatedCount} position updates...`);
    await CustomFlowchart.findByIdAndUpdate(
      flowchartDoc._id,
      { flowchart: JSON.stringify(flowchartData) },
      { new: true }
    );

    console.log('✅ Successfully updated Neuroserpin6 positions in MongoDB!');
    console.log(`📊 Updated ${updatedCount} node positions`);

  } catch (error) {
    console.error('❌ Error updating positions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateNeuroserpin6Positions();
}

export default updateNeuroserpin6Positions;