# RISE Technologies LLC - Technology Hub Framework (V2.0)
## Cost-Plus Procurement Model for NH Group

**Version:** 2.0 - Cost-Plus Model  
**Date:** January 2026  
**Classification:** Internal - Strategic  
**Owner:** NH IT Department

---

## Executive Summary

This framework establishes RISE Technologies LLC as the centralized technology procurement hub for NH Group under a **Cost-Plus Pricing Model**. RISE will manage vendor relationships, process purchase orders, and handle payment flows between entities and technology suppliers, earning a fixed percentage markup on all transactions.

**Key Changes from V1.0:**
- Cost-Plus pricing model (Base Cost + Fixed Markup %)
- Entity-initiated requirements with PO flow through RISE
- Technology-specific expertise onboarding with 1-month advance notice
- Exclusive procurement mandate for approved technologies per entity
- Direct PO issuance from RISE to vendors with entity delivery details

---

## 1. OPERATIONAL MODEL

### 1.1 Cost-Plus Pricing Structure

**Pricing Formula:**
```
Total Entity Cost = Vendor Base Cost + (Vendor Base Cost × Markup %)
```

**Markup Percentage:**
- To be negotiated based on transaction volume and complexity
- Typical range: 5-15%
- Subject to annual review and adjustment
- Fixed rate per entity or category (to be agreed)

**Example Transaction:**
```
Vendor Invoice to RISE: AED 100,000
Agreed Markup: 10%
RISE Invoice to Entity: AED 110,000
```

**Transparency Commitments:**
- RISE must provide vendor invoice copies upon request
- Quarterly cost audits allowed by NH Finance
- Annual markup review with performance-based adjustments
- No hidden fees or additional charges beyond agreed markup

###

 1.2 Procurement Flow

**Step-by-Step Process:**

```
┌─────────────┐        ┌──────────┐        ┌─────────┐
│ NH Entity   │───────>│   RISE   │───────>│ Vendor  │
│ (Requires)  │        │ (PO)     │        │(Delivers│
└─────────────┘        └──────────┘        └─────────┘
      │                      │                    │
      │ 1. Requirement       │ 2. PO with         │
      │    Submission        │    Entity Address  │
      │                      │                    │
      │                      │<───────────────────│
      │                      │ 3. Vendor Invoice  │
      │                      │                    │
      │                      │ 4. Payment         │
      │                      ├───────────────────>│
      │                      │                    │
      │<─────────────────────│                    │
      │ 5. RISE Invoice      │                    │
      │    (Cost + Markup)   │                    │
      │                      │                    │
      │ 6. Payment           │                    │
      ├─────────────────────>│                    │
      │                      │                    │
```

**Detailed Flow:**

**1. Entity Submits Requirement to RISE**
- Entity identifies technology/service need
- Entity creates internal requisition
- Entity sends requirement details to RISE via standard form
- Required information:
  - Product/service specification
  - Quantity
  - Delivery address
  - Required delivery date
  - Budget code
  - Approver details

**2. RISE Issues PO to Vendor**
- RISE evaluates requirement
- RISE sources vendor (or uses pre-approved vendor)
- RISE negotiates pricing
- RISE issues PO to vendor containing:
  - **Bill To**: RISE Technologies LLC
  - **Ship To**: [Entity Name & Delivery Address]
  - **Purchase Price**: As negotiated with vendor
  - **Payment Terms**: As agreed with vendor

**3. Vendor Invoices RISE**
- Vendor delivers product/service to entity location
- Vendor issues invoice to RISE Technologies
- Invoice amount = Base cost agreed in PO

**4. RISE Pays Vendor**
- RISE verifies delivery and invoice
- RISE processes payment to vendor per agreed terms
- Payment made from RISE corporate account

**5. RISE Invoices Entity**
- RISE issues invoice to entity containing:
  - Base cost (vendor invoice amount)
  - Markup percentage and amount
  - Total cost (Base + Markup)
  - Copy of original vendor invoice (attached)
  - Delivery confirmation

**6. Entity Pays RISE**
- Entity verifies invoice against requirement
- Entity processes payment per NH standard terms (typically 30 days)
- Payment made to RISE corporate account

### 1.3 Technology Expertise Onboarding

**Initial Technology Portfolio Definition:**

