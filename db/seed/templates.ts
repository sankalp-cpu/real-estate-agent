/**
 * Drafting templates and the clause library.
 *
 * Template bodies carry two kinds of marker:
 *   {{variable}}      — filled from matter variables
 *   [[clause:slot]]   — filled from the clause library; the 'standard' variant is
 *                       the approved position and anything else redlines against it.
 */

export type SeedTemplate = {
  id: string;
  name: string;
  docType: string;
  jurisdiction: string;
  version: string;
  isCurrent: boolean;
  description: string;
  variables: Array<{ key: string; label: string; example: string }>;
  body: string;
  usageCount: number;
};

export type SeedClause = {
  id: string;
  slot: string;
  title: string;
  body: string;
  variant: 'standard' | 'alternative' | 'counterparty_favourable';
  riskLevel: 'low' | 'medium' | 'high';
  riskNote?: string;
  usageCount: number;
};

const COMMON_PARTIES = `THIS {{instrument_name}} is made at {{place}} on this {{day}} day of {{month}}, {{year}}

BETWEEN

{{party_a_name}}, a company incorporated under the Companies Act, having its registered office at {{party_a_address}} (hereinafter referred to as the "{{party_a_short}}", which expression shall unless repugnant to the context include its successors and permitted assigns) of the ONE PART;

AND

{{party_b_name}}, having its address at {{party_b_address}} (hereinafter referred to as the "{{party_b_short}}", which expression shall unless repugnant to the context include its successors and permitted assigns) of the OTHER PART.`;

