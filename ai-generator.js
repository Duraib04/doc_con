// AI Document Generator Script
let currentStep = 1;
let selectedDocType = null;
let selectedTemplate = null;
let selectedColor = '#2563eb';
let selectedFont = 'Arial, sans-serif';
let documentData = {};

// Document Templates
const templates = {
    permission: [
        {
            id: 'permission-formal',
            name: 'Formal Permission',
            description: 'Traditional business format',
            fields: ['recipientName', 'recipientTitle', 'organization', 'subject', 'reason', 'duration', 'senderName', 'senderTitle']
        },
        {
            id: 'permission-casual',
            name: 'Casual Permission',
            description: 'Friendly and approachable',
            fields: ['recipientName', 'subject', 'reason', 'senderName']
        },
        {
            id: 'permission-academic',
            name: 'Academic Permission',
            description: 'For educational institutions',
            fields: ['principalName', 'schoolName', 'studentName', 'class', 'reason', 'date', 'parentName']
        }
    ],
    cover: [
        {
            id: 'cover-modern',
            name: 'Modern Professional',
            description: 'Contemporary design',
            fields: ['hiringManager', 'company', 'position', 'introduction', 'experience', 'whyCompany', 'closing', 'yourName', 'email', 'phone']
        },
        {
            id: 'cover-traditional',
            name: 'Traditional Format',
            description: 'Classic business style',
            fields: ['hiringManager', 'company', 'position', 'opening', 'qualifications', 'conclusion', 'yourName', 'address', 'email', 'phone']
        },
        {
            id: 'cover-creative',
            name: 'Creative Style',
            description: 'Stand out from the crowd',
            fields: ['company', 'position', 'hook', 'achievements', 'passion', 'yourName', 'portfolio', 'email']
        }
    ],
    resume: [
        {
            id: 'resume-professional',
            name: 'Professional Resume',
            description: 'Clean and organized',
            fields: ['fullName', 'title', 'email', 'phone', 'location', 'summary', 'experience', 'education', 'skills']
        },
        {
            id: 'resume-creative',
            name: 'Creative Resume',
            description: 'Showcase creativity',
            fields: ['fullName', 'tagline', 'email', 'phone', 'portfolio', 'about', 'experience', 'skills', 'projects']
        },
        {
            id: 'resume-technical',
            name: 'Technical Resume',
            description: 'Tech-focused layout',
            fields: ['fullName', 'title', 'email', 'github', 'linkedin', 'summary', 'technicalSkills', 'experience', 'education', 'certifications']
        }
    ],
    leave: [
        {
            id: 'leave-formal',
            name: 'Formal Leave Request',
            description: 'Official leave application',
            fields: ['managerName', 'leaveType', 'startDate', 'endDate', 'reason', 'contactInfo', 'yourName', 'employeeId']
        },
        {
            id: 'leave-casual',
            name: 'Casual Leave Request',
            description: 'Informal request',
            fields: ['managerName', 'startDate', 'endDate', 'reason', 'yourName']
        },
        {
            id: 'leave-emergency',
            name: 'Emergency Leave',
            description: 'Urgent leave request',
            fields: ['managerName', 'emergencyType', 'startDate', 'duration', 'contactNumber', 'yourName']
        }
    ],
    greeting: [
        {
            id: 'greeting-birthday',
            name: 'Birthday Card',
            description: 'Celebrate birthdays',
            fields: ['recipientName', 'message', 'wishes', 'senderName']
        },
        {
            id: 'greeting-anniversary',
            name: 'Anniversary Card',
            description: 'Celebrate anniversaries',
            fields: ['coupleName', 'years', 'message', 'senderName']
        },
        {
            id: 'greeting-thank-you',
            name: 'Thank You Card',
            description: 'Express gratitude',
            fields: ['recipientName', 'reason', 'message', 'senderName']
        },
        {
            id: 'greeting-congratulations',
            name: 'Congratulations',
            description: 'Celebrate achievements',
            fields: ['recipientName', 'achievement', 'message', 'senderName']
        },
        {
            id: 'greeting-holiday',
            name: 'Holiday Greeting',
            description: 'Seasonal wishes',
            fields: ['recipientName', 'holiday', 'message', 'senderName']
        }
    ],
    business: [
        {
            id: 'business-proposal',
            name: 'Business Proposal',
            description: 'Formal proposal letter',
            fields: ['recipientName', 'company', 'subject', 'proposal', 'benefits', 'nextSteps', 'yourName', 'yourCompany', 'email']
        },
        {
            id: 'business-inquiry',
            name: 'Business Inquiry',
            description: 'Request information',
            fields: ['recipientName', 'company', 'subject', 'inquiry', 'questions', 'yourName', 'yourCompany', 'email']
        },
        {
            id: 'business-complaint',
            name: 'Complaint Letter',
            description: 'Formal complaint',
            fields: ['recipientName', 'company', 'orderNumber', 'issue', 'resolution', 'yourName', 'email', 'phone']
        }
    ]
};

