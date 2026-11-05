/**
 * Workspace seed — users, matters, documents.
 *
 * All of it is fictional demonstration data constructed for the real estate walkthrough:
 * the people, the matters, the projects and the counterparties do not correspond
 * to real individuals or real proceedings. The case law referenced inside the
 * pleadings is real (see authorities.ts) because the point of the demo is that
 * the system retrieves and checks real authority.
 */

export type SeedUser = {
  id: string;
  name: string;
  email: string;
  role: 'head_of_legal' | 'counsel' | 'paralegal' | 'panel_counsel' | 'admin';
  designation: string;
  office: string;
  initials: string;
};

export const USERS: SeedUser[] = [
  {
    id: 'u-head',
    name: 'Rajeev Menon',
    email: 'rajeev.menon@realestate.example.in',
    role: 'head_of_legal',
    designation: 'Head of Legal',
    office: 'Gurugram',
    initials: 'RM',
  },
  {
    id: 'u-counsel-1',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@realestate.example.in',
    role: 'counsel',
    designation: 'Senior Counsel — Litigation',
    office: 'Gurugram',
    initials: 'AS',
  },
  {
    id: 'u-counsel-2',
    name: 'Vikram Desai',
    email: 'vikram.desai@realestate.example.in',
    role: 'counsel',
    designation: 'Counsel — Contracts & Advisory',
    office: 'Gurugram',
    initials: 'VD',
  },
  {
    id: 'u-para',
    name: 'Priya Nair',
    email: 'priya.nair@realestate.example.in',
    role: 'paralegal',
    designation: 'Legal Executive',
    office: 'Noida',
    initials: 'PN',
  },
  {
    id: 'u-panel',
    name: 'S. Krishnan',
    email: 's.krishnan@panel.example.in',
    role: 'panel_counsel',
    designation: 'Panel Counsel — NCDRC',
    office: 'External — New Delhi',
    initials: 'SK',
  },
  {
    id: 'u-admin',
    name: 'Farah Qureshi',
    email: 'farah.qureshi@realestate.example.in',
    role: 'admin',
    designation: 'Legal Operations & IT',
    office: 'Gurugram',
    initials: 'FQ',
  },
];

export type SeedMatter = {
  id: string;
  reference: string;
  title: string;
  matterType: 'litigation' | 'contract' | 'advisory';
  forum: string | null;
  counterparty: string | null;
  project: string | null;
  status: 'active' | 'on_hold' | 'closed';
  exposureInr: number | null;
  nextDate: string | null;
  summary: string;
  ownerId: string;
  createdAt: string;
  access: Array<{ userId: string; level: 'owner' | 'contributor' | 'viewer' }>;
};