export const TEMPLATES: SeedTemplate[] = [
  {
    id: 'tpl-nda',
    name: 'Non-Disclosure Agreement (mutual)',
    docType: 'NDA',
    jurisdiction: 'India',
    version: 'v4.1',
    isCurrent: true,
    description:
      'Mutual confidentiality agreement for counterparty discussions, land aggregation and vendor onboarding.',
    variables: [
      { key: 'instrument_name', label: 'Instrument', example: 'NON-DISCLOSURE AGREEMENT' },
      { key: 'place', label: 'Place of execution', example: 'Gurugram' },
      { key: 'day', label: 'Day', example: '16th' },
      { key: 'month', label: 'Month', example: 'August' },
      { key: 'year', label: 'Year', example: '2026' },
      { key: 'party_a_name', label: 'First party', example: 'Real Estate Development Pvt. Ltd.' },
      { key: 'party_a_address', label: 'First party address', example: 'Corporate Office, Sector 67, Gurugram' },
      { key: 'party_a_short', label: 'First party short name', example: 'Company' },
      { key: 'party_b_name', label: 'Second party', example: 'Meridian Capital Advisors LLP' },
      { key: 'party_b_address', label: 'Second party address', example: 'Nariman Point, Mumbai' },
      { key: 'party_b_short', label: 'Second party short name', example: 'Recipient' },
      { key: 'purpose', label: 'Purpose', example: 'evaluation of a proposed joint development' },
      { key: 'term_years', label: 'Term (years)', example: '3' },
    ],
    body: `${COMMON_PARTIES}

WHEREAS the Parties propose to engage in discussions in connection with {{purpose}} (the "Purpose"), and in the course of such discussions each Party may disclose to the other certain confidential and proprietary information;

NOW THEREFORE the Parties agree as follows:

1. CONFIDENTIAL INFORMATION
[[clause:nda_definition]]

2. OBLIGATIONS OF THE RECIPIENT
[[clause:nda_obligations]]

3. EXCLUSIONS
Confidential Information shall not include information which is or becomes publicly available otherwise than through breach of this Agreement, was lawfully in the possession of the receiving Party prior to disclosure, is lawfully received from a third party without restriction, or is independently developed without reference to the Confidential Information.

4. TERM
This Agreement shall remain in force for a period of {{term_years}} years from the date first written above, and the obligations of confidentiality shall survive for a further period of {{term_years}} years from the date of termination.

5. GOVERNING LAW AND DISPUTE RESOLUTION
[[clause:dispute_resolution]]

IN WITNESS WHEREOF the Parties have executed this Agreement on the date first written above.

For {{party_a_name}}                          For {{party_b_name}}


Authorised Signatory                          Authorised Signatory`,
    usageCount: 214,
  },
  {
    id: 'tpl-mou',
    name: 'Memorandum of Understanding',
    docType: 'MOU',
    jurisdiction: 'India',
    version: 'v3.4',
    isCurrent: true,
    description:
      'Non-binding MOU recording heads of terms for land aggregation, joint development or channel partner arrangements.',
    variables: [
      { key: 'instrument_name', label: 'Instrument', example: 'MEMORANDUM OF UNDERSTANDING' },
      { key: 'place', label: 'Place of execution', example: 'Gurugram' },
      { key: 'day', label: 'Day', example: '16th' },
      { key: 'month', label: 'Month', example: 'August' },
      { key: 'year', label: 'Year', example: '2026' },
      { key: 'party_a_name', label: 'First party', example: 'Real Estate Development Pvt. Ltd.' },
      { key: 'party_a_address', label: 'First party address', example: 'Corporate Office, Sector 67, Gurugram' },
      { key: 'party_a_short', label: 'First party short name', example: 'Developer' },
      { key: 'party_b_name', label: 'Second party', example: 'Consortium of landowners, Sector 113' },
      { key: 'party_b_address', label: 'Second party address', example: 'Village Bajghera, Gurugram' },
      { key: 'party_b_short', label: 'Second party short name', example: 'Landowners' },
      { key: 'subject_matter', label: 'Subject matter', example: 'the proposed development of 18.4 acres in Sector 113, Gurugram' },
      { key: 'exclusivity_days', label: 'Exclusivity (days)', example: '90' },
    ],
    body: `${COMMON_PARTIES}

WHEREAS the Parties have held discussions in relation to {{subject_matter}} and wish to record the understanding reached between them;

NOW THEREFORE the Parties record as follows:

1. SUBJECT MATTER
The Parties propose to proceed with {{subject_matter}} on the commercial terms recorded in Schedule I, subject in each case to the execution of definitive documentation.

2. NATURE OF THIS MEMORANDUM
[[clause:mou_binding_nature]]

3. EXCLUSIVITY
For a period of {{exclusivity_days}} days from the date hereof, the {{party_b_short}} shall not solicit, entertain or negotiate any competing proposal in respect of the subject matter of this Memorandum.

4. DUE DILIGENCE
The {{party_a_short}} shall be entitled to conduct legal, title and technical due diligence, and the {{party_b_short}} shall provide reasonable access to all records required for that purpose.

5. CONFIDENTIALITY
[[clause:nda_obligations]]

6. GOVERNING LAW AND DISPUTE RESOLUTION
[[clause:dispute_resolution]]

IN WITNESS WHEREOF the Parties have executed this Memorandum on the date first written above.

For {{party_a_name}}                          For {{party_b_name}}


Authorised Signatory                          Authorised Signatory`,
    usageCount: 96,
  },
  {
    id: 'tpl-leave-license',
    name: 'Leave and License Agreement',
    docType: 'Leave & License',
    jurisdiction: 'India',
    version: 'v5.0',
    isCurrent: true,
    description: 'Commercial leave and license agreement for office and retail space.',
    variables: [
      { key: 'instrument_name', label: 'Instrument', example: 'LEAVE AND LICENSE AGREEMENT' },
      { key: 'place', label: 'Place of execution', example: 'Gurugram' },
      { key: 'day', label: 'Day', example: '16th' },
      { key: 'month', label: 'Month', example: 'August' },
      { key: 'year', label: 'Year', example: '2026' },
      { key: 'party_a_name', label: 'Licensor', example: 'Real Estate Development Pvt. Ltd.' },
      { key: 'party_a_address', label: 'Licensor address', example: 'Corporate Office, Sector 67, Gurugram' },
      { key: 'party_a_short', label: 'Licensor short name', example: 'Licensor' },
      { key: 'party_b_name', label: 'Licensee', example: 'Nexlayer Technologies Pvt. Ltd.' },
      { key: 'party_b_address', label: 'Licensee address', example: 'Cyber City, Gurugram' },
      { key: 'party_b_short', label: 'Licensee short name', example: 'Licensee' },
      { key: 'premises', label: 'Licensed premises', example: 'Unit 704, 7th Floor, Corporate Park, Sector 65, Gurugram, admeasuring 4,200 sq. ft. of super area' },
      { key: 'license_fee', label: 'Monthly license fee', example: 'Rs. 4,20,000 (Rupees Four Lakh Twenty Thousand only)' },
      { key: 'security_deposit', label: 'Security deposit', example: 'Rs. 25,20,000 (Rupees Twenty Five Lakh Twenty Thousand only)' },
      { key: 'term_months', label: 'Term (months)', example: '60' },
      { key: 'lock_in_months', label: 'Lock-in (months)', example: '36' },
    ],
    body: `${COMMON_PARTIES}

WHEREAS the {{party_a_short}} is the absolute owner of the premises described as {{premises}} (the "Licensed Premises"), and has agreed to grant to the {{party_b_short}} leave and license to use and occupy the same on the terms set out below;

NOW THEREFORE the Parties agree as follows:

1. GRANT OF LICENSE
The {{party_a_short}} hereby grants to the {{party_b_short}} leave and license to enter upon and use the Licensed Premises for a period of {{term_months}} months commencing from the date hereof. Nothing herein shall be construed as creating any tenancy, lease or interest in the Licensed Premises in favour of the {{party_b_short}}.

2. LICENSE FEE
The {{party_b_short}} shall pay to the {{party_a_short}} a license fee of {{license_fee}} per month, payable in advance on or before the seventh day of each calendar month.

3. SECURITY DEPOSIT
[[clause:security_deposit]]

4. LOCK-IN AND TERMINATION
[[clause:lock_in]]

5. MAINTENANCE AND OUTGOINGS
The {{party_b_short}} shall bear all charges for electricity, water and telecommunication consumed at the Licensed Premises, together with common area maintenance charges levied by the {{party_a_short}} or the maintenance agency.

6. GOVERNING LAW AND DISPUTE RESOLUTION
[[clause:dispute_resolution]]

IN WITNESS WHEREOF the Parties have executed this Agreement on the date first written above.

For {{party_a_name}}                          For {{party_b_name}}


Authorised Signatory                          Authorised Signatory`,
    usageCount: 148,
  },
  {
    id: 'tpl-legal-notice-138',
    name: 'Legal Notice under Section 138, Negotiable Instruments Act',
    docType: 'Notice',
    jurisdiction: 'India',
    version: 'v2.7',
    isCurrent: true,
    description: 'Statutory demand notice on dishonour of a cheque, to be issued within 30 days of the bank memo.',
    variables: [
      { key: 'notice_date', label: 'Date of notice', example: '16 August 2026' },
      { key: 'addressee_name', label: 'Addressee', example: 'Turnkey Structures Pvt. Ltd.' },
      { key: 'addressee_address', label: 'Addressee address', example: 'Plot 44, Udyog Vihar Phase IV, Gurugram' },
      { key: 'client_name', label: 'Client', example: 'Real Estate Development Pvt. Ltd.' },
      { key: 'cheque_no', label: 'Cheque number', example: '004182' },
      { key: 'cheque_date', label: 'Cheque date', example: '10 July 2026' },
      { key: 'cheque_amount', label: 'Cheque amount', example: 'Rs. 1,86,40,000 (Rupees One Crore Eighty Six Lakh Forty Thousand only)' },
      { key: 'drawee_bank', label: 'Drawee bank', example: 'HDFC Bank, Sector 44 Branch, Gurugram' },
      { key: 'dishonour_date', label: 'Date of dishonour memo', example: '24 July 2026' },
      { key: 'dishonour_reason', label: 'Reason for dishonour', example: 'Funds Insufficient' },
      { key: 'underlying_liability', label: 'Underlying liability', example: 'amounts due under the EPC Contract dated 11 April 2023' },
    ],
    body: `BY REGISTERED POST WITH ACKNOWLEDGEMENT DUE AND BY EMAIL

Dated: {{notice_date}}

To,
{{addressee_name}}
{{addressee_address}}

LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

Under instructions from and on behalf of my client, {{client_name}}, I hereby serve upon you the following notice:

1. That in discharge of your liability towards my client in respect of {{underlying_liability}}, you issued in favour of my client cheque bearing no. {{cheque_no}} dated {{cheque_date}} for a sum of {{cheque_amount}} drawn on {{drawee_bank}}.

2. That my client presented the said cheque for encashment within the period of its validity. The said cheque was returned unpaid by the drawee bank vide return memo dated {{dishonour_date}} with the remark "{{dishonour_reason}}".

3. That the dishonour of the said cheque has occurred by reason of insufficiency of funds in the account maintained by you, and the said cheque was issued in discharge of a legally enforceable debt or liability owed by you to my client.

4. You are hereby called upon to pay to my client the sum of {{cheque_amount}} within fifteen days of the receipt of this notice, failing which my client shall be constrained to initiate proceedings against you under Section 138 of the Negotiable Instruments Act, 1881, and to pursue such other civil and criminal remedies as are available in law, entirely at your risk as to costs and consequences.

5. A copy of this notice is retained in my office for record and further necessary action.

Yours faithfully,


Advocate for {{client_name}}`,
    usageCount: 61,
  },
  {
    id: 'tpl-rera-reply',
    name: 'Reply to RERA complaint',
    docType: 'Pleading',
    jurisdiction: 'Haryana',
    version: 'v1.9',
    isCurrent: true,
    description: 'Standard-form reply to an allottee complaint before the Real Estate Regulatory Authority.',
    variables: [
      { key: 'authority', label: 'Authority', example: 'HARYANA REAL ESTATE REGULATORY AUTHORITY, GURUGRAM' },
      { key: 'complaint_no', label: 'Complaint number', example: 'CR/2026/2214' },
      { key: 'complainant', label: 'Complainant', example: 'Shri Aditya Raghunathan' },
      { key: 'respondent', label: 'Respondent', example: 'Real Estate Development Pvt. Ltd.' },
      { key: 'project', label: 'Project', example: 'Skyline Residences, Sector 79, Gurugram' },
      { key: 'registration_no', label: 'RERA registration', example: 'HRERA/GGM/2018/114' },
      { key: 'agreement_date', label: 'Agreement date', example: '19 August 2019' },
      { key: 'committed_date', label: 'Committed possession date', example: '19 February 2023' },
      { key: 'delay_reason', label: 'Principal cause of delay', example: 'suspension of construction activity under successive orders of the Commission for Air Quality Management' },
    ],
    body: `BEFORE THE {{authority}}

Complaint No. {{complaint_no}}

{{complainant}}                                          ... Complainant
                          versus
{{respondent}}                                           ... Respondent

REPLY ON BEHALF OF THE RESPONDENT

The Respondent above named respectfully submits as follows:

PRELIMINARY SUBMISSIONS

1. That the present Complaint is misconceived and is liable to be dismissed. The Respondent denies each and every allegation contained in the Complaint save as is expressly admitted below, and nothing shall be deemed to be admitted by reason of not having been specifically traversed.

2. That the project {{project}} stands registered with this Authority under registration no. {{registration_no}}, and the Respondent has filed all quarterly returns and has maintained the separate account prescribed under Section 4(2)(l)(D) of the Act.

3. That the Agreement for Sale between the parties was executed on {{agreement_date}} and the committed date for offer of possession thereunder was {{committed_date}}.

4. [[clause:rera_delay_defence]]

5. That without prejudice to the foregoing, any compensation payable stands to be computed in accordance with the Act and the rules made thereunder, and the Complainant is not entitled to the reliefs claimed or to any of them.

REPLY ON MERITS

6. That the contents of paragraph 1 of the Complaint are matters of record and require no reply.

7. That the contents of the remaining paragraphs of the Complaint are denied save to the extent that they are consistent with the preliminary submissions above.

PRAYER

It is therefore respectfully prayed that this Authority be pleased to dismiss the Complaint with costs.

For {{respondent}}


Authorised Representative`,
    usageCount: 87,
  },
  {
    id: 'tpl-channel-partner',
    name: 'Channel Partner / Brokerage Agreement',
    docType: 'Brokerage',
    jurisdiction: 'India',
    version: 'v3.0',
    isCurrent: true,
    description: 'Appointment of a channel partner for sale of inventory, with commission structure and conduct obligations.',
    variables: [
      { key: 'instrument_name', label: 'Instrument', example: 'CHANNEL PARTNER AGREEMENT' },
      { key: 'place', label: 'Place of execution', example: 'Gurugram' },
      { key: 'day', label: 'Day', example: '16th' },
      { key: 'month', label: 'Month', example: 'August' },
      { key: 'year', label: 'Year', example: '2026' },
      { key: 'party_a_name', label: 'Company', example: 'Real Estate Development Pvt. Ltd.' },
      { key: 'party_a_address', label: 'Company address', example: 'Corporate Office, Sector 67, Gurugram' },
      { key: 'party_a_short', label: 'Company short name', example: 'Company' },
      { key: 'party_b_name', label: 'Channel partner', example: 'Anchor Realty Advisors' },
      { key: 'party_b_address', label: 'Channel partner address', example: 'Sohna Road, Gurugram' },
      { key: 'party_b_short', label: 'Channel partner short name', example: 'Channel Partner' },
      { key: 'project', label: 'Project', example: 'Skyline Residences, Sector 79, Gurugram' },
      { key: 'commission_pct', label: 'Commission (%)', example: '2.0' },
    ],
    body: `${COMMON_PARTIES}

WHEREAS the {{party_a_short}} is developing the project known as {{project}} and wishes to appoint the {{party_b_short}} on a non-exclusive basis to identify prospective purchasers of inventory in the said project;

NOW THEREFORE the Parties agree as follows:

1. APPOINTMENT
The {{party_a_short}} appoints the {{party_b_short}} on a non-exclusive basis for the purpose set out above. The {{party_b_short}} is an independent contractor and nothing herein constitutes a partnership, joint venture or agency beyond the limited authority expressly conferred.

2. COMMISSION
The {{party_b_short}} shall be entitled to a commission of {{commission_pct}}% of the net sale consideration in respect of each transaction procured by it and concluded by the {{party_a_short}}, payable upon realisation of not less than 20% of the sale consideration from the purchaser and upon execution of the agreement for sale.

3. CONDUCT AND REPRESENTATIONS
[[clause:channel_partner_conduct]]

4. RERA COMPLIANCE
The {{party_b_short}} shall at all times hold a valid registration as a real estate agent under the Real Estate (Regulation and Development) Act, 2016 and shall not facilitate the sale of any unit in an unregistered project.

5. TERM AND TERMINATION
This Agreement may be terminated by either Party upon thirty days written notice, without prejudice to commission accrued in respect of transactions concluded prior to the date of termination.

6. GOVERNING LAW AND DISPUTE RESOLUTION
[[clause:dispute_resolution]]

IN WITNESS WHEREOF the Parties have executed this Agreement on the date first written above.

For {{party_a_name}}                          For {{party_b_name}}


Authorised Signatory                          Authorised Signatory`,
    usageCount: 132,
  },
];