// Field labels and placeholders
const fieldConfig = {
    recipientName: { label: 'Recipient Name', placeholder: 'Mr./Ms. John Doe', type: 'text' },
    recipientTitle: { label: 'Recipient Title', placeholder: 'Manager, HR Department', type: 'text' },
    organization: { label: 'Organization', placeholder: 'ABC Company Ltd.', type: 'text' },
    subject: { label: 'Subject', placeholder: 'Request for Permission', type: 'text' },
    reason: { label: 'Reason', placeholder: 'Explain the reason...', type: 'textarea' },
    duration: { label: 'Duration', placeholder: 'e.g., 3 days, 1 week', type: 'text' },
    senderName: { label: 'Your Name', placeholder: 'Your Full Name', type: 'text' },
    senderTitle: { label: 'Your Title', placeholder: 'Your Position', type: 'text' },
    principalName: { label: "Principal's Name", placeholder: 'Principal Name', type: 'text' },
    schoolName: { label: 'School Name', placeholder: 'School Name', type: 'text' },
    studentName: { label: 'Student Name', placeholder: 'Student Full Name', type: 'text' },
    class: { label: 'Class/Grade', placeholder: 'e.g., 10th Grade', type: 'text' },
    date: { label: 'Date', placeholder: '', type: 'date' },
    parentName: { label: 'Parent Name', placeholder: 'Parent/Guardian Name', type: 'text' },
    hiringManager: { label: 'Hiring Manager', placeholder: 'Hiring Manager Name', type: 'text' },
    company: { label: 'Company Name', placeholder: 'Company Name', type: 'text' },
    position: { label: 'Position', placeholder: 'Job Title', type: 'text' },
    introduction: { label: 'Introduction', placeholder: 'Introduce yourself...', type: 'textarea' },
    experience: { label: 'Relevant Experience', placeholder: 'Highlight your experience...', type: 'textarea' },
    whyCompany: { label: 'Why This Company', placeholder: 'Why you want to join...', type: 'textarea' },
    closing: { label: 'Closing Statement', placeholder: 'Closing remarks...', type: 'textarea' },
    yourName: { label: 'Your Full Name', placeholder: 'Your Name', type: 'text' },
    email: { label: 'Email', placeholder: 'your.email@example.com', type: 'email' },
    phone: { label: 'Phone Number', placeholder: '+1 (555) 000-0000', type: 'tel' },
    address: { label: 'Address', placeholder: 'Your Address', type: 'text' },
    opening: { label: 'Opening Paragraph', placeholder: 'Opening statement...', type: 'textarea' },
    qualifications: { label: 'Qualifications', placeholder: 'Your qualifications...', type: 'textarea' },
    conclusion: { label: 'Conclusion', placeholder: 'Concluding remarks...', type: 'textarea' },
    hook: { label: 'Opening Hook', placeholder: 'Attention-grabbing opening...', type: 'textarea' },
    achievements: { label: 'Key Achievements', placeholder: 'Notable achievements...', type: 'textarea' },
    passion: { label: 'Your Passion', placeholder: 'What drives you...', type: 'textarea' },
    portfolio: { label: 'Portfolio URL', placeholder: 'https://yourportfolio.com', type: 'url' },
    fullName: { label: 'Full Name', placeholder: 'Your Full Name', type: 'text' },
    title: { label: 'Professional Title', placeholder: 'e.g., Software Engineer', type: 'text' },
    location: { label: 'Location', placeholder: 'City, Country', type: 'text' },
    summary: { label: 'Professional Summary', placeholder: 'Brief professional summary...', type: 'textarea' },
    education: { label: 'Education', placeholder: 'Degree, University, Year', type: 'textarea' },
    skills: { label: 'Skills', placeholder: 'Skill 1, Skill 2, Skill 3...', type: 'textarea' },
    tagline: { label: 'Professional Tagline', placeholder: 'Your tagline...', type: 'text' },
    about: { label: 'About You', placeholder: 'Tell about yourself...', type: 'textarea' },
    projects: { label: 'Projects', placeholder: 'Notable projects...', type: 'textarea' },
    github: { label: 'GitHub', placeholder: 'github.com/username', type: 'url' },
    linkedin: { label: 'LinkedIn', placeholder: 'linkedin.com/in/username', type: 'url' },
    technicalSkills: { label: 'Technical Skills', placeholder: 'Programming languages, tools...', type: 'textarea' },
    certifications: { label: 'Certifications', placeholder: 'Relevant certifications...', type: 'textarea' },
    managerName: { label: 'Manager Name', placeholder: "Manager's Name", type: 'text' },
    leaveType: { label: 'Leave Type', placeholder: 'e.g., Annual Leave, Sick Leave', type: 'text' },
    startDate: { label: 'Start Date', placeholder: '', type: 'date' },
    endDate: { label: 'End Date', placeholder: '', type: 'date' },
    contactInfo: { label: 'Contact Information', placeholder: 'Emergency contact...', type: 'text' },
    employeeId: { label: 'Employee ID', placeholder: 'Your Employee ID', type: 'text' },
    emergencyType: { label: 'Emergency Type', placeholder: 'Nature of emergency', type: 'text' },
    contactNumber: { label: 'Contact Number', placeholder: 'Emergency contact number', type: 'tel' },
    message: { label: 'Personal Message', placeholder: 'Your heartfelt message...', type: 'textarea' },
    wishes: { label: 'Wishes', placeholder: 'Special wishes...', type: 'textarea' },
    coupleName: { label: 'Couple Name', placeholder: 'Names of the couple', type: 'text' },
    years: { label: 'Years', placeholder: 'Number of years', type: 'number' },
    achievement: { label: 'Achievement', placeholder: 'What they achieved...', type: 'text' },
    holiday: { label: 'Holiday', placeholder: 'e.g., Christmas, New Year', type: 'text' },
    proposal: { label: 'Proposal Details', placeholder: 'Your proposal...', type: 'textarea' },
    benefits: { label: 'Benefits', placeholder: 'Benefits of your proposal...', type: 'textarea' },
    nextSteps: { label: 'Next Steps', placeholder: 'Proposed next steps...', type: 'textarea' },
    yourCompany: { label: 'Your Company', placeholder: 'Your Company Name', type: 'text' },
    inquiry: { label: 'Inquiry', placeholder: 'Your inquiry...', type: 'textarea' },
    questions: { label: 'Specific Questions', placeholder: 'Questions you have...', type: 'textarea' },
    orderNumber: { label: 'Order/Reference Number', placeholder: 'Order #12345', type: 'text' },
    issue: { label: 'Issue/Problem', placeholder: 'Describe the issue...', type: 'textarea' },
    resolution: { label: 'Desired Resolution', placeholder: 'What resolution you seek...', type: 'textarea' }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeColorPicker();
    initializeFontSelect();
});

