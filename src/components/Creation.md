# Toolkit Creator Specification

## Overview
Create a multi-step form for building toolkits that mirrors the viewing experience. The creation process should be intuitive and visually consistent with how users will ultimately view the toolkit.

## Step 1: Basic Information
- Title input (required)
- Description textarea (required)
- Industry dropdown selection (required)
- Project Type dropdown selection (required)

## Step 2: Process Steps Creation
### Visual Layout
- Horizontal scrolling layout matching the section view
- Process steps displayed as wide cards (800px) that scroll horizontally
- "Add Process Step" card at the end of the scroll

### Process Step Card Structure
1. Header
   - Process step number
   - Name input
   - Description textarea
   - "Generate with AI" button (enabled when name is provided)

2. Subphases Section
   - Grid layout for subphases (2 columns)
   - Each subphase contains:
     - Name input
     - Description textarea
     - Tools sections divided into:
       - Traditional Tools
       - AI Tools

3. Tools Structure
   - Name input
   - Website URL input
   - Overview textarea
   - Key Features list (bullet points)
   - "Fetch Tool Data" button (enabled when name and website provided)

### Interactive Features
1. AI Generation
   - Generate process descriptions based on step name
   - Suggest subphases based on process context
   - Auto-fetch tool information when website is provided

2. Tool Management
   - Add/remove tools for each subphase
   - Toggle between Traditional and AI tools
   - Fetch tool data from existing database
   - Manual tool information entry

3. Validation
   - Real-time validation of required fields
   - Step completion indicators
   - Error messaging for incomplete sections

## Step 3: Review & Publish
- Preview of the complete toolkit
- Final validation check
- Publish button
- Success/error feedback

## UI/UX Requirements
1. Visual Hierarchy
   - Clear section differentiation
   - Consistent spacing and typography
   - Visual feedback for interactions

2. Navigation
   - Step indicators
   - Back/Next buttons
   - Save draft functionality

3. Responsive Design
   - Horizontal scrolling on desktop
   - Adaptive layout for different screen sizes
   - Touch-friendly interaction points

4. Styling
   - Color coding for Traditional vs AI tools
   - Consistent with viewing interface
   - Clear action buttons
   - Hover/focus states for interactive elements

## Data Structure


## Validation Rules
1. Basic Info
   - All fields required
   - Title: min 5 characters
   - Description: min 20 characters

2. Process Steps
   - At least one process step required
   - Each step needs:
     - Name and description
     - At least one subphase
     - At least one tool (Traditional or AI) per subphase

3. Tools
   - Required: name, website, overview
   - Website must be valid URL
   - At least one feature per tool