Each entity must notify RISE of all technology categories they want procured through RISE:

**Notification Process:**
1. Entity completes "Technology Portfolio Form" listing:
   - Technology category (e.g., "Cloud Services - AWS")
   - Current vendors (if any)
   - Annual spend estimate
   - Technical complexity level
   - Special requirements

2. RISE evaluates each technology category:
   - Assess internal expertise availability
   - Identify knowledge gaps
   - Determine if external expertise needed
   - Estimate onboarding timeline

3. RISE responds with:
   - **Confirmed**: RISE has expertise, can support immediately
   - **Onboarding Required**: RISE needs X weeks to build expertise
   - **Not Viable**: Technology too specialized, recommend direct procurement

4. Entity and RISE agree on final approved technology list

**Example Technology Categories:**

| Category | Example Technologies | Typical Complexity |
|----------|----------------------|-------------------|
| **Cloud Services** | AWS, Azure, Google Cloud, Oracle Cloud | High |
| **Enterprise Software** | Oracle, SAP, Microsoft, Salesforce | High |
| **Security Solutions** | Firewalls, EDR, SIEM, DLP | High |
| **Networking** | Cisco, Juniper, Aruba, Fortinet | High |
| **Collaboration** | Microsoft 365, Zoom, Slack | Medium |
| **Hardware** | Dell, HP, Lenovo servers/endpoints | Medium |
| **Telecom Services** | Etisalat, du, VOIP providers | Low |
| **Software Licensing** | Adobe, AutoCAD, specialty tools | Medium |

**New Technology Addition - 1 Month Advance Notice:**

When an entity requires a NEW technology category not previously approved:

**Process:**
1. **Month 0, Week 1**: Entity submits "New Technology Request" to RISE
   - Technology name and category
   - Business justification
   - Expected annual usage
   - Timeline criticality

2. **Month 0, Week 1-2**: RISE Assessment
   - Evaluate technology complexity
   - Assess internal expertise
   - Identify training/hiring needs
   - Consult with vendors if needed

3. **Month 0, Week 3**: RISE Response
   - **Approved**: Can support within 1 month
   - **Conditional**: Need X additional time beyond 1 month
   - **Declined**: Too specialized, recommend alternative

4. **Month 0, Week 4 - Month 1**: Onboarding Period
   - RISE trains staff on technology
   - RISE establishes vendor relationships
   - RISE builds knowledge base
   - RISE completes readiness assessment

5. **Month 1+**: Technology goes live for procurement through RISE

**Exceptions:**
- **Emergency/Critical Needs**: Entity may procure directly with post-facto notification to RISE
- **Highly Specialized**: RISE may decline if technology requires deep specialization
- **Low Volume**: RISE may decline if expected usage doesn't justify expertise investment

### 1.4 Exclusive Procurement Mandate

**Once Technology is Approved:**

For each technology category approved for an entity:
- **RISE becomes the ONLY authorized vendor** for that technology
- Entity MUST route ALL procurement through RISE
- Direct entity-to-vendor procurement is NOT ALLOWED (except emergencies)
- This exclusivity applies to:
  - New purchases
  - Renewals
  - Upgrades
  - Professional services
  - Maintenance and support contracts
  - Training services

**Enforcement:**
- Entity procurement systems should block direct POs for RISE-managed technologies
- Finance will reject invoices from vendors for RISE-managed technologies
- Exceptions require written approval from Group CIO and entity CEO

**Rationale:**
- Ensures RISE can negotiate volume discounts
- Maintains consolidated vendor relationships
- Prevents fragmentation of procurement
- Allows RISE to track total spend and leverage it

**Exception Process:**
If entity needs to procure directly (emergency, RISE unavailable, etc.):
1. Entity requests "Emergency Direct Procurement Waiver" from Group CIO
2. Must document reason and business impact
3. If approved, entity notifies RISE immediately after procurement
4. RISE updates records and takes over vendor relationship going forward

---

## 2. ENTITY RESPONSIBILITIES

### 2.1 Initial Setup Requirements

**Within First Month of Engagement:**

Each entity must complete:

1. **Technology Portfolio Notification**
   - List all technology categories for RISE management
   - Provide current vendor relationships
   - Share historical spend data (past 12 months)
   - Identify critical dependencies

