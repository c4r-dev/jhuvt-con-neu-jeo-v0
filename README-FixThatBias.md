# Fix That Bias Activity - Implementation Documentation

## Overview

The Fix That Bias activity is an interactive educational tool designed to help users develop critical thinking skills for identifying and addressing methodological concerns in research studies. Users are presented with case studies containing research methods and must identify potential bias issues and suggest appropriate solutions.

## Features Implemented

### ✅ Core Functionality
- **Case Study Presentation**: ReactFlow-based visualization of research methods steps
- **Interactive Node Selection**: Click to select problematic research steps
- **Solution Selection**: Drag-and-drop interface for applying solutions
- **Feedback System**: Immediate feedback on user selections with color-coded responses
- **Progress Tracking**: Session-based progress tracking through multiple case studies
- **Results Dashboard**: Comprehensive results page showing user performance

### ✅ User Interface Features
- **"No Concerns" Option**: Button for studies without obvious problems
- **Visual Feedback**: Color-coded cards (RED for incorrect, GREEN for correct)
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations

### ✅ Data Management
- **MongoDB Integration**: User sessions and results stored in database
- **Session Management**: Unique session IDs for tracking user progress
- **Performance Analytics**: Detailed tracking of attempts and success rates

## File Structure

```
src/app/
├── api/
│   ├── fixThatBias/
│   │   └── route.js                 # Main API endpoints
│   ├── models/
│   │   └── ftbUserSession.js        # MongoDB schema for user sessions
│   └── libs/
│       └── mongodb.js               # Database connection
├── pages/
│   ├── FTB-1/
│   │   ├── page.js                  # Main activity page
│   │   └── FTB-1.css               # Activity styles
│   └── FTB-results/
│       ├── page.js                  # Results page
│       └── FTB-results.css         # Results styles
├── components/
│   ├── FixThatBiasFlow.js          # ReactFlow component
│   └── SolutionCards.js            # Solution selection component
└── page.js                         # Updated home page with navigation
```

## API Endpoints

### GET `/api/fixThatBias`

**Parameters:**
- `sessionId` (optional): Retrieve existing session
- `caseStudyId` (optional): Get specific case study data

**Response:**
```json
{
  "session": { /* session data */ },
  "totalCaseStudies": 4,
  "caseStudy": { /* case study data */ }
}
```

### POST `/api/fixThatBias`

**Request Body:**
```json
{
  "sessionId": "uuid",
  "caseStudyId": 1,
  "action": "selectProblem" | "selectSolution" | "noConcerns",
  "data": {
    "selectedStepId": "step1" | "selectedSolutionId": "solution1"
  }
}
```

**Response:**
```json
{
  "success": true,
  "isCorrect": true,
  "feedback": "Feedback message",
  "canProceedToSolutions": true
}
```

## Activity Flow

### Phase 1: Problem Identification
1. User views case study information and research methods flowchart
2. User selects a method step they believe has a bias/methodological issue
3. User clicks "Confirm Selection" or "No Concerns"
4. System provides immediate feedback (correct/incorrect)
5. If correct, user proceeds to solution phase

### Phase 2: Solution Selection
1. User sees solution cards at bottom of screen
2. User clicks or drags solution to apply it
3. Incorrect solutions become disabled (red) with feedback
4. Correct solution advances to next case study
5. After all case studies, user sees results page

## Data Schema

### FTBUserSession Model
```javascript
{
  sessionId: String,           // Unique session identifier
  caseStudyResults: [{
    caseStudyId: Number,       // Case study ID
    caseStudyTitle: String,    // Case study title
    selectedProblemStep: String, // Selected step ID
    isCorrectProblem: Boolean, // Whether problem was correctly identified
    problemAttempts: Number,   // Number of attempts for problem
    selectedSolution: String,  // Selected solution ID
    isCorrectSolution: Boolean, // Whether solution was correct
    solutionAttempts: Number,  // Number of attempts for solution
    completedAt: Date          // Completion timestamp
  }],
  totalScore: Number,          // Overall score
  completedStudies: Number,    // Number of completed studies
  isCompleted: Boolean         // Whether session is complete
}
```

## Case Study Data Structure

Case studies are loaded from `FTB-Data.json` and include:

```javascript
{
  "id": 1,
  "title": "Study Title",
  "category": "human, masking",
  "researchQuestion": "Research question text",
  "independentVariable": "IV description",
  "dependentVariable": "DV description", 
  "subjectPopulation": "Subject population",
  "methodsSteps": [
    {
      "id": "step1",
      "text": "Method step description",
      "isCorrect": false,      // Whether this step has the problem
      "position": { "x": 100, "y": 100 }
    }
  ],
  "correctText": "Explanation when correct",
  "incorrectText": "Try again message",
  "solutionCards": [
    {
      "id": "solution1", 
      "text": "Solution description",
      "isCorrect": true,
      "feedback": "Detailed feedback"
    }
  ]
}
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB database
- Environment variables configured

### Environment Variables
Create a `.env.local` file with:
```
MONGODB_URI=your_mongodb_connection_string
```

### Installation
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Navigate to `http://localhost:3000`
4. Click "Fix That Bias Activity" to begin

## Usage

### For Educators
1. Students access the activity through the main navigation
2. Each session creates a unique ID for tracking
3. Results can be retrieved from the database for assessment
4. Activity supports multiple concurrent users

### For Students
1. Read case study information carefully
2. Click on flowchart nodes to select problematic steps
3. Use "No Concerns" if no issues are apparent
4. Apply solutions by clicking on solution cards
5. View detailed results at completion

## Customization

### Adding New Case Studies
1. Edit `FTB-Data.json` to add new case studies
2. Follow existing data structure
3. Update `totalCaseStudies` in metadata
4. Ensure node positions are set for ReactFlow visualization

### Modifying Feedback
- Edit `correctText` and `incorrectText` in case study data
- Modify solution card `feedback` messages
- Adjust feedback styling in CSS files

## Technical Notes

### ReactFlow Integration
- Custom node types for method steps
- Automatic edge generation between sequential steps
- Node positioning from case study data
- Interactive selection with visual feedback

### Session Management
- UUID-based session IDs for uniqueness
- Automatic session creation on first access
- Progress persistence across page refreshes
- Session completion tracking

### Error Handling
- API error responses for invalid requests
- Loading states for async operations
- Graceful degradation for missing data
- User-friendly error messages

## Future Enhancements

### Possible Improvements
- [ ] Admin panel for managing case studies
- [ ] Export results to CSV/PDF
- [ ] Timer-based challenges
- [ ] Difficulty levels (beginner/advanced)
- [ ] Collaborative sessions
- [ ] Detailed analytics dashboard
- [ ] Integration with LMS platforms

### Performance Optimizations
- [ ] Case study data caching
- [ ] Lazy loading for large datasets
- [ ] Image optimization for flowcharts
- [ ] Database indexing for sessions

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**
   - Verify MONGODB_URI environment variable
   - Check database connectivity
   - Ensure MongoDB service is running

2. **ReactFlow Not Rendering**
   - Check for console errors
   - Verify node data structure
   - Ensure proper CSS imports

3. **Session Not Persisting**
   - Check browser localStorage
   - Verify API endpoints are working
   - Check network tab for failed requests

### Debugging

- Enable detailed logging in API routes
- Use React Developer Tools for component inspection
- Monitor MongoDB queries for performance
- Check browser network tab for API calls

## Support

For technical issues or questions about the implementation, please refer to:
- API documentation in route files
- Component prop documentation
- Database schema comments
- Console logging for debugging

---

*Last updated: April 2025*
*Version: 1.0.0* 