export const MATTERS: SeedMatter[] = [
  {
    id: 'm-ncdrc-skyline',
    reference: 'RE/LIT/2026/042',
    title: 'Skyline Residences Allottees Association v. Developer',
    matterType: 'litigation',
    forum: 'NCDRC, New Delhi',
    counterparty: 'Skyline Residences Allottees Association (62 complainants)',
    project: 'Skyline Residences, Sector 79, Gurugram',
    status: 'active',
    exposureInr: 486000000,
    nextDate: '2026-09-08',
    summary:
      'Consolidated consumer complaint by 62 allottees alleging delay of 31 months in handing over possession, seeking refund with interest in the alternative to possession with delay compensation, and challenging the compensation and forfeiture clauses of the Apartment Buyer\'s Agreement as one-sided. A parallel threat of a Section 7 IBC application has been notified by a subset of the same group.',
    ownerId: 'u-counsel-1',
    createdAt: '2026-05-14T09:20:00Z',
    access: [
      { userId: 'u-counsel-1', level: 'owner' },
      { userId: 'u-head', level: 'contributor' },
      { userId: 'u-para', level: 'contributor' },
      { userId: 'u-panel', level: 'viewer' },
    ],
  },
  {
    id: 'm-ibc-notice',
    reference: 'RE/LIT/2026/047',
    title: 'Threatened Section 7 application — Skyline Residences allottees',
    matterType: 'litigation',
    forum: 'NCLT, Chandigarh Bench',
    counterparty: 'Group of 38 allottees',
    project: 'Skyline Residences, Sector 79, Gurugram',
    status: 'active',
    exposureInr: 1240000000,
    nextDate: '2026-08-29',
    summary:
      'Notice of intention to file an application under Section 7 of the IBC by a group of 38 allottees of the Skyline Residences project. Maintainability turns on the Section 7(1) threshold — 100 allottees of the same project or 10% of total allottees, whichever is less.',
    ownerId: 'u-counsel-1',
    createdAt: '2026-07-02T11:05:00Z',
    access: [
      { userId: 'u-counsel-1', level: 'owner' },
      { userId: 'u-head', level: 'contributor' },
    ],
  },
  {
    id: 'm-arb-turnkey',
    reference: 'RE/LIT/2026/033',
    title: 'Developer v. Turnkey Structures Pvt. Ltd.',
    matterType: 'litigation',
    forum: 'Arbitration — sole arbitrator',
    counterparty: 'Turnkey Structures Pvt. Ltd.',
    project: 'Corporate Park, Sector 65, Gurugram',
    status: 'active',
    exposureInr: 214000000,
    nextDate: '2026-09-19',
    summary:
      'Claim against the EPC contractor for delay-linked liquidated damages and defective works. Contractor has challenged the constitution of the tribunal on the ground that the arbitrator was unilaterally appointed by the developer, and has raised a preliminary objection that the contract is insufficiently stamped.',
    ownerId: 'u-counsel-2',
    createdAt: '2026-03-21T14:40:00Z',
    access: [
      { userId: 'u-counsel-2', level: 'owner' },
      { userId: 'u-head', level: 'contributor' },
      { userId: 'u-counsel-1', level: 'viewer' },
    ],
  },
  {
    id: 'm-land-sector91',
    reference: 'RE/LIT/2026/019',
    title: 'Title and acquisition review — Sector 91 land parcel',
    matterType: 'advisory',
    forum: 'Punjab & Haryana High Court',
    counterparty: 'Haryana Urban Development Authority',
    project: 'Proposed acquisition — Sector 91, Gurugram',
    status: 'active',
    exposureInr: 890000000,
    nextDate: '2026-10-02',
    summary:
      'Due diligence on a 14.6 acre parcel assembled partly through GPA/SA transactions, with a pending question whether an earlier acquisition lapsed under Section 24(2) of the 2013 Act. Both issues go to the marketability of title.',
    ownerId: 'u-counsel-2',
    createdAt: '2026-02-09T10:15:00Z',
    access: [
      { userId: 'u-counsel-2', level: 'owner' },
      { userId: 'u-head', level: 'contributor' },
      { userId: 'u-para', level: 'contributor' },
    ],
  },
  {
    id: 'm-jd-sector113',
    reference: 'RE/CON/2026/112',
    title: 'Joint development agreement — Sector 113 landowners',
    matterType: 'contract',
    forum: null,
    counterparty: 'Consortium of 7 landowners',
    project: 'Proposed development — Sector 113, Gurugram',
    status: 'active',
    exposureInr: 2100000000,
    nextDate: '2026-08-25',
    summary:
      'Negotiation of a joint development agreement with a landowner consortium. Open points: whether the agreement creates an interest in the land in the developer\'s favour, the revenue share waterfall, and the dispute resolution clause.',
    ownerId: 'u-counsel-2',
    createdAt: '2026-06-30T08:50:00Z',
    access: [
      { userId: 'u-counsel-2', level: 'owner' },
      { userId: 'u-head', level: 'contributor' },
    ],
  },
  {
    id: 'm-rera-compliance',
    reference: 'RE/ADV/2026/008',
    title: 'RERA compliance review — ongoing projects',
    matterType: 'advisory',
    forum: 'Haryana RERA, Gurugram',
    counterparty: null,
    project: 'All ongoing projects',
    status: 'active',
    exposureInr: null,
    nextDate: '2026-09-30',
    summary:
      'Half-yearly review of registration status, quarterly filings, escrow compliance and revised completion dates across ongoing projects, with an assessment of exposure under Section 18 on projects running past their registered completion dates.',
    ownerId: 'u-head',
    createdAt: '2026-01-12T07:30:00Z',
    access: [
      { userId: 'u-head', level: 'owner' },
      { userId: 'u-counsel-1', level: 'contributor' },
      { userId: 'u-counsel-2', level: 'contributor' },
      { userId: 'u-para', level: 'contributor' },
    ],
  },
];

export type SeedChunk = { page: number; para: string; heading?: string; body: string };

export type SeedDocument = {
  id: string;
  matterId: string | null;
  title: string;
  docType:
    | 'pleading'
    | 'contract'
    | 'judgment'
    | 'notice'
    | 'order'
    | 'correspondence'
    | 'policy';
  source: 'upload' | 'scan' | 'erp' | 'email';
  ocrStatus: 'received' | 'scanning' | 'digitizing' | 'indexing' | 'indexed' | 'needs_review';
  ocrConfidence: number | null;
  pageCount: number;
  filedBy: string | null;
  docDate: string | null;
  uploadedBy: string;
  createdAt: string;
  chunks: SeedChunk[];
};