2. **Procurement Process Documentation**
   - Internal approval workflows
   - Budget codes and cost centers
   - Authorized approvers list
   - Payment terms and cycles

3. **Contact Assignment**
   - Primary RISE liaison (entity-side)
   - Technical point of contact
   - Financial/procurement contact
   - Escalation contacts

4. **System Integration**
   - Provide access to relevant procurement systems
   - Set up RISE as approved vendor in ERP
   - Configure email routing for requirements
   - Establish shared document repository

### 2.2 Ongoing Operational Responsibilities

**Monthly:**
- Review RISE invoices within 5 business days
- Process payments within agreed terms (typically 30 days)
- Update technology requirements forecast
- Report any vendor performance issues

**Quarterly:**
- Conduct cost review with RISE
- Verify markup calculations on sample transactions
- Update approved technology list if needed
- Review and confirm delivery satisfaction

**Annually:**
- Comprehensive spend analysis
- Markup percentage renegotiation review
- Technology portfolio refresh
- Vendor performance evaluation

### 2.3 Advance Notice Requirements

**1-Month Advance Notice Required For:**
- New technology category additions
- Significant volume changes (>50% increase)
- New vendor onboarding requests
- Changes to delivery locations
- Major project requirements

**2-Week Notice Required For:**
- Routine purchases >AED 100,000
- Multi-location deliveries
- Custom configuration requirements
- Urgentpriority requests

**No Advance Notice Required:**
- Repeat orders from approved vendors
- Routine orders <AED 100,000
- Emergency replacements (with post-notification)

---

## 3. RISE RESPONSIBILITIES

### 3.1 Core Operational Duties

**Procurement Management:**
- Process all entity requirements within 2 business days
- Issue POs to vendors within agreed timelines
- Track delivery status and confirm receipt
- Manage returns, exchanges, and warranty claims
- Handle vendor escalations and disputes

**Financial Management:**
- Process vendor invoices promptly (within 5 days)
- Pay vendors per agreed terms
- Issue accurate invoices to entities (Cost + Markup)
- Provide vendor invoice copies on request
- Maintain transparent financial records

**Vendor Relationship Management:**
- Negotiate competitive pricing
- Maintain vendor performance scorecards
- Conduct quarterly vendor business reviews
- Manage contract renewals and amendments
- Build strategic vendor partnerships

**Technology Expertise Development:**
- Respond to new technology requests within 5 business days
- Complete onboarding within 1 month (or communicate alternate timeline)
- Maintain up-to-date technology knowledge
- Train staff on emerging technologies
- Build vendor certification program

### 3.2 Service Level Commitments

**Response Times:**
| Request Type | Response SLA | Resolution SLA |
|--------------|--------------|----------------|
| Emergency Requirement | 4 hours | 24 hours (PO issued) |
| Urgent Requirement | 1 business day | 2 business days |
| Standard Requirement | 2 business days | 5 business days |
| New Technology Request | 5 business days | 30 days (onboarding) |

**Accuracy Commitments:**
- PO accuracy: 98% (correct specifications)
- Invoicing accuracy: 99% (correct cost + markup)
- Delivery accuracy: 95% (on-time, correct location)

**Communication:**
- Weekly status report to each entity
- Monthly performance dashboard
- Quarterly business review meetings
- Ad-hoc updates for critical issues

### 3.3 Documentation & Transparency

**RISE Must Provide:**
1. **Per Transaction:**
   - Copy of vendor quotation/invoice
   - Proof of delivery
   - Markup calculation breakdown

2. **Monthly:**
   - Consolidated spending report per entity
   - Transaction log (all POs and invoices)
   - Vendor performance summary
   - Open issues tracker

3. **Quarterly:**
   - Cost savings analysis (vs. direct procurement)
   - Vendor leverage report
   - Technology category performance
   - Forecast for next quarter

4. **Annually:**
   - Comprehensive financial audit support
   - Vendor contract summary
   - Technology portfolio health check
   - Strategic recommendations

---

## 4. FINANCIAL CONTROLS & AUDIT RIGHTS

### 4.1 Cost Verification Mechanisms

**NH Group Rights:**

1. **Invoice Verification**
   - Request vendor invoice copies anytime
   - Compare quoted vs. actual vendor pricing
   - Challenge pricing discrepancies
   - Audit markup calculations

