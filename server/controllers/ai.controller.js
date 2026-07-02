import { GoogleGenerativeAI } from '@google/generative-ai';

// @desc    Enhance job description using Gemini AI
// @route   POST /api/ai/enhance-job
// @access  Private/HiringManager
export const enhanceJobDescription = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!description?.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key is not configured on the server.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    });

    const jobRole = title ? title : 'tech professional';

    const prompt = `You are an expert tech recruiter and copywriter working at a top-tier company. 
Enhance the following job description to be professional, compelling, and appealing to top-tier ${jobRole}s. 
Be specific, clear, and concise. Use bullet points for key responsibilities and requirements.
Output ONLY the enhanced description text, without any preamble, introductions, or closings.

Original description:
${description}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ enhancedDescription: text });
  } catch (error) {
    console.error('Gemini AI Error:', error.message);
    res.status(500).json({ message: 'Failed to enhance description with AI. Please try again.' });
  }
};

// @desc    Calculate AI Match Score
// @route   POST /api/ai/match-score
// @access  Private
export const getMatchScore = async (req, res) => {
  try {
    const { profile, jobDescription } = req.body;
    
    if (!profile || !jobDescription) {
      return res.status(400).json({ message: 'Profile and Job Description are required' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

    const prompt = `You are an expert AI recruiting assistant. Evaluate the fit between the candidate's profile and the job description.
    Candidate Profile:
    Bio: ${profile.bio || 'None'}
    Skills: ${profile.skills?.join(', ') || 'None'}
    
    Job Description:
    ${jobDescription}
    
    Analyze the match and return a JSON object with EXACTLY this structure, nothing else:
    {
      "score": <number between 0-100 representing the fit percentage>,
      "reason": "<One short sentence explaining why they are a good or bad fit>"
    }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    // Clean up potential markdown formatting
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const json = JSON.parse(text);
    res.json(json);
  } catch (error) {
    console.error('Gemini AI Error:', error.message);
    res.status(500).json({ message: 'Failed to calculate match score.' });
  }
};

// @desc    Generate Cover Letter
// @route   POST /api/ai/generate-cover-letter
// @access  Private
export const generateCoverLetter = async (req, res) => {
  try {
    const { profile, jobDescription, company, jobTitle } = req.body;
    
    if (!profile || !jobDescription) {
      return res.status(400).json({ message: 'Profile and Job Description are required' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

    const role = jobTitle || 'professional';

    const prompt = `You are an expert career coach writing a cover letter for a ${role}.
    Write a highly tailored, concise, and professional cover letter for the following candidate applying to the following job at ${company || 'the company'}.
    
    Candidate Background:
    Bio: ${profile.bio || 'None'}
    Skills: ${profile.skills?.join(', ') || 'None'}
    
    Job Description:
    ${jobDescription}
    
    Guidelines:
    - Keep it under 3 paragraphs.
    - Be confident but not arrogant.
    - Focus on how their skills match the job description.
    - Do NOT include placeholder brackets like [Your Name]. Just write the body paragraphs. Output only the body text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    res.json({ coverLetter: text });
  } catch (error) {
    console.error('Gemini AI Error:', error.message);
    res.status(500).json({ message: 'Failed to generate cover letter.' });
  }
};
