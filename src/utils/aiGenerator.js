// WorkPulse AI Proposal & Cover Letter Generator Engine

export const generateAIProposal = (project, freelancerName = 'Elena Rostova') => {
  const skillsList = project.skills ? project.skills.join(', ') : 'modern tech stack';
  const deliverablesText = project.deliverables 
    ? project.deliverables.map(d => `• ${d}`).join('\n') 
    : `• Fully responsive frontend & backend integration\n• High performance & secure deployment`;

  const proposalTemplate = `Dear ${project.clientCompany || project.clientName || 'Hiring Manager'},

I am excited to submit my proposal for "${project.title}". As a senior specialist experienced in ${skillsList}, I am confident in delivering exceptional, production-grade results within your target timeframe.

Why I am the best fit for your project:
1. Deep Technical Expertise: Hands-on mastery of ${skillsList} matching your exact requirements.
2. High Performance & Security: Clean, scalable code architecture adhering to modern UI/UX and industry best practices.
3. Proven Track Record: 100% job success rate with transparent communication and daily milestone updates.

Key Deliverables I will execute for you:
${deliverablesText}

I am available to start immediately and look forward to discussing your project requirements in detail.

Best regards,
${freelancerName}`;

  return proposalTemplate;
};
