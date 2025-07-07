import { torService } from '@/services/api/torService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock skills database for demonstration
const skillsDatabase = [
  'javascript', 'react', 'node.js', 'python', 'java', 'sql', 'mongodb',
  'aws', 'docker', 'kubernetes', 'infrastructure', 'consulting', 'project management',
  'financial analysis', 'regulatory compliance', 'procurement', 'climate resilience',
  'economic policy', 'capacity building', 'technical assistance', 'engineering',
  'economics', 'finance', 'law', 'environmental science', 'risk management'
];

// Mock CV analysis - in real implementation, this would use AI/ML services
const analyzeCVContent = (fileName, fileType) => {
  // Simulate CV content analysis based on filename patterns
  const skills = [];
  const qualifications = [];
  
  if (fileName.toLowerCase().includes('senior') || fileName.toLowerCase().includes('lead')) {
    skills.push('project management', 'consulting', 'technical assistance');
    qualifications.push('10+ years experience', 'Leadership experience');
  }
  
  if (fileName.toLowerCase().includes('engineer')) {
    skills.push('engineering', 'infrastructure', 'project management');
    qualifications.push('Engineering degree', 'Professional certification');
  }
  
  if (fileName.toLowerCase().includes('financial') || fileName.toLowerCase().includes('finance')) {
    skills.push('financial analysis', 'regulatory compliance', 'risk management');
    qualifications.push('Finance degree', 'CPA/CFA certification');
  }
  
  // Add some random skills for demonstration
  const randomSkills = skillsDatabase.slice(0, Math.floor(Math.random() * 5) + 3);
  skills.push(...randomSkills);
  
  return {
    extractedSkills: [...new Set(skills)],
    extractedQualifications: qualifications,
    experienceLevel: skills.length > 10 ? 'senior' : skills.length > 5 ? 'mid' : 'junior'
  };
};

const compareSkillsWithRequirements = (cvSkills, torRequirements) => {
  if (!torRequirements || !Array.isArray(cvSkills)) {
    return { matched: [], missing: [], matchPercentage: 0 };
  }
  
  // Extract skills from TOR qualifications text
  const torSkills = [];
  const qualText = torRequirements.toLowerCase();
  
  skillsDatabase.forEach(skill => {
    if (qualText.includes(skill.toLowerCase())) {
      torSkills.push(skill);
    }
  });
  
  const cvSkillsLower = cvSkills.map(s => s.toLowerCase());
  const matched = torSkills.filter(skill => 
    cvSkillsLower.some(cvSkill => cvSkill.includes(skill) || skill.includes(cvSkill))
  );
  
  const missing = torSkills.filter(skill => !matched.includes(skill));
  const matchPercentage = torSkills.length > 0 ? Math.round((matched.length / torSkills.length) * 100) : 0;
  
  return {
    matched,
    missing,
    matchPercentage,
    totalRequired: torSkills.length
  };
};

export const qualificationService = {
  async analyzeQualifications(submissionData) {
    await delay(400);
    
    try {
      // Get TOR data if ticketId is provided
      let torData = null;
      if (submissionData.ticketId) {
        try {
          // In real implementation, would need to map ticket to TOR
          // For demo, use first available TOR
          const tors = await torService.getAll();
          torData = tors.length > 0 ? tors[0] : null;
        } catch (err) {
          console.warn('Could not fetch TOR data:', err);
        }
      }
      
      // Analyze CV content
      const cvAnalysis = analyzeCVContent(submissionData.fileName, submissionData.fileType);
      
      // Compare with TOR requirements if available
      let torComparison = null;
      if (torData && torData.sections && torData.sections.qualifications) {
        torComparison = compareSkillsWithRequirements(
          cvAnalysis.extractedSkills,
          torData.sections.qualifications
        );
      }
      
      // Generate qualification summary
      const qualificationSummary = {
        status: torComparison ? 
          (torComparison.matchPercentage >= 80 ? 'excellent' : 
           torComparison.matchPercentage >= 60 ? 'good' : 
           torComparison.matchPercentage >= 40 ? 'fair' : 'poor') : 'analyzed',
        
        extractedSkills: cvAnalysis.extractedSkills,
        extractedQualifications: cvAnalysis.extractedQualifications,
        experienceLevel: cvAnalysis.experienceLevel,
        
        torComparison: torComparison ? {
          matchedSkills: torComparison.matched,
          missingSkills: torComparison.missing,
          matchPercentage: torComparison.matchPercentage,
          totalRequired: torComparison.totalRequired,
          torTitle: torData.title
        } : null,
        
        checkpoint: this.generateCheckpointSummary(cvAnalysis, torComparison),
        analyzedDate: new Date().toISOString()
      };
      
      return qualificationSummary;
      
    } catch (error) {
      console.error('Error analyzing qualifications:', error);
      return {
        status: 'error',
        checkpoint: 'Unable to analyze qualifications due to processing error.',
        analyzedDate: new Date().toISOString()
      };
    }
  },

  generateCheckpointSummary(cvAnalysis, torComparison) {
    if (!cvAnalysis) {
      return 'Qualification analysis could not be completed.';
    }
    
    let summary = `CV Analysis: ${cvAnalysis.experienceLevel} level candidate with ${cvAnalysis.extractedSkills.length} identified skills.`;
    
    if (cvAnalysis.extractedQualifications.length > 0) {
      summary += ` Key qualifications: ${cvAnalysis.extractedQualifications.slice(0, 2).join(', ')}.`;
    }
    
    if (torComparison) {
      summary += ` TOR Match: ${torComparison.matchPercentage}% alignment`;
      
      if (torComparison.matchedSkills.length > 0) {
        summary += ` (strong in: ${torComparison.matchedSkills.slice(0, 3).join(', ')})`;
      }
      
      if (torComparison.missingSkills.length > 0) {
        summary += `. Areas for development: ${torComparison.missingSkills.slice(0, 2).join(', ')}.`;
      }
      
      if (torComparison.matchPercentage >= 80) {
        summary += ' Excellent candidate match.';
      } else if (torComparison.matchPercentage >= 60) {
        summary += ' Good candidate match with minor gaps.';
      } else if (torComparison.matchPercentage >= 40) {
        summary += ' Moderate match, may require additional training.';
      } else {
        summary += ' Limited match, significant skill development needed.';
      }
    }
    
    return summary;
  },

  async compareWithTOR(cvData, torId) {
    await delay(300);
    
    try {
      const torData = await torService.getById(torId);
      
      if (!torData.sections || !torData.sections.qualifications) {
        throw new Error('TOR qualifications not found');
      }
      
      const comparison = compareSkillsWithRequirements(
        cvData.extractedSkills || [],
        torData.sections.qualifications
      );
      
      return {
        ...comparison,
        torTitle: torData.title,
        torId: torData.Id,
        comparedDate: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error comparing with TOR:', error);
      throw error;
    }
  }
};