-- Seed 6 Kenya-relevant clinical cases (one per domain)
INSERT INTO cases (domain, title, difficulty, discrimination, guessing, demographics, presentation, history, physical_exam, expert_differential, not_to_miss, explanations, clinical_pearls, next_steps) VALUES

-- 1. Respiratory
('respiratory', 'Pediatric Respiratory Infection', -0.5, 1.5, 0.15,
  '{"age": "8 years", "sex": "male", "location": "Kibera, Nairobi", "context": "Lives with grandmother"}'::jsonb,
  '{"chiefComplaint": {"english": "The child has had a sore throat and severe cough for 3 days", "kiswahili": "Mtoto anaumwa koo na kukohoa sana kwa siku tatu"}, "vitals": {"temperature": 38.5, "heartRate": 110, "respiratoryRate": 24, "weight": 18}}'::jsonb,
  '{"presentingIllness": ["Child developed sore throat 3 days ago, progressively worsening", "Dry cough that became productive with yellow sputum", "Fever started yesterday, highest recorded at 39°C", "Difficulty swallowing, refusing solid foods", "Grandmother reports child is less active than usual", "No recent travel, but other children in the community have similar symptoms", "Previous episode of similar illness 6 months ago, treated with antibiotics"]}'::jsonb,
  '{"general": "Child appears unwell, mildly dehydrated, alert but irritable", "headNeck": "Throat erythematous with tonsillar exudate, bilateral cervical lymphadenopathy", "respiratory": "Bilateral coarse crepitations, no wheeze, normal chest expansion", "cardiovascular": "Heart sounds normal, no murmurs, peripheral pulses present"}'::jsonb,
  '[{"diagnosis": "Bacterial Pharyngitis (Strep Throat)", "likelihood": 0.85, "reasoning": "Fever + sore throat + tonsillar exudate strongly suggest bacterial pharyngitis"}, {"diagnosis": "Pneumonia", "likelihood": 0.75, "reasoning": "Productive cough with fever raises concern for pneumonia"}, {"diagnosis": "Tonsillitis", "likelihood": 0.65, "reasoning": "Tonsillar exudate and throat symptoms consistent"}, {"diagnosis": "Viral Upper Respiratory Infection", "likelihood": 0.15, "reasoning": "Could be viral but less likely given clinical presentation"}]'::jsonb,
  ARRAY['Bacterial Pharyngitis (Strep Throat)', 'Pneumonia'],
  '{"keyFeatures": ["Fever + sore throat + tonsillar exudate strongly suggest bacterial pharyngitis", "Age 5-15 years is peak incidence for strep throat", "Bilateral cervical lymphadenopathy supports bacterial etiology", "Productive cough with fever raises concern for pneumonia"]}'::jsonb,
  '["Strep Throat in Children: Look for sudden onset, high fever, headache, and absence of cough. The Centor criteria can help but should be used carefully in pediatric patients."]'::jsonb,
  '["Rapid strep test or throat culture", "Chest X-ray if respiratory symptoms persist", "Start symptomatic treatment while awaiting results"]'::jsonb
),