2. **Quarterly Audits**
   - NH Finance can conduct quarterly cost audits
   - RISE must provide access to:
     - All vendor invoices
     - PO documentation
     - Payment records
     - Email communications with vendors
   - Audit findings must be addressed within 15 days

3. **Annual Financial Audit**
   - Comprehensive audit of all RISE transactions
   - External auditor access if requested
   - Verification of markup consistency
   - Review of vendor rebates/kickbacks (must be disclosed)

4. **Spot Checks**
   - Random transaction sampling (10% of monthly volume)
   - Verify cost-plus calculation accuracy
   - Confirm vendor invoice authenticity
   - Check for undisclosed fees

### 4.2 Markup Adjustment Mechanisms

**Markup Can Be Adjusted Based On:**

**Performance-Based Adjustment:**
- SLA achievement >95% → Markup+1%
- Cost savings delivered >15% → Markup+0.5%
- Entity satisfaction score >4.5/5 → Markup+0.5%
- SLA achievement <85% → Markup-1%
- Cost overruns >10% → Markup-0.5%

**Volume-Based Adjustment:**
- Annual spend >AED 10M → Markup -1%
- Annual spend >AED 20M → Markup -2%
- Annual spend <AED 5M → Markup +1%

**Category Complexity Adjustment:**
- High complexity (Cloud, ERP, Security) → Higher markup justified
- Low complexity (Hardware, Telecom) → Lower markup expected
- Standard complexity (Software licensing) → Base markup

**Negotiation Process:**
- Annual review meeting (Q4)
- Both parties present data
- Negotiate new markup for coming year
- Document agreed changes
- Effective from start of new fiscal year

### 4.3 Prohibited Practices

**RISE May NOT:**
1. Accept vendor kickbacks, rebates, or commissions without disclosing to NH
2. Charge fees beyond agreed markup percentage
3. Inflate vendor costs to increase markup revenue
4. Steer entities toward higher-cost vendors for profit
5. Delay procurement to manipulate timelines
6. Misrepresent vendor pricing or capabilities
7. Create artificial scarcity to increase prices
8. Bundle unwanted products/services

**Penalties for Violations:**
- First violation: Written warning + markup reduction 2% for 6 months
- Second violation: Markup reduction 5% for 12 months
- Third violation: Termination of engagement + legal action

**Discovery Process:**
- Violations can be reported by entities, NH IT, or identified in audits
- Investigation by Group CIO and Finance
- RISE given 5 days to respond
- Decision by Steering Committee
- Appeal to CEO (final)

---

## 5. PHASE D EVALUATION FRAMEWORK

### Phase 1: Initial Assessment (Months 1-2)

**Objective:** Assess RISE's capability to operate cost-plus model effectively

**Evaluation Criteria:**

| Dimension | Weight | Criteria | Minimum Score |
|-----------|--------|----------|---------------|
| **Financial Capability** | 30% | Can handle payment float, has working capital, financial systems in place | 7/10 |
| **Process Maturity** | 25% | Documented procurement process, invoice processing, audit trail | 7/10 |
| **Technology Knowledge** | 20% | Expertise in entity's initial technology portfolio | 6/10 |
| **Transparency** | 15% | Willingness to share vendor invoices, open book accounting | 8/10 |
| **System Integration** | 10% | Can integrate with entity procurement/finance systems | 6/10 |

**Passing Score:** ≥75/100 (weighted average)

**Phase 1 Activities:**
- Week 1-2: RISE completes technology portfolio assessment for each entity
- Week 3-4: Pilot 5-10 small transactions (<AED 50K each)
- Week 5-6: Review pilot results, audit invoices, verify markup accuracy
- Week 7-8: Compile evaluation report, present to Steering Committee

**GO/NO-GO Decision:**
- Score ≥75 AND no major red flags → Proceed to Phase 2
- Score <75 OR major concerns → Terminate engagement

### Phase 2: Probation Period (Months 3-8)

**Objective:** Validate RISE can deliver at scale with consistent quality

**Monthly KPIs:**

