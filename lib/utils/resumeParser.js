import mammoth from "mammoth";

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
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;

        let extractedText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item) => ('str' in item ? item.str : ''))
                .join(' ');
            extractedText += pageText + '\n';
        }

        await loadingTask.destroy();
        return extractedText;
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
  "skills": [],
  "experience": [
    {
      "companyName": "",
      "role": "",
      "date": "",
      "jobDescription": ""
    }
  ]
}

For skills, extract technical skills, programming languages, tools, frameworks, and soft skills. Return an array of strings, max 10 most relevant skills.

Resume text:
${text}
`.trim();

    try {
        console.log('📄 Calling OpenAI to extract resume fields...');
        
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
            const errorText = await response.text();
            console.error('❌ OpenAI API call failed:', response.status, errorText);
            
            let errorJson;
            try {
                errorJson = JSON.parse(errorText);
            } catch {
                errorJson = { error: errorText };
            }
            
            throw new Error(errorJson.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        let reply = result.content;
        
        console.log('📝 OpenAI raw response:', reply.substring(0, 200) + '...');
        
        // Clean up markdown code blocks if present
        if (reply.includes("```json") || reply.includes("```")) {
            reply = reply.replace(/```json\s*|\s*```/g, "").trim();
        }

        const parsed = JSON.parse(reply);
        console.log('✅ Resume fields extracted successfully:', Object.keys(parsed));
        
        return parsed;
    } catch (err) {
        console.error("❌ Error parsing resume data:", err);
        console.error('Error details:', err.message);
        
        // Return partial data structure to avoid complete failure
        return {
            email: "",
            firstName: "",
            lastName: "",
            university: "",
            major: "",
            graduationMonth: "",
            graduationYear: "",
            linkedInURL: "",
            gitHubURL: "",
            skills: [],
            experience: []
        };
    }
};

export const parseResume = async (file) => {
    try {
        console.log('📄 Starting resume parsing for:', file.name);
        const ext = file.name.split(".").pop().toLowerCase();
        let text = "";

        console.log('📝 Extracting text from', ext.toUpperCase(), 'file...');

        switch (ext) {
            case "txt":
                text = await extractTextFromTXT(file);
                console.log('✅ TXT text extracted, length:', text.length);
                break;
            case "docx":
                text = await extractTextFromDOCX(file);
                console.log('✅ DOCX text extracted, length:', text.length);
                break;
            case "pdf":
                text = await extractTextFromPDF(file);
                console.log('✅ PDF text extracted, length:', text.length);
                break;
            default:
                throw new Error("Unsupported file format. Please upload a PDF, DOCX, or TXT file.");
        }

        if (!text || text.trim().length < 50) {
            console.warn('⚠️ Extracted text is too short:', text.length, 'characters');
            throw new Error("Could not extract enough text from resume. File may be corrupted or password-protected.");
        }

        console.log('🤖 Sending to OpenAI for field extraction...');
        const parsedData = await extractFieldsFromText(text);
        
        if (!parsedData || Object.keys(parsedData).length === 0) {
            console.error('❌ No data extracted from resume');
            throw new Error("Could not extract data from resume. Please try a different format or fill in manually.");
        }
        
        console.log('✅ Resume parsing complete:', parsedData);
        return parsedData;
    } catch (error) {
        console.error("❌ Error parsing resume:", error);
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