-- 2. Infectious Disease
('infectious', 'Adult Febrile Illness', 0.0, 1.8, 0.15,
  '{"age": "32 years", "sex": "female", "location": "Mathare, Nairobi", "context": "Mother of 3, works as house cleaner"}'::jsonb,
  '{"chiefComplaint": {"english": "High fever, headache, and body aches for 5 days", "kiswahili": "Homa kali, maumivu ya kichwa na mwili kwa siku tano"}, "vitals": {"temperature": 39.2, "heartRate": 95, "respiratoryRate": 20, "bloodPressure": "110/70"}}'::jsonb,
  '{"presentingIllness": ["High fever (up to 39.5°C) for 5 days", "Severe headache and body aches", "Nausea and vomiting for 2 days", "Lost appetite completely", "Feeling very weak and tired", "No recent travel outside Nairobi", "Rainy season, many mosquitoes in the area", "No known sick contacts"]}'::jsonb,
  '{"general": "Appears ill, dehydrated, alert but uncomfortable", "headNeck": "No neck stiffness, no lymphadenopathy", "respiratory": "Clear lung fields bilaterally", "cardiovascular": "Normal heart sounds, no murmurs", "abdomen": "Soft, mild tenderness, no hepatosplenomegaly", "skin": "No rash, no jaundice"}'::jsonb,
  '[{"diagnosis": "Malaria", "likelihood": 0.90, "reasoning": "High fever, headache, body aches in endemic area during rainy season"}, {"diagnosis": "Typhoid Fever", "likelihood": 0.70, "reasoning": "Prolonged fever with GI symptoms"}, {"diagnosis": "Viral Syndrome", "likelihood": 0.60, "reasoning": "Non-specific febrile illness"}, {"diagnosis": "Urinary Tract Infection", "likelihood": 0.30, "reasoning": "Less likely given symptom pattern"}]'::jsonb,
  ARRAY['Malaria', 'Typhoid Fever'],
  '{"keyFeatures": ["High fever with headache and body aches in endemic area strongly suggests malaria", "Rainy season increases vector-borne disease risk", "Nausea and vomiting common in both malaria and typhoid", "Absence of localizing symptoms makes systemic infection likely"]}'::jsonb,
  '["Malaria: Always consider in febrile patients in endemic areas. Rapid diagnostic tests are reliable but microscopy remains gold standard.", "Typhoid: Consider in prolonged fever with GI symptoms. Rose spots may appear but are uncommon."]'::jsonb,
  '["Malaria rapid diagnostic test and thick/thin blood smears", "Complete blood count", "Typhoid serology if malaria negative", "Start antimalarial treatment if positive"]'::jsonb
),

-- 3. Pediatric
('pediatric', 'Infant with Diarrhea', -0.3, 1.6, 0.15,
  '{"age": "9 months", "sex": "female", "location": "Mukuru slums, Nairobi", "context": "Lives with mother and 3 siblings"}'::jsonb,
  '{"chiefComplaint": {"english": "Baby has had loose stools and vomiting for 3 days", "kiswahili": "Mtoto anakojoa-kojoa na kutapika kwa siku tatu"}, "vitals": {"temperature": 38.1, "heartRate": 140, "respiratoryRate": 35, "weight": 7.2}}'::jsonb,
  '{"presentingIllness": ["Loose, watery stools 8-10 times per day for 3 days", "Vomiting everything she drinks", "Decreased urination, no wet diapers for 8 hours", "Appears weak and lethargic", "Still breastfeeding but reduced intake", "No blood in stool", "Other children in compound have similar illness", "Mother uses borehole water for drinking"]}'::jsonb,
  '{"general": "Lethargic infant, appears dehydrated", "headNeck": "Sunken fontanelle, dry mucous membranes", "respiratory": "Clear breath sounds bilaterally", "cardiovascular": "Tachycardic but regular, capillary refill 3 seconds", "abdomen": "Soft, active bowel sounds, no distension", "skin": "Poor skin turgor, no rash"}'::jsonb,
  '[{"diagnosis": "Acute Gastroenteritis with Dehydration", "likelihood": 0.95, "reasoning": "Classic presentation of diarrhea, vomiting, and dehydration"}, {"diagnosis": "Rotavirus Infection", "likelihood": 0.80, "reasoning": "Common cause of gastroenteritis in infants"}, {"diagnosis": "Bacterial Gastroenteritis", "likelihood": 0.60, "reasoning": "Possible with poor sanitation"}, {"diagnosis": "Malnutrition", "likelihood": 0.40, "reasoning": "Consider in setting of recurrent illness"}]'::jsonb,
  ARRAY['Severe Dehydration', 'Sepsis'],
  '{"keyFeatures": ["Signs of moderate dehydration: sunken fontanelle, poor skin turgor, decreased urination", "Gastroenteritis common in overcrowded settings with poor sanitation", "Infants at higher risk for rapid dehydration", "Continued breastfeeding is protective"]}'::jsonb,
  '["Dehydration Assessment: Sunken fontanelle, poor skin turgor, and decreased urination are key signs in infants", "ORS: Oral rehydration solution is first-line treatment for mild-moderate dehydration"]'::jsonb,
  '["Assess dehydration status using WHO guidelines", "Start oral rehydration therapy", "Continue breastfeeding", "Consider zinc supplementation"]'::jsonb
),

