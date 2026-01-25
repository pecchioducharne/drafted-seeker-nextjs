import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../backend/firebase";
import githubAnalysisService from "./GitHubAnalysisService";

// Available skills from skills.yaml (flattened)
const availableSkills = [
  "Programming", "Python", "JavaScript", "Java", "C++", "C#", "TypeScript", "Swift", "Go", "PHP", "Dart", "Rust",
  "Data Analysis", "Excel", "Google Sheets", "SQL", "Tableau", "Python (Pandas)", "Data Cleaning",
  "Marketing", "Social Media Marketing", "Content Creation", "Email Marketing", "SEO Basics", "Canva", "Analytics (Google/Facebook)",
  "Project Management", "Trello", "Notion", "Google Workspace", "Time Management", "Team Coordination",
  "Sales", "Outreach", "CRM Tools (e.g. HubSpot)", "Demand Generation", "Customer Relationship",
  "Communication", "Graphic Design", "Figma", "Photoshop", "Visual Storytelling", "Web Development", 
  "HTML/CSS", "WordPress", "Responsive Design", "Social Media Management", "Instagram", "TikTok", 
  "LinkedIn", "Copywriting", "Customer Service", "Research", "Market Research", "Competitive Research", 
  "User Surveys", "Google Search Mastery", "Formulas", "Pivot Tables", "Waterfall", "Data Entry", 
  "Formatting", "Finance", "Budgeting", "Expense Tracking", "Financial Literacy", "Accounting", 
  "Technical Support", "Troubleshooting", "Helpdesk Tools", "Basic IT Support", "Clear Communication", 
  "UX/UI Design", "Wireframing", "User Feedback", "Prototyping (Basic)", "Video Editing", "CapCut", 
  "iMovie", "Adobe Premiere (Basic)", "TikTok Editing", "Organization", "Club Leadership", 
  "Event Planning", "Team Leading", "Initiative Taking"
];

const generateSkillsFromContent = async (userEmail) => {
  try {
    const userDocRef = doc(db, "drafted-accounts", userEmail);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error("User document does not exist.");
    }

    const data = userDoc.data();
    const firstName = data.firstName || "Candidate";
    const major = data.major || "";
    const transcripts = data.transcripts || [];
    const experience = data.experience || [];
    const githubURL = data.gitHubURL || "";

    // Determine content source: transcripts > experience
    let contentSource, content;
    const validTranscripts = transcripts.filter(t => t?.trim());
    
    if (validTranscripts.length > 0) {
      contentSource = "video transcripts";
      content = validTranscripts.join('\n\n');
    } else if (experience.length > 0) {
      contentSource = "resume experience";
      content = experience.map(exp => 
        `${exp.role || ''} at ${exp.companyName || ''}: ${exp.jobDescription || ''}`
      ).join('\n\n');
    } else {
      throw new Error("No content available for skill assignment.");
    }

    console.log(`🔍 Generating skills from ${contentSource} for ${firstName}`);

    const systemMessage = "You are a helpful assistant that identifies relevant skills from candidate content.";
    const prompt = `
Based on the following ${contentSource}, identify 5-8 most relevant skills for ${firstName}. 
You must ONLY use skills from this exact list: ${availableSkills.join(", ")}.

Consider their major (${major}) and content to select appropriate skills.
Return ONLY a JSON array of skill names. Example: ["JavaScript", "Python", "Communication"]

Major: ${major}
Content: ${content}`.trim();

    const response = await fetch('/.netlify/functions/askOpenAI', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemMessage,
        prompt,
        model: "gpt-4o-mini"
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    let resultText = result.content.trim()
      .replace(/```json\s*|\s*```/g, "")
      .replace(/```\s*|\s*```/g, "");

    console.log("Raw OpenAI skills response:", resultText);

    // Parse and validate skills
    let suggestedSkills = [];
    try {
      suggestedSkills = JSON.parse(resultText);
    } catch (parseError) {
      console.error("Error parsing skills JSON:", parseError);
      // Fallback: extract mentioned skills
      suggestedSkills = availableSkills.filter(skill => 
        resultText.toLowerCase().includes(skill.toLowerCase())
      ).slice(0, 8);
    }

    const validSkills = suggestedSkills.filter(skill => availableSkills.includes(skill));
    console.log("✅ Valid skills identified:", validSkills);

    // Merge with existing skills
    const existingSkills = data.skills || [];
    const mergedSkills = [...new Set([...existingSkills, ...validSkills])];

    await updateDoc(userDocRef, { skills: mergedSkills });
    console.log("💾 Skills auto-assigned:", mergedSkills);

    // 🎯 NEW: Trigger GitHub analysis if valid GitHub URL provided
    if (githubURL && githubAnalysisService.isValidGitHubURL(githubURL)) {
      try {
        console.log("🚀 Triggering GitHub analysis for enhanced skills...");
        await githubAnalysisService.triggerAnalysis(githubURL, userEmail, firstName);
        console.log("✅ GitHub analysis triggered successfully");
      } catch (githubError) {
        console.error("⚠️ GitHub analysis failed, continuing with basic skills:", githubError);
        // Don't throw - GitHub analysis is enhancement, not requirement
      }
    }
    
    return mergedSkills;
  } catch (error) {
    console.error("Error generating skills:", error);
    throw error;
  }
};

export default generateSkillsFromContent;
