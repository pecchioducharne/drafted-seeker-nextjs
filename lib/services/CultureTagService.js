import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const generateCultureTags = async (userEmail) => {
  try {
    // Fetch the user's transcripts from Firestore
    const userDocRef = doc(db, "drafted-accounts", userEmail);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error("User document does not exist.");
    }

    const data = userDoc.data();
    const allTranscripts = data.transcripts || [];
    const firstName = data.firstName || "Candidate"; // Extract firstName

    // Filter out empty transcripts
    const validTranscripts = allTranscripts.filter(t => t && t.trim().length > 0);
    
    if (validTranscripts.length < 1) {
      console.log('⚠️ No valid transcripts found, skipping culture tag generation');
      throw new Error("At least one valid transcript is required.");
    }

    console.log(`📊 Generating culture tags from ${validTranscripts.length} transcript(s)`);
    console.log('Transcripts available:', validTranscripts.map((t, i) => `Video ${i + 1}: ${t.substring(0, 50)}...`));

    // Define allowed culture tags
    const allowedCultureTags = [
      "Integrity",
      "Innovation",
      "Teamwork",
      "Customer Obsession",
      "Accountability",
      "Transparency",
      "Fast Learning",
      "Resilience",
      "Respect",
      "Excellence",
      "Adaptability",
      "Leadership",
      "Creativity",
      "Communication",
      "Out of the Box Thinking"
    ];

    // Updated prompt to match the batch version's format
    const systemMessage = "You are a helpful assistant that generates culture tags based on provided transcripts.";
    const prompt = `
Based on the following transcripts, generate exactly 4 culture tags with explanations for ${firstName}. 
Use only these tags: ${allowedCultureTags.join(", ")}.

You must follow this EXACT format for each tag (starting with a hyphen):
- [Tag]: [Explanation]
- [Tag]: [Explanation]
- [Tag]: [Explanation]
- [Tag]: [Explanation]

Example format:
- Leadership: Shows strong initiative in leading projects.
- Innovation: Demonstrates creative problem-solving abilities.
- Teamwork: Collaborates effectively with diverse teams.
- Fast Learning: Quickly adapts to new technologies.

Make each explanation unique to ${firstName}'s video resume, journey, experiences, and story.
Keep each explanation to 1-2 sentences maximum.

Transcripts:
${validTranscripts.join('\n\n')}
`;

    // Use Netlify Function instead of direct API call
    const response = await fetch('/.netlify/functions/askOpenAI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemMessage,
        prompt,
        model: "gpt-3.5-turbo"
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const resultText = result.content.trim();

    console.log("Result Text:", resultText);

    // Updated parsing logic
    const lines = resultText.split('\n').filter(line => line.trim() !== '');
    
    const cultureTags = [];
    const cultureDescriptions = [];

    // Updated parsing logic to handle hyphen-prefixed lines
    for (const line of lines) {
      // Remove hyphen and clean the line
      const cleanLine = line.replace(/^[-•]\s*/, '').trim();
      
      // Find the matching tag at the start of the line
      const matchingTag = allowedCultureTags.find(tag => 
        cleanLine.toLowerCase().startsWith(tag.toLowerCase() + ':')
      );

      if (matchingTag) {
        // Extract the description (everything after "Tag:")
        const description = cleanLine.substring(matchingTag.length + 1).trim();
        if (description) {
          cultureTags.push(matchingTag);
          cultureDescriptions.push(description);
        }
      }
    }

    // Personalize descriptions
    const personalizedDescriptions = cultureDescriptions.map(desc => 
      desc.replace(/the candidate/gi, firstName)
    );

    // Update Firestore with the new culture tags and descriptions
    await updateDoc(userDocRef, {
      culture: {
        cultureTags: cultureTags,
        cultureDescriptions: personalizedDescriptions,
      },
    });

    console.info("Culture tags and descriptions generated and saved.");
  } catch (error) {
    console.error("Error generating culture tags:", error);
    throw error;
  }
};

export default generateCultureTags;
