/**
 * Demonstration case-law corpus.
 *
 * HONESTY NOTE — this matters more than anything else in the prototype:
 *
 *   • Every judgment below is REAL, with its real citation, court, bench and year.
 *   • Every `holding` is an accurate statement of what the case decided.
 *   • Every `status` (good_law / distinguished / overruled) is accurate as at August 2026.
 *   • The passage text in `paras` is an EDITORIAL PRECIS of the holding, not verbatim
 *     judgment text, and the locators ("Held (i)", "Ratio", ...) are locators into that
 *     precis — NOT claims about the judgment's own paragraph numbering.
 *
 * A production deployment indexes licensed full text and cites true paragraph numbers.
 * We would rather show a demo that under-claims than put a fabricated pin cite in front
 * of counsel. The UI states this on every screen that renders an authority.
 */

export type SeedPara = { locator: string; body: string };

export type SeedAuthority = {
  id: string;
  caseTitle: string;
  citation: string;
  court: string;
  bench: string;
  year: number;
  decidedOn: string;
  tags: string[];
  holding: string;
  status: 'good_law' | 'distinguished' | 'overruled';
  statusNote?: string;
  supersededBy?: string;
  paras: SeedPara[];
};

const ik = (name: string) =>
  `https://indiankanoon.org/search/?formInput=${encodeURIComponent(name)}`;