export const CLAUSES: SeedClause[] = [
  // --- Dispute resolution -------------------------------------------------
  {
    id: 'cl-dr-standard',
    slot: 'dispute_resolution',
    title: 'Arbitration — institutional appointment (approved)',
    body:
      'This Agreement shall be governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with this Agreement shall be referred to arbitration by a sole arbitrator appointed in accordance with the rules of the Delhi International Arbitration Centre. The seat and venue of arbitration shall be Gurugram, Haryana, and the proceedings shall be conducted in English. The courts at Gurugram shall have exclusive jurisdiction in respect of matters not falling to be determined in arbitration.',
    variant: 'standard',
    riskLevel: 'low',
    riskNote:
      'Institutional appointment avoids the Perkins Eastman objection to unilateral appointment by an interested party.',
    usageCount: 388,
  },
  {
    id: 'cl-dr-unilateral',
    slot: 'dispute_resolution',
    title: 'Arbitration — sole arbitrator nominated by the Company',
    body:
      'Any dispute arising out of or in connection with this Agreement shall be referred to the sole arbitration of an arbitrator to be nominated by the Managing Director of the Company, whose decision shall be final and binding. The seat of arbitration shall be Gurugram.',
    variant: 'counterparty_favourable',
    riskLevel: 'high',
    riskNote:
      'Unilateral appointment by an interested party is invalid following Perkins Eastman Architects DPC v. HSCC (India) Ltd. (2020) 20 SCC 760. This clause is present in legacy agreements and is already under challenge in RE/LIT/2026/033. Do not use in new drafts.',
    usageCount: 41,
  },
  {
    id: 'cl-dr-courts',
    slot: 'dispute_resolution',
    title: 'Courts only — no arbitration',
    body:
      'This Agreement shall be governed by the laws of India and the courts at Gurugram, Haryana shall have exclusive jurisdiction over any dispute arising out of or in connection with this Agreement.',
    variant: 'alternative',
    riskLevel: 'medium',
    riskNote:
      'Appropriate where the counterparty is a consumer, since consumer disputes are non-arbitrable in any event (Emaar MGF v. Aftab Singh). Slower for commercial disputes.',
    usageCount: 57,
  },

  // --- NDA ----------------------------------------------------------------
  {
    id: 'cl-nda-def-standard',
    slot: 'nda_definition',
    title: 'Confidential Information — broad definition (approved)',
    body:
      '"Confidential Information" means all information disclosed by or on behalf of either Party to the other, whether before or after the date hereof, in whatever form and whether or not marked as confidential, relating to the business, finances, properties, land holdings, project plans, approvals, pricing, customers or affairs of the disclosing Party, together with all notes, analyses and derivative materials prepared by the receiving Party which contain or reflect such information.',
    variant: 'standard',
    riskLevel: 'low',
    usageCount: 201,
  },
  {
    id: 'cl-nda-def-narrow',
    slot: 'nda_definition',
    title: 'Confidential Information — marked information only',
    body:
      '"Confidential Information" means information disclosed in writing and clearly marked as confidential at the time of disclosure, or disclosed orally and reduced to writing and marked as confidential within fifteen days of such disclosure.',
    variant: 'counterparty_favourable',
    riskLevel: 'medium',
    riskNote:
      'A marking requirement is routinely not complied with in practice, and information disclosed in meetings and site visits falls outside protection. Accept only where the counterparty insists and the disclosure is genuinely limited.',
    usageCount: 28,
  },
  {
    id: 'cl-nda-obl-standard',
    slot: 'nda_obligations',
    title: 'Confidentiality obligations (approved)',
    body:
      'The receiving Party shall hold the Confidential Information in strict confidence, shall use it solely for the Purpose, and shall not disclose it to any person other than those of its directors, employees and professional advisers who need to know it for the Purpose and who are bound by obligations of confidentiality no less onerous than these. The receiving Party shall be responsible for any breach by such persons. Upon written demand the receiving Party shall return or destroy all Confidential Information and certify that it has done so, save for one copy retained for the purpose of compliance with law or internal record retention policy.',
    variant: 'standard',
    riskLevel: 'low',
    usageCount: 236,
  },

  // --- MOU ----------------------------------------------------------------
  {
    id: 'cl-mou-nonbinding',
    slot: 'mou_binding_nature',
    title: 'Non-binding save for specified clauses (approved)',
    body:
      'Save in respect of the clauses relating to exclusivity, confidentiality, governing law and dispute resolution, which shall be binding upon the Parties, this Memorandum records the present intention of the Parties only and does not create any legally binding obligation upon either Party. No Party shall be under any obligation to proceed with the proposed transaction, and neither Party shall be liable to the other for any cost or expense incurred in connection with the negotiations should the transaction not proceed. Nothing in this Memorandum shall be construed as creating any right, title or interest in any immovable property in favour of either Party.',
    variant: 'standard',
    riskLevel: 'low',
    riskNote:
      'The express disclaimer of any interest in immovable property is deliberate: it keeps the instrument outside the characterisation discussed in Sushil Kumar Agarwal v. Meenakshi Sadhu (2019) 2 SCC 241 and preserves flexibility until definitive documents.',
    usageCount: 88,
  },
  {
    id: 'cl-mou-binding',
    slot: 'mou_binding_nature',
    title: 'Binding heads of terms',
    body:
      'This Memorandum shall be binding upon the Parties and shall be specifically enforceable in accordance with its terms. The Parties shall proceed in good faith to execute definitive documentation reflecting the commercial terms recorded in Schedule I within the period specified therein.',
    variant: 'alternative',
    riskLevel: 'high',
    riskNote:
      'Converts a heads-of-terms document into an enforceable contract before due diligence is complete. Use only with express approval of the Head of Legal.',
    usageCount: 9,
  },

  // --- Leave & License ----------------------------------------------------
  {
    id: 'cl-sd-standard',
    slot: 'security_deposit',
    title: 'Security deposit — six months, refundable without interest (approved)',
    body:
      'The Licensee shall deposit with the Licensor a sum equivalent to six months license fee, being {{security_deposit}}, as an interest-free refundable security deposit. The said deposit shall be refunded to the Licensee within thirty days of the expiry or earlier determination of this Agreement and the handover of vacant and peaceful possession of the Licensed Premises, after adjusting any amounts lawfully due from the Licensee.',
    variant: 'standard',
    riskLevel: 'low',
    usageCount: 141,
  },
  {
    id: 'cl-sd-forfeit',
    slot: 'security_deposit',
    title: 'Security deposit — forfeiture on early exit',
    body:
      'In the event the Licensee vacates the Licensed Premises prior to the expiry of the Lock-in Period, the entire security deposit shall stand forfeited to the Licensor as agreed compensation, without the Licensor being required to establish any loss.',
    variant: 'counterparty_favourable',
    riskLevel: 'high',
    riskNote:
      'Forfeiture without proof of loss is vulnerable under Section 74 of the Contract Act following Kailash Nath Associates v. DDA (2015) 4 SCC 136 and Maula Bux v. Union of India. Where the premises are promptly re-let, no loss arises and the forfeiture is liable to be treated as a penalty. Prefer the standard clause with a genuine pre-estimate.',
    usageCount: 22,
  },
  {
    id: 'cl-lockin-standard',
    slot: 'lock_in',
    title: 'Lock-in with genuine pre-estimate (approved)',
    body:
      'The Parties agree to a lock-in period of {{lock_in_months}} months from the commencement of the term. Should the Licensee vacate prior to the expiry of the lock-in period, the Licensee shall pay to the Licensor the license fee for the unexpired portion of the lock-in period or for three months, whichever is less, the Parties agreeing that the said sum represents a genuine pre-estimate of the loss likely to be occasioned to the Licensor by reason of the premises remaining vacant and of the costs of re-letting. After the lock-in period, either Party may terminate upon three months written notice.',
    variant: 'standard',
    riskLevel: 'low',
    riskNote:
      'Framed as a genuine pre-estimate and capped, which is the position most likely to survive scrutiny under Section 74.',
    usageCount: 129,
  },

  // --- RERA reply ---------------------------------------------------------
  {
    id: 'cl-rera-delay-standard',
    slot: 'rera_delay_defence',
    title: 'Delay defence — specific supervening events (approved)',
    body:
      'That such delay as has occurred in the offer of possession is attributable to {{delay_reason}}, being events beyond the control of the Respondent, and the Respondent has duly applied to this Authority for extension of the registration under the proviso to Section 4(2)(l)(C) of the Act. The Respondent has at all material times continued construction activity to the extent permitted and has applied for the occupation certificate, which application is pending before the competent authority.',
    variant: 'standard',
    riskLevel: 'medium',
    riskNote:
      'The nexus between each event and the period of delay claimed must be pleaded with specificity and supported by documents. A generalised plea of industry conditions will not discharge the burden: DLF Home Developers v. Capital Greens (2021) 5 SCC 537. Note also that under Newtech Promoters the allottee\'s right to refund under Section 18 is unqualified and is not defeated by force majeure — this clause mitigates quantum, it does not defeat the claim.',
    usageCount: 74,
  },
  {
    id: 'cl-rera-delay-broad',
    slot: 'rera_delay_defence',
    title: 'Delay defence — general force majeure plea',
    body:
      'That the delay, if any, is attributable to force majeure and to circumstances beyond the control of the Respondent, and the Respondent is not liable for the same.',
    variant: 'alternative',
    riskLevel: 'high',
    riskNote:
      'A bare plea without particulars. Rejected in substance in DLF Home Developers v. Capital Greens, where the burden was held to lie on the developer to establish the causal nexus with specificity. Do not file without particulars.',
    usageCount: 12,
  },

  // --- Channel partner ----------------------------------------------------
  {
    id: 'cl-cp-conduct-standard',
    slot: 'channel_partner_conduct',
    title: 'Channel partner conduct and representations (approved)',
    body:
      'The Channel Partner shall not make any representation, warranty or assurance to any prospective purchaser as to possession dates, assured returns, rental guarantees, appreciation or approvals, save as is expressly contained in the sales literature approved in writing by the Company. The Channel Partner shall not issue any advertisement referring to the project without the prior written approval of the Company. The Channel Partner shall indemnify the Company against any claim arising from a breach of this clause, including any claim before a consumer forum or the Authority founded upon a representation made by the Channel Partner.',
    variant: 'standard',
    riskLevel: 'low',
    riskNote:
      'Unauthorised assurances by channel partners are a recurring source of consumer complaints alleging unfair trade practice. The indemnity is the principal protection and should not be diluted.',
    usageCount: 118,
  },
  {
    id: 'cl-cp-conduct-light',
    slot: 'channel_partner_conduct',
    title: 'Channel partner conduct — light touch',
    body:
      'The Channel Partner shall conduct itself professionally and in accordance with applicable law, and shall not make any misleading representation to prospective purchasers.',
    variant: 'counterparty_favourable',
    riskLevel: 'high',
    riskNote:
      'No indemnity and no approval requirement for advertising. Leaves the Company exposed to consumer claims founded on assurances it never authorised.',
    usageCount: 6,
  },
];
