import mammoth from "mammoth";
import extractPdfText from 'react-pdftotext';

export const extractTextFromTXT = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

export const extractTextFromDOCX = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

export const extractTextFromPDF = async (file) => {
    try {
        const text = await extractPdfText(file);
        return text;
    } catch (err) {
        console.error("Failed to extract PDF text:", err);
        throw new Error("PDF extraction failed.");
    }
};

export const extractFieldsFromText = async (text) => {
    const systemMessage = "You are a helpful assistant that extracts structured resume data.";
    const prompt = `
Extract the following fields from this resume text and return them as valid JSON only. Do not include backticks or explanation.

Structure:
{
  "email": "",
  "firstName": "",
  "lastName": "",
  "university": "",
  "major": "",
  "graduationMonth": "",
  "graduationYear": "",
  "linkedInURL": "",
  "gitHubURL": "",
  "experience": [
    {
      "companyName": "",
      "role": "",
      "date": "",
      "jobDescription": ""
    }
  ]
}

Resume text:
${text}
`.trim();

    try {
        // Use Netlify Function instead of OpenAI SDK
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
        let reply = result.content;
        
        if (reply.startsWith("```json")) {
            reply = reply.replace(/```json\s*|\s*```/g, "").trim();
        }

        return JSON.parse(reply);
    } catch (err) {
        console.error("Error parsing resume data:", err);
        return null;
    }
};

export const parseResume = async (file) => {
    try {
        const ext = file.name.split(".").pop().toLowerCase();
        let text = "";

        switch (ext) {
            case "txt":
                text = await extractTextFromTXT(file);
                break;
            case "docx":
                text = await extractTextFromDOCX(file);
                break;
            case "pdf":
                text = await extractTextFromPDF(file);
                break;
            default:
                throw new Error("Unsupported file format. Please upload a PDF, DOCX, or TXT file.");
        }

        const parsedData = await extractFieldsFromText(text);
        return parsedData;
    } catch (error) {
        console.error("Error parsing resume:", error);
        throw error;
    }
};

export const calculateDataCompleteness = (parsedData) => {
    if (!parsedData) return 0;
    
    const requiredFields = [
        'email',
        'firstName',
        'lastName',
        'university',
        'major',
        'graduationYear'
    ];
    
    const optionalFields = [
        'graduationMonth',
        'linkedInURL',
        'gitHubURL'
    ];
    
    const requiredFieldsPresent = requiredFields.filter(field => 
        parsedData[field] && parsedData[field].toString().trim()
    ).length;
    
    const optionalFieldsPresent = optionalFields.filter(field => 
        parsedData[field] && parsedData[field].toString().trim()
    ).length;
    
    // Weight required fields more heavily than optional fields
    const score = (requiredFieldsPresent / requiredFields.length) * 0.8 + 
                 (optionalFieldsPresent / optionalFields.length) * 0.2;
                 
    return score;
};