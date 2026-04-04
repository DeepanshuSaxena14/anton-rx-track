export const PAYERS = ['UnitedHealthcare', 'Cigna', 'Blue Cross Blue Shield NC'];
export const DRUGS = ['Keytruda', 'Dupixent'];

export const mockPolicies = [
  {
    id: 'uhc-keytruda',
    drug_name: 'pembrolizumab',
    brand_name: 'Keytruda',
    hcpcs_code: 'J9271',
    payer: 'UnitedHealthcare',
    coverage_status: 'conditional',
    covered_indications: ['Melanoma', 'Non-small cell lung cancer'],
    pa_required: true,
    pa_criteria: ['Diagnosis confirmation'],
    step_therapy_required: false,
    step_therapy_details: null,
    site_of_care: ['hospital_outpatient', 'physician_office'],
    effective_date: '2023-01-01T00:00:00.000Z',
    score: 8
  },
  {
    id: 'cigna-keytruda',
    drug_name: 'pembrolizumab',
    brand_name: 'Keytruda',
    hcpcs_code: 'J9271',
    payer: 'Cigna',
    coverage_status: 'covered',
    covered_indications: ['Melanoma'],
    pa_required: false,
    pa_criteria: [],
    step_therapy_required: true,
    step_therapy_details: 'Requires trial of alternative therapy if applicable',
    site_of_care: ['physician_office'],
    effective_date: '2023-05-10T00:00:00.000Z',
    score: 6
  },
  {
    id: 'bcbs-keytruda',
    drug_name: 'pembrolizumab',
    brand_name: 'Keytruda',
    hcpcs_code: 'J9271',
    payer: 'Blue Cross Blue Shield NC',
    coverage_status: 'not_covered',
    covered_indications: [],
    pa_required: false,
    pa_criteria: [],
    step_therapy_required: false,
    step_therapy_details: null,
    site_of_care: [],
    effective_date: '2023-11-20T00:00:00.000Z',
    score: 3
  },
  {
    id: 'uhc-dupixent',
    drug_name: 'dupilumab',
    brand_name: 'Dupixent',
    hcpcs_code: 'J0173',
    payer: 'UnitedHealthcare',
    coverage_status: 'covered',
    covered_indications: ['Atopic Dermatitis', 'Asthma'],
    pa_required: true,
    pa_criteria: ['Inadequate response to steroids'],
    step_therapy_required: false,
    step_therapy_details: null,
    site_of_care: ['physician_office', 'home_infusion'],
    effective_date: '2024-01-01T00:00:00.000Z',
    score: 9
  },
  {
    id: 'cigna-dupixent',
    drug_name: 'dupilumab',
    brand_name: 'Dupixent',
    hcpcs_code: 'J0173',
    payer: 'Cigna',
    coverage_status: 'conditional',
    covered_indications: ['Atopic Dermatitis'],
    pa_required: true,
    pa_criteria: ['Ages 6+'],
    step_therapy_required: true,
    step_therapy_details: 'Requires generic alternatives first',
    site_of_care: ['home_infusion'],
    effective_date: '2024-02-15T00:00:00.000Z',
    score: 5
  },
  {
    id: 'bcbs-dupixent',
    drug_name: 'dupilumab',
    brand_name: 'Dupixent',
    hcpcs_code: 'J0173',
    payer: 'Blue Cross Blue Shield NC',
    coverage_status: 'conditional',
    covered_indications: ['Asthma'],
    pa_required: true,
    pa_criteria: ['Severe eosinophilic asthma diagnosis'],
    step_therapy_required: false,
    step_therapy_details: null,
    site_of_care: ['physician_office'],
    effective_date: '2024-03-01T00:00:00.000Z',
    score: 2
  }
];

