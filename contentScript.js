(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const FLOATING_DIV_ID = "ct-chart-floating";

  let observer;
  let hasLoaded = false;

  // State management
  let panelVisible = false;
  let panelShow = false;
  let backdropVisible = false;
  let isChartActive = false;
  let isAuditTableActive = false;
  let isConditionAuditActive = false;
  let contentType = 'chart';
  let searchTerm = '';
  let auditSearchTerm = '';
  let conditionAuditSearchTerm = '';
  let buttonsShifted = false;
  let currentPage = 1;
  let sortConfig = { key: null, direction: 'asc' };
  let conditionAuditSortConfig = { key: null, direction: 'asc' };
  const itemsPerPage = 20;


  // Medical Conditions Data
  const medicalConditionsData = [
    {
      id: 1,
      title: 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
      icon: '🩺',
      details: {
        eGFR: 52,
        date: '11/15/2022',
        icd10: 'E11.22',
        hcc24: 18,
        hcc28: 37,
        rxHcc: '15',
        source: 'All Source Data',
        note: true,
        active: true,
        code_type: 'Documented',
        RADV_score: 3,
        code_status: 'DOCUMENTED'
      },
      description: 'Patient diagnosed with type 2 diabetes mellitus with associated kidney disease. Requires close monitoring of renal function and glycemic control. Management includes glucose monitoring, HbA1c testing every 3 months, and nephrology consultation.',
      clinicalIndicators: 'Elevated HbA1c, Fasting glucose > 126 mg/dL',
      codeExplanation: 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
      noteText: 'Patient needs regular follow-up with endocrinologist and nephrologist. Current medications include metformin and ACE inhibitor for kidney protection.'
    },
    {
      id: 2,
      title: 'Chronic kidney disease, stage 3a',
      icon: '🩺',
      details: {
        encounter: 'Database Test',
        date: '11/04/2021',
        icd10: 'N18.31',
        hcc24: 138,
        hcc28: 329,
        rxHcc: '21',
        source: 'All Source Data',
        note: true,
        active: false,
        code_type: 'Opportunities',
        RADV_score: 0,
        code_status: 'OPPORTUNITIES'
      },
      description: 'Chronic kidney disease in stage 3a with moderate reduction in kidney function. eGFR values consistently between 45-59 mL/min/1.73m². Patient requires ongoing monitoring and management of underlying risk factors.',
      clinicalIndicators: 'eGFR 30-59 mL/min/1.73m²',
      codeExplanation: 'Chronic kidney disease, stage 3a (moderate)',
      noteText: 'Monitor progression carefully. Patient advised on diet modifications and medication adjustments to preserve kidney function.'
    },
    {
      id: 3,
      title: 'Morbid (severe) obesity due to excess calories',
      icon: '⚖️',
      details: {
        bmi: 42.3,
        date: '08/17/2022',
        icd10: 'E66.01',
        hcc24: 22,
        hcc28: 48,
        rxHcc: '12',
        source: 'All Source Data',
        note: true,
        active: false,
        code_type: 'Documented',
        RADV_score: 2,
        code_status: 'DOCUMENTED'
      },
      description: 'Patient presents with severe obesity (BMI 42.3 kg/m²). Comprehensive approach to weight management including dietary counseling, physical activity recommendations, and consideration of bariatric surgery evaluation.',
      clinicalIndicators: 'BMI ≥ 40 kg/m²',
      codeExplanation: 'Morbid obesity due to excess calories',
      noteText: 'Patient has tried multiple weight loss programs without success. Will consider referral to bariatric surgery program if current intervention fails.'
    },
    {
      id: 4,
      title: 'Body mass index [BMI] 40.0-44.9, adult',
      icon: '📊',
      details: {
        bmi: 42.5,
        date: '11/07/2022',
        icd10: 'Z68.41',
        hcc24: 22,
        hcc28: 41,
        rxHcc: null,
        source: 'All Source Data',
        note: false,
        active: false,
        code_type: 'Opportunities',
        RADV_score: 1,
        code_status: 'OPPORTUNITIES'
      },
      description: 'Patient has BMI in the severely obese range (40.0-44.9). Documented for tracking and management purposes.',
      clinicalIndicators: 'BMI 40.0-44.9 kg/m²',
      codeExplanation: 'Body mass index 40.0-44.9, adult'
    },
    {
      id: 5,
      title: 'Inflammatory polyarthropathy',
      icon: '🦴',
      details: {
        source: 'MSO Data, suspect diagnosis',
        date: '09/03/2021',
        icd10: 'M06.4',
        hcc24: 40,
        hcc28: 94,
        note: true,
        active: false,
        code_type: 'Opportunities',
        RADV_score: 0,
        code_status: 'OPPORTUNITIES'
      },
      clinicalIndicators: 'Joint pain, swelling, morning stiffness',
      documentation: 'Rheumatology consult, Imaging studies',
      codeExplanation: 'Inflammatory polyarthropathy, unspecified'
    },
    {
      id: 6,
      title: 'Degenerative disease of nervous system, unspecified',
      icon: '🧠',
      details: {
        source: 'Claim, CMS',
        date: '06/25/2020',
        icd10: 'G31.9',
        hcc24: 52,
        hcc28: "",
        note: true,
        active: false,
        code_type: 'Documented',
        RADV_score: 1,
        code_status: 'DOCUMENTED'
      },
      clinicalIndicators: 'Cognitive decline, memory impairment',
      documentation: 'Neurology consult, Cognitive assessments',
      codeExplanation: 'Degenerative disease of nervous system, unspecified'
    },
    {
      id: 7,
      title: 'Major depressive disorder, single episode, mild',
      icon: '🧠',
      details: {
        source: 'MSO Data, chronic diagnosis',
        date: '04/30/2020',
        icd10: 'F32.0',
        hcc24: 59,
        hcc28: "",
        note: true,
        active: false,
        code_type: 'Opportunities',
        RADV_score: 2,
        code_status: 'OPPORTUNITIES'
      },
      clinicalIndicators: 'Depressed mood, anhedonia, sleep disturbance',
      documentation: 'Psychiatry consult, PHQ-9 assessment',
      codeExplanation: 'Major depressive disorder, single episode, mild'
    },
    {
      id: 8,
      title: 'Major depressive disorder, single episode, moderate',
      icon: '🧠',
      details: {
        source: 'Suspected condition assertion',
        date: '09/10/2022',
        icd10: 'F32.1',
        hcc24: 59,
        hcc28: "",
        note: true,
        active: false,
        code_type: 'Documented',
        RADV_score: 3,
        code_status: 'DOCUMENTED'
      },
      clinicalIndicators: 'Severe depression, functional impairment',
      documentation: 'Psychiatry consult, Clinical assessment',
      codeExplanation: 'Major depressive disorder, single episode, moderate'
    },
    {
      id: 9,
      title: 'Hypertension, unspecified',
      icon: '🫀',
      details: {
        source: 'All Source Data',
        date: '03/15/2023',
        icd10: 'I10',
        hcc24: 85,
        hcc28: 85,
        rxHcc: '119',
        note: true,
        active: true,
        code_type: 'Documented',
        RADV_score: 1,
        code_status: 'DOCUMENTED'
      },
      description: 'Essential hypertension requiring ongoing management with blood pressure medications and lifestyle modifications. Regular monitoring of blood pressure at home.',
      clinicalIndicators: 'Blood pressure > 140/90 mmHg',
      codeExplanation: 'Essential hypertension, unspecified',
      noteText: 'Patient is compliant with ACE inhibitor regimen. Blood pressure controlled with current medication.'
    },
    {
      id: 10,
      title: 'Hyperlipidemia, unspecified',
      icon: '🩸',
      details: {
        source: 'Lab Results',
        date: '02/20/2023',
        icd10: 'E78.5',
        hcc24: 22,
        hcc28: 22,
        note: false,
        active: true,
        code_type: 'Opportunities',
        RADV_score: 0,
        code_status: 'OPPORTUNITIES'
      },
      clinicalIndicators: 'Total cholesterol > 200 mg/dL',
      documentation: 'Lipid panel, Lab results',
      codeExplanation: 'Hyperlipidemia, unspecified'
    },
    {
      id: 11,
      title: 'Coronary artery disease, unspecified',
      icon: '🫀',
      details: {
        source: 'Cardiology Report',
        date: '01/15/2023',
        icd10: 'I25.9',
        hcc24: 85,
        hcc28: 85,
        note: true,
        active: true,
        code_type: 'Documented',
        RADV_score: 2,
        code_status: 'DOCUMENTED'
      },
      clinicalIndicators: 'Chest pain, abnormal stress test',
      documentation: 'Cardiology consult, Stress test',
      codeExplanation: 'Coronary artery disease, unspecified'
    },
    {
      id: 12,
      title: 'Osteoarthritis of knee, bilateral',
      icon: '🦴',
      details: {
        source: 'Orthopedic Report',
        date: '12/10/2022',
        icd10: 'M17.0',
        hcc24: 40,
        hcc28: 40,
        note: true,
        active: true,
        code_type: 'Opportunities',
        RADV_score: 1,
        code_status: 'OPPORTUNITIES'
      },
      clinicalIndicators: 'Joint pain, stiffness, crepitus',
      documentation: 'Orthopedic consult, X-ray findings',
      codeExplanation: 'Osteoarthritis of knee, bilateral'
    }
  ];

  // Audit Table Data
  const auditTableData = [
    {
      chartId: 1019,
      dos: '09/17/2025',
      name: 'James Washington',
      provider: 'Jatin N Sheth',
      hccCount: 7,
      conditionsForAudit: 4,
      radvCompleted: 1,
      initialQualityScore: 1.40
    },
    {
      chartId: 1016,
      dos: '09/17/2025',
      name: 'Charles R Chick',
      provider: 'Jatin N Sheth',
      hccCount: 10,
      conditionsForAudit: 2,
      radvCompleted: 0,
      initialQualityScore: 1.14
    },
    {
      chartId: 1008,
      dos: '09/15/2025',
      name: 'Sheryl S Markey',
      provider: 'PS-Pariksith Singh',
      hccCount: 3,
      conditionsForAudit: 2,
      radvCompleted: 0,
      initialQualityScore: 1.67
    },
    {
      chartId: 1011,
      dos: '09/15/2025',
      name: 'Karen K Frick',
      provider: 'Alex Anthony Tambrini',
      hccCount: 4,
      conditionsForAudit: 1,
      radvCompleted: 0,
      initialQualityScore: 1.18
    },
    {
      chartId: 1002,
      dos: '09/12/2025',
      name: 'Yvonne S Holm',
      provider: 'PS-Loida Buaquina',
      hccCount: 9,
      conditionsForAudit: 7,
      radvCompleted: 5,
      initialQualityScore: 1.41
    },
    {
      chartId: 1006,
      dos: '09/12/2025',
      name: 'Mary K Carwell',
      provider: 'PS-James Craig',
      hccCount: 8,
      conditionsForAudit: 5,
      radvCompleted: 0,
      initialQualityScore: 1.74
    },
    {
      chartId: 1010,
      dos: '09/12/2025',
      name: 'Jose D Rodriguez',
      provider: 'Abdel Jibawi',
      hccCount: 6,
      conditionsForAudit: 2,
      radvCompleted: 0,
      initialQualityScore: 1.20
    },
    {
      chartId: 1012,
      dos: '09/12/2025',
      name: 'Vincent P Roscillo',
      provider: 'Alex Anthony Tambrini',
      hccCount: 6,
      conditionsForAudit: 2,
      radvCompleted: 0,
      initialQualityScore: 1.07
    },
    {
      chartId: 1006,
      dos: '09/12/2025',
      name: 'Mary K Carwell',
      provider: 'PS-James Craig',
      hccCount: 16,
      conditionsForAudit: 1,
      radvCompleted: 0,
      initialQualityScore: 1.04
    },
    {
      chartId: 1002,
      dos: '09/12/2025',
      name: 'Yvonne S Holm',
      provider: 'PS-Loida Buaquina',
      hccCount: 16,
      conditionsForAudit: 4,
      radvCompleted: 0,
      initialQualityScore: 1.13
    },
    {
      chartId: 1003,
      dos: '09/10/2025',
      name: 'Roger C Oneil',
      provider: 'PS-Loida Buaquina',
      hccCount: 7,
      conditionsForAudit: 2,
      radvCompleted: 0,
      initialQualityScore: 1.21
    },
    {
      chartId: 1005,
      dos: '09/10/2025',
      name: 'Cheryl Jenkins',
      provider: 'PS-John Ameen',
      hccCount: 8,
      conditionsForAudit: 3,
      radvCompleted: 2,
      initialQualityScore: 1.21
    },
    {
      chartId: 1015,
      dos: '09/10/2025',
      name: 'William Schlossnagle',
      provider: 'PS-James Craig',
      hccCount: 3,
      conditionsForAudit: 1,
      radvCompleted: 0,
      initialQualityScore: 1.25
    },
    {
      chartId: 1005,
      dos: '09/10/2025',
      name: 'Cheryl Jenkins',
      provider: 'PS-John Ameen',
      hccCount: 15,
      conditionsForAudit: 1,
      radvCompleted: 0,
      initialQualityScore: 1.04
    },
    {
      chartId: 1003,
      dos: '09/10/2025',
      name: 'Roger C Oneil',
      provider: 'PS-Loida Buaquina',
      hccCount: 14,
      conditionsForAudit: 2,
      radvCompleted: 0,
      initialQualityScore: 1.08
    },
    {
      chartId: 1022,
      dos: '09/10/2025',
      name: 'Jackie Howe',
      provider: 'Shaheen Pirani',
      hccCount: 5,
      conditionsForAudit: 5,
      radvCompleted: 0,
      initialQualityScore: 3.13
    },
    {
      chartId: 1028,
      dos: '09/10/2025',
      name: 'Robert C Pellegrino',
      provider: 'PS-John Ameen',
      hccCount: 9,
      conditionsForAudit: 2,
      radvCompleted: 0,
      initialQualityScore: 1.22
    }
  ];

  // Condition Audit Table Data
  const conditionAuditData = [
    {
      id: 1,
      conditionName: 'Bilateral lower extremity atherosclerosis with rest pain',
      accurateCode: 'I70.229',
      progressNotes: ['05/05/2025', '04/15/2025'],
      hccCode: '264',
      evidenceStrength: 'Moderate',
      auditDate: '10/24/2025',
      auditScore: 3
    },
    {
      id: 2,
      conditionName: 'Paraparesis',
      accurateCode: 'G82.20',
      progressNotes: ['11/01/2024'],
      hccCode: '181',
      evidenceStrength: 'Weak',
      auditDate: '',
      auditScore: 2
    },
    {
      id: 3,
      conditionName: 'Type 2 diabetes mellitus',
      accurateCode: 'E11.9',
      progressNotes: ['11/22/2022', '10/15/2022'],
      hccCode: '38',
      evidenceStrength: 'Weak',
      auditDate: '',
      auditScore: 2
    },
    {
      id: 4,
      conditionName: 'Chronic obstructive pulmonary disease, unspecified',
      accurateCode: 'J44.9',
      progressNotes: ['11/22/2022'],
      hccCode: '280',
      evidenceStrength: 'Moderate',
      auditDate: '',
      auditScore: 3
    }
  ];

  // Add CSS styles with high specificity to avoid conflicts
  function addStyles() {
    const style = document.createElement('style');
    style.id = 'caretracker-extension-styles';
    style.textContent = `
      /* High specificity CSS to avoid website conflicts */
      #caretracker-extension-styles {
        all: initial;
      }

      /* Reset and base styles with high specificity */
      #caretracker-extension-styles * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      /* Rectangular Floating Button Container - High Specificity */
      body .floating-buttons {
        position: fixed !important;
        right: 0 !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        z-index: 10000 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
        background: #007bff !important;
        border-radius: 12px 0 0 12px !important;
        padding: 15px 8px 15px 15px !important;
        box-shadow: -4px 0 12px rgba(0, 123, 255, 0.3) !important;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        font-family: Arial, sans-serif !important;
      }

      body .floating-buttons.shifted {
        right: 70% !important;
      }

      body .floating-icon-btn {
        width: 45px !important;
        height: 45px !important;
        background: #fff !important;
        color: #007bff !important;
        border: none !important;
        border-radius: 50% !important;
        font-size: 20px !important;
        cursor: pointer !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
        transition: all 0.3s ease !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        position: relative !important;
        font-family: Arial, sans-serif !important;
        text-decoration: none !important;
        outline: none !important;
      }

      body .floating-icon-btn:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
      }

      /* Enhanced Tooltip Design - High Specificity */
      body .floating-icon-btn::before {
        content: attr(data-tooltip) !important;
        position: absolute !important;
        right: 60px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%) !important;
        color: white !important;
        padding: 8px 12px !important;
        border-radius: 8px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        white-space: nowrap !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
        z-index: 10000 !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        font-family: Arial, sans-serif !important;
      }

      body .floating-icon-btn::after {
        content: '' !important;
        position: absolute !important;
        right: 52px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        border: 6px solid transparent !important;
        border-left-color: #2c3e50 !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
        z-index: 10000 !important;
      }

      body .floating-icon-btn:hover::before {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(-50%) translateX(-5px) !important;
        animation: tooltipPulse 2s infinite !important;
      }

      body .floating-icon-btn:hover::after {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(-50%) translateX(-5px) !important;
      }

      @keyframes tooltipPulse {
        0%, 100% {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        50% {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }
      }

      /* Tooltip Animation for Active States */
      .floating-icon-btn.chart-btn.active::before {
        background: #28a745;
      }

      .floating-icon-btn.chart-btn.active::after {
        border-left-color: #28a745;
      }

      .floating-icon-btn.chart-btn.active {
        background: #28a745;
        color: #fff;
      }

      /* Condition Audit Button Active States */
      .floating-icon-btn.condition-audit-btn.active::before {
        background: #28a745;
      }

      .floating-icon-btn.condition-audit-btn.active::after {
        border-left-color: #28a745;
      }

      .floating-icon-btn.condition-audit-btn.active {
        background: #28a745;
        color: #fff;
      }

      /* Backdrop Overlay with animation - High Specificity */
      body .backdrop {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: rgba(0, 0, 0, 0.5) !important;
        z-index: 9998 !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transition: opacity 0.3s ease, visibility 0.3s ease !important;
      }

      body .backdrop.visible {
        opacity: 1 !important;
        visibility: visible !important;
      }

      /* Floating Panel with Slide Animation - High Specificity */
      body #ct-chart-floating {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        width: 70% !important;
        height: 100vh !important;
        background: #f8f9fa !important;
        box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3) !important;
        z-index: 9999 !important;
        font-family: Arial, sans-serif !important;
        font-size: 13px !important;
        color: #333 !important;
        transform: translateX(100%) !important;
        transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
      }

      body #ct-chart-floating.show {
        transform: translateX(0) !important;
      }

      body #ct-chart-floating .chart-header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 12px 20px !important;
        background: #fff !important;
        border-bottom: 1px solid #e0e0e0 !important;
        flex-shrink: 0 !important;
      }

      body #ct-chart-floating h3 {
        margin: 0 !important;
        font-size: 18px !important;
        color: #333 !important;
        font-weight: 600 !important;
      }

      body #ct-chart-floating .close-btn {
        background: transparent !important;
        color: #666 !important;
        border: none !important;
        cursor: pointer !important;
        padding: 4px 8px !important;
        font-size: 24px !important;
        transition: color 0.2s ease !important;
      }

      body #ct-chart-floating .close-btn:hover {
        color: #333 !important;
      }

      /* Medical Conditions Section - High Specificity */
      body .medical-conditions-section {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        background: #f8f9fa !important;
        min-height: 0 !important;
        height: 100% !important;
      }

      body .medical-conditions-section > h4 {
        padding: 15px 20px !important;
        margin: 0 !important;
        background: #fff !important;
        border-bottom: 1px solid #e0e0e0 !important;
        flex-shrink: 0 !important;
      }

      /* Search Container - High Specificity */
      body .search-container {
        padding: 10px 20px !important;
        background: #fff !important;
        border-bottom: 1px solid #e0e0e0 !important;
        flex-shrink: 0 !important;
      }

      body .search-input {
        width: 100% !important;
        padding: 8px 12px !important;
        border: 2px solid #e9ecef !important;
        border-radius: 8px !important;
        font-size: 14px !important;
        background: #f8f9fa !important;
        transition: all 0.3s ease !important;
        box-sizing: border-box !important;
        font-family: Arial, sans-serif !important;
      }

      body .search-input:focus {
        outline: none !important;
        border-color: #007bff !important;
        background: #fff !important;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1) !important;
      }

      body .search-input::placeholder {
        color: #6c757d !important;
        font-style: italic !important;
      }

      body .search-results-count {
        margin-top: 4px !important;
        font-size: 12px !important;
        color: #6c757d !important;
        font-weight: 500 !important;
        text-align: right !important;
      }

      /* No Results UI */
      .no-results {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
        color: #6c757d;
        min-height: 400px;
        width: 100%;
        grid-column: 1 / -1;
        margin: 50px 0;
      }

      .no-results-icon {
        font-size: 48px;
        margin-bottom: 20px;
        opacity: 0.6;
      }

      .no-results h3 {
        color: #495057;
        margin-bottom: 10px;
        font-size: 20px;
        font-weight: 600;
      }

      .no-results p {
        margin-bottom: 20px;
        font-size: 14px;
        line-height: 1.5;
      }

      .no-results-suggestions {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #e9ecef;
        max-width: 400px;
        text-align: left;
      }

      .no-results-suggestions p {
        margin-bottom: 10px;
        font-weight: 600;
        color: #495057;
      }

      .no-results-suggestions ul {
        margin: 0;
        padding-left: 20px;
        color: #6c757d;
      }

      .no-results-suggestions li {
        margin-bottom: 5px;
        font-size: 13px;
      }

      .medical-conditions-scroll {
        flex: 1 !important;
        overflow-y: auto !important;
        padding: 15px !important;
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 15px !important;
        min-height: 0 !important;
        height: 100% !important;
        align-content: start !important;
      }

      /* Custom Scrollbar for Medical Conditions */
      .medical-conditions-scroll::-webkit-scrollbar {
        width: 8px;
      }

      .medical-conditions-scroll::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      .medical-conditions-scroll::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }

      .medical-conditions-scroll::-webkit-scrollbar-thumb:hover {
        background: #555;
      }

      /* Force scrollbar to always show */
      .medical-conditions-scroll {
        scrollbar-width: thin;
        scrollbar-color: #888 #f1f1f1;
      }

      /* Beautiful Medical Condition Card Design - High Specificity */
      body .medical-condition-card {
        background: #ffffff !important;
        border: 1px solid #e8e8e8 !important;
        border-left: 4px solid #28a745 !important;
        border-radius: 4px !important;
        padding: 5px !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06) !important;
        height: fit-content !important;
        transition: all 0.3s ease !important;
        font-family: Arial, sans-serif !important;
      }

      body .medical-condition-card:hover {
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1) !important;
        transform: translateY(-1px) !important;
      }

      /* Badges Row */
      body .card-badges-row {
        margin-bottom: 10px !important;
        display: flex !important;
        justify-content: space-between !important;
      }

      body .badge-group {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 6px !important;
        align-items: center !important;
      }

      body .icd-badge {
        display: inline-block !important;
        padding: 4px 8px !important;
        background: #dbeafe !important;
        color: #1e40af !important;
        border: 1px solid #93c5fd !important;
        border-radius: 2px !important;
        font-size: 10px !important;
        font-weight: 600 !important;
        font-family: 'Courier New', monospace !important;
      }

      body .hcc-badge {
        display: inline-block !important;
        padding: 4px 8px !important;
        background: #d1fae5 !important;
        color: #065f46 !important;
        border: 1px solid #6ee7b7 !important;
        border-radius: 2px !important;
        font-size: 10px !important;
        font-weight: 600 !important;
        font-family: 'Courier New', monospace !important;
      }

      body .rx-hcc-badge {
        display: inline-block !important;
        padding: 4px 8px !important;
        background: #f3e8ff !important;
        color: #6b21a8 !important;
        border: 1px solid #c084fc !important;
        border-radius: 2px !important;
        font-size: 10px !important;
        font-weight: 600 !important;
        font-family: 'Courier New', monospace !important;
      }

      body .code-type-badge {
        display: inline-block !important;
        padding: 4px 8px !important;
        border-radius: 2px !important;
        font-size: 10px !important;
        font-weight: 600 !important;
        font-family: 'Courier New', monospace !important;
      }

      body .code-type-badge.documented {
        background: #d1fae5 !important;
        color: #065f46 !important;
        border: 1px solid #6ee7b7 !important;
      }

      body .code-type-badge.opportunities {
        background: #fed7aa !important;
        color: #9a3412 !important;
        border: 1px solid #fdba74 !important;
      }

      body .audit-score-icon {
        display: inline-flex !important;
        align-items: center !important;
        gap: 4px !important;
        padding: 4px 8px !important;
        background: #fee2e2 !important;
        color: #dc2626 !important;
        border: 1px solid #fca5a5 !important;
        border-radius: 2px !important;
        font-size: 10px !important;
        font-weight: 700 !important;
        font-family: 'Courier New', monospace !important;
        cursor: pointer !important;
      }

      /* Card Title */
      body .card-title {
        font-size: 13px !important;
        font-weight: 700 !important;
        color: #111827 !important;
        margin: 0 0 10px 0 !important;
        line-height: 1.3 !important;
        font-family: Arial, sans-serif !important;
      }

      /* Card Description Paragraph */
      body .card-description {
        font-size: 11px !important;
        color: #374151 !important;
        line-height: 1.5 !important;
        margin: 0 0 10px 0 !important;
        font-family: Arial, sans-serif !important;
      }

      /* Card Sections */
      body .card-info-row {
        display: flex !important;
        align-items: flex-start !important;
        gap: 8px !important;
        padding: 6px 0 !important;
        font-size: 11px !important;
        color: #374151 !important;
        font-family: Arial, sans-serif !important;
      }

      body .card-info-row .label {
        font-weight: 600 !important;
        color: #6b7280 !important;
        font-family: Arial, sans-serif !important;
      }

      body .card-info-row .value {
        flex: 1 !important;
        font-family: Arial, sans-serif !important;
      }

      /* Audit Table Section */
      .audit-table-container {
        width: 100%;
        height: 100%;
        padding: 20px;
        overflow: auto;
      }

      .audit-table-wrapper {
        width: 100%;
        overflow-x: auto;
        margin-top: 10px;
        margin-bottom: 5px;
      }

      .audit-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        table-layout: auto;
      }

      .audit-table thead {
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
        color: white;
      }

      .audit-table th {
        padding: 14px 14px;
        text-align: left;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
        height: 48px;
        vertical-align: middle;
      }

      .audit-table tbody tr {
        transition: background-color 0.2s ease;
      }

      .audit-table tbody tr:hover {
        background: #f8f9fa;
      }

      .audit-table tbody tr:nth-child(even) {
        background: #f9fafb;
      }

      .audit-table tbody tr:nth-child(even):hover {
        background: #f3f4f6;
      }

      .audit-table td {
        padding: 12px 14px;
        font-size: 13px;
        color: #374151;
        border-bottom: 1px solid #e5e7eb;
      }

      .audit-table td:first-child,
      .audit-table th:first-child {
        padding-left: 20px;
        min-width: 80px;
      }

      .audit-table td:nth-child(2),
      .audit-table th:nth-child(2) {
        min-width: 80px;
      }

      .audit-table td:nth-child(3),
      .audit-table th:nth-child(3) {
        min-width: 100px;
      }

      .audit-table td:nth-child(4),
      .audit-table th:nth-child(4) {
        min-width: 120px;
      }

      .audit-table td:nth-child(5),
      .audit-table th:nth-child(5) {
        min-width: 90px;
      }

      .audit-table td:nth-child(6),
      .audit-table th:nth-child(6) {
        min-width: 100px;
      }

      .audit-table td:nth-child(7),
      .audit-table th:nth-child(7) {
        min-width: 100px;
      }

      .audit-table td:nth-child(8),
      .audit-table th:nth-child(8) {
        min-width: 100px;
      }

      .audit-table td:last-child,
      .audit-table th:last-child {
        padding-right: 20px;
      }

      /* Sortable Headers */
      .audit-table .sortable {
        cursor: pointer;
        user-select: none;
        position: relative;
        transition: background-color 0.2s ease;
        text-align: left;
        white-space: nowrap;
        overflow: visible;
        text-overflow: ellipsis;
        max-width: 100%;
        padding-right: 20px !important;
      }

      .audit-table .sortable:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .sort-icon {
        width: 16px;
        height: 16px;
        fill: currentColor;
        opacity: 0.7;
        transition: opacity 0.2s ease;
        display: inline-block;
        vertical-align: middle;
        margin-left: 4px;
        flex-shrink: 0;
        margin-top: -2px;
        padding-bottom: 2px;
      }

      .audit-table .sortable span {
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .audit-table td:nth-child(6),
      .audit-table th:nth-child(6) {
        text-align: center;
      }

      .audit-table td:nth-child(7),
      .audit-table th:nth-child(7) {
        text-align: center;
      }

      .audit-table td:nth-child(8),
      .audit-table th:nth-child(8) {
        text-align: center;
      }

      .sort-icon.active {
        opacity: 1;
      }

      /* Pagination Styles */
      .pagination-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-top: 1px solid #e5e7eb;
        flex-wrap: wrap;
        gap: 15px;
      }

      .pagination-info {
        font-size: 13px;
        color: #6b7280;
        font-weight: 500;
      }

      .pagination {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .pagination-btn {
        padding: 8px 16px;
        border: 1px solid #d1d5db;
      background: #fff;
        color: #374151;
        border-radius: 6px;
      font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .pagination-btn:hover:not(:disabled) {
        background: #f3f4f6;
        border-color: #9ca3af;
      }

      .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .pagination-btn.active {
        background: #1e40af;
        color: #fff;
        border-color: #1e40af;
      }

      .pagination-btn.active:hover {
        background: #1e3a8a;
      }

      /* Responsive Design */
      @media (max-width: 1024px) {
        body #ct-chart-floating {
          width: 85% !important;
        }

        body .floating-buttons.shifted {
          right: 85% !important;
        }
      }

      @media (max-width: 768px) {
        body #ct-chart-floating {
          width: 100% !important;
        }

        body .floating-buttons {
          right: 0 !important;
          padding: 12px 6px 12px 12px !important;
        }

        body .floating-buttons.shifted {
          right: 0 !important;
        }

        body .floating-icon-btn {
          width: 40px !important;
          height: 40px !important;
          font-size: 18px !important;
        }

        .medical-conditions-scroll {
          grid-template-columns: 1fr !important;
        }

        .card-info-row {
          flex-direction: column !important;
          gap: 4px !important;
        }

        .card-info-row .label {
          min-width: auto !important;
        }

        .pagination-wrapper {
          flex-direction: column !important;
          align-items: center !important;
        }

        .pagination {
          justify-content: center !important;
        }
      }

      @media (max-width: 480px) {
        body .floating-buttons {
          padding: 10px 4px 10px 10px !important;
        }

        body .floating-icon-btn {
          width: 35px !important;
          height: 35px !important;
          font-size: 16px !important;
        }

        .medical-condition-card {
          padding: 10px !important;
        }

        .card-title {
          font-size: 12px !important;
        }

        .card-description,
        .card-info-row {
          font-size: 10px !important;
        }

        .badge-group {
          gap: 4px !important;
        }

        .icd-badge,
        .hcc-badge,
        .rx-hcc-badge {
          font-size: 9px !important;
          padding: 3px 6px !important;
        }

        .pagination-wrapper {
          padding: 15px !important;
        }

        .pagination-info {
          font-size: 11px !important;
        }

        .pagination-btn {
          padding: 6px 12px !important;
          font-size: 11px !important;
        }

        /* Mobile tooltip adjustments */
        body .floating-icon-btn::before {
          right: 50px !important;
          font-size: 11px !important;
          padding: 6px 10px !important;
        }

        body .floating-icon-btn::after {
          right: 42px !important;
          border-width: 5px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Filter medical conditions based on search term
  function filterMedicalConditions() {
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) {
      return medicalConditionsData;
    }

    const searchLower = trimmedSearch.toLowerCase();
    return medicalConditionsData.filter(condition => {
      return (
        // Title
        condition.title.toLowerCase().includes(searchLower) ||
        // Description
        (condition.description && condition.description.toLowerCase().includes(searchLower)) ||
        // Clinical Indicators
        condition.clinicalIndicators.toLowerCase().includes(searchLower) ||
        // Code Explanation
        condition.codeExplanation.toLowerCase().includes(searchLower) ||
        // Note Text
        (condition.noteText && condition.noteText.toLowerCase().includes(searchLower)) ||
        // Documentation
        (condition.documentation && condition.documentation.toLowerCase().includes(searchLower)) ||
        // ICD-10 code
        condition.details.icd10.toLowerCase().includes(searchLower) ||
        // HCC codes
        (condition.details.hcc24 && condition.details.hcc24.toString().includes(searchLower)) ||
        (condition.details.hcc28 && condition.details.hcc28.toString().includes(searchLower)) ||
        (condition.details.rxHcc && condition.details.rxHcc.toString().includes(searchLower)) ||
        // Status
        (condition.details.active ? 'active' : 'inactive').includes(searchLower) ||
        // Source
        (condition.details.source && condition.details.source.toLowerCase().includes(searchLower)) ||
        // Date
        (condition.details.date && condition.details.date.includes(searchLower)) ||
        // Additional fields
        (condition.details.eGFR && condition.details.eGFR.toString().includes(searchLower)) ||
        (condition.details.bmi && condition.details.bmi.toString().includes(searchLower)) ||
        (condition.details.encounter && condition.details.encounter.toLowerCase().includes(searchLower)) ||
        // Code Type
        (condition.details.code_type && condition.details.code_type.toLowerCase().includes(searchLower))
      );
    });
  }

  // Filter audit table data based on search term
  function filterAuditData() {
    const trimmedSearch = auditSearchTerm.trim();
    if (!trimmedSearch) {
      return auditTableData;
    }

    const searchLower = trimmedSearch.toLowerCase();
    return auditTableData.filter(row => {
      return (
        // Chart ID
        row.chartId.toString().includes(searchLower) ||
        // DOS (Date of Service)
        row.dos.toLowerCase().includes(searchLower) ||
        // Name
        row.name.toLowerCase().includes(searchLower) ||
        // Provider
        row.provider.toLowerCase().includes(searchLower) ||
        // HCC Count
        row.hccCount.toString().includes(searchLower) ||
        // Conditions for Audit
        row.conditionsForAudit.toString().includes(searchLower) ||
        // RADV Completed
        row.radvCompleted.toString().includes(searchLower) ||
        // Initial Quality Score
        row.initialQualityScore.toString().includes(searchLower)
      );
    });
  }

  // Filter condition audit data based on search term
  function filterConditionAuditData() {
    const trimmedSearch = conditionAuditSearchTerm.trim();
    if (!trimmedSearch) {
      return conditionAuditData;
    }

    const searchLower = trimmedSearch.toLowerCase();
    return conditionAuditData.filter(row => {
      return (
        // Condition Name
        row.conditionName.toLowerCase().includes(searchLower) ||
        // Accurate Code
        row.accurateCode.toLowerCase().includes(searchLower) ||
        // Progress Notes
        row.progressNotes.some(note => note.toLowerCase().includes(searchLower)) ||
        // HCC Code
        row.hccCode.toString().includes(searchLower) ||
        // Evidence Strength
        row.evidenceStrength.toLowerCase().includes(searchLower) ||
        // Audit Date
        row.auditDate.toLowerCase().includes(searchLower) ||
        // Audit Score
        row.auditScore.toString().includes(searchLower)
      );
    });
  }

  // Helper function to render sort icons with 3-stage support
  function renderSortIcon(columnKey) {
    if (sortConfig.key === columnKey) {
      if (sortConfig.direction === 'asc') {
        return `<svg class="sort-icon active" viewBox="0 0 100 100"><polygon points="50,20 80,60 20,60" fill="currentColor"/></svg>`;
      } else if (sortConfig.direction === 'desc') {
        return `<svg class="sort-icon active" viewBox="0 0 100 100"><polygon points="20,20 80,20 50,60" fill="currentColor"/></svg>`;
      }
    }
    return '';
  }

  function renderConditionAuditSortIcon(columnKey) {
    if (conditionAuditSortConfig.key === columnKey) {
      if (conditionAuditSortConfig.direction === 'asc') {
        return `<svg class="sort-icon active" viewBox="0 0 100 100"><polygon points="50,20 80,60 20,60" fill="currentColor"/></svg>`;
      } else if (conditionAuditSortConfig.direction === 'desc') {
        return `<svg class="sort-icon active" viewBox="0 0 100 100"><polygon points="20,20 80,20 50,60" fill="currentColor"/></svg>`;
      }
    }
    return '';
  }

  // Sort audit data
  // Sort audit data
  function sortAuditData(key) {
    currentPage = 1;
    let direction;
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null; // Reset
        sortConfig = { key: null, direction: null };
        showAuditContent();
        return;
      }
    } else {
      direction = 'asc';
    }
    sortConfig = { key, direction };
    showAuditContent();
  }

  // Sort condition audit data
  function sortConditionAuditData(key) {
    currentPage = 1;
    let direction;
    if (conditionAuditSortConfig.key === key) {
      if (conditionAuditSortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (conditionAuditSortConfig.direction === 'desc') {
        direction = null; // Reset
        conditionAuditSortConfig = { key: null, direction: null };
        showConditionAuditContent();
        return;
      }
    } else {
      direction = 'asc';
    }
    conditionAuditSortConfig = { key, direction };
    showConditionAuditContent();
  }

  function paginateData(data) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }

  function changePage(page) {
    currentPage = page;
    showAuditContent();
  }

  // Create floating buttons
  function createFloatingButtons() {
    console.log("🔧 Creating floating buttons...");
    const existing = document.getElementById('floatingButtons');
    if (existing) {
      console.log("⚠️ Floating buttons already exist, skipping creation");
      return existing;
    }

    const buttonsDiv = document.createElement('div');
    buttonsDiv.id = 'floatingButtons';
    buttonsDiv.className = 'floating-buttons';
    buttonsDiv.style.cssText = `
      position: fixed !important;
      right: 0 !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      z-index: 10000 !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      background: #007bff !important;
      border-radius: 12px 0 0 12px !important;
      padding: 15px 8px 15px 15px !important;
      box-shadow: -4px 0 12px rgba(0, 123, 255, 0.3) !important;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
      font-family: Arial, sans-serif !important;
    `;

    buttonsDiv.innerHTML = `
      <button class="floating-icon-btn chart-btn" id="chartBtn" data-tooltip="Chart Details">
        📊
      </button>
      <button class="floating-icon-btn audit-btn" id="auditBtn" data-tooltip="Audit Details Table">
        📋
      </button>
      <button class="floating-icon-btn condition-audit-btn" id="conditionAuditBtn" data-tooltip="Audit Details Table">
        📝
      </button>
    `;

    document.body.appendChild(buttonsDiv);
    console.log("✅ Floating buttons created and added to DOM");

    // Add event listeners
    document.getElementById('chartBtn').addEventListener('click', showChartDetails);
    document.getElementById('auditBtn').addEventListener('click', showAuditTable);
    document.getElementById('conditionAuditBtn').addEventListener('click', showConditionAuditTable);
    console.log("✅ Event listeners added to buttons");

    return buttonsDiv;
  }

  // Create backdrop
  function createBackdrop() {
    const existing = document.getElementById('backdrop');
    if (existing) return existing;

    const backdrop = document.createElement('div');
    backdrop.id = 'backdrop';
    backdrop.className = 'backdrop';
    backdrop.addEventListener('click', closePanel);
    document.body.appendChild(backdrop);
    return backdrop;
  }

  // Create floating panel with high specificity CSS
  function createFloatingPanel() {
    const existing = document.getElementById(FLOATING_DIV_ID);
    if (existing) return existing;

    const div = document.createElement('div');
    div.id = FLOATING_DIV_ID;
    div.className = 'hidden';
    div.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      width: 30% !important;
      height: 100vh !important;
      background: #f8f9fa !important;
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3) !important;
      z-index: 9999 !important;
      font-family: Arial, sans-serif !important;
      font-size: 13px !important;
      color: #333 !important;
      transform: translateX(100%) !important;
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
    `;

    const header = document.createElement('div');
    header.className = 'chart-header';
    header.style.cssText = `
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 12px 20px !important;
      background: #fff !important;
      border-bottom: 1px solid #e0e0e0 !important;
      flex-shrink: 0 !important;
    `;

    const title = document.createElement('h3');
    title.id = 'chartTitle';
    title.textContent = 'Chart Details - John Doe';
    title.style.cssText = `
      margin: 0 !important;
      font-size: 18px !important;
      color: #333 !important;
      font-weight: 600 !important;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeChartDiv';
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: transparent !important;
      color: #666 !important;
      border: none !important;
      cursor: pointer !important;
      padding: 4px 8px !important;
      font-size: 24px !important;
      transition: color 0.2s ease !important;
    `;

    const content = document.createElement('div');
    content.id = 'chartContent';

    header.appendChild(title);
    header.appendChild(closeBtn);
    div.appendChild(header);
    div.appendChild(content);

    document.body.appendChild(div);

    closeBtn.addEventListener('click', closePanel);
    return div;
  }

  function showPanel(type) {
    console.log(`🎯 showPanel called with type: ${type}`);
    const div = document.getElementById(FLOATING_DIV_ID);
    const backdrop = document.getElementById('backdrop');
    const floatingButtons = document.getElementById('floatingButtons');
    const chartBtn = document.getElementById('chartBtn');
    const auditBtn = document.getElementById('auditBtn');
    const conditionAuditBtn = document.getElementById('conditionAuditBtn');

    console.log('Elements found:', { div: !!div, backdrop: !!backdrop, floatingButtons: !!floatingButtons, chartBtn: !!chartBtn, auditBtn: !!auditBtn, conditionAuditBtn: !!conditionAuditBtn });

    if (div && backdrop && floatingButtons) {
      div.classList.remove('hidden');
      div.style.transform = 'translateX(0) !important';
      backdrop.classList.add('visible');
      floatingButtons.classList.add('shifted');
      floatingButtons.style.right = '70% !important';
      console.log('✅ Panel shown successfully');
    } else {
      console.error('❌ Missing required elements for panel');
    }

    contentType = type;

    if (type === 'chart') {
      chartBtn.classList.add('active');
      auditBtn.classList.remove('active');
      if (conditionAuditBtn) {
        conditionAuditBtn.classList.remove('active');
        conditionAuditBtn.setAttribute('data-tooltip', 'Audit Details Table');
      }
      chartBtn.setAttribute('data-tooltip', 'Active - Chart Details');
      auditBtn.setAttribute('data-tooltip', 'Audit Details Table');
      document.getElementById('chartTitle').textContent = 'Chart Details - John Doe';
      showChartContent();
    } else if (type === 'audit') {
      auditBtn.classList.add('active');
      chartBtn.classList.remove('active');
      if (conditionAuditBtn) {
        conditionAuditBtn.classList.remove('active');
        conditionAuditBtn.setAttribute('data-tooltip', 'Audit Details Table');
      }
      chartBtn.setAttribute('data-tooltip', 'Chart Details');
      auditBtn.setAttribute('data-tooltip', 'Active - Audit Details Table');
      document.getElementById('chartTitle').textContent = 'Audit Details Table';
      showAuditContent();
    } else if (type === 'conditionAudit') {
      if (conditionAuditBtn) {
        conditionAuditBtn.classList.add('active');
        conditionAuditBtn.setAttribute('data-tooltip', 'Active - Audit Details Table');
      }
      chartBtn.classList.remove('active');
      auditBtn.classList.remove('active');
      chartBtn.setAttribute('data-tooltip', 'Chart Details');
      auditBtn.setAttribute('data-tooltip', 'Audit Details Table');
      document.getElementById('chartTitle').textContent = 'Audit Details Table';
      showConditionAuditContent();
    }
  }


  function showAuditTable() {
    console.log("📋 Audit Table button clicked");
    showPanel('audit');
  }

  function showChartDetails() {
    console.log("📊 Chart Details button clicked");
    showPanel('chart');
  }

  function showConditionAuditTable() {
    console.log("📝 Audit Table button clicked");
    showPanel('conditionAudit');
  }

  function closePanel() {
    const div = document.getElementById(FLOATING_DIV_ID);
    const backdrop = document.getElementById('backdrop');
    const floatingButtons = document.getElementById('floatingButtons');
    const chartBtn = document.getElementById('chartBtn');
    const auditBtn = document.getElementById('auditBtn');
    const conditionAuditBtn = document.getElementById('conditionAuditBtn');

    div.classList.add('hidden');
    div.style.transform = 'translateX(100%) !important';
    backdrop.classList.remove('visible');
    floatingButtons.classList.remove('shifted');
    floatingButtons.style.right = '0 !important';
    chartBtn.classList.remove('active');
    auditBtn.classList.remove('active');
    if (conditionAuditBtn) {
      conditionAuditBtn.classList.remove('active');
      conditionAuditBtn.setAttribute('data-tooltip', 'Audit Details Table');
    }
    chartBtn.setAttribute('data-tooltip', 'Chart Details');
    auditBtn.setAttribute('data-tooltip', 'Audit Details Table');

    setTimeout(() => div.classList.add('hidden'), 400);
  }

  function showChartContent() {
    const chartContent = document.getElementById('chartContent');
    const showSearchBar = medicalConditionsData.length > 6;
    const filteredConditions = filterMedicalConditions();

    const searchBarHTML = showSearchBar
      ? `
      <div class="search-container">
        <input
          type="text"
          placeholder="Search conditions, ICD codes, HCC codes, status..."
          value="${searchTerm}"
          oninput="handleSearch(this.value)"
          class="search-input"
        />
        <div class="search-results-count">
          ${filteredConditions.length} of ${medicalConditionsData.length} conditions
        </div>
      </div>
    `
      : '';

    chartContent.innerHTML = `
      <div class="medical-conditions-section">
        <h4>Medical Conditions</h4>
        ${searchBarHTML}
        <div class="medical-conditions-scroll">
          ${filteredConditions.length === 0 && searchTerm.trim() ? `
            <div style="text-align: center; padding: 40px 20px; height: 60px; font-size: 14px; color: #6c757d; font-style: italic; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
              <div style="font-size: 24px;">🔍</div>
              <div>No conditions found</div>
              <div style="font-size: 12px; color: #9ca3af;">No conditions match your search for "<strong>${searchTerm}</strong>"</div>
            </div>
          ` : filteredConditions.map((condition) => {
      const RADV_score = condition.details.RADV_score || 0;
      const code_status = condition.details.code_status || '';
      const rxHcc = condition.details.rxHcc;
      const hcc28 = condition.details.hcc28;
      const isRADV = (code_status === "DOCUMENTED" && (RADV_score > 0 && RADV_score < 4) && (rxHcc?.length > 0 || hcc28?.length > 0));

      return `
            <div class="medical-condition-card" style="${isRADV ? 'border-left: 4px solid #dc2626; border-top: 1px solid #dc2626; border-right: 1px solid #dc2626; border-bottom: 1px solid #dc2626' : ''}">
              <div class="card-badges-row">
                <div class="badge-group">
                  <span class="icd-badge">ICD-10: ${condition.details.icd10}</span>
                  ${condition.details.hcc28 ? `<span class="hcc-badge">HCC-28: ${condition.details.hcc28}</span>` : ''}
                  ${condition.details.rxHcc ? `<span class="rx-hcc-badge">Rx-HCC: ${condition.details.rxHcc}</span>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${condition.details.code_type ? `<span class="code-type-badge ${condition.details.code_type.toLowerCase()}">${condition.details.code_type}</span>` : ''}
                  ${isRADV ? `<span class="audit-score-icon">Audit: ${RADV_score}</span>` : ''}
                </div>
              </div>
              <h5 class="card-title" style="${isRADV ? 'color: #dc2626' : ''}">${condition.title}</h5>
              <p class="card-description">${condition.description || 'No description available'}</p>
              <div class="card-info-row">
                <span class="label">Clinical Indicators:</span>
                <span class="value">${condition.clinicalIndicators}</span>
              </div>
              <div class="card-info-row">
                <span class="label">Code Explanation:</span>
                <span class="value">${condition.codeExplanation}</span>
              </div>
              <div class="card-info-row">
                <span class="label">Note:</span>
                <span class="value">${condition.noteText || 'Not available'}</span>
              </div>
            </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
  }

  function showAuditContent() {
    // Filter data first
    let filteredData = filterAuditData();
    // Sort data if needed
    let sortedData = [...filteredData];
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        if (['chartId', 'hccCount', 'conditionsForAudit', 'radvCompleted'].includes(sortConfig.key)) {
          return sortConfig.direction === 'asc' ? a[sortConfig.key] - b[sortConfig.key] : b[sortConfig.key] - a[sortConfig.key];
        }
        if (sortConfig.key === 'initialQualityScore') {
          return sortConfig.direction === 'asc' ? parseFloat(a[sortConfig.key]) - parseFloat(b[sortConfig.key]) : parseFloat(b[sortConfig.key]) - parseFloat(a[sortConfig.key]);
        }
        const aVal = String(a[sortConfig.key]).toLowerCase();
        const bVal = String(b[sortConfig.key]).toLowerCase();
        return sortConfig.direction === 'asc' ? aVal < bVal ? -1 : aVal > bVal ? 1 : 0 : aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      });
    }

    // Paginate
    const paginatedData = paginateData(sortedData);
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const chartContent = document.getElementById('chartContent');
    chartContent.innerHTML = `
      <div class="audit-table-container">
        <!-- Audit Details Table Search -->
        <div class="search-container">
          <input
            type="text"
            placeholder="Search audit data by chart ID, name, provider, dates..."
            value="${auditSearchTerm}"
            oninput="handleAuditSearch(this.value)"
            class="search-input"
          />
          <div class="search-results-count">
            ${filteredData.length} of ${auditTableData.length} entries
          </div>
        </div>
        <div class="audit-table-wrapper">
          <table class="audit-table">
            <thead>
              <tr>
                <th onclick="sortAuditData('chartId')" class="sortable">
                  <span>Chart Id</span> ${renderSortIcon('chartId')}
                </th>
                <th onclick="sortAuditData('dos')" class="sortable">
                  <span>DOS</span> ${renderSortIcon('dos')}
                </th>
                <th onclick="sortAuditData('name')" class="sortable">
                  <span>Name</span> ${renderSortIcon('name')}
                </th>
                <th onclick="sortAuditData('provider')" class="sortable">
                  <span>Provider</span> ${renderSortIcon('provider')}
                </th>
                <th onclick="sortAuditData('hccCount')" class="sortable">
                  <span>HCC Count</span> ${renderSortIcon('hccCount')}
                </th>
                <th onclick="sortAuditData('conditionsForAudit')" class="sortable">
                  <span>Conditions for Audit</span> ${renderSortIcon('conditionsForAudit')}
                </th>
                <th onclick="sortAuditData('radvCompleted')" class="sortable">
                  <span>RADV Completed</span> ${renderSortIcon('radvCompleted')}
                </th>
                <th onclick="sortAuditData('initialQualityScore')" class="sortable">
                  <span>Initial Quality Score</span> ${renderSortIcon('initialQualityScore')}
                </th>
              </tr>
            </thead>
            <tbody>
              ${paginatedData
                .map(row => `
                  <tr>
                    <td>${row.chartId}</td>
                    <td>${row.dos}</td>
                    <td>${row.name}</td>
                    <td>${row.provider}</td>
                    <td>${row.hccCount}</td>
                    <td>${row.conditionsForAudit}</td>
                    <td>${row.radvCompleted}</td>
                    <td>${row.initialQualityScore}</td>
                  </tr>
                `)
                .join('')}
            </tbody>
          </table>
        </div>
        ${totalPages > 1
          ? `
        <div class="pagination-wrapper">
          <div class="pagination-info">
            Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, sortedData.length)} of ${sortedData.length} entries
          </div>
          <div class="pagination">
            <button onclick="changePage(currentPage - 1)" class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''}>
              Previous
            </button>
            ${Array.from({ length: totalPages }, (_, i) => {
              const page = i + 1;
              return `<button onclick="changePage(${page})" class="pagination-btn ${currentPage === page ? 'active' : ''}">${page}</button>`;
            }).join('')}
            <button onclick="changePage(currentPage + 1)" class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''}>
              Next
            </button>
          </div>
        </div>
        `
          : ''
        }
      </div>
    `;
  }

  function handleSearch(value) {
    searchTerm = value;
    if (contentType === 'chart') {
      const input = document.querySelector('.search-input');
      const isFocused = document.activeElement === input;
      showChartContent();
      // Refocus the input if it was focused before
      setTimeout(() => {
        const newInput = document.querySelector('.search-input');
        if (newInput && isFocused) {
          newInput.focus();
          // Restore cursor position
          newInput.setSelectionRange(value.length, value.length);
        }
      }, 0);
    }
  }

  function handleAuditSearch(value) {
    auditSearchTerm = value;
    if (contentType === 'audit') {
      const input = document.querySelector('.search-input');
      const isFocused = document.activeElement === input;
      showAuditContent();
      // Refocus the input if it was focused before
      setTimeout(() => {
        const newInput = document.querySelector('.search-input');
        if (newInput && isFocused) {
          newInput.focus();
          // Restore cursor position
          newInput.setSelectionRange(value.length, value.length);
        }
      }, 0);
    }
  }

  function handleConditionAuditSearch(value) {
    conditionAuditSearchTerm = value;
    if (contentType === 'conditionAudit') {
      const input = document.querySelector('.search-input');
      const isFocused = document.activeElement === input;
      showConditionAuditContent();
      // Refocus the input if it was focused before
      setTimeout(() => {
        const newInput = document.querySelector('.search-input');
        if (newInput && isFocused) {
          newInput.focus();
          // Restore cursor position
          newInput.setSelectionRange(value.length, value.length);
        }
      }, 0);
    }
  }


  function showConditionAuditContent() {
    // Filter data first
    let filteredData = filterConditionAuditData();
    // Sort data if needed
    let sortedData = [...filteredData];
    if (conditionAuditSortConfig.key) {
      sortedData.sort((a, b) => {
        if (conditionAuditSortConfig.key === 'auditScore' || conditionAuditSortConfig.key === 'hccCode') {
          return conditionAuditSortConfig.direction === 'asc' ? a[conditionAuditSortConfig.key] - b[conditionAuditSortConfig.key] : b[conditionAuditSortConfig.key] - a[conditionAuditSortConfig.key];
        }
        const aVal = String(a[conditionAuditSortConfig.key]).toLowerCase();
        const bVal = String(b[conditionAuditSortConfig.key]).toLowerCase();
        return conditionAuditSortConfig.direction === 'asc' ? aVal < bVal ? -1 : aVal > bVal ? 1 : 0 : aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      });
    }

    const chartContent = document.getElementById('chartContent');
    chartContent.innerHTML = `
      <div class="audit-table-container">
        <div class="search-container">
          <input
            type="text"
            placeholder="Search by condition name, accurate code, HCC code, evidence strength..."
            value="${conditionAuditSearchTerm}"
            oninput="handleConditionAuditSearch(this.value)"
            class="search-input"
          />
          <div class="search-results-count">
            ${filteredData.length} of ${conditionAuditData.length} conditions
          </div>
        </div>
        <div class="audit-table-wrapper">
          ${sortedData.length === 0 && conditionAuditSearchTerm.trim() ? `
            <div style="text-align: center; padding: 40px 20px; height: 60px; font-size: 14px; color: #6c757d; font-style: italic; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
              <div style="font-size: 24px;">🔍</div>
              <div>No audit records found</div>
              <div style="font-size: 12px; color: #9ca3af;">No records match your search for "<strong>${conditionAuditSearchTerm}</strong>"</div>
            </div>
          ` : `
            <table class="audit-table">
              <thead>
                <tr>
                  <th onclick="sortConditionAuditData('conditionName')" class="sortable">
                    <span>Condition Name</span> ${renderConditionAuditSortIcon('conditionName')}
                  </th>
                  <th onclick="sortConditionAuditData('accurateCode')" class="sortable">
                    <span>Accurate Code</span> ${renderConditionAuditSortIcon('accurateCode')}
                  </th>
                  <th class="sortable" style="cursor: default;">
                    <span>Progress notes</span>
                  </th>
                  <th onclick="sortConditionAuditData('hccCode')" class="sortable">
                    <span>HCC Code</span> ${renderConditionAuditSortIcon('hccCode')}
                  </th>
                  <th onclick="sortConditionAuditData('evidenceStrength')" class="sortable">
                    <span>Evidence Strength</span> ${renderConditionAuditSortIcon('evidenceStrength')}
                  </th>
                  <th onclick="sortConditionAuditData('auditDate')" class="sortable">
                    <span>Audit Date</span> ${renderConditionAuditSortIcon('auditDate')}
                  </th>
                  <th onclick="sortConditionAuditData('auditScore')" class="sortable">
                    <span>Audit Score</span> ${renderConditionAuditSortIcon('auditScore')}
                  </th>
                </tr>
              </thead>
              <tbody>
                ${sortedData.map(row => `
                  <tr>
                    <td>${row.conditionName}</td>
                    <td>${row.accurateCode}</td>
                    <td>
                      <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                        ${row.progressNotes.map((note, index) => `
                          <button 
                            style="padding: 4px 8px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; cursor: pointer; font-size: 13px;"
                          >
                            ${note}
                          </button>
                        `).join('')}
                      </div>
                    </td>
                    <td>${row.hccCode}</td>
                    <td>${row.evidenceStrength}</td>
                    <td>${row.auditDate || ''}</td>
                    <td>${row.auditScore}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `;
  }


  // 🧩 Detect patient info and trigger automatically
  function tryAutoLoad() {
    if (hasLoaded) return;

    // Initialize the UI components regardless of specific page elements
    console.log("🔍 CareTracker extension: Initializing UI components");

    // Initialize the UI components
    addStyles();
    createFloatingButtons();
    createBackdrop();
    createFloatingPanel();

    // Don't auto-show panel, let user click buttons
    hasLoaded = true;
  }

  // Make functions globally available for onclick handlers
  window.handleSearch = handleSearch;
  window.handleAuditSearch = handleAuditSearch;
  window.handleConditionAuditSearch = handleConditionAuditSearch;
  window.sortAuditData = sortAuditData;
  window.sortConditionAuditData = sortConditionAuditData;
  window.changePage = changePage;

  // 🧠 Observe DOM changes
  observer = new MutationObserver(() => tryAutoLoad());
  observer.observe(document.body, { childList: true, subtree: true });

  // Try once immediately
  tryAutoLoad();
})();