export const AUTHORITIES: SeedAuthority[] = [
  // =========================================================================
  // RERA — registration, retroactivity, refund on delay
  // =========================================================================
  {
    id: 'auth-newtech',
    caseTitle: 'M/s Newtech Promoters and Developers Pvt. Ltd. v. State of Uttar Pradesh',
    citation: '(2022) 1 SCC 1',
    court: 'Supreme Court of India',
    bench: 'Three-Judge Bench',
    year: 2021,
    decidedOn: '2021-11-11',
    tags: ['rera', 'delayed-possession', 'refund', 'retroactivity', 'real-estate'],
    holding:
      'RERA applies retroactively to ongoing projects that were incomplete and unregistered at commencement. Where the promoter fails to hand over possession by the date stipulated in the agreement, the allottee has an unqualified right to refund of the amount paid with interest under Section 18, irrespective of unforeseen events or orders of authorities. Refund, interest and penalty fall to the Regulatory Authority; compensation falls to the Adjudicating Officer.',
    status: 'good_law',
    paras: [
      {
        locator: 'Held (i)',
        body:
          'The Real Estate (Regulation and Development) Act, 2016 is retroactive in operation. Projects that were ongoing and for which completion certificate had not been issued at the commencement of the Act are within its sweep, and the promoter of such a project is obliged to register it. The application of the statute to an existing project does not render it retrospective in an impermissible sense; it regulates the future conduct of a continuing transaction.',
      },
      {
        locator: 'Held (ii)',
        body:
          'The right of the allottee under Section 18 to withdraw from the project and claim refund of the entire amount paid together with interest is an unqualified right. It is not conditional upon the reason for the delay in handing over possession. Unforeseen events, or orders passed by statutory authorities that had no nexus with any default of the allottee, do not dilute that right where the promoter has failed to give possession by the date specified in the agreement for sale.',
      },
      {
        locator: 'Held (iii)',
        body:
          'The jurisdiction to direct refund of the amount and interest on the refund, or to direct payment of interest for delayed delivery of possession, or to direct payment of penalty and interest thereon, vests in the Regulatory Authority. The Adjudicating Officer has jurisdiction where the claim is for compensation and interest thereon under Sections 12, 14, 18 and 19. The two jurisdictions are distinct and the delineation is mandatory.',
      },
      {
        locator: 'Held (iv)',
        body:
          'An allottee who does not intend to withdraw from the project is entitled to interest for every month of delay until handing over of possession, at the prescribed rate. The election between withdrawal with refund and continuation with delay interest belongs to the allottee, not to the promoter.',
      },
    ],
  },
  {
    id: 'auth-neelkamal',
    caseTitle: 'Neelkamal Realtors Suburban Pvt. Ltd. v. Union of India',
    citation: '2018 SCC OnLine Bom 8955',
    court: 'High Court of Bombay',
    bench: 'Division Bench',
    year: 2017,
    decidedOn: '2017-12-06',
    tags: ['rera', 'constitutional-validity', 'retroactivity', 'real-estate', 'high-court'],
    holding:
      'Upheld the constitutional validity of RERA, including its application to ongoing projects. Registration requirements and the Section 18 refund regime were held not to be retrospective in an unconstitutional sense, and not violative of Articles 14, 19(1)(g) or 300A.',
    status: 'good_law',
    paras: [
      {
        locator: 'Held (i)',
        body:
          'The provisions requiring registration of ongoing projects operate prospectively upon the continuing obligations of the promoter. The legislature is competent to regulate a transaction that is still in the course of performance, and the application of the Act to such projects does not amount to impermissible retrospectivity or to a taking of property under Article 300A.',
      },
      {
        locator: 'Held (ii)',
        body:
          'The Act is a beneficial legislation enacted to remedy a demonstrated asymmetry of information and bargaining power between promoters and allottees in the real estate sector. Its provisions are to be construed in a manner that advances that remedial purpose rather than defeats it.',
      },
      {
        locator: 'Held (iii)',
        body:
          'A promoter is permitted, under the proviso to Section 4(2)(l)(C), to seek an extension of the registration where completion is delayed by force majeure. That statutory route is the appropriate mechanism for genuine supervening events; it does not follow that every delay is excused.',
      },
    ],
  },

  // =========================================================================
  // Consumer — one-sided clauses, delay compensation, forum
  // =========================================================================
  {
    id: 'auth-imperia',
    caseTitle: 'Imperia Structures Ltd. v. Anil Patni',
    citation: '(2020) 10 SCC 783',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2020,
    decidedOn: '2020-11-02',
    tags: ['consumer', 'rera', 'ncdrc', 'jurisdiction', 'delayed-possession'],
    holding:
      'Remedies under the Consumer Protection Act are in addition to, and not in derogation of, remedies under RERA. Section 79 of RERA does not bar a consumer forum from entertaining a complaint by an allottee. An allottee may elect the consumer forum notwithstanding the availability of RERA.',
    status: 'good_law',
    paras: [
      {
        locator: 'Held (i)',
        body:
          'Section 79 of the RERA Act bars the jurisdiction of civil courts, but a complaint under the Consumer Protection Act is not a suit or proceeding before a civil court within the meaning of that bar. The Consumer Protection Act provides an additional remedy, expressly preserved, and the enactment of RERA does not displace it.',
      },
      {
        locator: 'Held (ii)',
        body:
          'Section 88 of the RERA Act states that its provisions are in addition to and not in derogation of any other law for the time being in force. Section 18 itself preserves the allottee\'s remedies under any other law. The two statutes are therefore complementary, and the allottee retains an election.',
      },
      {
        locator: 'Held (iii)',
        body:
          'The mere registration of a project under RERA, or the pendency of proceedings before the Regulatory Authority, does not oust the jurisdiction of the consumer fora in respect of a complaint alleging deficiency in service arising from failure to deliver possession.',
      },
    ],
  },
  {
    id: 'auth-govindan',
    caseTitle: 'Pioneer Urban Land & Infrastructure Ltd. v. Govindan Raghavan',
    citation: '(2019) 5 SCC 725',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2019,
    decidedOn: '2019-04-02',
    tags: ['consumer', 'one-sided-clauses', 'unfair-trade-practice', 'refund', 'delayed-possession'],
    holding:
      'Incorporation of one-sided and unreasonable clauses in an apartment buyer\'s agreement constitutes an unfair trade practice. The buyer is not bound by such clauses. Where possession is delayed well beyond the agreed date, the buyer cannot be compelled to take possession and is entitled to refund with interest.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'A term of an apartment buyer\'s agreement which is wholly one-sided, unfair and unreasonable, and which the buyer had no real opportunity to negotiate, cannot bind the buyer. The incorporation of such terms in a standard form agreement offered on a take-it-or-leave-it basis amounts to an unfair trade practice within the meaning of the Consumer Protection Act.',
      },
      {
        locator: 'Held (i)',
        body:
          'The stark asymmetry of the agreement is illustrative: the builder was entitled to charge interest at a punitive rate on delayed payment by the buyer, while the buyer was offered a nominal, token sum per square foot per month for delay in delivery of possession by the builder. Such an imbalance is not a bargain; it is an imposition.',
      },
      {
        locator: 'Held (ii)',
        body:
          'A buyer who has waited for a period far beyond the contractually stipulated date of possession cannot be compelled to wait indefinitely, nor to accept possession at the builder\'s convenience. The buyer is entitled to seek refund of the amounts deposited together with reasonable interest by way of compensation.',
      },
    ],
  },
  {
    id: 'auth-arifur',
    caseTitle: 'Wg. Cdr. Arifur Rahman Khan v. DLF Southern Homes Pvt. Ltd.',
    citation: '(2020) 16 SCC 512',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2020,
    decidedOn: '2020-08-24',
    tags: ['consumer', 'delayed-possession', 'compensation', 'one-sided-clauses', 'deficiency-in-service'],
    holding:
      'Failure to hand over possession within the contractually stipulated period is a deficiency in service. A clause confining the developer\'s liability for delay to a nominal rate does not preclude the consumer forum from awarding just and reasonable compensation. Acceptance of possession by the buyer does not amount to waiver of the claim for delay compensation.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'A clause in the apartment buyer\'s agreement which restricts the developer\'s liability for delay to a token amount per square foot per month, while imposing a substantially higher rate of interest on the buyer for delayed payment, is one-sided. Such a clause does not operate as a ceiling on the jurisdiction of the consumer forum to award just compensation for the developer\'s breach.',
      },
      {
        locator: 'Held (i)',
        body:
          'The failure of the developer to comply with the contractual obligation to provide the flat within the stipulated period, subject to a grace period, amounts to a deficiency in service within the meaning of the Consumer Protection Act. That conclusion follows from the breach itself and does not require proof of malafides.',
      },
      {
        locator: 'Held (ii)',
        body:
          'Where a buyer has taken possession and executed a deed of conveyance, that act does not by itself constitute a waiver or estoppel extinguishing an accrued claim for compensation for the antecedent delay. A buyer who has waited for years cannot be treated as having surrendered the claim merely by taking what was always due.',
      },
      {
        locator: 'Held (iii)',
        body:
          'Compensation must be assessed on a principled basis that neither leaves the buyer uncompensated for a substantial delay nor visits the developer with a windfall liability unrelated to the loss. A uniform, reasoned rate applied across similarly situated buyers is an appropriate method.',
      },
    ],
  },
  {
    id: 'auth-ireo',
    caseTitle: 'Ireo Grace Realtech Pvt. Ltd. v. Abhishek Khanna',
    citation: '(2021) 3 SCC 241',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2021,
    decidedOn: '2021-01-11',
    tags: ['consumer', 'one-sided-clauses', 'refund', 'arbitration', 'delayed-possession'],
    holding:
      'One-sided clauses in an apartment buyer\'s agreement are unfair and do not bind the allottee. Allottees who wish to withdraw are entitled to refund with interest; those who wish to continue are entitled to possession with delay compensation. An arbitration clause does not oust the jurisdiction of the consumer forum.',
    status: 'good_law',
    paras: [
      {
        locator: 'Held (i)',
        body:
          'The terms of the apartment buyer\'s agreement were found to be wholly one-sided, unfair and unreasonable. The developer had the benefit of extensive discretions and grace periods while the allottee bore penal consequences for any deviation. Such terms are not binding on the allottee.',
      },
      {
        locator: 'Held (ii)',
        body:
          'Allottees are entitled to elect. Those who wish to withdraw from the project may claim refund of the amounts paid with interest. Those who wish to continue are entitled to delay compensation for the period beyond the stipulated date until offer of possession. The election is the allottee\'s.',
      },
      {
        locator: 'Held (iii)',
        body:
          'The existence of an arbitration clause in the agreement does not bar the allottee from invoking the remedy before the consumer fora, consumer disputes being non-arbitrable.',
      },
    ],
  },
  {
    id: 'auth-emaar-aftab',
    caseTitle: 'Emaar MGF Land Ltd. v. Aftab Singh',
    citation: '(2019) 12 SCC 751',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2018,
    decidedOn: '2018-12-10',
    tags: ['arbitration', 'consumer', 'non-arbitrability', 'jurisdiction', 'real-estate'],
    holding:
      'An arbitration clause in a builder-buyer agreement does not bar a complaint before the consumer fora. Consumer disputes are non-arbitrable, and Section 8 of the Arbitration and Conciliation Act as amended in 2015 does not compel reference of such disputes to arbitration.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'Disputes falling within the ambit of the Consumer Protection Act are non-arbitrable. The remedy before the consumer fora is a special remedy conferred by a statute enacted for a public purpose, and an agreement between the parties cannot displace it.',
      },
      {
        locator: 'Held (i)',
        body:
          'The amendment of Section 8 of the Arbitration and Conciliation Act, 1996 by the 2015 Amendment Act does not have the effect of obliging a consumer forum to refer parties to arbitration where a complaint has been filed by a consumer. The amendment addressed the scope of judicial scrutiny at the referral stage, not the categories of dispute that are capable of arbitration.',
      },
      {
        locator: 'Held (ii)',
        body:
          'It remains open to a consumer to elect to pursue arbitration. What is impermissible is for the opposite party to compel a consumer, against the consumer\'s election, out of the statutory forum and into arbitration.',
      },
    ],
  },
  {
    id: 'auth-fortune',
    caseTitle: 'Fortune Infrastructure v. Trevor D\'Lima',
    citation: '(2018) 5 SCC 442',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2018,
    decidedOn: '2018-03-12',
    tags: ['consumer', 'delayed-possession', 'reasonable-time', 'refund'],
    holding:
      'A buyer cannot be made to wait indefinitely for possession. Where the agreement does not stipulate a date for delivery, a reasonable time must be read in, and a period of three years is ordinarily reasonable.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'A person cannot be made to wait indefinitely for possession of the flat allotted to him, and is entitled to seek refund of the amount paid by him along with compensation. Where no time for delivery is stipulated in the agreement, the court will read in a reasonable time; a period of three years would ordinarily be reasonable for completion of the contract.',
      },
      {
        locator: 'Held (i)',
        body:
          'The absence of an express date in the agreement operates against the party who drafted the instrument and who controls the timetable of construction. It does not confer upon the developer an open-ended licence to defer performance.',
      },
    ],
  },
  {
    id: 'auth-dlf-capital-greens',
    caseTitle: 'DLF Home Developers Ltd. v. Capital Greens Flat Buyers Association',
    citation: '(2021) 5 SCC 537',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2021,
    decidedOn: '2021-03-14',
    tags: ['consumer', 'delayed-possession', 'compensation', 'force-majeure', 'real-estate'],
    holding:
      'Buyers are entitled to compensation for delay in handing over possession. A developer invoking force majeure or third-party causes must establish a genuine nexus between the event and the delay. Compensation should be assessed on a reasoned, uniform basis rather than at the token contractual rate.',
    status: 'good_law',
    paras: [
      {
        locator: 'Held (i)',
        body:
          'Where the developer seeks to attribute delay to supervening events — orders of statutory authorities, non-availability of materials, or the default of contractors — the burden lies on the developer to establish the causal nexus between the event relied upon and the period of delay actually claimed. A generalised assertion of difficulty in the construction industry will not discharge that burden.',
      },
      {
        locator: 'Held (ii)',
        body:
          'The contractual rate of compensation stipulated in a standard form agreement does not bind the consumer forum where that rate is manifestly inadequate. At the same time, the compensation awarded must bear a rational relationship to the loss occasioned by the delay and should be applied uniformly across similarly placed buyers.',
      },
      {
        locator: 'Held (iii)',
        body:
          'Some allowance may legitimately be made for delays genuinely attributable to causes beyond the developer\'s control where these are proved with specificity, and the period so established may be excluded from the computation of the delay for which compensation is payable.',
      },
    ],
  },
  {
    id: 'auth-lda-mkgupta',
    caseTitle: 'Lucknow Development Authority v. M.K. Gupta',
    citation: '(1994) 1 SCC 243',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 1993,
    decidedOn: '1993-11-05',
    tags: ['consumer', 'service', 'housing', 'deficiency-in-service', 'foundational'],
    holding:
      'Construction and allotment of housing by a development authority is a "service" under the Consumer Protection Act. A person aggrieved by deficiency in that service is a consumer and may seek redress before the consumer fora.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'When a statutory authority undertakes to construct a building or allot a site or flat, and does so for consideration, the activity is a service within the meaning of the Consumer Protection Act. Any deficiency or fault in the process of that construction or allotment is a deficiency in service, and the allottee is a consumer entitled to invoke the jurisdiction of the consumer fora.',
      },
      {
        locator: 'Held (i)',
        body:
          'The word "service" in the statute is of wide import and is not confined to services of a professional or commercial character narrowly understood. The definition is deliberately expansive and is to be construed so as to advance the remedial object of the enactment.',
      },
    ],
  },
  {
    id: 'auth-gda-balbir',
    caseTitle: 'Ghaziabad Development Authority v. Balbir Singh',
    citation: '(2004) 5 SCC 65',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2004,
    decidedOn: '2004-03-17',
    tags: ['consumer', 'compensation', 'delayed-possession', 'interest', 'housing'],
    holding:
      'Consumer fora have wide powers to award compensation for failure to deliver possession, but the power must be exercised on settled principles and with reasons. Compensation is to be computed with regard to the facts of the case rather than by mechanical application of a uniform rate.',
    status: 'good_law',
    paras: [
      {
        locator: 'Held (i)',
        body:
          'The power to award compensation under the Consumer Protection Act is wide, and extends to compensating an allottee for the loss occasioned by delay in delivery of possession, including by way of interest on the amounts paid. The power is not confined to the return of the principal sum.',
      },
      {
        locator: 'Held (ii)',
        body:
          'That power must nevertheless be exercised judicially and upon reasons. Compensation cannot be awarded by a mechanical application of a uniform rate across dissimilar cases; the forum must consider the particular facts, the period of delay and the loss actually occasioned.',
      },
    ],
  },

  // =========================================================================
  // IBC / NCLT — homebuyers as financial creditors, Section 7 threshold
  // =========================================================================
  {
    id: 'auth-pioneer-uoi',
    caseTitle: 'Pioneer Urban Land and Infrastructure Ltd. v. Union of India',
    citation: '(2019) 8 SCC 416',
    court: 'Supreme Court of India',
    bench: 'Three-Judge Bench',
    year: 2019,
    decidedOn: '2019-08-09',
    tags: ['ibc', 'nclt', 'homebuyers', 'financial-creditor', 'rera', 'real-estate'],
    holding:
      'Upheld the 2018 amendment treating allottees of real estate projects as financial creditors under the IBC. RERA and the IBC operate harmoniously; where there is inconsistency, Section 238 of the IBC prevails. Allottees may therefore initiate corporate insolvency resolution against a defaulting developer.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'Amounts raised from allottees under a real estate project have the commercial effect of a borrowing and are therefore within the definition of financial debt. The Explanation inserted by the 2018 Amendment Act is clarificatory of that position, and the classification of allottees as financial creditors is neither arbitrary nor violative of Article 14.',
      },
      {
        locator: 'Held (i)',
        body:
          'RERA is to be read harmoniously with the Insolvency and Bankruptcy Code. RERA does not exclude the remedy under the Code. In the event of a conflict between the two, Section 238 of the Code, being a later enactment containing a non obstante clause, will prevail.',
      },
      {
        locator: 'Held (ii)',
        body:
          'The remedies available to an allottee under RERA, under the Consumer Protection Act and under the Code are concurrent. The allottee is not obliged to exhaust one before invoking another.',
      },
      {
        locator: 'Held (iii)',
        body:
          'The Code is not intended to be used as a substitute for a recovery forum or as a means of pressurising a solvent developer. Where an allottee is a speculative investor seeking to exit an investment rather than a genuine purchaser seeking a home, the adjudicating authority may take that into account.',
      },
    ],
  },
  {
    id: 'auth-manish-kumar',
    caseTitle: 'Manish Kumar v. Union of India',
    citation: '(2021) 5 SCC 1',
    court: 'Supreme Court of India',
    bench: 'Three-Judge Bench',
    year: 2021,
    decidedOn: '2021-01-19',
    tags: ['ibc', 'nclt', 'homebuyers', 'section-7', 'threshold', 'real-estate'],
    holding:
      'Upheld the provisos to Section 7(1) of the IBC requiring an application by allottees to be filed jointly by not less than one hundred allottees of the same real estate project, or not less than ten per cent of the total allottees of that project, whichever is less.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'The threshold requiring a minimum number of allottees of the same real estate project to join in an application under Section 7 is a valid legislative classification. It is designed to prevent a single disgruntled allottee from putting an entire project, and the interests of all other allottees in it, into insolvency. The requirement is neither arbitrary nor an unreasonable restriction on the right of access.',
      },
      {
        locator: 'Held (i)',
        body:
          'The threshold is to be computed with reference to allottees of the same real estate project, and not with reference to the corporate debtor as a whole or to all projects undertaken by it. The unit of computation is the project.',
      },
      {
        locator: 'Held (ii)',
        body:
          'The requirement is a condition precedent to the maintainability of the application. An application filed without satisfying the threshold is liable to be rejected, subject to the opportunity afforded by the statute to cure the defect within the prescribed period.',
      },
    ],
  },
  {
    id: 'auth-innoventive',
    caseTitle: 'Innoventive Industries Ltd. v. ICICI Bank',
    citation: '(2018) 1 SCC 407',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2017,
    decidedOn: '2017-08-31',
    tags: ['ibc', 'nclt', 'section-7', 'default', 'admission'],
    holding:
      'On an application under Section 7, the adjudicating authority need only satisfy itself that a default has occurred and that the application is complete. The defences available to the corporate debtor at the admission stage are correspondingly narrow.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'The moment the adjudicating authority is satisfied that a default has occurred, that the application is complete and that no disciplinary proceeding is pending against the proposed resolution professional, it must admit the application. The scheme of Section 7 does not contemplate an adjudication of the merits of the underlying dispute at the threshold.',
      },
      {
        locator: 'Held (i)',
        body:
          'Default means non-payment of a debt that has become due and payable and is not paid. The corporate debtor may point to the record of an information utility or other evidence to show that no default has in fact occurred, but it cannot resist admission by raising a dispute as to quantum or by asserting a counterclaim.',
      },
    ],
  },
  {
    id: 'auth-vidarbha',
    caseTitle: 'Vidarbha Industries Power Ltd. v. Axis Bank Ltd.',
    citation: '(2022) 8 SCC 352',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2022,
    decidedOn: '2022-07-12',
    tags: ['ibc', 'nclt', 'section-7', 'discretion', 'admission'],
    holding:
      'Held that Section 7(5)(a) of the IBC is discretionary — the adjudicating authority "may" admit an application — and that the authority may consider the wider circumstances of the corporate debtor before admitting.',
    status: 'distinguished',
    statusNote:
      'Confined to its own peculiar facts by M. Suresh Kumar Reddy v. Canara Bank (2023). Innoventive continues to hold the field: once default is established, admission ordinarily follows. Cite with care and always alongside the later decision.',
    supersededBy: 'auth-suresh-reddy',
    paras: [
      {
        locator: 'Held (i)',
        body:
          'The use of the expression "may" in Section 7(5)(a), contrasted with the mandatory "shall" appearing in Section 9(5), indicates that the adjudicating authority retains a discretion in the matter of admission of an application by a financial creditor, and is not bound to admit merely upon proof of debt and default.',
      },
      {
        locator: 'Held (ii)',
        body:
          'In exercising that discretion the adjudicating authority may have regard to the wider circumstances, including whether the corporate debtor is solvent and whether an award in its favour, sufficient to discharge the debt, is pending realisation.',
      },
    ],
  },
  {
    id: 'auth-suresh-reddy',
    caseTitle: 'M. Suresh Kumar Reddy v. Canara Bank',
    citation: '(2023) 8 SCC 387',
    court: 'Supreme Court of India',
    bench: 'Three-Judge Bench',
    year: 2023,
    decidedOn: '2023-05-11',
    tags: ['ibc', 'nclt', 'section-7', 'discretion', 'admission'],
    holding:
      'Clarified that Vidarbha Industries was decided in the peculiar facts of that case and does not dilute Innoventive. Once the NCLT is satisfied that a default has occurred and the application is complete, it has little option but to admit.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'The decision in Vidarbha Industries was rendered in the context of its own peculiar facts and cannot be read as laying down a general rule that the adjudicating authority may decline admission notwithstanding proof of debt and default. The law as stated in Innoventive Industries and in Swiss Ribbons continues to hold the field.',
      },
      {
        locator: 'Held (i)',
        body:
          'Once the existence of a financial debt and a default in excess of the statutory threshold are established, and the application is otherwise complete, the adjudicating authority has little option but to admit the application. The discretion is not a licence to embark upon a general assessment of the corporate debtor\'s solvency.',
      },
    ],
  },
  {
    id: 'auth-swiss-ribbons',
    caseTitle: 'Swiss Ribbons Pvt. Ltd. v. Union of India',
    citation: '(2019) 4 SCC 17',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2019,
    decidedOn: '2019-01-25',
    tags: ['ibc', 'constitutional-validity', 'financial-creditor', 'nclt'],
    holding:
      'Upheld the constitutional validity of the IBC. The classification between financial creditors and operational creditors rests on an intelligible differentia with a rational nexus to the object of the Code.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'The distinction drawn by the Code between financial creditors and operational creditors is founded upon an intelligible differentia. Financial creditors are, from the very beginning, involved in assessing the viability of the corporate debtor and are equipped to engage in the restructuring of debt. The classification bears a rational relation to the object sought to be achieved.',
      },
      {
        locator: 'Held (i)',
        body:
          'The Insolvency and Bankruptcy Code is a beneficial legislation aimed at resolution rather than recovery, and at maximisation of the value of the assets of the corporate debtor. Its provisions are to be construed with that primary object in view.',
      },
    ],
  },
  {
    id: 'auth-bikram-chatterji',
    caseTitle: 'Bikram Chatterji v. Union of India',
    citation: '(2019) 19 SCC 161',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2019,
    decidedOn: '2019-07-23',
    tags: ['ibc', 'homebuyers', 'real-estate', 'rera', 'diversion-of-funds', 'directors-liability'],
    holding:
      'The Amrapali decision. RERA registrations were cancelled, lease deeds terminated, a court-supervised agency directed to complete the projects, forensic audit ordered, and the personal assets of promoters and directors attached to protect homebuyers, on findings of large-scale diversion of homebuyers\' funds.',
    status: 'good_law',
    paras: [
      {
        locator: 'Held (i)',
        body:
          'Where the funds collected from homebuyers for a project have been diverted to other purposes, the corporate veil may be lifted and the personal assets of the promoters and directors, and of entities to which the funds were routed, may be attached to secure the completion of the project and the protection of the homebuyers.',
      },
      {
        locator: 'Held (ii)',
        body:
          'The interests of homebuyers, who have invested their life savings and in many cases continue to service loans for homes they have not received, are paramount in fashioning relief. The Court will not permit the corporate structure to be used as a shield against that obligation.',
      },
      {
        locator: 'Held (iii)',
        body:
          'A forensic audit of the flow of funds is an appropriate mechanism where diversion is alleged, and the findings of such an audit may found directions against the promoters personally.',
      },
    ],
  },
  {
    id: 'auth-chitra-sharma',
    caseTitle: 'Chitra Sharma v. Union of India',
    citation: '(2018) 18 SCC 575',
    court: 'Supreme Court of India',
    bench: 'Three-Judge Bench',
    year: 2018,
    decidedOn: '2018-08-09',
    tags: ['ibc', 'homebuyers', 'nclt', 'cirp', 'real-estate'],
    holding:
      'The Jaypee Infratech matter. Directed that homebuyers be represented in the committee of creditors and made interim arrangements to protect their interests during the corporate insolvency resolution process.',
    status: 'good_law',
    paras: [
      {
        locator: 'Held (i)',
        body:
          'Homebuyers who have invested in a project that is the subject of a corporate insolvency resolution process are entitled to representation in the committee of creditors so that their interests are considered in the framing and approval of a resolution plan.',
      },
      {
        locator: 'Held (ii)',
        body:
          'The Court may make interim arrangements, including as to the deposit of funds and restraints upon the promoters, to preserve the position of homebuyers pending the outcome of the resolution process.',
      },
    ],
  },

  // =========================================================================
  // Arbitration — arbitrability, appointment, stamping
  // =========================================================================
  {
    id: 'auth-vidya-drolia',
    caseTitle: 'Vidya Drolia v. Durga Trading Corporation',
    citation: '(2021) 2 SCC 1',
    court: 'Supreme Court of India',
    bench: 'Three-Judge Bench',
    year: 2020,
    decidedOn: '2020-12-14',
    tags: ['arbitration', 'non-arbitrability', 'jurisdiction', 'referral', 'consumer'],
    holding:
      'Laid down a four-fold test for determining non-arbitrability of a dispute. At the referral stage the court conducts only a prima facie review, the rule being "when in doubt, refer". Consumer disputes and other claims assigned to special statutory fora fall outside arbitration.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'A dispute is non-arbitrable when the cause of action or subject matter relates to actions in rem that do not pertain to subordinate rights in personam; when it affects third-party rights, has erga omnes effect and requires centralised adjudication; when it relates to the inalienable sovereign and public interest functions of the State; or when the subject matter is expressly or by necessary implication non-arbitrable under a mandatory statute.',
      },
      {
        locator: 'Held (i)',
        body:
          'At the stage of reference under Section 8 or Section 11, the court performs a prima facie examination only. The scope of that examination is narrow, and the rule of thumb is that when in doubt the court should refer the dispute to arbitration and leave the question of jurisdiction to the tribunal.',
      },
      {
        locator: 'Held (ii)',
        body:
          'Where a statute creates a special forum for a class of disputes and confers upon it powers and remedies that an arbitral tribunal cannot exercise, the necessary implication is that those disputes are not capable of settlement by arbitration.',
      },
    ],
  },
  {
    id: 'auth-booz-allen',
    caseTitle: 'Booz Allen and Hamilton Inc. v. SBI Home Finance Ltd.',
    citation: '(2011) 5 SCC 532',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2011,
    decidedOn: '2011-04-15',
    tags: ['arbitration', 'non-arbitrability', 'rights-in-rem', 'mortgage', 'property'],
    holding:
      'Disputes relating to rights in rem are not arbitrable; disputes relating to rights in personam are. Enforcement of a mortgage, being an action in rem, is non-arbitrable.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'Generally and traditionally, all disputes relating to rights in personam are considered to be amenable to arbitration, while disputes relating to rights in rem are required to be adjudicated by courts and public tribunals. This is not a rigid or inflexible rule: disputes relating to subordinate rights in personam arising from rights in rem have always been considered arbitrable.',
      },
      {
        locator: 'Held (i)',
        body:
          'A suit for enforcement of a mortgage by sale is an action in rem, affecting the rights of persons other than the immediate parties, and is therefore not a dispute capable of being resolved by a private tribunal constituted by the agreement of two parties.',
      },
    ],
  },
  {
    id: 'auth-perkins',
    caseTitle: 'Perkins Eastman Architects DPC v. HSCC (India) Ltd.',
    citation: '(2020) 20 SCC 760',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2019,
    decidedOn: '2019-11-26',
    tags: ['arbitration', 'appointment', 'independence', 'unilateral-appointment', 'contract-risk'],
    holding:
      'A person who has an interest in the outcome of the dispute is disqualified not only from acting as arbitrator but also from unilaterally appointing a sole arbitrator. Clauses conferring a unilateral power of appointment on one contracting party are invalid.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'Where the agreement confers upon one party, who has an interest in the outcome of the dispute, the exclusive power to appoint the sole arbitrator, that power is invalid. A person who is ineligible to act as an arbitrator by reason of interest cannot be permitted to nominate the arbitrator, for the element of exclusivity in the appointment destroys the independence that the statutory scheme requires.',
      },
      {
        locator: 'Held (i)',
        body:
          'The principle applies whether the appointing authority is a party itself or an officer or employee of that party. What matters is the interest in the outcome, not the formal designation of the appointing person.',
      },
      {
        locator: 'Held (ii)',
        body:
          'Where such a clause is found to be invalid, the appropriate course is for the court to appoint an independent arbitrator rather than to hold the arbitration agreement itself to be unworkable.',
      },
    ],
  },
  {
    id: 'auth-nn-global',
    caseTitle: 'N.N. Global Mercantile Pvt. Ltd. v. Indo Unique Flame Ltd.',
    citation: '(2023) 7 SCC 1',
    court: 'Supreme Court of India',
    bench: 'Five-Judge Constitution Bench',
    year: 2023,
    decidedOn: '2023-04-25',
    tags: ['arbitration', 'stamping', 'unstamped-agreement', 'enforceability', 'section-11'],
    holding:
      'Held by majority that an unstamped or insufficiently stamped instrument containing an arbitration clause is not enforceable in law until stamped, and that the arbitration agreement in such an instrument is void.',
    status: 'overruled',
    statusNote:
      'OVERRULED by the seven-Judge Constitution Bench in In Re: Interplay Between Arbitration Agreements under the Arbitration and Conciliation Act 1996 and the Indian Stamp Act 1899 (2024) 6 SCC 1, which held that non-stamping is a curable defect and does not render an arbitration agreement void or unenforceable. Do not rely on this decision.',
    supersededBy: 'auth-interplay',
    paras: [
      {
        locator: 'Held (i) — no longer good law',
        body:
          'An instrument which is exigible to stamp duty and which is unstamped or insufficiently stamped is not a contract enforceable in law within the meaning of Section 2(h) of the Contract Act, and the arbitration agreement contained in such an instrument cannot be acted upon.',
      },
      {
        locator: 'Held (ii) — no longer good law',
        body:
          'At the stage of an application under Section 11, the court is obliged to examine and impound an unstamped instrument, and cannot refer the parties to arbitration until the defect of stamping is cured.',
      },
    ],
  },
  {
    id: 'auth-interplay',
    caseTitle:
      'In Re: Interplay Between Arbitration Agreements under the Arbitration and Conciliation Act 1996 and the Indian Stamp Act 1899',
    citation: '(2024) 6 SCC 1',
    court: 'Supreme Court of India',
    bench: 'Seven-Judge Constitution Bench',
    year: 2023,
    decidedOn: '2023-12-13',
    tags: ['arbitration', 'stamping', 'unstamped-agreement', 'enforceability', 'section-11'],
    holding:
      'Overruled N.N. Global. Non-stamping or insufficient stamping is a curable defect. An unstamped agreement is inadmissible in evidence but not void or unenforceable. Objections as to stamping fall to be decided by the arbitral tribunal, not by the court at the referral stage.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'Agreements which are not stamped or are inadequately stamped are inadmissible in evidence under Section 35 of the Stamp Act. They are not rendered void or void ab initio, nor unenforceable. Non-stamping is a curable defect, and the consequence prescribed by the Stamp Act is inadmissibility, not invalidity.',
      },
      {
        locator: 'Held (i)',
        body:
          'The decisions in N.N. Global Mercantile and in SMS Tea Estates, insofar as they held to the contrary, are overruled. The relevant paragraphs of Garware Wall Ropes are similarly overruled.',
      },
      {
        locator: 'Held (ii)',
        body:
          'At the stage of Sections 8 and 11, the court is to examine the existence of an arbitration agreement on a prima facie basis. Objections relating to stamping do not fall for determination at that stage and are to be decided by the arbitral tribunal in accordance with the doctrine of competence-competence.',
      },
    ],
  },
  {
    id: 'auth-cox-kings',
    caseTitle: 'Cox and Kings Ltd. v. SAP India Pvt. Ltd.',
    citation: '(2024) 4 SCC 1',
    court: 'Supreme Court of India',
    bench: 'Five-Judge Constitution Bench',
    year: 2023,
    decidedOn: '2023-12-06',
    tags: ['arbitration', 'group-of-companies', 'non-signatory', 'group-structure'],
    holding:
      'The group of companies doctrine is part of Indian arbitration jurisprudence. A non-signatory may be bound by an arbitration agreement where the conduct of the parties demonstrates a mutual intention to bind it, assessed on the facts.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'The group of companies doctrine has an independent existence as a principle of law flowing from a harmonious reading of the definition of "parties" together with the requirement of a legal relationship. A non-signatory may be held to be a veritable party to the arbitration agreement where the circumstances demonstrate the mutual intention of all parties to bind it.',
      },
      {
        locator: 'Held (i)',
        body:
          'The determination requires a fact-specific enquiry into the relationship between the parties, the commonality of subject matter, the composite nature of the transaction, the participation of the non-signatory in the negotiation and performance of the contract, and the conduct of the parties as a whole. Mere membership of a corporate group is not sufficient.',
      },
    ],
  },

  // =========================================================================
  // Land, title and acquisition
  // =========================================================================
  {
    id: 'auth-suraj-lamp',
    caseTitle: 'Suraj Lamp & Industries Pvt. Ltd. v. State of Haryana',
    citation: '(2012) 1 SCC 656',
    court: 'Supreme Court of India',
    bench: 'Three-Judge Bench',
    year: 2011,
    decidedOn: '2011-10-11',
    tags: ['title', 'conveyance', 'gpa-sale', 'registration', 'land', 'real-estate'],
    holding:
      'Transactions in the nature of Sale Agreement / General Power of Attorney / Will do not convey title to immovable property. Title in immovable property can be transferred only by a registered deed of conveyance.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'A transfer of immovable property by way of sale can only be by a deed of conveyance which is registered. In the absence of a registered deed of conveyance, no right, title or interest in immovable property is conveyed. Transactions styled as SA/GPA/WILL transfers do not convey title and do not amount to a transfer within the meaning of Section 54 of the Transfer of Property Act.',
      },
      {
        locator: 'Held (i)',
        body:
          'Such transactions cannot be recognised as valid modes of transfer of immovable property. They are frequently resorted to for evasion of stamp duty and registration charges and for the deployment of unaccounted money, and the recognition of such transactions would defeat the statutory scheme.',
      },
      {
        locator: 'Held (ii)',
        body:
          'Nothing said above invalidates a genuine agreement to sell, a genuine power of attorney executed for a lawful purpose, or a genuine will. What is denied is the recognition of such instruments as effecting a transfer of title.',
      },
    ],
  },
  {
    id: 'auth-indore-development',
    caseTitle: 'Indore Development Authority v. Manoharlal',
    citation: '(2020) 8 SCC 129',
    court: 'Supreme Court of India',
    bench: 'Five-Judge Constitution Bench',
    year: 2020,
    decidedOn: '2020-03-06',
    tags: ['land-acquisition', 'section-24', 'lapse', 'compensation', 'land'],
    holding:
      'Under Section 24(2) of the 2013 Act, an acquisition lapses only where both conditions are met — physical possession has not been taken AND compensation has not been paid. The conditions are conjunctive. Compensation is "paid" when tendered or deposited in the treasury; deposit in court is not required. Expressly overruled Pune Municipal Corporation.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'The word "or" occurring in Section 24(2) between possession and payment of compensation is to be read as "nor" or as "and". The deemed lapse of acquisition takes effect only where, due to the inaction of authorities for five years or more prior to the commencement of the 2013 Act, both of two conditions are satisfied: physical possession of the land has not been taken and compensation has not been paid.',
      },
      {
        locator: 'Held (i)',
        body:
          'The obligation to "pay" is discharged by tendering the compensation to the landowner or, upon refusal, by depositing it in the treasury. There is no requirement that the amount be deposited in court in order to avoid the consequence of lapse. The decision in Pune Municipal Corporation v. Harakchand Misirimal Solanki, which held otherwise, does not lay down good law and is overruled.',
      },
      {
        locator: 'Held (ii)',
        body:
          'A landowner who has refused to accept compensation, or who has sought reference for enhancement, cannot claim the benefit of the deemed lapse provision on the basis of non-payment brought about by the landowner\'s own conduct.',
      },
    ],
  },
  {
    id: 'auth-pune-municipal',
    caseTitle: 'Pune Municipal Corporation v. Harakchand Misirimal Solanki',
    citation: '(2014) 3 SCC 183',
    court: 'Supreme Court of India',
    bench: 'Three-Judge Bench',
    year: 2014,
    decidedOn: '2014-01-24',
    tags: ['land-acquisition', 'section-24', 'lapse', 'compensation', 'land'],
    holding:
      'Held that where compensation had not been deposited in court, the acquisition would be deemed to have lapsed under Section 24(2) of the 2013 Act, and that deposit in the treasury was not sufficient compliance.',
    status: 'overruled',
    statusNote:
      'OVERRULED by the five-Judge Constitution Bench in Indore Development Authority v. Manoharlal (2020) 8 SCC 129, which held the conditions in Section 24(2) to be conjunctive and deposit in the treasury to be sufficient. Do not rely on this decision.',
    supersededBy: 'auth-indore-development',
    paras: [
      {
        locator: 'Held (i) — no longer good law',
        body:
          'Compensation is not "paid" within the meaning of Section 24(2) unless it has been deposited in court in accordance with the requirements of the Land Acquisition Act, 1894. Deposit in the government treasury does not amount to payment, and the acquisition is in consequence deemed to have lapsed.',
      },
    ],
  },
  {
    id: 'auth-sushil-agarwal',
    caseTitle: 'Sushil Kumar Agarwal v. Meenakshi Sadhu',
    citation: '(2019) 2 SCC 241',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2018,
    decidedOn: '2018-11-27',
    tags: ['development-agreement', 'specific-performance', 'real-estate', 'joint-development', 'land'],
    holding:
      'Classified development agreements into categories and held that whether a developer may seek specific performance depends on whether the agreement creates an interest in the property in favour of the developer, or merely confers a licence to develop coupled with a right to a share of the proceeds.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'Development agreements fall broadly into categories. Where the agreement merely permits the developer to enter upon the land to carry out construction, with remuneration in the form of a share of the constructed area or of the proceeds, and creates no interest in the immovable property in favour of the developer, the remedy of specific performance is not ordinarily available to the developer, whose claim sounds in damages.',
      },
      {
        locator: 'Held (i)',
        body:
          'Where, on the other hand, the agreement transfers or agrees to transfer an interest in the immovable property to the developer, the developer stands in a different position and may seek specific enforcement of that transfer.',
      },
      {
        locator: 'Held (ii)',
        body:
          'The characterisation depends upon the substance of the bargain as disclosed by the instrument read as a whole, and not upon the label the parties have attached to it.',
      },
    ],
  },

  // =========================================================================
  // Contract — liquidated damages, forfeiture, unconscionability, construction
  // =========================================================================
  {
    id: 'auth-kailash-nath',
    caseTitle: 'Kailash Nath Associates v. Delhi Development Authority',
    citation: '(2015) 4 SCC 136',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2015,
    decidedOn: '2015-01-09',
    tags: ['contract', 'liquidated-damages', 'section-74', 'forfeiture', 'earnest-money'],
    holding:
      'Under Section 74 of the Contract Act, compensation is payable only where loss or damage is caused by the breach. Forfeiture of earnest money is permissible only to the extent that it is a genuine pre-estimate of loss; where no loss is shown, forfeiture amounts to a penalty and is not recoverable.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'Section 74 applies to cases where compensation is named in the contract as payable in case of breach, or where the contract contains any other stipulation by way of penalty. Reasonable compensation is payable only if loss or damage is caused by the breach. Where no legal injury at all results from the breach, no compensation can be awarded, for Section 74 is not a charging provision independent of loss.',
      },
      {
        locator: 'Held (i)',
        body:
          'Forfeiture of earnest money under a contract for sale of property, if reasonable, does not fall within Section 74 where the amount is a genuine pre-estimate of damage. If, however, the forfeiture is of the nature of a penalty, Section 74 applies, and the party forfeiting must show that loss has in fact been occasioned.',
      },
      {
        locator: 'Held (ii)',
        body:
          'Where the party in whose favour the stipulation operates has in fact suffered no loss — for example, because the property has been resold at a higher price — the retention of the amount forfeited cannot be justified, and the sum must be returned.',
      },
    ],
  },
  {
    id: 'auth-maula-bux',
    caseTitle: 'Maula Bux v. Union of India',
    citation: '(1969) 2 SCC 554',
    court: 'Supreme Court of India',
    bench: 'Three-Judge Bench',
    year: 1969,
    decidedOn: '1969-08-14',
    tags: ['contract', 'forfeiture', 'earnest-money', 'section-74', 'liquidated-damages'],
    holding:
      'A distinction exists between earnest money, which may be forfeited on the buyer\'s default, and a security deposit or advance, forfeiture of which is in the nature of a penalty and is governed by Section 74. Where loss is capable of proof, it must be proved.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'Forfeiture of earnest money under a contract, if the amount is reasonable, does not fall within Section 74. But if forfeiture is of the nature of a penalty, Section 74 applies. Where the party complaining of breach is in a position to prove the loss suffered, the court will require such proof before awarding compensation.',
      },
      {
        locator: 'Held (i)',
        body:
          'It is only in cases where the assessment of damages is not possible, or where the loss is by its nature difficult to prove, that the court may award the sum named in the contract as reasonable compensation without insisting upon proof of actual loss.',
      },
    ],
  },
  {
    id: 'auth-ongc-saw-pipes',
    caseTitle: 'Oil & Natural Gas Corporation Ltd. v. Saw Pipes Ltd.',
    citation: '(2003) 5 SCC 705',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2003,
    decidedOn: '2003-04-17',
    tags: ['contract', 'liquidated-damages', 'section-74', 'arbitration', 'delay', 'construction'],
    holding:
      'Where the parties have agreed a genuine pre-estimate of damages and the loss is difficult to prove, the stipulated sum may be awarded without proof of actual loss. Also expanded the "public policy" ground for setting aside an award to include patent illegality.',
    status: 'distinguished',
    statusNote:
      'The Section 74 holding on liquidated damages remains good law. The expansion of "public policy" under Section 34 was narrowed by the 2015 Amendment (Section 34(2A)) and by Ssangyong Engineering (2019); rely on the liquidated damages proposition, not the public policy proposition.',
    paras: [
      {
        locator: 'Held (i)',
        body:
          'Where the parties have, at the time of contracting, agreed upon a sum as a genuine pre-estimate of the loss likely to be occasioned by delay, and where the loss occasioned by such delay is in its nature difficult or impossible to prove with precision, the party complaining of breach is entitled to the stipulated sum without being required to prove actual loss.',
      },
      {
        locator: 'Held (ii)',
        body:
          'The stipulated sum operates as a ceiling. The court or tribunal must still be satisfied that the sum represents a genuine pre-estimate rather than a penalty in terrorem, and reasonable compensation not exceeding that sum is what the section permits.',
      },
    ],
  },
  {
    id: 'auth-brojo-nath',
    caseTitle: 'Central Inland Water Transport Corporation Ltd. v. Brojo Nath Ganguly',
    citation: '(1986) 3 SCC 156',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 1986,
    decidedOn: '1986-04-06',
    tags: ['contract', 'unconscionable', 'unequal-bargaining-power', 'section-23', 'standard-form'],
    holding:
      'An unconscionable term in a contract between parties of unequal bargaining power, where the weaker party had no real choice but to accept a standard form, is void under Section 23 of the Contract Act as opposed to public policy.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'The court will not enforce, and will strike down as unconscionable, an unfair and unreasonable contract or an unfair and unreasonable clause in a contract, entered into between parties who are not equal in bargaining power. This applies to a situation in which the weaker party has no meaningful choice but to sign a standard form contract on a take-it-or-leave-it basis.',
      },
      {
        locator: 'Held (i)',
        body:
          'The principle does not apply where the bargaining power of the contracting parties is equal or almost equal, or where both parties are businessmen and the contract is a commercial transaction negotiated between them.',
      },
    ],
  },
  {
    id: 'auth-nabha-power',
    caseTitle: 'Nabha Power Ltd. v. Punjab State Power Corporation Ltd.',
    citation: '(2018) 11 SCC 508',
    court: 'Supreme Court of India',
    bench: 'Two-Judge Bench',
    year: 2017,
    decidedOn: '2017-10-05',
    tags: ['contract', 'implied-terms', 'business-efficacy', 'commercial-contract', 'construction'],
    holding:
      'Set out the "penta-test" for implying a term into a commercial contract. Courts should be reluctant to read terms into a detailed commercial agreement negotiated between sophisticated parties; the term must be necessary for business efficacy and so obvious that it goes without saying.',
    status: 'good_law',
    paras: [
      {
        locator: 'Ratio',
        body:
          'A term will be implied into a commercial contract only where it is reasonable and equitable; necessary to give business efficacy to the contract, so that no term will be implied if the contract is effective without it; so obvious that it goes without saying; capable of clear expression; and not contradictory of any express term of the contract. All five conditions must be satisfied.',
      },
      {
        locator: 'Held (i)',
        body:
          'Where sophisticated commercial parties have set out their bargain in a detailed written instrument, the court should be slow to supplement that bargain. The officious bystander test is one of necessity, not of reasonableness or of improvement upon the parties\' arrangements.',
      },
    ],
  },
];

export const CORPUS_NOTE =
  'Demonstration corpus. Judgments, citations, courts, benches and good-law status are real and accurate. ' +
  'Passage text is an editorial precis of each holding, not verbatim judgment text, and locators are locators ' +
  'into that precis rather than the judgment\'s own paragraph numbering. Production deployments index licensed ' +
  'full text with true pin cites. Verify against the source before filing.';

export const sourceUrlFor = (a: SeedAuthority) => ik(a.caseTitle);
