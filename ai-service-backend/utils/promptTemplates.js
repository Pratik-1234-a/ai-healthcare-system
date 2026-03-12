const generatePatientSummaryPrompt = (patientData) => {
  return `
    Generate a comprehensive medical summary for a patient with the following information:
    
    Patient History: ${patientData.patientHistory}
    Current Symptoms: ${patientData.symptoms}
    Medical Records: ${patientData.medicalRecords}
    
    Provide:
    1. Summary of patient condition
    2. Potential diagnoses
    3. Recommended tests
    4. Treatment suggestions
    
    Format the response as a clear, professional medical report.
  `;
};

const generateRiskAssessmentPrompt = (patientData) => {
  return `
    Assess the health risk for a patient with:
    
    Age: ${patientData.age}
    Symptoms: ${patientData.symptoms}
    Medical History: ${patientData.medicalHistory}
    Current Medications: ${patientData.medications}
    
    Provide:
    1. Overall risk level (Low/Medium/High)
    2. Key risk factors
    3. Preventive measures
    4. Urgent actions needed
  `;
};

module.exports = {
  generatePatientSummaryPrompt,
  generateRiskAssessmentPrompt,
};