-- 4. Maternal
('maternal', 'Pregnant Woman with Headache', 0.2, 1.7, 0.15,
  '{"age": "26 years", "sex": "female", "location": "Kawangware, Nairobi", "context": "G2P1, 34 weeks pregnant"}'::jsonb,
  '{"chiefComplaint": {"english": "Severe headache and swelling of feet for 1 week", "kiswahili": "Maumivu makali ya kichwa na kuvimba miguu kwa wiki moja"}, "vitals": {"temperature": 37.0, "heartRate": 92, "respiratoryRate": 18, "bloodPressure": "160/100", "weight": 75}}'::jsonb,
  '{"presentingIllness": ["Severe headache for 1 week, worse in mornings", "Progressive swelling of feet and hands", "Blurred vision occasionally", "No nausea or vomiting", "Fetal movements normal", "Previous pregnancy was normal", "Last ANC visit 4 weeks ago, BP was 120/80", "No history of hypertension"]}'::jsonb,
  '{"general": "Alert, appears uncomfortable due to headache", "headNeck": "No papilledema visible, neck supple", "respiratory": "Clear breath sounds bilaterally", "cardiovascular": "Regular rhythm, no murmurs", "abdomen": "Gravid uterus, fetal heart rate 140 bpm", "extremities": "Bilateral pitting edema to mid-calf", "neurological": "Alert, oriented, reflexes brisk"}'::jsonb,
  '[{"diagnosis": "Preeclampsia", "likelihood": 0.95, "reasoning": "Hypertension + proteinuria + symptoms after 20 weeks gestation"}, {"diagnosis": "Gestational Hypertension", "likelihood": 0.70, "reasoning": "New-onset hypertension in pregnancy"}, {"diagnosis": "HELLP Syndrome", "likelihood": 0.40, "reasoning": "Severe form of preeclampsia"}, {"diagnosis": "Chronic Hypertension", "likelihood": 0.30, "reasoning": "Less likely given normal previous readings"}]'::jsonb,
  ARRAY['Severe Preeclampsia', 'Eclampsia', 'HELLP Syndrome'],
  '{"keyFeatures": ["New-onset hypertension (>140/90) after 20 weeks gestation", "Headache and visual symptoms suggest CNS involvement", "Edema commonly present but not diagnostic", "Risk factors: first pregnancy, extremes of age"]}'::jsonb,
  '["Preeclampsia: Always check urine protein in pregnant women with new hypertension", "Severe Features: Severe headache, visual changes, epigastric pain, or BP >160/110"]'::jsonb,
  '["Urine dipstick for protein", "Complete blood count and liver function tests", "Fetal monitoring with NST", "Consider hospitalization for monitoring"]'::jsonb
),

