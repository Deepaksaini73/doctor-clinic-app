export const APPOINTMENT_SYSTEM_PROMPT = `
Extract patient appointment information from the following voice transcript.
Format the response as a JSON object with these fields:
{
  "patientName": "Full name of patient",
  "patientAge": "Number only",
  "gender": "male/female/other",
  "mobileNumber": "10 digit number if mentioned",
  "symptoms": "List of symptoms described",
  "priority": "routine/urgent/emergency based on description",
  "doctorId": "Leave empty - will be matched later",
  "notes": "Any additional information"
}

Rules:
- Extract only relevant medical appointment information
- For gender, default to "other" if unclear
- For priority, default to "routine" unless urgency is mentioned
- Format symptoms as a clear, comma-separated list
- Include key medical terms in notes
- Remove any irrelevant conversation
`