function setupEventListeners() {
    // Document type selection
    document.querySelectorAll('.doc-type-card').forEach(card => {
        card.addEventListener('click', () => {
            selectedDocType = card.dataset.type;
            document.querySelectorAll('.doc-type-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            setTimeout(() => goToStep(2), 300);
        });
    });

    // Generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateDocument);
    }
}

function initializeColorPicker() {
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            selectedColor = swatch.dataset.color;
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
            updatePreview();
        });
    });
    // Select first color by default
    document.querySelector('.color-swatch')?.classList.add('selected');
}

function initializeFontSelect() {
    const fontSelect = document.getElementById('fontSelect');
    if (fontSelect) {
        fontSelect.addEventListener('change', (e) => {
            selectedFont = e.target.value;
            updatePreview();
        });
    }
}

function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-container').forEach(container => {
        container.classList.add('hidden');
    });
    
    // Show current step
    document.getElementById(`step${step}`).classList.remove('hidden');
    currentStep = step;
    
    // Load content for step
    if (step === 2) {
        loadTemplates();
    } else if (step === 3) {
        loadCustomization();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadTemplates() {
    const templateGrid = document.getElementById('templateGrid');
    const docTemplates = templates[selectedDocType] || [];
    
    templateGrid.innerHTML = docTemplates.map(template => `
        <div class="template-card" data-template="${template.id}">
            <div class="template-preview">
                <div style="font-weight: 600; margin-bottom: 0.5rem;">${getTemplatePreviewTitle(selectedDocType)}</div>
                <div style="font-size: 0.75rem; color: #6b7280;">${template.description}</div>
            </div>
            <div class="template-name">${template.name}</div>
            <div class="template-desc">${template.description}</div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            const templateId = card.dataset.template;
            selectedTemplate = docTemplates.find(t => t.id === templateId);
            document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            setTimeout(() => goToStep(3), 300);
        });
    });
}

function getTemplatePreviewTitle(docType) {
    const titles = {
        permission: 'Permission Letter',
        cover: 'Cover Letter',
        resume: 'Professional Resume',
        leave: 'Leave Application',
        greeting: 'Greeting Card',
        business: 'Business Letter'
    };
    return titles[docType] || 'Document';
}

function loadCustomization() {
    const contentForm = document.getElementById('contentForm');
    
    if (!selectedTemplate) return;
    
    contentForm.innerHTML = selectedTemplate.fields.map(fieldName => {
        const config = fieldConfig[fieldName];
        if (!config) return '';
        
        if (config.type === 'textarea') {
            return `
                <div class="form-group">
                    <label>${config.label}</label>
                    <textarea 
                        id="field_${fieldName}" 
                        placeholder="${config.placeholder}"
                        data-field="${fieldName}"
                    ></textarea>
                </div>
            `;
        } else {
            return `
                <div class="form-group">
                    <label>${config.label}</label>
                    <input 
                        type="${config.type}" 
                        id="field_${fieldName}" 
                        placeholder="${config.placeholder}"
                        data-field="${fieldName}"
                    />
                </div>
            `;
        }
    }).join('');
    
    // Add input listeners
    contentForm.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            documentData[input.dataset.field] = input.value;
            updatePreview();
        });
    });
    
    // Initial preview
    updatePreview();
}

function updatePreview() {
    const preview = document.getElementById('documentPreview');
    if (!preview) return;
    
    const previewContent = generatePreviewContent();
    preview.innerHTML = previewContent;
    preview.style.fontFamily = selectedFont;
    preview.style.color = selectedColor === '#ffffff' ? '#000000' : '#374151';
}

function generatePreviewContent() {
    if (!selectedTemplate) return '<p style="color: #9ca3af;">Select a template to see preview...</p>';
    
    const docType = selectedDocType;
    const templateId = selectedTemplate.id;
    
    // Generate content based on document type
    if (docType === 'greeting') {
        return generateGreetingPreview();
    } else if (docType === 'resume') {
        return generateResumePreview();
    } else {
        return generateLetterPreview();
    }
}

function generateGreetingPreview() {
    const recipientName = documentData.recipientName || '[Recipient Name]';
    const message = documentData.message || '[Your heartfelt message will appear here]';
    const senderName = documentData.senderName || '[Your Name]';
    
    let icon = '🎉';
    let greeting = 'Congratulations!';
    
    if (selectedTemplate.id.includes('birthday')) {
        icon = '🎂';
        greeting = 'Happy Birthday!';
    } else if (selectedTemplate.id.includes('anniversary')) {
        icon = '💑';
        greeting = 'Happy Anniversary!';
    } else if (selectedTemplate.id.includes('thank')) {
        icon = '🙏';
        greeting = 'Thank You!';
    } else if (selectedTemplate.id.includes('holiday')) {
        icon = '🎄';
        greeting = documentData.holiday ? `Happy ${documentData.holiday}!` : 'Season\'s Greetings!';
    }
    
    return `
        <div class="greeting-card-preview" style="background: linear-gradient(135deg, ${selectedColor}22 0%, ${selectedColor}44 100%);">
            <div class="greeting-icon">${icon}</div>
            <div class="greeting-message" style="color: ${selectedColor};">${greeting}</div>
            <div class="greeting-recipient" style="font-size: 1.2rem; margin: 1rem 0;">
                Dear ${recipientName},
            </div>
            <div class="greeting-content">${message}</div>
            ${documentData.wishes ? `<div style="margin: 1rem 0;">${documentData.wishes}</div>` : ''}
            <div class="greeting-from">
                <div style="margin-top: 2rem;">With warm regards,</div>
                <div style="font-weight: 600; margin-top: 0.5rem;">${senderName}</div>
            </div>
        </div>
    `;
}

function generateResumePreview() {
    const fullName = documentData.fullName || '[Your Name]';
    const title = documentData.title || documentData.tagline || '[Professional Title]';
    const email = documentData.email || '[email@example.com]';
    const phone = documentData.phone || '[Phone Number]';
    
    return `
        <div class="preview-header">
            <h2 style="color: ${selectedColor}; margin: 0; font-size: 2rem;">${fullName}</h2>
            <p style="color: #6b7280; margin: 0.5rem 0;">${title}</p>
            <p style="font-size: 0.9rem; color: #6b7280;">
                ${email} | ${phone}
                ${documentData.location ? ` | ${documentData.location}` : ''}
            </p>
            ${documentData.linkedin ? `<p style="font-size: 0.9rem;"><a href="https://${documentData.linkedin}" style="color: ${selectedColor};">LinkedIn</a></p>` : ''}
            ${documentData.github ? `<p style="font-size: 0.9rem;"><a href="https://${documentData.github}" style="color: ${selectedColor};">GitHub</a></p>` : ''}
            ${documentData.portfolio ? `<p style="font-size: 0.9rem;"><a href="${documentData.portfolio}" style="color: ${selectedColor};">Portfolio</a></p>` : ''}
        </div>
        
        ${documentData.summary || documentData.about ? `
            <div class="resume-section">
                <h4 style="color: ${selectedColor};">${documentData.about ? 'ABOUT' : 'PROFESSIONAL SUMMARY'}</h4>
                <p>${documentData.summary || documentData.about || ''}</p>
            </div>
        ` : ''}
        
        ${documentData.experience ? `
            <div class="resume-section">
                <h4 style="color: ${selectedColor};">EXPERIENCE</h4>
                <div>${documentData.experience.split('\n').map(line => `<p>${line}</p>`).join('')}</div>
            </div>
        ` : ''}
        
        ${documentData.education ? `
            <div class="resume-section">
                <h4 style="color: ${selectedColor};">EDUCATION</h4>
                <div>${documentData.education.split('\n').map(line => `<p>${line}</p>`).join('')}</div>
            </div>
        ` : ''}
        
        ${documentData.skills || documentData.technicalSkills ? `
            <div class="resume-section">
                <h4 style="color: ${selectedColor};">SKILLS</h4>
                <p>${documentData.skills || documentData.technicalSkills || ''}</p>
            </div>
        ` : ''}
        
        ${documentData.projects ? `
            <div class="resume-section">
                <h4 style="color: ${selectedColor};">PROJECTS</h4>
                <div>${documentData.projects.split('\n').map(line => `<p>${line}</p>`).join('')}</div>
            </div>
        ` : ''}
        
        ${documentData.certifications ? `
            <div class="resume-section">
                <h4 style="color: ${selectedColor};">CERTIFICATIONS</h4>
                <p>${documentData.certifications}</p>
            </div>
        ` : ''}
    `;
}

function generateLetterPreview() {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    let content = '';
    
    // Header
    if (documentData.yourName || documentData.address || documentData.email) {
        content += `<div style="margin-bottom: 2rem;">`;
        if (documentData.yourName) content += `<div style="font-weight: 600;">${documentData.yourName}</div>`;
        if (documentData.address) content += `<div>${documentData.address}</div>`;
        if (documentData.email) content += `<div>${documentData.email}</div>`;
        if (documentData.phone) content += `<div>${documentData.phone}</div>`;
        content += `</div>`;
    }
    
    content += `<div class="preview-date" style="margin-bottom: 2rem;">${today}</div>`;
    
    // Recipient
    if (documentData.recipientName || documentData.company || documentData.hiringManager || documentData.managerName || documentData.principalName) {
        content += `<div style="margin-bottom: 2rem;">`;
        const recipient = documentData.recipientName || documentData.hiringManager || documentData.managerName || documentData.principalName;
        if (recipient) content += `<div style="font-weight: 600;">${recipient}</div>`;
        if (documentData.recipientTitle) content += `<div>${documentData.recipientTitle}</div>`;
        if (documentData.company || documentData.organization || documentData.schoolName) {
            content += `<div>${documentData.company || documentData.organization || documentData.schoolName}</div>`;
        }
        content += `</div>`;
    }
    
    // Subject
    if (documentData.subject) {
        content += `<div style="margin-bottom: 2rem; font-weight: 600;">Subject: ${documentData.subject}</div>`;
    }
    
    // Greeting
    const recipientFirstName = (documentData.recipientName || documentData.hiringManager || documentData.managerName || documentData.principalName || 'Sir/Madam').split(' ')[0];
    content += `<div style="margin-bottom: 1rem;">Dear ${recipientFirstName},</div>`;
    
    // Body
    content += `<div class="preview-body">`;
    
    // Add all text areas and relevant fields
    selectedTemplate.fields.forEach(field => {
        if (documentData[field] && fieldConfig[field]?.type === 'textarea') {
            content += `<p style="margin-bottom: 1rem; text-align: justify;">${documentData[field]}</p>`;
        }
    });
    
    // Add other relevant single-line fields in context
    if (documentData.duration) {
        content += `<p>Duration: ${documentData.duration}</p>`;
    }
    if (documentData.startDate && documentData.endDate) {
        content += `<p>Leave Period: ${documentData.startDate} to ${documentData.endDate}</p>`;
    }
    if (documentData.leaveType) {
        content += `<p>Leave Type: ${documentData.leaveType}</p>`;
    }
    
    content += `</div>`;
    
    // Closing
    content += `
        <div class="preview-signature">
            <p>Sincerely,</p>
            <p style="font-weight: 600; margin-top: 1rem;">${documentData.senderName || documentData.yourName || documentData.parentName || '[Your Name]'}</p>
            ${documentData.senderTitle ? `<p>${documentData.senderTitle}</p>` : ''}
            ${documentData.employeeId ? `<p>Employee ID: ${documentData.employeeId}</p>` : ''}
            ${documentData.studentName && selectedDocType === 'permission' ? `<p>Student: ${documentData.studentName}</p>` : ''}
            ${documentData.class ? `<p>Class: ${documentData.class}</p>` : ''}
        </div>
    `;
    
    return `<div class="preview-header" style="border-color: ${selectedColor};"></div>${content}`;
}

function generateDocument() {
    if (!validateForm()) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set font
        doc.setFont('helvetica');
        
        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const maxWidth = pageWidth - 2 * margin;
        
        // Helper function to add text with word wrap
        const addText = (text, size, style = 'normal', color = [0, 0, 0], align = 'left') => {
            doc.setFontSize(size);
            doc.setFont('helvetica', style);
            doc.setTextColor(...color);
            
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach(line => {
                if (yPos > doc.internal.pageSize.getHeight() - 20) {
                    doc.addPage();
                    yPos = 20;
                }
                
                if (align === 'center') {
                    doc.text(line, pageWidth / 2, yPos, { align: 'center' });
                } else {
                    doc.text(line, margin, yPos);
                }
                yPos += size * 0.5;
            });
            yPos += 5;
        };
        
        // Convert hex color to RGB
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16)
            ] : [37, 99, 235];
        };
        
        const primaryColor = hexToRgb(selectedColor);
        
        // Generate content based on document type
        if (selectedDocType === 'greeting') {
            generateGreetingPDF(doc, addText, primaryColor);
        } else if (selectedDocType === 'resume') {
            generateResumePDF(doc, addText, primaryColor);
        } else {
            generateLetterPDF(doc, addText, primaryColor);
        }
        
        // Save the PDF
        const fileName = `${selectedDocType}_${Date.now()}.pdf`;
        doc.save(fileName);
        
        showNotification('Document generated successfully!', 'success');
    } catch (error) {
        console.error('Error generating document:', error);
        showNotification('Error generating document. Please try again.', 'error');
    }
}

function generateGreetingPDF(doc, addText, primaryColor) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Background color
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2], 0.1);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Add decorative border
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(2);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
    
    let yPos = pageHeight / 4;
    
    // Greeting
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    
    let greeting = 'Congratulations!';
    if (selectedTemplate.id.includes('birthday')) greeting = 'Happy Birthday!';
    else if (selectedTemplate.id.includes('anniversary')) greeting = 'Happy Anniversary!';
    else if (selectedTemplate.id.includes('thank')) greeting = 'Thank You!';
    else if (selectedTemplate.id.includes('holiday')) greeting = documentData.holiday ? `Happy ${documentData.holiday}!` : 'Season\'s Greetings!';
    
    doc.text(greeting, pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;
    
    // Recipient
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Dear ${documentData.recipientName || '[Recipient Name]'},`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Message
    doc.setFontSize(12);
    const messageLines = doc.splitTextToSize(documentData.message || '', pageWidth - 60);
    messageLines.forEach(line => {
        doc.text(line, pageWidth / 2, yPos, { align: 'center' });
        yPos += 7;
    });
    
    yPos += 10;
    
    // Wishes
    if (documentData.wishes) {
        const wishLines = doc.splitTextToSize(documentData.wishes, pageWidth - 60);
        wishLines.forEach(line => {
            doc.text(line, pageWidth / 2, yPos, { align: 'center' });
            yPos += 7;
        });
    }
    
    // Sender
    yPos += 20;
    doc.setFont('helvetica', 'italic');
    doc.text('With warm regards,', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(documentData.senderName || '[Your Name]', pageWidth / 2, yPos, { align: 'center' });
}

function generateResumePDF(doc, addText, primaryColor) {
    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(documentData.fullName || '[Your Name]', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const title = documentData.title || documentData.tagline || '[Professional Title]';
    doc.text(title, 105, 28, { align: 'center' });
    
    const contactInfo = [documentData.email, documentData.phone, documentData.location].filter(Boolean).join(' | ');
    doc.setFontSize(10);
    doc.text(contactInfo, 105, 35, { align: 'center' });
    
    let yPos = 45;
    
    // Add line
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    // Sections
    const sections = [
        { title: 'PROFESSIONAL SUMMARY', content: documentData.summary || documentData.about },
        { title: 'EXPERIENCE', content: documentData.experience },
        { title: 'EDUCATION', content: documentData.education },
        { title: 'SKILLS', content: documentData.skills || documentData.technicalSkills },
        { title: 'PROJECTS', content: documentData.projects },
        { title: 'CERTIFICATIONS', content: documentData.certifications }
    ];
    
    sections.forEach(section => {
        if (section.content) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...primaryColor);
            doc.text(section.title, 20, yPos);
            yPos += 7;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const lines = doc.splitTextToSize(section.content, 170);
            lines.forEach(line => {
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(line, 20, yPos);
                yPos += 5;
            });
            yPos += 5;
        }
    });
}

function generateLetterPDF(doc, addText, primaryColor) {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Sender info
    if (documentData.yourName) addText(documentData.yourName, 11, 'bold');
    if (documentData.address) addText(documentData.address, 10);
    if (documentData.email) addText(documentData.email, 10);
    if (documentData.phone) addText(documentData.phone, 10);
    
    // Date
    addText(today, 10, 'normal', [100, 100, 100]);
    
    // Recipient
    const recipient = documentData.recipientName || documentData.hiringManager || documentData.managerName || documentData.principalName;
    if (recipient) addText(recipient, 11, 'bold');
    if (documentData.recipientTitle) addText(documentData.recipientTitle, 10);
    if (documentData.company || documentData.organization || documentData.schoolName) {
        addText(documentData.company || documentData.organization || documentData.schoolName, 10);
    }
    
    // Subject
    if (documentData.subject) {
        addText(`Subject: ${documentData.subject}`, 11, 'bold', primaryColor);
    }
    
    // Greeting
    const recipientFirstName = (recipient || 'Sir/Madam').split(' ')[0];
    addText(`Dear ${recipientFirstName},`, 11);
    
    // Body - add all textarea fields
    selectedTemplate.fields.forEach(field => {
        if (documentData[field] && fieldConfig[field]?.type === 'textarea') {
            addText(documentData[field], 11, 'normal', [0, 0, 0], 'left');
        }
    });
    
    // Additional fields
    if (documentData.duration) addText(`Duration: ${documentData.duration}`, 10);
    if (documentData.startDate && documentData.endDate) {
        addText(`Leave Period: ${documentData.startDate} to ${documentData.endDate}`, 10);
    }
    
    // Closing
    addText('Sincerely,', 11);
    addText(documentData.senderName || documentData.yourName || documentData.parentName || '[Your Name]', 11, 'bold');
    if (documentData.senderTitle) addText(documentData.senderTitle, 10);
    if (documentData.employeeId) addText(`Employee ID: ${documentData.employeeId}`, 10);
}

function validateForm() {
    // Check if at least some key fields are filled
    if (Object.keys(documentData).length === 0) return false;
    
    // Check for required fields based on document type
    const requiredFields = {
        permission: ['recipientName', 'reason', 'senderName'],
        cover: ['company', 'position', 'yourName'],
        resume: ['fullName', 'email'],
        leave: ['managerName', 'startDate', 'endDate', 'yourName'],
        greeting: ['recipientName', 'message', 'senderName'],
        business: ['recipientName', 'company', 'yourName']
    };
    
    const required = requiredFields[selectedDocType] || [];
    return required.every(field => documentData[field] && documentData[field].trim() !== '');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">${type === 'success' ? '✓' : '✗'}</div>
        <div class="notification-message">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