/**
 * The hero input. This is the pleading filed against the developer — the exact workflow the
 * client described: "a pleading has been filed against me asserting a point of law;
 * research it and tell me whether it is available to me or against me."
 */
export const PLEADING_TEXT = `IN THE NATIONAL CONSUMER DISPUTES REDRESSAL COMMISSION, NEW DELHI
CONSUMER CASE NO. 1184 OF 2026

Skyline Residences Allottees Association & Ors.                     ... Complainants
                                    versus
Real Estate Development Pvt. Ltd.                                   ... Opposite Party

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

GROUNDS

1. That the Opposite Party, having received the entire sale consideration from the Complainants under Apartment Buyer's Agreements executed between 2019 and 2021, has failed to hand over possession of the allotted apartments within the stipulated period of 42 months, and the delay as on the date of this Complaint is 31 months. It is respectfully submitted that such failure constitutes a deficiency in service within the meaning of the Consumer Protection Act, 2019.

2. That Clause 11.4 of the Apartment Buyer's Agreement, which purports to limit the Opposite Party's liability for delay to Rs. 10 per square foot per month of the super area, while Clause 9.2 of the same instrument entitles the Opposite Party to charge interest at 18% per annum compounded quarterly on any delayed payment by the Complainants, is wholly one-sided, unfair and unreasonable. The Complainants submit that such a clause constitutes an unfair trade practice and is not binding upon them, and that this Commission is not confined to the said rate in awarding compensation.

3. That the Complainants who do not wish to continue in the project are entitled to refund of the entire amount deposited together with interest, and that such right is unqualified and not defeated by any plea of force majeure. The Complainants further submit that the Opposite Party cannot compel them to wait indefinitely nor to accept possession at the Opposite Party's convenience.

4. That the registration of the said project under the Real Estate (Regulation and Development) Act, 2016 does not oust the jurisdiction of this Commission. The remedy under the Consumer Protection Act is an additional remedy and is expressly preserved.

5. That the arbitration clause contained in Clause 27.1 of the Apartment Buyer's Agreement does not bar the present Complaint, consumer disputes being incapable of settlement by arbitration.

6. That Clause 14.3 of the Apartment Buyer's Agreement, providing for forfeiture of the entire earnest money amounting to 20% of the total sale consideration upon cancellation by the allottee, is in the nature of a penalty and is liable to be struck down, the Opposite Party having suffered no loss whatsoever by reason of any such cancellation.

7. That the Complainants who took possession under protest during 2025 and executed conveyance deeds have not thereby waived their accrued claim for compensation in respect of the antecedent period of delay, and no estoppel operates against them.

PRAYER
The Complainants pray that this Commission be pleased to direct the Opposite Party to refund the amounts deposited with interest at 15% per annum to those Complainants electing to withdraw, and to pay delay compensation at a just and reasonable rate to those Complainants electing to continue, and to declare Clauses 9.2, 11.4 and 14.3 of the Apartment Buyer's Agreement void and unenforceable.`;