| KPI | Target | Measurement |
|-----|--------|-------------|
| Response Time SLA | ≥90% | % of requirements responded to within SLA |
| PO Accuracy | ≥95% | % of POs issued correctly first time |
| Invoice Accuracy | ≥98% | % of invoices with correct cost+markup |
| Delivery On-Time | ≥90% | % of deliveries per scheduled date |
| Cost Competitiveness | Vendor cost ≤ Market rate | Quarterly spot checks vs. market |
| Transparency | 100% | Vendor invoice sharing on request |

**Monthly Performance Review:**
- Each entity scores RISE performance
- NH IT compiles consolidated report
- Present to Steering Committee by 10th of following month
- Address any SLA breaches immediately

**Mid-Probation Checkpoint (Month 5):**
- Comprehensive performance review
- Cost-benefit analysis (savings delivered vs. markup paid)
- Entity satisfaction survey
- Decision: Continue probation, extend probation, or terminate

**End of Probation (Month 8):**
- Calculate overall probation score (all 6 KPIs weighted equally)
- Minimum score required: ≥80/100
- Conduct financial audit of all transactions
- Entity feedback survey (must be ≥4/5 average)

**Phase 2 Decision Gate:**
- Score ≥80/100 AND entity satisfaction ≥4/5 AND no major issues → Proceed to Phase 3
- Any criterion not met → Extend probation 3 months OR terminate

### Phase 3: Permanent Engagement (Month 9+)

**Ongoing Governance:**

**Monthly:** 
- Performance dashboard review
- Invoice verification (10% spot check)
- Issue resolution

**Quarterly:**
- Business review with RISE management
- KPI scorecard evaluation
- Cost audit (sample basis)
- Entity satisfaction pulse check

**Annually:**
- Comprehensive performance evaluation
- Full financial audit
- Markup percentage renegotiation
- Technology portfolio refresh
- Renewal decision (Continue / Modify / Terminate)

**Continuous Monitoring:**
- Real-time tracking of response/delivery SLAs
- Monthly invoice accuracy checks
- Quarterly cost competitiveness reviews
- Annual value assessment

---

## 6. GOVERNANCE STRUCTURE

### 6.1 Steering Committee

**Composition:**
- Group CIO (Chair)
- Group CFO
- NH IT Manager (Execution Lead)
- Representative from each major subsidiary (EFI, Bloom, FoodQuest, Entrust, Exeed)

**Meeting Frequency:**
- Monthly during Phase 1 & 2
- Quarterly during Phase 3
- Ad-hoc for critical issues

**Decision Authority:**
- Phase transition approvals (1→2, 2→3)
- Markup percentage adjustments
- Dispute resolution (entity vs. RISE)
- Termination decisions
- Exception approvals

### 6.2 Execution Manager (NH IT)

**Designated Role:** Senior NH IT team member

**Responsibilities:**
- Day-to-day RISE relationship management
- Process entity requirements and track status
- Conduct monthly performance reviews
- Compile reports for Steering Committee
- Enforce SLAs and escalate breaches
- Coordinate audits and spot checks
- Maintain vendor intelligence database

**Authority Level:**
- Approve routine transactions
- Escalate issues to Group CIO
- Request vendor invoice documentation
- Flag pricing discrepancies
- Coordinate with entity contacts

**Time Commitment:** 30-40% FTE expected

### 6.3 Entity Liaison Contacts

Each subsidiary appoints:
- Primary RISE contact (procurement/IT manager)
- Alternate contact
- Finance contact for invoice processing

**Responsibilities:**
- Submit technology requirements to RISE
- Review and approve RISE invoices
- Provide feedback on RISE performance
- Escalate issues to Execution Manager
- Participate in quarterly reviews

---

## 7. EXIT STRATEGY & TERMINATION

### 7.1 Termination Rights

**NH Group Can Terminate:**
- **For Cause:**
  - SLA breaches (performance <75% for 2 consecutive months)
  - Financial misconduct (hidden fees, false invoicing, etc.)
  - Security breaches
  - Repeated non-compliance with audit requests
  - Fraud or misrepresentation
  - *Effect*: Immediate termination, potential legal action

- **For Convenience:**
  - After Phase 1 or 2 (if evaluation criteria not met)
  - After Phase 3 with 90-day notice
  - Annual renewal decision (decline to renew)
  - *Effect*: Orderly handover per transition plan

**RISE Can Terminate:**
- With 90-day notice after Phase 3 begins
- Immediately if NH fails to pay invoices for 60+ days
- By mutual agreement anytime