-- 5. NCDs
('ncds', 'Middle-aged Man with Chest Pain', 0.1, 1.5, 0.15,
  '{"age": "52 years", "sex": "male", "location": "Kasarani, Nairobi", "context": "Accountant, known diabetic"}'::jsonb,
  '{"chiefComplaint": {"english": "Crushing chest pain radiating to left arm for 2 hours", "kiswahili": "Maumivu makali ya kifua yanayoenda mkono wa kushoto kwa masaa mawili"}, "vitals": {"temperature": 37.0, "heartRate": 105, "respiratoryRate": 22, "bloodPressure": "145/90", "weight": 85}}'::jsonb,
  '{"presentingIllness": ["Sudden onset severe chest pain while climbing stairs", "Pain described as crushing, 8/10 severity", "Radiates to left arm and jaw", "Associated with sweating and nausea", "No relief with rest", "Similar but milder episodes over past month", "Known diabetic for 10 years, poorly controlled", "Smokes 10 cigarettes per day"]}'::jsonb,
  '{"general": "Diaphoretic, appears anxious and in pain", "headNeck": "No JVD, carotids palpable", "respiratory": "Clear breath sounds, no crackles", "cardiovascular": "Regular rhythm, S4 gallop, no murmurs", "abdomen": "Soft, non-tender", "extremities": "No edema, pedal pulses present"}'::jsonb,
  '[{"diagnosis": "ST-Elevation Myocardial Infarction (STEMI)", "likelihood": 0.85, "reasoning": "Typical chest pain with radiation, multiple risk factors"}, {"diagnosis": "Non-ST Elevation MI (NSTEMI)", "likelihood": 0.80, "reasoning": "Acute coronary syndrome presentation"}, {"diagnosis": "Unstable Angina", "likelihood": 0.70, "reasoning": "Crescendo pattern of chest pain"}, {"diagnosis": "Aortic Dissection", "likelihood": 0.30, "reasoning": "Less likely but must consider"}]'::jsonb,
  ARRAY['STEMI', 'NSTEMI', 'Aortic Dissection'],
  '{"keyFeatures": ["Classic anginal pain: substernal, crushing, radiating to arm/jaw", "Multiple cardiac risk factors: diabetes, smoking, hypertension", "Autonomic symptoms: sweating, nausea common in MI", "Duration >20 minutes concerning for MI vs angina"]}'::jsonb,
  '["ACS: Time is muscle - early recognition and intervention crucial", "Diabetic patients may have atypical or silent MI presentations"]'::jsonb,
  '["12-lead ECG immediately", "Cardiac enzymes (troponin)", "Aspirin 300mg stat unless contraindicated", "Prepare for urgent cardiology referral"]'::jsonb
),

-- 6. Emergency
('emergency', 'Unconscious Young Adult', 1.0, 2.0, 0.15,
  '{"age": "22 years", "sex": "male", "location": "CBD, Nairobi", "context": "University student, found unconscious by friends"}'::jsonb,
  '{"chiefComplaint": {"english": "Found unconscious at a party, not responding to voice", "kiswahili": "Alionekana amezimia katika sherehe, hajibu sauti"}, "vitals": {"temperature": 36.5, "heartRate": 60, "respiratoryRate": 8, "bloodPressure": "90/60", "oxygenSaturation": 88}}'::jsonb,
  '{"presentingIllness": ["Found unconscious at university party", "Friends report he was drinking alcohol heavily", "Possible drug use - friends mention pills", "Was normal and talking 2 hours ago", "No known medical conditions", "No known allergies", "Has been stressed about exams", "Friends deny suicidal ideation"]}'::jsonb,
  '{"general": "Unconscious, unresponsive to verbal stimuli, responds to pain", "headNeck": "Pupils pinpoint and reactive, no trauma visible", "respiratory": "Slow, shallow breathing, no wheeze", "cardiovascular": "Bradycardic, regular rhythm", "abdomen": "Soft, bowel sounds present", "neurological": "GCS 6 (E1V1M4), no focal deficits"}'::jsonb,
  '[{"diagnosis": "Opioid Overdose", "likelihood": 0.90, "reasoning": "Classic triad: CNS depression, pinpoint pupils, respiratory depression"}, {"diagnosis": "Mixed Drug Overdose", "likelihood": 0.80, "reasoning": "Combination of alcohol and other substances"}, {"diagnosis": "Alcohol Poisoning", "likelihood": 0.75, "reasoning": "Heavy drinking with altered consciousness"}, {"diagnosis": "Hypoglycemia", "likelihood": 0.40, "reasoning": "Can cause altered consciousness"}]'::jsonb,
  ARRAY['Opioid Overdose', 'Respiratory Failure', 'Aspiration'],
  '{"keyFeatures": ["Classic opioid toxidrome: respiratory depression, miosis, altered mental status", "Glasgow Coma Scale of 6 indicates severe impairment", "Respiratory rate of 8 is dangerously low", "Context of party setting with possible substance use"]}'::jsonb,
  '["Opioid Overdose: Naloxone can be life-saving but has short half-life", "Airway Management: Priority in unconscious patients with respiratory depression"]'::jsonb,
  '["Secure airway, assist ventilation", "Naloxone 0.4mg IV push", "Blood glucose check", "IV access and fluid resuscitation"]'::jsonb
);