export const DOCUMENTS: SeedDocument[] = [
  {
    id: 'doc-ncdrc-complaint',
    matterId: 'm-ncdrc-skyline',
    title: 'Consumer Complaint No. 1184 of 2026 — Skyline Residences Allottees Association',
    docType: 'pleading',
    source: 'upload',
    ocrStatus: 'indexed',
    ocrConfidence: 0.99,
    pageCount: 34,
    filedBy: 'Complainants',
    docDate: '2026-05-11',
    uploadedBy: 'u-para',
    createdAt: '2026-05-14T09:22:00Z',
    chunks: PLEADING_TEXT.split('\n\n')
      .filter((p) => /^\d+\./.test(p.trim()))
      .map((p, i) => ({
        page: 3 + Math.floor(i / 2),
        para: `Ground ${i + 1}`,
        heading: 'Grounds',
        body: p.trim(),
      })),
  },
  {
    id: 'doc-aba-skyline',
    matterId: 'm-ncdrc-skyline',
    title: 'Apartment Buyer\'s Agreement — Skyline Residences (executed 2019, scanned)',
    docType: 'contract',
    source: 'scan',
    ocrStatus: 'indexed',
    ocrConfidence: 0.94,
    pageCount: 88,
    filedBy: null,
    docDate: '2019-08-19',
    uploadedBy: 'u-para',
    createdAt: '2026-05-15T06:40:00Z',
    chunks: [
      {
        page: 21,
        para: 'Clause 9.2',
        heading: 'Payment and Default',
        body:
          'In the event of any delay by the Allottee in remitting any instalment of the Total Sale Consideration on or before its due date, the Allottee shall be liable to pay interest at the rate of 18% per annum, compounded quarterly, calculated from the due date until the date of actual realisation, without prejudice to the other rights and remedies of the Company under this Agreement including the right of cancellation.',
      },
      {
        page: 26,
        para: 'Clause 11.4',
        heading: 'Possession',
        body:
          'Subject to Clause 11.6 and to force majeure, in the event the Company fails to offer possession of the said Apartment within the Commitment Period together with the Grace Period, the Company shall be liable to pay to the Allottee compensation calculated at the rate of Rs. 10 (Rupees Ten only) per square foot per month of the Super Area for the period of such delay, and the payment of such compensation shall be the sole and exclusive remedy of the Allottee in respect of such delay.',
      },
      {
        page: 30,
        para: 'Clause 14.3',
        heading: 'Cancellation and Forfeiture',
        body:
          'In the event of cancellation of this Agreement by the Allottee for any reason whatsoever, the Company shall be entitled to forfeit the Earnest Money, being an amount equivalent to 20% of the Total Sale Consideration, together with interest accrued on delayed payments, brokerage paid and any statutory dues, and the balance if any shall be refunded to the Allottee without interest within 180 days of such cancellation.',
      },
      {
        page: 52,
        para: 'Clause 27.1',
        heading: 'Dispute Resolution',
        body:
          'All disputes, differences or claims arising out of or in connection with this Agreement shall be referred to the sole arbitration of an arbitrator to be nominated by the Managing Director of the Company, whose decision shall be final and binding upon the parties. The seat of arbitration shall be Gurugram and the proceedings shall be conducted in the English language.',
      },
      {
        page: 24,
        para: 'Clause 11.1',
        heading: 'Possession',
        body:
          'The Company proposes to offer possession of the said Apartment to the Allottee within a Commitment Period of 42 months from the date of execution of this Agreement, subject to a Grace Period of 6 months, and further subject to timely payment by the Allottee of all instalments and other charges payable under this Agreement.',
      },
    ],
  },
  {
    id: 'doc-ibc-notice',
    matterId: 'm-ibc-notice',
    title: 'Notice of intention to initiate CIRP under Section 7 IBC — 38 allottees',
    docType: 'notice',
    source: 'email',
    ocrStatus: 'indexed',
    ocrConfidence: 1.0,
    pageCount: 6,
    filedBy: 'Counsel for 38 allottees',
    docDate: '2026-06-28',
    uploadedBy: 'u-counsel-1',
    createdAt: '2026-07-02T11:08:00Z',
    chunks: [
      {
        page: 2,
        para: 'Para 4',
        heading: 'Financial debt',
        body:
          'Our clients are allottees of the Skyline Residences project and are financial creditors of Real Estate Development Pvt. Ltd. within the meaning of Section 5(7) read with the Explanation to Section 5(8)(f) of the Insolvency and Bankruptcy Code, 2016, the amounts raised from them having the commercial effect of a borrowing.',
      },
      {
        page: 3,
        para: 'Para 7',
        heading: 'Default',
        body:
          'The Corporate Debtor has defaulted in the delivery of possession and in the refund of the amounts due upon the allottees\' election to withdraw, and the aggregate default exceeds the threshold prescribed under Section 4 of the Code. Our clients propose to file an application under Section 7 before the National Company Law Tribunal, Chandigarh Bench.',
      },
      {
        page: 4,
        para: 'Para 9',
        heading: 'Numbers',
        body:
          'The present notice is issued on behalf of 38 allottees of the said project. The total number of allottees in the Skyline Residences project is 604.',
      },
    ],
  },
  {
    id: 'doc-epc-turnkey',
    matterId: 'm-arb-turnkey',
    title: 'EPC Contract — Turnkey Structures Pvt. Ltd. (Corporate Park, Sector 65)',
    docType: 'contract',
    source: 'scan',
    ocrStatus: 'indexed',
    ocrConfidence: 0.91,
    pageCount: 142,
    filedBy: null,
    docDate: '2023-04-11',
    uploadedBy: 'u-para',
    createdAt: '2026-03-22T05:15:00Z',
    chunks: [
      {
        page: 63,
        para: 'Clause 18.2',
        heading: 'Liquidated Damages',
        body:
          'If the Contractor fails to achieve Practical Completion by the Scheduled Completion Date, the Contractor shall pay to the Employer liquidated damages at the rate of 0.5% of the Contract Price per week of delay, subject to an aggregate cap of 10% of the Contract Price. The parties agree that the said sum represents a genuine pre-estimate of the loss likely to be suffered by the Employer and that the loss occasioned by such delay is by its nature difficult to ascertain with precision.',
      },
      {
        page: 118,
        para: 'Clause 34.3',
        heading: 'Arbitration',
        body:
          'Any dispute arising out of this Contract shall be referred to the sole arbitration of an arbitrator appointed by the Employer. The seat of arbitration shall be Gurugram.',
      },
      {
        page: 141,
        para: 'Execution page',
        heading: 'Stamping',
        body:
          'Executed on a stamp paper of Rs. 100 at Gurugram, Haryana. Note recorded by the document cell at the time of digitisation: the instrument appears to be insufficiently stamped having regard to the Contract Price, and the deficiency has been flagged for review.',
      },
    ],
  },
  {
    id: 'doc-sector91-title',
    matterId: 'm-land-sector91',
    title: 'Title chain abstract — Sector 91 parcel (14.6 acres)',
    docType: 'correspondence',
    source: 'scan',
    ocrStatus: 'needs_review',
    ocrConfidence: 0.68,
    pageCount: 47,
    filedBy: null,
    docDate: '2026-02-05',
    uploadedBy: 'u-para',
    createdAt: '2026-02-09T10:22:00Z',
    chunks: [
      {
        page: 12,
        para: 'Entry 7',
        heading: 'Chain of title',
        body:
          'Parcels bearing khasra numbers 118/2, 118/3 and 119/1, aggregating 4.2 acres, were acquired from the recorded owners by way of an agreement to sell coupled with a general power of attorney and a will, executed in 2009. No registered deed of conveyance appears on the record in respect of these parcels.',
      },
      {
        page: 19,
        para: 'Entry 14',
        heading: 'Acquisition history',
        body:
          'A notification under Section 4 of the Land Acquisition Act, 1894 was issued in respect of a portion of the parcel in 2011. Compensation was assessed and deposited in the government treasury in 2013. Physical possession does not appear to have been taken by the acquiring authority. The landowners contend that the acquisition has lapsed.',
      },
    ],
  },
  {
    id: 'doc-standard-aba',
    matterId: null,
    title: 'Standard Apartment Buyer\'s Agreement — approved template v6.2',
    docType: 'policy',
    source: 'upload',
    ocrStatus: 'indexed',
    ocrConfidence: 1.0,
    pageCount: 76,
    filedBy: null,
    docDate: '2026-04-01',
    uploadedBy: 'u-counsel-2',
    createdAt: '2026-04-01T04:00:00Z',
    chunks: [
      {
        page: 25,
        para: 'Clause 11.4',
        heading: 'Possession — approved position',
        body:
          'Where the Company fails to offer possession within the Commitment Period and Grace Period, the Company shall pay to the Allottee interest at the rate prescribed under the Real Estate (Regulation and Development) Act, 2016 and the rules made thereunder, for every month of delay until the date of offer of possession. Nothing in this clause shall limit any remedy available to the Allottee under applicable law.',
      },
      {
        page: 29,
        para: 'Clause 14.3',
        heading: 'Cancellation — approved position',
        body:
          'Upon cancellation by the Allottee, the Company shall be entitled to forfeit an amount not exceeding 10% of the Total Sale Consideration by way of a genuine pre-estimate of loss, and shall refund the balance within 45 days of the date of cancellation.',
      },
    ],
  },
  {
    id: 'doc-erp-extract',
    matterId: 'm-ncdrc-skyline',
    title: 'ERP extract — Skyline Residences collections and possession status',
    docType: 'correspondence',
    source: 'erp',
    ocrStatus: 'indexed',
    ocrConfidence: 1.0,
    pageCount: 3,
    filedBy: null,
    docDate: '2026-08-01',
    uploadedBy: 'u-admin',
    createdAt: '2026-08-01T03:30:00Z',
    chunks: [
      {
        page: 1,
        para: 'Extract 1',
        heading: 'Project summary',
        body:
          'Project: Skyline Residences, Sector 79, Gurugram. Total units 604. Units sold 588. Aggregate collections as at 31 July 2026: Rs. 1,842 crore. Registered completion date under Haryana RERA: 31 December 2023. Revised completion date sought: 30 June 2026. Occupation certificate: applied 14 March 2026, pending.',
      },
      {
        page: 2,
        para: 'Extract 2',
        heading: 'Possession status',
        body:
          'Offers of possession issued: 214 units. Possession taken: 186 units, of which 71 recorded as taken under protest. Conveyance deeds executed: 142. Complainants in Consumer Case No. 1184 of 2026: 62, of whom 24 have taken possession and 38 have not.',
      },
    ],
  },
];