export const mockChanges = [
  {
    id: 'chg-1',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    payer: 'UnitedHealthcare',
    drug: 'Keytruda',
    drug_name: 'pembrolizumab',
    type: 'criteria_changed',
    summary: 'Prior authorization criteria updated to require specialist consultation.',
    previous: 'Requires oncologist prescription',
    current: 'Requires oncologist prescription AND specialized genetic testing results'
  },
  {
    id: 'chg-2',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    payer: 'Cigna',
    drug: 'Dupixent',
    drug_name: 'dupilumab',
    type: 'coverage_added',
    summary: 'New indication covered for pediatric asthma patients.',
    previous: 'Ages 12+ covered for asthma',
    current: 'Ages 6+ covered for asthma'
  },
  {
    id: 'chg-3',
    date: new Date(Date.now() - 12 * 86400000).toISOString(),
    payer: 'Blue Cross Blue Shield NC',
    drug: 'Keytruda',
    drug_name: 'pembrolizumab',
    type: 'restriction',
    summary: 'Removed hospital outpatient site of care coverage.',
    previous: 'Hospital Outpatient, Physician Office',
    current: 'Physician Office only'
  },
  {
    id: 'chg-4',
    date: new Date(Date.now() - 18 * 86400000).toISOString(),
    payer: 'UnitedHealthcare',
    drug: 'Dupixent',
    drug_name: 'dupilumab',
    type: 'restriction',
    summary: 'Step therapy added requiring generic alternative first.',
    previous: 'No step therapy required',
    current: 'Must fail generic topical steroids'
  },
  {
    id: 'chg-5',
    date: new Date(Date.now() - 25 * 86400000).toISOString(),
    payer: 'Cigna',
    drug: 'Keytruda',
    drug_name: 'pembrolizumab',
    type: 'coverage_added',
    summary: 'Added coverage for Classical Hodgkin lymphoma.',
    previous: 'Not covered for cHL',
    current: 'Covered for cHL with standard PA criteria'
  },
  {
    id: 'chg-6',
    date: new Date(Date.now() - 30 * 86400000).toISOString(),
    payer: 'Blue Cross Blue Shield NC',
    drug: 'Dupixent',
    drug_name: 'dupilumab',
    type: 'criteria_changed',
    summary: 'Eosinophil threshold adjusted for asthma indication.',
    previous: 'Threshold >= 300 cells/mcL',
    current: 'Threshold >= 150 cells/mcL'
  },
  {
    id: 'chg-7',
    date: new Date(Date.now() - 45 * 86400000).toISOString(),
    payer: 'UnitedHealthcare',
    drug: 'Keytruda',
    drug_name: 'pembrolizumab',
    type: 'restriction',
    summary: 'Coverage status downgraded due to new guidelines.',
    previous: 'Covered',
    current: 'Conditional coverage based on staging'
  },
  {
    id: 'chg-8',
    date: new Date(Date.now() - 60 * 86400000).toISOString(),
    payer: 'Cigna',
    drug: 'Dupixent',
    drug_name: 'dupilumab',
    type: 'criteria_changed',
    summary: 'Renewal duration extended from 6 months to 12 months.',
    previous: 'Initial approval 6 months, renewal 6 months',
    current: 'Initial approval 6 months, renewal 12 months'
  },
  {
    id: 'chg-9',
    date: new Date(Date.now() - 75 * 86400000).toISOString(),
    payer: 'Blue Cross Blue Shield NC',
    drug: 'Keytruda',
    drug_name: 'pembrolizumab',
    type: 'restriction',
    summary: 'Restrictiveness score increased following medical review.',
    previous: 'Score: 2',
    current: 'Score: 3'
  },
  {
    id: 'chg-10',
    date: new Date(Date.now() - 85 * 86400000).toISOString(),
    payer: 'UnitedHealthcare',
    drug: 'Dupixent',
    drug_name: 'dupilumab',
    type: 'coverage_added',
    summary: 'Broadened coverage to include home infusion services.',
    previous: 'Physician Office only',
    current: 'Physician Office, Home Infusion'
  }
];
