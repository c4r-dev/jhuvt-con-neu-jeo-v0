import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { concerns, sessionId } = await request.json();

    if (!concerns || !Array.isArray(concerns) || concerns.length === 0) {
      return NextResponse.json(
        { error: 'Valid concerns array is required' },
        { status: 400 }
      );
    }
    
    console.log('Processing concerns with OpenAI for sessionId:', sessionId);
    
    // Transform the concerns data to match the expected format for OpenAI API
    const transformedConcerns = concerns.map(concern => ({
      id: concern.id,
      text: concern.text,
      nodeLabels: concern.nodeLabels, // Keep original nodeLabels array
      commentType: concern.commentType, // Keep original commentType
      node: concern.node, // Preserve additional fields
      concernType: concern.concernType, // Preserve additional fields
      timestamp: concern.timestamp // Preserve additional fields
    }));
    
    // Construct the prompt for OpenAI
    const prompt = `
You are a research analysis assistant helping to categorize concerns about research studies.

TASK:
Analyze the following list of concerns from a research study and group them into thematic categories.

REQUIREMENTS:
1. Group similar concerns based on common themes found in the *text* of the concerns. DO NOT group concerns by their existing \`commentType\` (e.g., BIAS, CONFOUND). The themes should reflect the content and meaning of the concerns themselves.
2. IMPORTANT: AVOID creating themes that simply mirror the existing concern types. For example, do not create themes called "BIAS CONCERNS", "CONFOUNDING FACTORS", "METHODOLOGICAL ISSUES" that simply group all bias-related, confound-related, or methodology-related concerns together.
3. Look for specific research issues, problems, variables, or methodological aspects mentioned in the concern texts themselves, and create themes around those specific issues.
4. Adjust the number of thematic groups based on the input:
   - If there are 3-9 concerns, aim for 3-5 distinct themes.
   - If there are 10-20 concerns, aim for 5-8 distinct themes.
   - If there are more than 20 concerns, aim for 8-15 themes.
   The goal is to find a good balance, avoiding too few themes (overly broad) or too many (overly granular).
5. Assign each group a concise 1-2 word name that is specific and descriptive of the actual issue identified (e.g., "DATA INTEGRITY", "SAMPLE SELECTION", "CONTROL VARIABLES").
6. Strive for a relatively balanced distribution of concerns across the identified themes. Avoid creating a single theme that contains a vast majority of the concerns.
7. DO NOT modify the original content of any concern.
8. Include EVERY concern in a group - do not exclude any.
9. If there are fewer than 3 concerns, still organize them into appropriate themes based on their specific content.

CONCERN DATA FORMAT:
Each concern has these attributes:
- id: Unique identifier
- nodeLabels: Names of the study phases/processes
- commentType: Category of concern (e.g., BIAS, CONFOUND, etc.)
- text: The actual concern text

INPUT CONCERNS:
${JSON.stringify(transformedConcerns, null, 2)}

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "themes": [
    {
      "name": "THEME_NAME",
      "concerns": [ARRAY_OF_ORIGINAL_CONCERN_OBJECTS]
    },
    ...more themes...
  ]
}

Ensure your response is valid JSON that can be parsed directly.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a research analysis assistant that categorizes concerns about research studies.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    console.log('Successfully processed concerns for sessionId:', sessionId);
    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error('Error processing concerns with OpenAI:', error);
    return NextResponse.json(
      { error: 'Failed to process concerns', details: error.message },
      { status: 500 }
    );
  }
}