### 7.2 Transition/Handover Process

**Upon Termination Notice:**

**Day 1-30: Transition Planning**
- RISE provides complete vendor relationship documentation
- List of all active POs and pending deliveries
- Contact details for all vendors
- Historical transaction data
- Outstanding issues log

**Day 31-60: Knowledge Transfer**
- RISE trains NH IT team (or replacement vendor)
- Introduce NH contacts to key vendors
- Transfer vendor credentials and access
- Provide templates and process documentation

**Day 61-90: Final Handover**
- Complete all pending transactions
- Final invoice reconciliation
- Transfer all contracts to NH or new vendor
- Return any NH proprietary information
- Conduct exit audit and financial settlement

**Post-90 Days:**
- RISE provides 30-day post-termination support (paid separately if needed)
- No ongoing obligations beyond final payment settlement

### 7.3 Transition Support

**RISE Must Provide:**
- Vendor contact database with relationship notes
- Pricing history and negotiated terms
- Contract copies and renewal schedules
- Process documentation and playbooks
- Lessons learned and recommendations

**NH Retains:**
- All vendor relationships (NH is always the customer of record)
- All contracts (NH is always the contracting party)
- All data and intellectual property
- Direct vendor access (no RISE approval needed post-termination)

---

## 8. RISK MANAGEMENT

### 8.1 Key Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|----------|--------|------------|
| **RISE markup inflation** | Medium | High | - Quarterly audits<br>- Vendor invoice verification<br>- Market rate benchmarking |
| **RISE cash flow issues** | Low | High | - Monitor financial health<br>- Require proof of payment to vendors<br>- Consider escrow for large orders |
| **Vendor relationship damage** | Medium | Medium | - NH always remains customer of record<br>- Direct NH-vendor communication allowed<br>- Regular vendor feedback collection |
| **Technology expertise gaps** | High | Medium | - 1-month onboarding period<br>- Option to decline specialized tech<br>- Emergency direct procurement waiver |
| **Invoice disputes** | Medium | Low | - Clear dispute resolution process<br>- Vendor invoice copies mandatory<br>- Escalation to Steering Committee |
| **Service degradation over time** | Medium | Medium | - Continuous KPI monitoring<br>- Quarterly performance reviews<br>- Annual renewal decision point |
| **Entity dissatisfaction** | High | High | - Monthly entity feedback<br>- Quarterly satisfaction surveys<br>- Easy termination path (90 days) |

### 8.2 Red Flags & Immediate Escalation

**Escalate Immediately to Group CIO if:**
- RISE requests prepayment before vendor payment
- Vendor invoices not provided within 48 hours of request
- Markup calculation discrepancies >5%
- SLA breaches >25% in any month
- Entity complaints about RISE unresponsiveness
- Vendor complaints about RISE non-payment
- RISE proposes changing cost-plus model
- RISE attempts to take over vendor relationships directly

### 8.3 Contingency Planning

**If RISE Fails During Engagement:**

**Emergency Response Plan:**
1. **Day 1**: Suspend all new POs through RISE
2. **Day 1-3**: Identify critical pending orders
3. **Day 3-5**: Contact vendors directly to confirm/expedite
4. **Day 5-10**: Establish direct procurement temporarily
5. **Day 10-30**: Evaluate permanent alternatives (new vendor or in-house)

**Backup Procurement Options:**
- Entities revert to direct vendor procurement
- NH IT provides temporary procurement support
- Engage alternate technology aggregator
- Hire dedicated procurement staff

---

## 9. PERFORMANCE METRICS & REPORTING

### 9.1 RISE Performance Dashboard

**Updated Monthly, Reviewed in Steering Committee:**

**Financial Metrics:**
- Total spend processed (AED)
- Average markup percentage applied
- Cost savings vs. direct procurement (%)
- Invoice processing time (days)
- Payment cycle adherence (%)

