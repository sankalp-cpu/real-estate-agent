/**
 * The stance layer — M3M's editorial view of a neutral case record.
 *
 * authorities.ts records what each judgment decided. Nothing in it is
 * M3M-specific. This file records, separately, how each authority bears on
 * M3M's position as a developer, employer and land buyer:
 *
 *   favours      'm3m'      — assists M3M's usual position
 *                'opponent' — cuts against it
 *                'balanced' — cuts both ways depending on the point taken
 *
 *   counterPoint how M3M meets the authority when it is cited against it, or
 *                how M3M deploys it when it is cited for it.
 *
 * Keeping the two layers apart matters. The case record is a matter of fact and
 * must not be bent toward the client. The stance is advocacy, and is labelled as
 * such in the interface.
 */

export type Stance = {
  favours: 'm3m' | 'opponent' | 'balanced';
  counterPoint: string;
};

export const STANCES: Record<string, Stance> = {
  // --- RERA -------------------------------------------------------------
  'auth-newtech': {
    favours: 'opponent',
    counterPoint:
      'The Section 18 right to refund is unqualified and cannot be met by a force majeure plea. Do not argue entitlement. Argue instead that the allottee has elected to continue in the project — in which case the remedy is delay interest, not refund — and confine the fight to the date from which interest runs and the rate prescribed under the rules.',
  },
  'auth-neelkamal': {
    favours: 'balanced',
    counterPoint:
      'Cited against M3M for the validity of RERA\'s application to ongoing projects, which is settled and not worth contesting. The usable half is the proviso route: the decision expressly recognises extension of registration for genuine force majeure, so a timely and particularised extension application is the appropriate answer rather than a defence raised for the first time in the reply.',
  },

  // --- Consumer ---------------------------------------------------------
  'auth-imperia': {
    favours: 'opponent',
    counterPoint:
      'Forum objections based on RERA registration will not succeed. Concede jurisdiction and preserve credibility for the points that matter. Where the same allottee is running parallel RERA and consumer proceedings on the same cause, press for a stay of one to avoid inconsistent relief and double recovery.',
  },
  'auth-govindan': {
    favours: 'opponent',
    counterPoint:
      'The vulnerability is the asymmetry itself — 18% compounded against the allottee versus a token per-square-foot rate against the company. Where the current template has been corrected to the RERA-prescribed rate, say so and confine the exposure to legacy agreements. On the facts, distinguish on the length of the delay and on whether the allottee was in default of the payment schedule.',
  },
  'auth-arifur': {
    favours: 'opponent',
    counterPoint:
      'This is the principal authority against a clause-capped compensation defence, and it also forecloses the waiver argument against allottees who took possession. Meet it on quantum rather than principle: press for a single reasoned rate applied uniformly, and for exclusion of periods of delay that are separately established as beyond the company\'s control.',
  },
  'auth-ireo': {
    favours: 'opponent',
    counterPoint:
      'Confirms both the one-sided clause analysis and the election between refund and continuation. The workable position is that the election belongs to the allottee but must be exercised once and consistently — an allottee who has affirmed the agreement, taken possession and executed conveyance cannot then elect refund.',
  },
  'auth-emaar-aftab': {
    favours: 'opponent',
    counterPoint:
      'A Section 8 application to refer an allottee to arbitration will fail. Do not file one. Note that the bar runs only in favour of the consumer, so a commercial counterparty in the same project — a bulk investor or a channel partner — remains within the arbitration clause.',
  },
  'auth-fortune': {
    favours: 'opponent',
    counterPoint:
      'Applies where the agreement fixes no date. Where the agreement does fix a commitment period and a grace period, as M3M\'s do, the three-year measure is displaced by the express term and this authority is of limited assistance to the complainant.',
  },
  'auth-dlf-capital-greens': {
    favours: 'balanced',
    counterPoint:
      'The most useful authority available to M3M on delay. It accepts that periods genuinely attributable to causes outside the developer\'s control may be excluded, provided the nexus is proved with specificity. That converts the defence from a plea into an evidentiary exercise: pair each suspension order or approval delay with the days claimed.',
  },
  'auth-lda-mkgupta': {
    favours: 'opponent',
    counterPoint:
      'Foundational and not contestable — housing development is a service and delay is a deficiency. Accept it and move to quantum.',
  },
  'auth-gda-balbir': {
    favours: 'balanced',
    counterPoint:
      'Useful against a consolidated complaint. The consumer forum\'s power to compensate is wide but must be exercised on reasons and on the facts of each case, not by mechanical application of a uniform rate across dissimilar allottees. Press for individual assessment where the complainants\' positions differ materially.',
  },

  // --- IBC / NCLT -------------------------------------------------------
  'auth-pioneer-uoi': {
    favours: 'balanced',
    counterPoint:
      'Settles that allottees are financial creditors, which is not contestable. The half that assists M3M is the caution that the Code is not a recovery forum: where the applicants are investors seeking an exit rather than purchasers seeking a home, that is a matter the adjudicating authority may properly weigh.',
  },
  'auth-manish-kumar': {
    favours: 'm3m',
    counterPoint:
      'The primary defence to a threatened Section 7 application. The threshold is the lesser of 100 allottees of the same project or 10% of the total allottees of that project, and it is a condition of maintainability. Establish the denominator on the project register and check the applicants against it before anything else.',
  },
  'auth-innoventive': {
    favours: 'opponent',
    counterPoint:
      'Once debt and default are established the scope for resisting admission is narrow, and a dispute as to quantum will not answer the application. The contest must therefore be on maintainability and on whether a default within the meaning of the Code has occurred at all, not on the merits of the underlying claim.',
  },
  'auth-vidarbha': {
    favours: 'm3m',
    counterPoint:
      'Attractive but unsafe. It has been confined to its own facts by M. Suresh Kumar Reddy, and citing it as a general discretion to refuse admission invites the correction. If relied upon at all, cite it together with the later decision and confine it to genuinely comparable facts.',
  },
  'auth-suresh-reddy': {
    favours: 'opponent',
    counterPoint:
      'Closes the discretion argument. Anticipate it rather than being met with it, and put the defence on the statutory threshold instead.',
  },
  'auth-swiss-ribbons': {
    favours: 'balanced',
    counterPoint:
      'Chiefly relevant for its characterisation of the Code as directed to resolution rather than recovery, which supports resisting an application whose real object is to extract payment.',
  },
  'auth-bikram-chatterji': {
    favours: 'opponent',
    counterPoint:
      'Engaged only where diversion of project funds is alleged. The answer is documentary: escrow compliance under Section 4(2)(l)(D), project-wise accounts, and a clean audit trail from collections to construction spend. Where those are in order the decision does not bite.',
  },
  'auth-chitra-sharma': {
    favours: 'opponent',
    counterPoint:
      'Relevant to the conduct of a CIRP rather than to its initiation. Of limited application before admission.',
  },

  // --- Arbitration ------------------------------------------------------
  'auth-vidya-drolia': {
    favours: 'balanced',
    counterPoint:
      'The referral standard assists M3M against commercial counterparties: a prima facie review only, with doubt resolved in favour of reference. The four-fold test is what keeps consumer disputes out, so the same decision cuts both ways depending on who the counterparty is.',
  },
  'auth-booz-allen': {
    favours: 'balanced',
    counterPoint:
      'Relevant where a dispute touches title or mortgage. A claim framed as an action in rem is outside arbitration, so the characterisation of the claim will often decide the forum.',
  },
  'auth-perkins': {
    favours: 'opponent',
    counterPoint:
      'Directly against the legacy clause conferring appointment on the Managing Director, and the objection is likely to succeed. The practical answer is to consent to an independent appointment early rather than defend the clause, which preserves the arbitration and avoids the award being challenged later on the same ground. All legacy contracts carrying this clause should be identified and the clause replaced on renewal.',
  },
  'auth-nn-global': {
    favours: 'm3m',
    counterPoint:
      'Do not rely on this decision. It has been overruled by a seven-Judge Bench and a stamping objection founded on it will fail.',
  },
  'auth-interplay': {
    favours: 'balanced',
    counterPoint:
      'Where a counterparty raises insufficient stamping as a preliminary objection, this decision answers it: the defect is curable, the consequence is inadmissibility rather than invalidity, and the objection falls to the tribunal rather than the court at the referral stage. Cure the deficiency and pay the duty; the objection then has nothing left in it.',
  },
  'auth-cox-kings': {
    favours: 'balanced',
    counterPoint:
      'Relevant to M3M\'s project SPV structure in both directions. It may allow M3M to bring a related group entity into an arbitration, and equally allows a counterparty to attempt the same against the parent. Keep contracting entities and performance aligned so the doctrine is not invited.',
  },

  // --- Land and title ---------------------------------------------------
  'auth-suraj-lamp': {
    favours: 'balanced',
    counterPoint:
      'Decisive in due diligence. Parcels held only through an agreement to sell with a power of attorney and a will carry no title, and no amount of possession cures that. Require a registered conveyance from the recorded owner before the parcel is treated as part of the developable area.',
  },
  'auth-indore-development': {
    favours: 'm3m',
    counterPoint:
      'Answers a landowner\'s claim that an earlier acquisition lapsed. The conditions in Section 24(2) are conjunctive and deposit in the treasury is payment, so a lapse claim founded only on non-deposit in court does not survive. Verify the treasury deposit and the possession record before relying on it.',
  },
  'auth-pune-municipal': {
    favours: 'opponent',
    counterPoint:
      'Overruled. If a landowner or an opposing party relies on it, the answer is Indore Development Authority, which expressly held it not to be good law.',
  },
  'auth-sushil-agarwal': {
    favours: 'balanced',
    counterPoint:
      'Determines whether M3M as developer can specifically enforce a joint development agreement. If the instrument creates no interest in the land, the remedy sounds in damages only. Where enforceability matters, the agreement must be drafted to create the interest — and where flexibility matters, it must be drafted not to.',
  },

  // --- Contract ---------------------------------------------------------
  'auth-kailash-nath': {
    favours: 'opponent',
    counterPoint:
      'The principal authority against the 20% forfeiture clause. A bare forfeiture without proof of loss is a penalty. Where the unit has been resold, and particularly where it has been resold at a higher price, the forfeiture is very difficult to sustain. The defensible position is a genuine pre-estimate supported by actual holding costs, marketing spend and the price differential on resale.',
  },
  'auth-maula-bux': {
    favours: 'opponent',
    counterPoint:
      'Draws the distinction between true earnest money and a security deposit. Where the sum is characterised as earnest and is reasonable in amount, forfeiture may stand; where it is in substance a deposit and the loss is capable of proof, proof will be required.',
  },
  'auth-ongc-saw-pipes': {
    favours: 'm3m',
    counterPoint:
      'The authority for recovering delay-linked liquidated damages from a contractor without proving actual loss, where the sum is a genuine pre-estimate and the loss is difficult to quantify. Rely on the Section 74 holding only — the public policy expansion in the same decision has since been narrowed and citing it invites an unnecessary argument.',
  },
  'auth-brojo-nath': {
    favours: 'opponent',
    counterPoint:
      'The foundation of the unconscionability attack on standard-form terms. Its own limit is the answer where the counterparty is commercial: the doctrine does not apply between parties of comparable bargaining power negotiating a commercial contract. It has real force against an individual allottee and little against an EPC contractor.',
  },
  'auth-nabha-power': {
    favours: 'm3m',
    counterPoint:
      'Resists the reading of additional obligations into a negotiated commercial contract. All five conditions of the penta-test must be met, and necessity rather than reasonableness is the standard. Useful wherever a counterparty seeks to imply a term M3M did not agree.',
  },
};