**Operational Metrics:**
- Requirements processed (#)
- PO issuance time (avg. days)
- On-time delivery (%)
- Order accuracy (%)
- Returns/issues (%)

**Service Quality Metrics:**
- Response time SLA compliance (%)
- Resolution time SLA compliance (%)
- Entity satisfaction score (1-5)
- Vendor satisfaction score (1-5)
- Issue escalation rate (%)

**Technology Metrics:**
- Technology categories managed (#)
- New technology onboarding (# & days)
- Technology expertise utilization (%)
- Vendor coverage per category (#)

### 9.2 Entity-Specific Reporting

**Each Entity Receives Monthly:**
1. Transaction log (all POs & invoices)
2. Spend analysis by technology category
3. Vendor performance scorecard
4. Cost savings estimate vs. direct procurement
5. Open issues tracker
6. Upcoming renewals/expirations

### 9.3 Annual Value Assessment

**Conducted in Q4 Each Year:**

**Cost-Benefit Analysis:**
- Total markup fees paid to RISE
- Documented cost savings delivered by RISE
- NH IT time saved (hours → cost)
- Vendor management value (qualitative)
- Net value = Savings - Markup fees

**Decision:**
- Positive net value → Continue engagement
- Negative net value → Renegotiate markup or consider termination
- Break-even → Evaluate qualitative benefits

---

## 10. APPENDICES

### Appendix A: Technology Portfolio Form Template

**Entity Name:** _________________  
**Date:** _________________  
**Completed By:** _________________

| Technology Category | Current Vendor(s) | Annual Spend (AED) | Complexity (H/M/L) | Immediate Need? | Special Requirements |
|---------------------|-------------------|--------------------|--------------------|-----------------|---------------------|
| Example: Cloud Services - AWS | AWS Direct | 500,000 | High | Yes | Need RI purchase support |
| | | | | | |

### Appendix B: Requirement Submission Form

**Entity:** _________________  
**Date:** _________________  
**Submitted By:** _________________  
**Urgency:** [ ] Emergency [ ] Urgent [ ] Standard

**Requirement Details:**
- Product/Service Description: _________________
- Quantity: _________________
- Vendor Preference (if any): _________________
- Delivery Address: _________________
- Required By Date: _________________
- Budget Code: _________________
- Estimated Value (AED): _________________
- Technical Specifications: (Attach document if needed)

**Approval:**
- Approved By: _________________
- Signature: _________________

### Appendix C: New Technology Request Form

**Entity:** _________________  
**Date:** _________________  
**Requested By:** _________________

**Technology Details:**
- Technology Name: _________________
- Category: _________________
- Vendor(s): _________________
- Business Justification: _________________
- Expected Annual Spend: _________________
- Timeline Criticality: _________________

**RISE Assessment:**
- Expertise Available: [ ] Yes [ ] No [ ] Partial
- Onboarding Required: [ ] Yes [ ] No
- Estimated Onboarding Time: ______ weeks
- Recommendation: [ ] Approve [ ] Decline [ ] Conditional

### Appendix D: Monthly Performance Report Template

**Month:** _________________  
**Entity:** _________________

**KPI Summary:**
| KPI | Target | Actual | Status |
|-----|--------|--------|--------|
| Response Time SLA | ≥90% | | |
| PO Accuracy | ≥95% | | |
| Invoice Accuracy | ≥98% | | |
| On-Time Delivery | ≥90% | | |
| Cost Competitiveness | ≤Market | | |
| Transparency | 100% | | |

**Financial Summary:**
- Total Spend Processed: AED _________
- Total Markup Charged: AED _________
- Average Markup %: _________
- Estimated Savings vs Direct: AED _________

**Issues:**
1. _________________ (Status: Open/Closed)
2. _________________ (Status: Open/Closed)

**Entity Feedback:**
Satisfaction Rating: ___/5  
Comments: _________________

---

## 11. APPROVAL & SIGNATURES

**This framework requires approval from:**

**Prepared By:**
- Name: _________________
- Title: NH IT Manager
- Signature: _________________
- Date: _________________

**Reviewed By:**
- Name: _________________
- Title: Group CIO
- Signature: _________________
- Date: _________________

**Approved By:**
- Name: _________________
- Title: Group CEO
- Signature: _________________
- Date: _________________

**Acknowledged By (RISE Technologies):**
- Name: _________________
- Title: _________________
- Signature: _________________
- Date: _________________

---

**END OF FRAMEWORK DOCUMENT**

*This is a living document. Version updates will be tracked and distributed to all stakeholders.*

**Next Review Date:** [Q4 2026]
