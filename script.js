// ===== Presentation Controller =====
class PresentationController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 18;
        this.isAnimating = false;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateUI();
        this.updateTotalSlides();
    }

    cacheElements() {
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlideEl = document.getElementById('currentSlide');
        this.totalSlidesEl = document.getElementById('totalSlides');
        this.progressFill = document.getElementById('progressFill');
        this.tocSidebar = document.getElementById('tocSidebar');
        this.tocItems = document.querySelectorAll('.toc-item');
        this.keyboardHints = document.getElementById('keyboardHints');
        this.breadcrumbSection = document.getElementById('breadcrumbSection');
        this.breadcrumbSlide = document.getElementById('breadcrumbSlide');
        this.tocToggle = document.getElementById('tocToggle');
        this.sidebarCollapsed = true;
        // Start with sidebar collapsed
        this.tocSidebar.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
    }

    bindEvents() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.goToPrev();
        });
        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.goToNext();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Table of Contents - click to navigate
        this.tocItems.forEach(item => {
            item.addEventListener('click', () => {
                const slideNum = parseInt(item.dataset.slide);
                this.goToSlide(slideNum);
            });
        });

        // Sidebar toggle
        if (this.tocToggle) {
            this.tocToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Touch/Swipe navigation
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Click to advance (on slide content) - disabled to avoid confusion
        // Users should use arrow keys, buttons, or swipe to navigate

        // Hide keyboard hints after first interaction
        const hideHints = () => {
            if (this.keyboardHints) {
                this.keyboardHints.style.opacity = '0';
                setTimeout(() => {
                    this.keyboardHints.style.display = 'none';
                }, 300);
            }
            document.removeEventListener('keydown', hideHints);
            document.removeEventListener('click', hideHints);
        };

        setTimeout(() => {
            document.addEventListener('keydown', hideHints, { once: true });
            document.addEventListener('click', hideHints, { once: true });
        }, 5000);
    }

    handleKeydown(e) {
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                this.goToNext();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                this.goToPrev();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
            case 'Escape':
                // Reserved for future use
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'b':
            case 'B':
                e.preventDefault();
                this.toggleSidebar();
                break;
        }
    }

    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        this.tocSidebar.classList.toggle('collapsed', this.sidebarCollapsed);
        document.body.classList.toggle('sidebar-collapsed', this.sidebarCollapsed);
    }

    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) < swipeThreshold) return;

        if (diff > 0) {
            this.goToNext();
        } else {
            this.goToPrev();
        }
    }

    goToNext() {
        if (this.isAnimating || this.currentSlide >= this.totalSlides) return;
        this.goToSlide(this.currentSlide + 1);
    }

    goToPrev() {
        if (this.isAnimating || this.currentSlide <= 1) return;
        this.goToSlide(this.currentSlide - 1);
    }

    goToSlide(slideNum) {
        if (this.isAnimating || slideNum < 1 || slideNum > this.totalSlides || slideNum === this.currentSlide) return;

        // Close side panel when navigating
        if (window.sidePanel) {
            window.sidePanel.closePanel();
        }

        this.isAnimating = true;
        const direction = slideNum > this.currentSlide ? 'next' : 'prev';

        // Get current and target slides
        const currentSlideEl = this.slides[this.currentSlide - 1];
        const targetSlideEl = this.slides[slideNum - 1];

        // Remove all transition classes first
        this.slides.forEach(s => {
            s.classList.remove('prev', 'next-incoming');
        });

        // Add transition classes based on direction
        if (direction === 'next') {
            currentSlideEl.classList.remove('active');
            currentSlideEl.classList.add('prev');
        } else {
            currentSlideEl.classList.remove('active');
            currentSlideEl.classList.add('next-incoming');
        }

        targetSlideEl.classList.add('active');

        // Update current slide number
        this.currentSlide = slideNum;
        this.updateUI();

        // Clean up after animation
        setTimeout(() => {
            currentSlideEl.classList.remove('prev', 'next-incoming');
            this.isAnimating = false;
        }, 500);
    }

    updateUI() {
        // Update slide counter
        this.currentSlideEl.textContent = this.currentSlide;

        // Update progress bar
        const progress = ((this.currentSlide - 1) / (this.totalSlides - 1)) * 100;
        this.progressFill.style.width = `${progress}%`;

        // Update navigation buttons
        this.prevBtn.disabled = this.currentSlide === 1;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;

        // Update TOC active item and breadcrumbs
        let activeSection = '';
        let activeTitle = '';

        this.tocItems.forEach(item => {
            const slideNum = parseInt(item.dataset.slide);
            const isActive = slideNum === this.currentSlide;
            item.classList.toggle('active', isActive);

            if (isActive) {
                activeSection = item.dataset.section || '';
                activeTitle = item.dataset.title || '';
            }
        });

        // Update breadcrumbs
        if (this.breadcrumbSection && this.breadcrumbSlide) {
            this.breadcrumbSection.textContent = activeSection || 'Introduction';
            this.breadcrumbSlide.textContent = activeTitle || 'Title';
        }

        // Update URL hash (for bookmarking)
        if (history.replaceState) {
            history.replaceState(null, null, `#slide-${this.currentSlide}`);
        }
    }

    updateTotalSlides() {
        this.totalSlides = this.slides.length;
        this.totalSlidesEl.textContent = this.totalSlides;
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// ===== Animation on scroll into view =====
class SlideAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.observeSlides();
    }

    observeSlides() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSlideContent(entry.target);
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.slide').forEach(slide => {
            observer.observe(slide);
        });
    }

    animateSlideContent(slide) {
        // Add stagger animation to cards and items
        const animatableItems = slide.querySelectorAll(
            '.summary-card, .problem-card, .swot-card, .pillar-card, .kpi-card, ' +
            '.initiative-item, .decision-item, .report-card, .appendix-card, ' +
            '.format-card, .factor-item, .doc-card'
        );

        animatableItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';

            setTimeout(() => {
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100 + (index * 50));
        });
    }
}

// ===== Progress indicators for data =====
class DataVisualization {
    constructor() {
        this.init();
    }

    init() {
        this.animateHealthScore();
        this.animateProgressBars();
    }

    animateHealthScore() {
        // Could add animated counters here
    }

    animateProgressBars() {
        // Could add animated progress bars here
    }
}

// ===== URL Hash Navigation =====
class HashNavigation {
    constructor(presentation) {
        this.presentation = presentation;
        this.init();
    }

    init() {
        // Check for hash on load
        const hash = window.location.hash;
        if (hash && hash.startsWith('#slide-')) {
            const slideNum = parseInt(hash.replace('#slide-', ''));
            if (slideNum >= 1 && slideNum <= this.presentation.totalSlides) {
                setTimeout(() => {
                    this.presentation.goToSlide(slideNum);
                }, 100);
            }
        }

        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash;
            if (hash && hash.startsWith('#slide-')) {
                const slideNum = parseInt(hash.replace('#slide-', ''));
                if (slideNum >= 1 && slideNum <= this.presentation.totalSlides) {
                    this.presentation.goToSlide(slideNum);
                }
            }
        });
    }
}

// ===== Print Mode =====
class PrintMode {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('beforeprint', () => {
            document.querySelectorAll('.slide').forEach(slide => {
                slide.classList.add('active');
            });
        });

        window.addEventListener('afterprint', () => {
            document.querySelectorAll('.slide').forEach((slide, index) => {
                if (index !== 0) {
                    slide.classList.remove('active');
                }
            });
        });
    }
}

// ===== Preloader =====
class Preloader {
    constructor() {
        this.init();
    }

    init() {
        // Add fade-in effect on load
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';

        window.addEventListener('load', () => {
            document.body.style.opacity = '1';
        });
    }
}

// ===== Side Panel Handler =====
class SidePanelHandler {
    constructor() {
        this.detailData = {
            // ===== Slide 3: Team & Structure - Skill Gaps =====
            'cybersecurity': {
                title: 'Missing Cybersecurity/PMO/BA Roles',
                content: `<ul class="detail-bullets">
                    <li>No dedicated cybersecurity leadership exists in the organization</li>
                    <li>No Project Management Office (PMO) to govern IT projects</li>
                    <li>No Business Analyst capabilities for requirements gathering</li>
                    <li>Critical exposure to cyber threats and compliance risks</li>
                    <li>Security responsibilities currently distributed informally</li>
                    <li>Target: Hire key roles by Q1-Q2 2026</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #1, #9</span>
                </div>`
            },
            'data-ai': {
                title: 'No AI Strategy or Governance',
                content: `<ul class="detail-bullets">
                    <li>No formal AI strategy to guide adoption decisions</li>
                    <li>Missing policies for responsible AI use and data ethics</li>
                    <li>No centralized data platform (data lake/warehouse)</li>
                    <li>Cannot leverage AI for business optimization</li>
                    <li>Data remains siloed across multiple systems</li>
                    <li>Target: Establish AI strategy by Q2 2026</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #55, #56, #57</span>
                </div>`
            },
            'cloud': {
                title: 'Limited Cloud Adoption',
                content: `<ul class="detail-bullets">
                    <li>Cloud usage is ad-hoc without coherent strategy</li>
                    <li>Hybrid architecture not optimized</li>
                    <li>Higher operational costs due to inefficiencies</li>
                    <li>Limited scalability for business growth</li>
                    <li>Cannot leverage modern cloud-native services</li>
                    <li>Need: Cloud-first strategy and Cloud Engineer hire</li>
                    <li>Target: 2026-2028 cloud transformation</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #34</span>
                </div>`
            },
            'enterprise': {
                title: 'Limited System Integration',
                content: `<ul class="detail-bullets">
                    <li>Systems operate independently in silos</li>
                    <li>No proper integration between applications</li>
                    <li>Data inconsistency across systems</li>
                    <li>Duplicate data entry required</li>
                    <li>Delayed reporting due to manual consolidation</li>
                    <li>No unified view of operations possible</li>
                    <li>Need: Enterprise Architect and integration standards</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #23</span>
                </div>`
            },
            // ===== Slide 4: Technology Landscape Stats =====
            'tech-26-list': {
                title: '26 Technologies in Use',
                content: `<ul class="detail-bullets">
                    <li><strong>ERP & Business Applications</strong></li>
                    <li>SAP ECC (Legacy ERP)</li>
                    <li>Oracle EBS</li>
                    <li>Microsoft Dynamics</li>
                    <li>Tally</li>
                    <li>QuickBooks</li>
                    <li><strong>Productivity & Collaboration</strong></li>
                    <li>Microsoft Office 365</li>
                    <li>Microsoft Teams</li>
                    <li>SharePoint</li>
                    <li><strong>Infrastructure</strong></li>
                    <li>VMware vSphere</li>
                    <li>Windows Server</li>
                    <li>Linux Servers</li>
                    <li>Dell/HP Server Hardware</li>
                    <li>NetApp/Dell Storage</li>
                    <li><strong>Network & Security</strong></li>
                    <li>Cisco Networking</li>
                    <li>Fortinet Firewalls</li>
                    <li>Palo Alto (Limited)</li>
                    <li>Symantec/McAfee Antivirus</li>
                    <li><strong>Database</strong></li>
                    <li>Microsoft SQL Server</li>
                    <li>Oracle Database</li>
                    <li>MySQL</li>
                    <li><strong>Other Applications</strong></li>
                    <li>Custom In-house Applications</li>
                    <li>Third-party SaaS Tools</li>
                    <li>Legacy DOS-based Systems</li>
                    <li>POS Systems</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Technology Assessment</span>
                </div>`
            },
            'tech-datacenters': {
                title: '2 Data Centers',
                content: `<ul class="detail-bullets">
                    <li><strong>Primary Data Center</strong></li>
                    <li>Location: UAE (On-premise)</li>
                    <li>Hosts core business applications</li>
                    <li>SAP ECC and Oracle EBS instances</li>
                    <li>Primary file and database servers</li>
                    <li><strong>Secondary Data Center</strong></li>
                    <li>Location: UAE (Co-location)</li>
                    <li>Limited redundancy capability</li>
                    <li>Not configured for full DR</li>
                    <li><strong>Key Issues</strong></li>
                    <li>No proper Disaster Recovery setup</li>
                    <li>Limited failover capabilities</li>
                    <li>Single points of failure exist</li>
                    <li>Aging infrastructure components</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #22, #29</span>
                </div>`
            },
            'tech-entities': {
                title: '7 Business Subsidiaries',
                content: `<ul class="detail-bullets">
                    <li><strong>National Holding</strong> - Group HQ & Shared Services</li>
                    <li><strong>EIIC</strong> - Emirates International Investment Company</li>
                    <li><strong>Bloom Holding</strong> - Real Estate, Education, Hospitality</li>
                    <li><strong>EFI</strong> - Emirates Food Industries (Hayatna, National Feed)</li>
                    <li><strong>Exeed Industries</strong> - Industrial (Precast, Construction)</li>
                    <li><strong>FoodQuest</strong> - F&B Hospitality (Al Baik, Denny's)</li>
                    <li><strong>Petromal</strong> - Oil & Gas, Oilfield Services</li>
                    <li><strong>Rise</strong> - Trading, Technologies, Healthcare</li>
                    <li><strong>Key Challenges:</strong></li>
                    <li>No standardized IT across subsidiaries</li>
                    <li>Different ERP systems per subsidiary</li>
                    <li>Siloed data and processes</li>
                    <li>Inconsistent security posture</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Assessment</span>
                </div>`
            },
            // ===== Slide 4: Technology - Categories =====
            'tech-erp': {
                title: 'Legacy ERP Systems',
                content: `<ul class="detail-bullets">
                    <li>Current ERP infrastructure is outdated</li>
                    <li>Unable to support business growth requirements</li>
                    <li>SAP ECC requires modernization to S/4 HANA Private Cloud</li>
                    <li>No Enterprise Performance Management (EPM) system</li>
                    <li>Financial planning and consolidation done manually</li>
                    <li>Target: ERP modernization 2026-2027</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #20, #40, #42</span>
                </div>`
            },
            'tech-infra': {
                title: 'Infrastructure Issues',
                content: `<ul class="detail-bullets">
                    <li>No Disaster Recovery (DR) service in place</li>
                    <li>Critical business continuity risk</li>
                    <li>Infrastructure components lack redundancy</li>
                    <li>Single points of failure throughout</li>
                    <li>No automated IT asset management</li>
                    <li>Manual inventory tracking processes</li>
                    <li>Target: DR implementation by Q2 2026</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #22, #29, #31</span>
                </div>`
            },
            'tech-security': {
                title: 'Security Tools Gap',
                content: `<ul class="detail-bullets">
                    <li>Security operations entirely outsourced</li>
                    <li>Limited internal security capability</li>
                    <li>Heavy dependency on third-party vendors</li>
                    <li>Network lacks proper segmentation</li>
                    <li>No security zones implemented</li>
                    <li>No internal SOC/NOC capability</li>
                    <li>Target: Build internal security team 2026</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #26, #27, #28</span>
                </div>`
            },
            // ===== Slide 5: Key Problems =====
            'problem-spof': {
                title: 'Single Points of Failure',
                content: `<ul class="detail-bullets">
                    <li>Critical IT functions depend on individual staff members</li>
                    <li>No backup personnel or cross-training in place</li>
                    <li>Severe business continuity risk if key staff unavailable</li>
                    <li>Knowledge loss risk if staff depart</li>
                    <li>Only one person supports critical subsidiary ERP systems</li>
                    <li>Target: Cross-training and documentation by 2026</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #2, #45</span>
                </div>`
            },
            'problem-governance': {
                title: 'No IT Governance Framework',
                content: `<ul class="detail-bullets">
                    <li>No documented IT governance framework exists</li>
                    <li>Ad-hoc decision making across IT</li>
                    <li>Shadow IT proliferation</li>
                    <li>Inconsistent technology choices</li>
                    <li>No data governance or management policies</li>
                    <li>Lack of accountability for IT decisions</li>
                    <li>ISO 27001 certification in progress</li>
                    <li>Target: Framework in place by Q1-Q2 2026</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #11, #12</span>
                </div>`
            },
            'problem-manual': {
                title: 'Heavy Manual Processes',
                content: `<ul class="detail-bullets">
                    <li>Many IT and business operations are manual</li>
                    <li>Time-consuming and error-prone workflows</li>
                    <li>Critical finance processes rely on spreadsheets</li>
                    <li>Manual financial reconciliations</li>
                    <li>Limited scalability due to manual work</li>
                    <li>Higher operational costs</li>
                    <li>Target: Process automation by 2026</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #13, #50, #51</span>
                </div>`
            },
            'problem-security': {
                title: 'Security Gaps',
                content: `<ul class="detail-bullets">
                    <li>No dedicated cybersecurity leadership</li>
                    <li>No security program or strategy</li>
                    <li>High exposure to cyber threats</li>
                    <li>Potential regulatory non-compliance</li>
                    <li>Reputational risk from security incidents</li>
                    <li>Security entirely dependent on third parties</li>
                    <li>Target: Hire Cybersecurity Lead Q1-Q2 2026</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #1, #26, #27, #28</span>
                </div>`
            },
            'problem-pmo': {
                title: 'No PMO (Project Management Office)',
                content: `<ul class="detail-bullets">
                    <li>No Project Management Office exists</li>
                    <li>Projects managed ad-hoc without standards</li>
                    <li>Projects consistently delivered late and over budget</li>
                    <li>No visibility into project portfolio status</li>
                    <li>No resource planning or allocation process</li>
                    <li>Cannot prioritize competing initiatives</li>
                    <li>No IT governance framework in place</li>
                    <li>Action: Establish PMO with dedicated PMO Lead</li>
                    <li>Target: Q1-Q2 2026</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #1, #11, #16, #17</span>
                </div>`
            },
            // ===== Slide 6: SWOT Analysis =====
            'swot-strengths': {
                title: 'Strengths',
                content: `<ul class="detail-bullets">
                    <li>Executive commitment to digital transformation</li>
                    <li>Board-level sponsorship for IT strategy</li>
                    <li>Financial resources available for investments</li>
                    <li>Dedicated IT team with strong domain knowledge</li>
                    <li>2 data centers provide foundation for growth</li>
                    <li>Greenfield opportunity in some areas</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte SWOT Analysis</span>
                </div>`
            },
            'swot-weaknesses': {
                title: 'Weaknesses',
                content: `<ul class="detail-bullets">
                    <li>Only 5 IT staff for entire organization</li>
                    <li>Severely under-resourced across 4 entities</li>
                    <li>Missing cybersecurity, data/AI, and cloud skills</li>
                    <li>Key knowledge concentrated in individuals</li>
                    <li>No PMO or project governance</li>
                    <li>Legacy systems and technical debt</li>
                    <li>Manual processes throughout</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #1, #2, #7</span>
                </div>`
            },
            'swot-opportunities': {
                title: 'Opportunities',
                content: `<ul class="detail-bullets">
                    <li>Cloud adoption for agility and scalability</li>
                    <li>Reduced infrastructure costs via cloud</li>
                    <li>AI and automation for efficiency gains</li>
                    <li>Data-driven decision making capability</li>
                    <li>Process standardization during ERP modernization</li>
                    <li>Cost optimization through vendor consolidation</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #34, #55, #56, #58</span>
                </div>`
            },
            'swot-threats': {
                title: 'Threats',
                content: `<ul class="detail-bullets">
                    <li>Increasing cyber threat landscape</li>
                    <li>Inadequate protection capabilities</li>
                    <li>No disaster recovery creates continuity risk</li>
                    <li>Single points of failure throughout</li>
                    <li>Difficulty attracting skilled IT talent</li>
                    <li>Evolving compliance requirements (ISO 27001)</li>
                    <li>Heavy reliance on third-party vendors</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Issue #1, #22, #26</span>
                </div>`
            },
            // ===== Slide 8: Strategic Pillars =====
            'pillar-governance': {
                title: 'Governance & Standards Pillar',
                content: `<ul class="detail-bullets">
                    <li><strong>Vision:</strong> Establish world-class IT governance that enables agility while ensuring compliance and accountability</li>
                    <li><strong>Best Practice Framework:</strong></li>
                    <li>COBIT 2019 for IT governance alignment</li>
                    <li>ITIL 4 for service management excellence</li>
                    <li>ISO 38500 for corporate IT governance</li>
                    <li><strong>Key Capabilities to Build:</strong></li>
                    <li>IT Steering Committee with executive sponsorship</li>
                    <li>Portfolio management for strategic investments</li>
                    <li>Standardized policies across all entities</li>
                    <li>Vendor governance and partnership management</li>
                    <li><strong>Expected Outcomes:</strong></li>
                    <li>Faster decision-making with clear accountability</li>
                    <li>Consistent IT practices across entities</li>
                    <li>Improved project success rates</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Industry Best Practice</span>
                </div>`
            },
            'pillar-digital': {
                title: 'Digital Transformation Pillar',
                content: `<ul class="detail-bullets">
                    <li><strong>Vision:</strong> Create a modern, integrated digital ecosystem that drives operational excellence and business growth</li>
                    <li><strong>Best Practice Framework:</strong></li>
                    <li>Cloud-first strategy for scalability</li>
                    <li>API-driven integration architecture</li>
                    <li>Automation-first process design</li>
                    <li><strong>Key Capabilities to Build:</strong></li>
                    <li>Unified ERP platform (S/4 HANA) for real-time insights</li>
                    <li>Enterprise Performance Management for planning</li>
                    <li>HRMS for employee experience excellence</li>
                    <li>Intelligent process automation (RPA, workflows)</li>
                    <li><strong>Expected Outcomes:</strong></li>
                    <li>60%+ reduction in manual processes</li>
                    <li>Real-time visibility across entities</li>
                    <li>Faster time-to-market for initiatives</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Digital Excellence</span>
                </div>`
            },
            'pillar-security': {
                title: 'Cybersecurity Pillar',
                content: `<ul class="detail-bullets">
                    <li><strong>Vision:</strong> Build a resilient security posture that protects assets while enabling business innovation</li>
                    <li><strong>Best Practice Framework:</strong></li>
                    <li>NIST Cybersecurity Framework for maturity</li>
                    <li>ISO 27001 for information security management</li>
                    <li>Zero Trust Architecture principles</li>
                    <li><strong>Key Capabilities to Build:</strong></li>
                    <li>24/7 Security Operations Center (SOC)</li>
                    <li>Identity and Access Management (IAM)</li>
                    <li>Security Information and Event Management (SIEM)</li>
                    <li>Incident response and recovery capability</li>
                    <li><strong>Expected Outcomes:</strong></li>
                    <li>Proactive threat detection and response</li>
                    <li>Compliance with regional regulations</li>
                    <li>Business confidence in security posture</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Security Excellence</span>
                </div>`
            },
            'pillar-data': {
                title: 'Data & AI Pillar',
                content: `<ul class="detail-bullets">
                    <li><strong>Vision:</strong> Transform into a data-driven organization that leverages AI for competitive advantage</li>
                    <li><strong>Best Practice Framework:</strong></li>
                    <li>DAMA-DMBOK for data management</li>
                    <li>Responsible AI principles for governance</li>
                    <li>DataOps for agile data delivery</li>
                    <li><strong>Key Capabilities to Build:</strong></li>
                    <li>Enterprise Data Platform (data lake/warehouse)</li>
                    <li>Self-service Business Intelligence & Analytics</li>
                    <li>AI/ML platform for predictive insights</li>
                    <li>Data governance and quality management</li>
                    <li><strong>Expected Outcomes:</strong></li>
                    <li>Data-driven decision making at all levels</li>
                    <li>Predictive analytics for business optimization</li>
                    <li>Trusted, governed data assets</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Data Excellence</span>
                </div>`
            },
            // ===== Slide 10: KPIs =====
            'kpi-health': {
                title: 'IT Health Score',
                content: `<ul class="detail-bullets">
                    <li><strong>Target:</strong> Achieve 80+ IT Health Score by 2028</li>
                    <li><strong>Measurement Approach:</strong></li>
                    <li>Quarterly maturity assessments across all domains</li>
                    <li>Balanced scorecard across People, Process, Technology</li>
                    <li>Benchmark against industry standards</li>
                    <li><strong>Health Score Components:</strong></li>
                    <li>Governance maturity (25%)</li>
                    <li>Security posture (25%)</li>
                    <li>Technology modernization (25%)</li>
                    <li>Team capability (25%)</li>
                    <li><strong>Success Indicators:</strong></li>
                    <li>Year 1: Score 50+ (Foundation built)</li>
                    <li>Year 2: Score 65+ (Transformation underway)</li>
                    <li>Year 3: Score 80+ (Excellence achieved)</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Continuous Improvement</span>
                </div>`
            },
            'kpi-uptime': {
                title: 'System Uptime',
                content: `<ul class="detail-bullets">
                    <li><strong>Target:</strong> 99.5% uptime for critical business systems</li>
                    <li><strong>Best Practice Approach:</strong></li>
                    <li>Implement comprehensive monitoring and alerting</li>
                    <li>Deploy redundancy for all critical systems</li>
                    <li>Establish disaster recovery with <4hr RTO</li>
                    <li>Define and enforce service level agreements</li>
                    <li><strong>Monitoring Capabilities:</strong></li>
                    <li>Real-time infrastructure dashboards</li>
                    <li>Proactive alerting before issues impact users</li>
                    <li>Automated incident escalation</li>
                    <li><strong>Business Value:</strong></li>
                    <li>Uninterrupted business operations</li>
                    <li>Customer and employee confidence</li>
                    <li>Reduced revenue loss from downtime</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Operational Excellence</span>
                </div>`
            },
            'kpi-incidents': {
                title: 'Security Incidents',
                content: `<ul class="detail-bullets">
                    <li><strong>Target:</strong> Zero critical breaches, <5 minor incidents/year</li>
                    <li><strong>Best Practice Approach:</strong></li>
                    <li>24/7 Security Operations Center monitoring</li>
                    <li>SIEM-based threat detection and response</li>
                    <li>Proactive vulnerability management</li>
                    <li>Regular penetration testing</li>
                    <li><strong>Response Capabilities:</strong></li>
                    <li>15-minute response SLA for critical alerts</li>
                    <li>Documented incident response playbooks</li>
                    <li>Regular tabletop exercises and drills</li>
                    <li><strong>Business Value:</strong></li>
                    <li>Protected business assets and reputation</li>
                    <li>Regulatory compliance assurance</li>
                    <li>Stakeholder confidence in security</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Security Excellence</span>
                </div>`
            },
            'kpi-team': {
                title: 'Team Size Growth',
                content: `<ul class="detail-bullets">
                    <li><strong>Target:</strong> Build a 16-person high-performing IT team</li>
                    <li><strong>Team Structure Vision:</strong></li>
                    <li>Leadership: CIO, PMO Lead, Security Lead, Data/AI Lead</li>
                    <li>Architecture: Enterprise Architect, Solutions Architects</li>
                    <li>Operations: Infrastructure, Security, Support teams</li>
                    <li>Delivery: Developers, Analysts, Project Managers</li>
                    <li><strong>Capability Development:</strong></li>
                    <li>Continuous learning and certification programs</li>
                    <li>Cross-training for knowledge redundancy</li>
                    <li>Career development pathways</li>
                    <li><strong>Business Value:</strong></li>
                    <li>Right skills for transformation execution</li>
                    <li>Reduced vendor dependency</li>
                    <li>Sustainable IT operations</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">People Excellence</span>
                </div>`
            },
            'kpi-automation': {
                title: 'Process Automation',
                content: `<ul class="detail-bullets">
                    <li><strong>Target:</strong> 60%+ of key processes automated</li>
                    <li><strong>Automation Strategy:</strong></li>
                    <li>Identify high-volume, repetitive processes</li>
                    <li>Implement RPA for transactional work</li>
                    <li>Build intelligent workflows with approvals</li>
                    <li>Integrate systems via APIs</li>
                    <li><strong>Priority Automation Areas:</strong></li>
                    <li>Financial close and reporting processes</li>
                    <li>IT service request fulfillment</li>
                    <li>Data integration and reconciliation</li>
                    <li>Employee onboarding/offboarding</li>
                    <li><strong>Business Value:</strong></li>
                    <li>Faster process execution</li>
                    <li>Reduced errors and rework</li>
                    <li>Staff freed for higher-value work</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Process Excellence</span>
                </div>`
            },
            'kpi-cost': {
                title: 'IT Cost/Revenue Ratio',
                content: `<ul class="detail-bullets">
                    <li><strong>Target:</strong> Maintain IT costs at <3% of revenue</li>
                    <li><strong>Cost Optimization Strategy:</strong></li>
                    <li>Cloud migration for infrastructure efficiency</li>
                    <li>System consolidation reducing licensing</li>
                    <li>Automation reducing manual labor costs</li>
                    <li>Strategic vendor partnerships</li>
                    <li><strong>Financial Governance:</strong></li>
                    <li>IT financial management and tracking</li>
                    <li>Project-based cost allocation</li>
                    <li>ROI measurement for investments</li>
                    <li>Monthly cost reporting to leadership</li>
                    <li><strong>Business Value:</strong></li>
                    <li>Transparent IT spending</li>
                    <li>Optimized technology investments</li>
                    <li>Demonstrable value from IT</li>
                </ul>
                <div class="detail-reference">
                    <span class="ref-badge">Financial Excellence</span>
                </div>`
            },
            // ===== Slide 11: Hiring Roadmap =====
            'hire-pmo': {
                title: 'PMO Lead - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Phase</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Recruitment</span>
                        <div class="gantt-bar-cell"><div class="gantt-bar hiring span-2">Hire</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">PMO Setup</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-2">Setup</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Governance</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-9">Operational</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color hiring"></span>Hiring</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color planning"></span>Setup</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color implementation"></span>Operational</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Milestone:</strong> PMO fully operational by Q4 2026</div>`
            },
            'hire-cybersecurity': {
                title: 'Cybersecurity Lead - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Phase</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Recruitment</span>
                        <div class="gantt-bar-cell"><div class="gantt-bar hiring span-2">Hire</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Security Strategy</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-2">Plan</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">SOC Build</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-4">Build</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">ISO 27001</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar deployment span-5">Certification</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color hiring"></span>Hiring</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color planning"></span>Planning</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color implementation"></span>Build</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color deployment"></span>Certification</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Milestone:</strong> SOC operational Q3 2027, ISO 27001 by Q4 2028</div>`
            },
            'hire-data-ai': {
                title: 'Data & AI Lead - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Phase</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Recruitment</span>
                        <div class="gantt-bar-cell"><div class="gantt-bar hiring span-2">Hire</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Data Strategy</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-2">Plan</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Data Platform</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-6">Build</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">AI Use Cases</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar ongoing span-4">Scale</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color hiring"></span>Hiring</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color planning"></span>Planning</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color implementation"></span>Build</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color ongoing"></span>Scale</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Milestone:</strong> Data platform live Q2 2027, AI pilots Q1 2028</div>`
            },
            'hire-architect': {
                title: 'Enterprise Architect - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Phase</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Recruitment</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar hiring span-2">Hire</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">EA Framework</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-2">Define</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Integration Stds</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-7">Implement</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color hiring"></span>Hiring</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color planning"></span>Define</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color implementation"></span>Implement</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Milestone:</strong> TOGAF framework adopted Q1 2027</div>`
            },
            'hire-cloud': {
                title: 'Cloud Engineer - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Phase</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Recruitment</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar hiring span-2">Hire</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Cloud Strategy</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-2">Plan</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Migration</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-7">Migrate</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color hiring"></span>Hiring</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color planning"></span>Planning</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color implementation"></span>Migration</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Milestone:</strong> Cloud-first architecture by 2028</div>`
            },
            'hire-security-analyst': {
                title: 'Security Analyst - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Phase</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Recruitment</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar hiring span-2">Hire</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">SIEM Deploy</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-3">Deploy</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">SOC Ops</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar ongoing span-6">24/7 Ops</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color hiring"></span>Hiring</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color implementation"></span>Deploy</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color ongoing"></span>Operations</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Milestone:</strong> 24/7 SOC coverage by Q3 2027</div>`
            },
            'hire-infra': {
                title: 'Infrastructure Staff - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Phase</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Recruitment</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar hiring span-4">Hire Team</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">DR Setup</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-3">Implement</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">24/7 Support</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar ongoing span-4">Operational</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color hiring"></span>Hiring</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color implementation"></span>Implement</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color ongoing"></span>Operations</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Milestone:</strong> Full DR capability by Q1 2028</div>`
            },
            'hire-developers': {
                title: 'Application Developers - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Phase</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Recruitment</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar hiring span-4">Hire Team</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">DevOps Setup</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-2">Setup</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Custom Dev</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-5">Delivery</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color hiring"></span>Hiring</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color planning"></span>Setup</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color implementation"></span>Delivery</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Milestone:</strong> In-house dev capability by 2028</div>`
            },
            'hire-soc': {
                title: 'SOC Analysts - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Phase</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Recruitment</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar hiring span-4">Hire Team</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Training</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-2">Train</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">24/7 SOC</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar ongoing span-5">Operational</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color hiring"></span>Hiring</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color planning"></span>Training</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color ongoing"></span>Operations</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Milestone:</strong> Full 24/7 SOC by Q4 2027</div>`
            },
            'y1-hire-leads': {
                title: 'Year 1 Initiatives - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Initiative</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                        <span class="gantt-header-label">Q1</span>
                        <span class="gantt-header-label">Q2</span>
                        <span class="gantt-header-label">Q3</span>
                        <span class="gantt-header-label">Q4</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Hire Key Leads</span>
                        <div class="gantt-bar-cell"><div class="gantt-bar critical span-2">CRITICAL</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">PMO Setup</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-3">Setup</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Oracle EPM</span>
                        <div class="gantt-bar-cell"><div class="gantt-bar deployment span-4">Complete</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Security Tools</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-2">Deploy</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color" style="background:#ef4444"></span>Critical</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color implementation"></span>Implementation</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color deployment"></span>Go-Live</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Year 1 Goals:</strong> PMO operational, EPM live, Security foundation</div>`
            },
            'temp-hire-developers': {
                title: 'Application Developers',
                content: `<div class="detail-metrics">
                    <span class="metric high">Impact: 8.0</span>
                    <span class="metric priority-p1">Deloitte Priority: P1</span>
                    <span class="metric">Timeline: 2027</span>
                </div>
                <p><strong>Role Justification:</strong> Limited Automation Capabilities and Missing Business Applications require development capacity.</p>
                <p><strong>Deloitte Recommendation:</strong></p>
                <p>• Build internal application development capability</p>
                <p>• Support ERP customization and integration</p>
                <p>• Enable automation initiatives</p>
                <p><strong>Key Responsibilities:</strong></p>
                <p>• Develop and maintain business applications</p>
                <p>• Build integrations between systems</p>
                <p>• Support ERP implementation and customization</p>
                <p>• Implement process automation (RPA)</p>
                <p>• Develop APIs and middleware</p>
                <p><strong>Best Practice:</strong> Adopt agile methodology and CI/CD practices for faster delivery.</p>`
            },
            'hire-soc': {
                title: 'SOC Analysts',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Report Issue #28</span>
                    <span class="ref-category">Category: Technology</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric high">Impact: 8.0</span>
                    <span class="metric priority-p1">Deloitte Priority: P1</span>
                    <span class="metric">Timeline: 2027</span>
                </div>
                <p><strong>Role Justification:</strong> Outsourced Security Monitoring (SOC/NOC) - Need to build internal 24/7 capability.</p>
                <p><strong>Deloitte Recommendation:</strong></p>
                <p>• Establish internal Security Operations Center</p>
                <p>• Build tiered analyst structure (L1, L2, L3)</p>
                <p>• Implement security orchestration and automation</p>
                <p><strong>Key Responsibilities:</strong></p>
                <p>• 24/7 security event monitoring</p>
                <p>• Incident detection and response</p>
                <p>• Threat intelligence analysis</p>
                <p>• Security tool management</p>
                <p>• Escalation and reporting</p>
                <p><strong>Best Practice:</strong> Start with 2-3 analysts and grow based on incident volume. Use automation to maximize analyst efficiency.</p>`
            },
            // ===== Slide 12: Year 1 Initiatives =====
            'y1-overview': {
                title: 'Year 1 (2026) - Overview',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Foundation Year</span>
                    <span class="ref-category">MUST DO</span>
                </div>
                <p><strong>Year 1 Goal:</strong> Leadership hired, PMO operational, governance established, EPM live, security foundation built, core technology deployed.</p>
                <p><strong>Key Focus Areas:</strong></p>
                <ul class="detail-bullets">
                    <li><strong>People & Hiring (H1-H4)</strong> - Hire Cyber Lead, Data/AI Lead, BA, PMO Lead, Cloud Engineer</li>
                    <li><strong>Process (P1-P6)</strong> - Governance framework, Steering Committee, Data governance, IT architecture</li>
                    <li><strong>Technology (T1-T13)</strong> - DMS, Ticketing, Asset Mgmt, IAM, Oracle EPM, SOC/NOC setup</li>
                    <li><strong>ERP Strategy</strong> - Planning and vendor selection</li>
                </ul>
                <p><strong>Critical Milestones:</strong></p>
                <ul class="detail-bullets">
                    <li>Q1-Q2: Hire Cybersecurity Lead & Data/AI Lead</li>
                    <li>Q2: Governance framework design complete</li>
                    <li>Q3-Q4: BA & PMO hired, SOC/NOC setup begins</li>
                    <li>Q4: Oracle EPM rollout complete</li>
                </ul>
                <p><em>See "Year 1 - Program" slide for detailed quarterly timeline.</em></p>`
            },
            'y1-hire-leads': {
                title: 'Hire Critical Leadership',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Report Issues #1, #55</span>
                    <span class="ref-category">Year 1 Priority</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Impact: 10.0</span>
                    <span class="metric priority-p0">Deloitte Priority: P0</span>
                </div>
                <p><strong>Deloitte Recommendation:</strong> Fill critical leadership gaps as first priority - all other initiatives depend on having right leadership in place.</p>
                <p><strong>Roles to Fill:</strong></p>
                <p>• <strong>PMO Lead</strong> - Issue #1 (Impact 10.0) - No PMO exists</p>
                <p>• <strong>Cybersecurity Lead</strong> - Issue #1 (Impact 10.0)</p>
                <p>• <strong>Data & AI Lead</strong> - Issue #55 (Impact 9.0)</p>
                <p><strong>Best Practice Approach:</strong></p>
                <p>• Start recruitment immediately upon budget approval</p>
                <p>• Consider interim consultants while recruiting</p>
                <p>• Define clear job descriptions with measurable objectives</p>
                <p>• Competitive compensation to attract top talent</p>
                <p><strong>Success Criteria:</strong></p>
                <p>• All three roles filled by end of Q2 2026</p>
                <p>• 90-day plans developed for each role</p>
                <p>• Team building roadmap established</p>`
            },
            'y1-pmo': {
                title: 'Establish PMO',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Report Issue #1, #11</span>
                    <span class="ref-category">Year 1 Priority</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Impact: 10.0</span>
                    <span class="metric priority-p0">Deloitte Priority: P0</span>
                </div>
                <p><strong>Deloitte Recommendation:</strong> Establish PMO as critical foundation for successful IT transformation delivery.</p>
                <p><strong>Current State:</strong> No PMO exists. Projects managed ad-hoc without standardized approach.</p>
                <p><strong>Key Components:</strong></p>
                <p>• <strong>Project Methodology</strong> - Implement hybrid Agile/Waterfall approach</p>
                <p>• <strong>Portfolio Management</strong> - Centralized view of all IT initiatives</p>
                <p>• <strong>Resource Management</strong> - Capacity planning and allocation</p>
                <p>• <strong>Project Governance</strong> - Stage gates, approvals, escalation</p>
                <p>• <strong>Reporting & Dashboards</strong> - Real-time project status visibility</p>
                <p><strong>Best Practice Approach:</strong></p>
                <p>• Start lean - governance and methodology first</p>
                <p>• Implement PMO tools (MS Project, Jira, or similar)</p>
                <p>• Define project intake and prioritization process</p>
                <p>• Establish weekly/monthly reporting cadence</p>
                <p>• Create project templates and artifacts</p>
                <p><strong>Success Criteria:</strong></p>
                <p>• PMO Lead hired by Q1 2026</p>
                <p>• PMO operational by Q2 2026</p>
                <p>• All major projects tracked in portfolio by Q3 2026</p>
                <p>• Project success rate improvement measured</p>`
            },
            'y1-governance': {
                title: 'IT Governance Framework',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Report Issues #11, #12</span>
                    <span class="ref-category">Year 1 Priority</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Impact: 10.0</span>
                    <span class="metric priority-p0">Deloitte Priority: P0</span>
                </div>
                <p><strong>Deloitte Recommendation:</strong> Establish IT governance as foundation for all transformation initiatives.</p>
                <p><strong>Key Components:</strong></p>
                <p>• <strong>IT Steering Committee</strong> - Executive oversight body</p>
                <p>• <strong>Policies & Standards</strong> - Document all IT policies</p>
                <p>• <strong>Project Governance</strong> - PMO and project prioritization</p>
                <p>• <strong>Data Governance</strong> - Issue #12 (Impact 10.0)</p>
                <p><strong>Best Practice Approach:</strong></p>
                <p>• Adopt COBIT framework for IT governance</p>
                <p>• Implement ITIL for service management</p>
                <p>• Establish Architecture Review Board</p>
                <p>• Define RACI for key decisions</p>
                <p><strong>Success Criteria:</strong></p>
                <p>• Steering Committee operational by Q1 2026</p>
                <p>• Core policies documented by Q2 2026</p>
                <p>• ISO 27001 certification initiated</p>`
            },
            'y1-epm': {
                title: 'Oracle EPM Implementation',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Report Issue #42</span>
                    <span class="ref-category">Year 1 Priority</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Impact: 10.0</span>
                    <span class="metric priority-p0">Deloitte Priority: P0</span>
                </div>
                <p><strong>Deloitte Recommendation:</strong> Complete Enterprise Performance Management implementation as foundation for financial transformation.</p>
                <p><strong>Issue Background:</strong> Missing Finance EPM System - No consolidated financial planning and reporting capability.</p>
                <p><strong>Implementation Scope:</strong></p>
                <p>• Financial consolidation across all entities</p>
                <p>• Budgeting and planning module</p>
                <p>• Management reporting and dashboards</p>
                <p>• Profitability and cost management</p>
                <p><strong>Best Practice Approach:</strong></p>
                <p>• Phased rollout starting with consolidation</p>
                <p>• Standardize Chart of Accounts first</p>
                <p>• Define KPIs and reporting requirements</p>
                <p>• Train finance users thoroughly</p>
                <p><strong>Success Criteria:</strong></p>
                <p>• Go-live by Q3 2026</p>
                <p>• All entities consolidated</p>
                <p>• Automated monthly close process</p>`
            },
            'y1-security': {
                title: 'Critical Security Tools',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Report Issues #26, #27, #30</span>
                    <span class="ref-category">Year 1 Priority</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric high">Impact: 8.0</span>
                    <span class="metric priority-p1">Deloitte Priority: P1</span>
                </div>
                <p><strong>Deloitte Recommendation:</strong> Deploy essential security controls to address critical vulnerabilities.</p>
                <p><strong>Priority Tools:</strong></p>
                <p>• <strong>SIEM</strong> - Security event monitoring</p>
                <p>• <strong>EDR</strong> - Endpoint detection and response</p>
                <p>• <strong>IAM</strong> - Identity and access management</p>
                <p>• <strong>DLP</strong> - Data loss prevention</p>
                <p><strong>Related Issues:</strong></p>
                <p>• Issue #26: Heavy Third-Party Vendor Dependency</p>
                <p>• Issue #27: Inadequate Network Segmentation</p>
                <p>• Issue #30: No Data Classification</p>
                <p><strong>Best Practice Approach:</strong></p>
                <p>• Start with SIEM for visibility</p>
                <p>• Deploy EDR to all endpoints</p>
                <p>• Implement MFA across all systems</p>
                <p>• Classify critical data assets</p>
                <p><strong>Success Criteria:</strong></p>
                <p>• 100% endpoint coverage by Q4 2026</p>
                <p>• 24/7 monitoring capability established</p>`
            },
            // ===== Slide 14: Year 2 Initiatives =====
            'y2-overview': {
                title: 'Year 2 (2027) - Overview',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Growth Year</span>
                    <span class="ref-category">SHOULD DO</span>
                </div>
                <p><strong>Year 2 Goal:</strong> ERP core build complete, HRMS live, Treasury & Procurement deployed, cloud migration started, AI analytics operational.</p>
                <p><strong>Key Focus Areas:</strong></p>
                <ul class="detail-bullets">
                    <li><strong>People (H1-H3)</strong> - Cyber Engineer, GRC Specialist, IDAM Specialist operational</li>
                    <li><strong>ERP & Apps (T2, T10, T15, E)</strong> - ERP core build, HRMS go-live, Treasury, Procurement, GRC</li>
                    <li><strong>Technology (T12, T14)</strong> - SOC/NOC 24/7 operations, Cloud migration start</li>
                    <li><strong>Data & AI</strong> - GRC Analytics, Audit Analytics</li>
                </ul>
                <p><strong>Critical Milestones:</strong></p>
                <ul class="detail-bullets">
                    <li>Q1-Q3: ERP Core Build & Data Migration</li>
                    <li>Q1-Q3: HRMS Configuration & Go-Live</li>
                    <li>Q2-Q4: SAP Ariba Procurement Implementation</li>
                    <li>Q3-Q4: Cloud migration begins, AI analytics deployment</li>
                </ul>
                <p><em>See "Year 2 - Program" slide for detailed quarterly timeline.</em></p>`
            },
            'y2-erp': {
                title: 'Core ERP Modernization',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Report Issues #20, #40</span>
                    <span class="ref-category">Year 2 Priority</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Impact: 10.0</span>
                    <span class="metric priority-p0">Deloitte Priority: P0</span>
                </div>
                <p><strong>Deloitte Recommendation:</strong> Modernize legacy ERP to S/4 HANA Private Cloud as core transformation initiative.</p>
                <p><strong>Issue Background:</strong></p>
                <p>• Issue #20: Legacy ERP System Requires Replacement</p>
                <p>• Issue #40: Legacy ERP Core System (SAP ECC)</p>
                <p><strong>Implementation Scope:</strong></p>
                <p>• Finance and Controlling (FICO)</p>
                <p>• Materials Management (MM)</p>
                <p>• Sales and Distribution (SD)</p>
                <p>• Production Planning (PP) where applicable</p>
                <p><strong>Best Practice Approach:</strong></p>
                <p>• Greenfield implementation recommended</p>
                <p>• Standardize processes before configuration</p>
                <p>• Phased entity rollout</p>
                <p>• Extensive change management</p>
                <p><strong>Success Criteria:</strong></p>
                <p>• Pilot entity live by Q2 2027</p>
                <p>• Full rollout by Q4 2027</p>`
            },
            'y2-hrms': {
                title: 'HRMS Implementation',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Report Issues #25, #41</span>
                    <span class="ref-category">Year 2 Priority</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Impact: 10.0</span>
                    <span class="metric priority-p0">Deloitte Priority: P0</span>
                </div>
                <p><strong>Deloitte Recommendation:</strong> Implement unified HRMS to replace fragmented solutions.</p>
                <p><strong>Issue Background:</strong></p>
                <p>• Issue #25: Missing Business Applications (HRMS)</p>
                <p>• Issue #41: Fragmented HRMS Solutions (Ad-hoc, Multiple Vendors)</p>
                <p><strong>Implementation Scope:</strong></p>
                <p>• Core HR and employee master data</p>
                <p>• Payroll processing</p>
                <p>• Time and attendance</p>
                <p>• Performance management</p>
                <p>• Learning management</p>
                <p><strong>Best Practice Approach:</strong></p>
                <p>• Cloud-based HRMS solution</p>
                <p>• Integrate with ERP for financials</p>
                <p>• Employee self-service portal</p>
                <p>• Mobile-first approach</p>
                <p><strong>Success Criteria:</strong></p>
                <p>• Single HRMS for all entities</p>
                <p>• Automated payroll processing</p>
                <p>• Employee self-service adoption >80%</p>`
            },
            'y2-soc-noc': {
                title: 'SOC/NOC Establishment',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Report Issue #28</span>
                    <span class="ref-category">Year 2 Priority</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric high">Impact: 8.0</span>
                    <span class="metric priority-p1">Deloitte Priority: P1</span>
                </div>
                <p><strong>Deloitte Recommendation:</strong> Establish internal Security and Network Operations Centers to reduce vendor dependency.</p>
                <p><strong>Issue Background:</strong> Outsourced Security Monitoring (SOC/NOC) - Limited visibility and control over security operations.</p>
                <p><strong>Implementation Scope:</strong></p>
                <p>• Security Operations Center (SOC)</p>
                <p>• Network Operations Center (NOC)</p>
                <p>• Integrated monitoring platform</p>
                <p>• Incident management processes</p>
                <p><strong>Best Practice Approach:</strong></p>
                <p>• Start with hybrid model (internal + MSSP)</p>
                <p>• Implement SOAR for automation</p>
                <p>• Define playbooks for common incidents</p>
                <p>• Establish escalation procedures</p>
                <p><strong>Success Criteria:</strong></p>
                <p>• 24/7 monitoring capability</p>
                <p>• Mean time to detect (MTTD) < 1 hour</p>
                <p>• Mean time to respond (MTTR) < 4 hours</p>`
            },
            'y2-network': {
                title: 'Network Segmentation',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Report Issue #27</span>
                    <span class="ref-category">Year 2 Priority</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric high">Impact: 8.0</span>
                    <span class="metric priority-p1">Deloitte Priority: P1</span>
                </div>
                <p><strong>Deloitte Recommendation:</strong> Implement network segmentation to limit blast radius of security incidents.</p>
                <p><strong>Issue Background:</strong> Inadequate Network Segmentation - Flat network architecture increases risk exposure.</p>
                <p><strong>Implementation Scope:</strong></p>
                <p>• Network zone architecture design</p>
                <p>• VLAN segmentation</p>
                <p>• Micro-segmentation for critical assets</p>
                <p>• Zero Trust network access</p>
                <p><strong>Best Practice Approach:</strong></p>
                <p>• Define security zones based on data sensitivity</p>
                <p>• Implement next-gen firewalls between zones</p>
                <p>• Deploy network access control (NAC)</p>
                <p>• Monitor east-west traffic</p>
                <p><strong>Success Criteria:</strong></p>
                <p>• Critical systems isolated</p>
                <p>• Zero Trust architecture implemented</p>
                <p>• Full network visibility achieved</p>`
            },
            // ===== Slide 16: Year 3 Initiatives =====
            'y3-overview': {
                title: 'Year 3 (2028) - Overview',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Optimization Year</span>
                    <span class="ref-category">NICE TO HAVE</span>
                </div>
                <p><strong>Year 3 Goal:</strong> ERP & Treasury live, cloud-first achieved, ISO 27001 certified, AI/RPA scaled enterprise-wide, full 16 FTE team operational.</p>
                <p><strong>Key Focus Areas:</strong></p>
                <ul class="detail-bullets">
                    <li><strong>People:</strong> App Developer hire, continuous team skilling, full 16 FTE operational</li>
                    <li><strong>ERP & Applications:</strong> S/4 HANA UAT and Go-Live, Treasury Go-Live, Procurement operations</li>
                    <li><strong>Infrastructure:</strong> Cloud migration complete, 24/7 SOC/NOC mature operations</li>
                    <li><strong>Security:</strong> ISO 27001 certification achieved</li>
                    <li><strong>Automation:</strong> Hyper-automation, RPA deployment, AI use cases scaled enterprise-wide</li>
                </ul>
                <p><em>See "Year 3 - Program" slide for detailed quarterly timeline.</em></p>`
            },
            'y3-treasury': {
                title: 'Treasury & Procurement',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Report Issue #21</span>
                    <span class="ref-category">Year 3 Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Impact: 10.0</span>
                    <span class="metric priority-p0">Deloitte Priority: P0</span>
                </div>
                <p><strong>Deloitte Recommendation:</strong> Implement Treasury and Procurement systems to complete financial transformation.</p>
                <p><strong>Issue Background:</strong> Missing Treasury/Procurement/GRC Systems - Manual processes and limited visibility.</p>
                <p><strong>Implementation Scope:</strong></p>
                <p>• Treasury management system</p>
                <p>• Cash management and forecasting</p>
                <p>• Procurement/sourcing platform</p>
                <p>• Supplier relationship management</p>
                <p>• Contract management</p>
                <p><strong>Best Practice Approach:</strong></p>
                <p>• Integrate with core ERP (S/4 HANA)</p>
                <p>• Implement bank connectivity</p>
                <p>• Automate payment processing</p>
                <p>• Deploy supplier portal</p>
                <p><strong>Prerequisites:</strong></p>
                <p>• Core ERP must be operational</p>
                <p>• Master data governance in place</p>`
            },
            'y3-cloud': {
                title: 'Full Cloud Migration',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Report Issue #34</span>
                    <span class="ref-category">Year 3 Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric medium">Impact: 6.0</span>
                    <span class="metric priority-p2">Deloitte Priority: P2</span>
                </div>
                <p><strong>Deloitte Recommendation:</strong> Complete cloud-first infrastructure transformation for agility and cost optimization.</p>
                <p><strong>Issue Background:</strong> Limited Cloud Adoption (Hybrid Not Optimized) - Opportunity to reduce infrastructure costs and improve scalability.</p>
                <p><strong>Migration Scope:</strong></p>
                <p>• Remaining on-premise workloads</p>
                <p>• Legacy application modernization</p>
                <p>• Data center consolidation</p>
                <p>• Disaster recovery to cloud</p>
                <p><strong>Best Practice Approach:</strong></p>
                <p>• Assess workloads using 6 Rs framework</p>
                <p>• Prioritize based on business value</p>
                <p>• Implement FinOps for cost management</p>
                <p>• Maintain hybrid capability where needed</p>
                <p><strong>Success Criteria:</strong></p>
                <p>• 80%+ workloads in cloud</p>
                <p>• Data center footprint reduced by 50%</p>
                <p>• Infrastructure costs optimized by 20%</p>`
            },
            'y3-ai': {
                title: 'AI Use Case Scaling',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Report Issues #55, #56, #58</span>
                    <span class="ref-category">Year 3 Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Impact: 9.0</span>
                    <span class="metric priority-p0">Deloitte Priority: P0</span>
                </div>
                <p><strong>Deloitte Recommendation:</strong> Scale AI initiatives across business processes after establishing data foundation.</p>
                <p><strong>Related Issues:</strong></p>
                <p>• Issue #55: No AI Strategy Defined</p>
                <p>• Issue #56: No AI Governance Framework</p>
                <p>• Issue #58: No Analytics/BI Capabilities</p>
                <p><strong>AI Use Cases:</strong></p>
                <p>• Predictive maintenance (manufacturing)</p>
                <p>• Demand forecasting (supply chain)</p>
                <p>• Customer analytics (retail)</p>
                <p>• Financial forecasting</p>
                <p>• Process automation (RPA + AI)</p>
                <p><strong>Best Practice Approach:</strong></p>
                <p>• Start with proven use cases with clear ROI</p>
                <p>• Establish AI Center of Excellence</p>
                <p>• Implement MLOps for model management</p>
                <p>• Ensure responsible AI practices</p>
                <p><strong>Prerequisites:</strong></p>
                <p>• Data platform operational</p>
                <p>• Data governance in place</p>
                <p>• AI governance framework established</p>`
            },
            // ===== Slide 19: Subsidiary Strategies =====
            'sub-efi': {
                title: 'Emirates Food Industries (EFI) - Strategy',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix E</span>
                    <span class="ref-category">Subsidiary Strategy</span>
                </div>
                <p><strong>Overview:</strong> EFI requires focus on data governance, AI strategy, and continuous security monitoring to support its manufacturing operations.</p>

                <h4 style="color: var(--accent-light); margin-top: 0.75rem; margin-bottom: 0.5rem;">Priority Initiatives:</h4>

                <div class="initiative-detail">
                    <p><strong>1. Data Governance & Data Management</strong></p>
                    <p>• <em>Challenge:</em> No unified data standards, manual analysis required</p>
                    <p>• <em>Solution:</em> Implement comprehensive data governance framework</p>
                    <p>• <em>Timeline:</em> Q2-Q4 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>2. IT Maturity Assessment</strong></p>
                    <p>• <em>Challenge:</em> Lack of clear maturity level direction</p>
                    <p>• <em>Solution:</em> Assess IT landscape using international maturity models</p>
                    <p>• <em>Timeline:</em> Q1-Q2 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>3. AI Strategy & Coordination</strong></p>
                    <p>• <em>Challenge:</em> Desire to implement AI (ChatGPT) without formal strategy</p>
                    <p>• <em>Solution:</em> Develop unified AI strategy with use case prioritization</p>
                    <p>• <em>Timeline:</em> Q2-Q3 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>4. AI Governance</strong></p>
                    <p>• <em>Challenge:</em> No formal AI governance framework</p>
                    <p>• <em>Solution:</em> Establish AI governance policies and standards</p>
                    <p>• <em>Timeline:</em> Q3-Q4 2026</p>
                    <p>• <em>Dependencies:</em> AI Strategy completion</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>5. GRC Application System</strong></p>
                    <p>• <em>Challenge:</em> Manual compliance and data tasks</p>
                    <p>• <em>Solution:</em> Implement GRC platform with automated data integration</p>
                    <p>• <em>Timeline:</em> Q4 2026-Q2 2027</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>6. Continuous Cybersecurity Monitoring</strong></p>
                    <p>• <em>Challenge:</em> No periodic security assessments</p>
                    <p>• <em>Solution:</em> Implement monthly VA, quarterly VAPT, annual risk assessments</p>
                    <p>• <em>Timeline:</em> Q2 2026 onwards (continuous)</p>
                </div>`
            },
            'sub-bloom': {
                title: 'Bloom Education - Strategy',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix E</span>
                    <span class="ref-category">Subsidiary Strategy</span>
                </div>
                <p><strong>Overview:</strong> Bloom Education needs to establish formal governance, hire security expertise, and implement infrastructure redundancy for their education operations.</p>

                <h4 style="color: var(--accent-light); margin-top: 0.75rem; margin-bottom: 0.5rem;">Priority Initiatives:</h4>

                <div class="initiative-detail">
                    <p><strong>1. People Plan Development</strong></p>
                    <p>• <em>Challenge:</em> Unclear roles and responsibilities, need for cybersecurity expert</p>
                    <p>• <em>Solution:</em> Define governance structure and hire dedicated security lead</p>
                    <p>• <em>Timeline:</em> Q2-Q3 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>2. Cyber & IT Governance Framework</strong></p>
                    <p>• <em>Challenge:</em> Siloed systems, fragmented data, no formal governance</p>
                    <p>• <em>Solution:</em> Develop comprehensive governance framework</p>
                    <p>• <em>Timeline:</em> Q2-Q3 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>3. Information Security Policy House</strong></p>
                    <p>• <em>Challenge:</em> No formalized security policies aligned with ISO 27001</p>
                    <p>• <em>Solution:</em> Develop and implement security policies and procedures</p>
                    <p>• <em>Timeline:</em> Q3-Q4 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>4. Data Classification and Labelling</strong></p>
                    <p>• <em>Challenge:</em> No data classification currently in place</p>
                    <p>• <em>Solution:</em> Implement comprehensive data classification framework</p>
                    <p>• <em>Timeline:</em> Q4 2026-Q1 2027</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>5. Infrastructure Redundancy and Continuity</strong></p>
                    <p>• <em>Challenge:</em> Single point of failure in internet connectivity, no DR</p>
                    <p>• <em>Solution:</em> Deploy redundancy (MPLS/internet lines) and DR with Moro Hub</p>
                    <p>• <em>Timeline:</em> Q2-Q3 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>6. SOC/NOC Implementation</strong></p>
                    <p>• <em>Challenge:</em> Need for network monitoring capabilities</p>
                    <p>• <em>Solution:</em> Implement SOC/NOC services with Moro cloud consolidation</p>
                    <p>• <em>Timeline:</em> Q3-Q4 2026</p>
                </div>`
            },
            'sub-entrust': {
                title: 'Entrust Capital - Strategy',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix E</span>
                    <span class="ref-category">Subsidiary Strategy</span>
                </div>
                <p><strong>Overview:</strong> Entrust Capital's strategy focuses primarily on AI capabilities for market analysis and investment decision support.</p>

                <h4 style="color: var(--accent-light); margin-top: 0.75rem; margin-bottom: 0.5rem;">Priority Initiatives:</h4>

                <div class="initiative-detail">
                    <p><strong>1. AI Strategy & Coordination</strong></p>
                    <p>• <em>Challenge:</em> Lack of unified AI strategy</p>
                    <p>• <em>Solution:</em> Develop AI strategy aligned with business objectives</p>
                    <p>• <em>Timeline:</em> Q2-Q3 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>2. AI Governance</strong></p>
                    <p>• <em>Challenge:</em> No formal AI governance for ChatGPT implementation</p>
                    <p>• <em>Solution:</em> Establish AI governance framework</p>
                    <p>• <em>Timeline:</em> Q3-Q4 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>3. AI-Driven Market Analysis</strong></p>
                    <p>• <em>Challenge:</em> Need for AI capabilities for market insights</p>
                    <p>• <em>Solution:</em> Implement AI-powered market analysis tools</p>
                    <p>• <em>Timeline:</em> Q4 2026-Q2 2027</p>
                    <p>• <em>Dependencies:</em> AI Strategy and Governance completion</p>
                </div>

                <p style="margin-top: 1rem;"><strong>Key Focus Areas:</strong></p>
                <p>• Portfolio Optimization with AI algorithms</p>
                <p>• Risk Management with AI models</p>
                <p>• Market Analysis with NLP models</p>
                <p>• Asset Allocation recommendations</p>
                <p>• Company Valuation AI models</p>`
            },
            'sub-exeed': {
                title: 'Exeed Industries - Strategy',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix E</span>
                    <span class="ref-category">Subsidiary Strategy</span>
                </div>
                <p><strong>Overview:</strong> Exeed Industries requires digital maturity assessment, AI strategy, and specialized OT lifecycle management for their industrial operations.</p>

                <h4 style="color: var(--accent-light); margin-top: 0.75rem; margin-bottom: 0.5rem;">Priority Initiatives:</h4>

                <div class="initiative-detail">
                    <p><strong>1. Digital Maturity and Automation</strong></p>
                    <p>• <em>Challenge:</em> No framework to assess IT/security/automation maturity</p>
                    <p>• <em>Solution:</em> Define digital maturity framework and roadmap</p>
                    <p>• <em>Timeline:</em> Q1-Q2 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>2. AI Strategy & Coordination</strong></p>
                    <p>• <em>Challenge:</em> Lack of AI strategy to support business objectives</p>
                    <p>• <em>Solution:</em> Develop comprehensive AI strategy</p>
                    <p>• <em>Timeline:</em> Q2-Q3 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>3. AI Governance</strong></p>
                    <p>• <em>Challenge:</em> No AI governance for desired ChatGPT implementation</p>
                    <p>• <em>Solution:</em> Establish AI governance policies</p>
                    <p>• <em>Timeline:</em> Q3-Q4 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>4. Implementation of Data Lakes/Warehouses</strong></p>
                    <p>• <em>Challenge:</em> Need for data-driven decision making</p>
                    <p>• <em>Solution:</em> Implement data lake/warehouse infrastructure</p>
                    <p>• <em>Timeline:</em> Q3 2026-Q2 2027</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>5. OT Lifecycle Management</strong></p>
                    <p>• <em>Challenge:</em> No formal OT system lifecycle management</p>
                    <p>• <em>Solution:</em> Define comprehensive OT lifecycle (projects, assets, assessments, vendors, risks)</p>
                    <p>• <em>Timeline:</em> Q2-Q4 2026</p>
                </div>

                <p style="margin-top: 1rem;"><strong>Note:</strong> OT (Operational Technology) management is critical for industrial operations and requires specialized security considerations separate from IT systems.</p>`
            },
            'sub-foodquest': {
                title: 'FoodQuest - Strategy',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix E</span>
                    <span class="ref-category">Subsidiary Strategy</span>
                </div>
                <p><strong>Overview:</strong> FoodQuest needs ERP support redundancy, order automation, and video analytics to support their food service operations.</p>

                <h4 style="color: var(--accent-light); margin-top: 0.75rem; margin-bottom: 0.5rem;">Priority Initiatives:</h4>

                <div class="initiative-detail">
                    <p><strong>1. ERP Application Support Engineer</strong></p>
                    <p>• <em>Challenge:</em> Single point of failure for ERP support</p>
                    <p>• <em>Solution:</em> Build redundant support team, implement knowledge management</p>
                    <p>• <em>Timeline:</em> Q2-Q3 2026</p>
                    <p>• <em>Note:</em> Oracle ERP (NetSuite) implementation expected Q2 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>2. Cyber & IT Governance Framework</strong></p>
                    <p>• <em>Challenge:</em> Siloed systems, manual processes, risk of human error</p>
                    <p>• <em>Solution:</em> Develop comprehensive governance framework</p>
                    <p>• <em>Timeline:</em> Q2-Q3 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>3. Order Automation</strong></p>
                    <p>• <em>Challenge:</em> Manual order management processes</p>
                    <p>• <em>Solution:</em> Implement automated order management system integrated with POS</p>
                    <p>• <em>Timeline:</em> Q3-Q4 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>4. Video Surveillance Analytics</strong></p>
                    <p>• <em>Challenge:</em> Need for customer behavior insights</p>
                    <p>• <em>Solution:</em> Deploy video analytics for conversion ratio analysis</p>
                    <p>• <em>Timeline:</em> Q4 2026-Q1 2027</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>5. Data Lakes/Warehouses</strong></p>
                    <p>• <em>Challenge:</em> Need for enhanced data-driven decision making</p>
                    <p>• <em>Solution:</em> Implement data lake/warehouse infrastructure</p>
                    <p>• <em>Timeline:</em> Q1-Q3 2026</p>
                </div>

                <div class="initiative-detail">
                    <p><strong>6. GRC Application System</strong></p>
                    <p>• <em>Challenge:</em> Manual compliance data tasks</p>
                    <p>• <em>Solution:</em> Implement GRC platform with automated integration</p>
                    <p>• <em>Timeline:</em> Q2-Q3 2026</p>
                </div>`
            },
            // ===== Initiative Code Details (H, P, T, E) =====
            // HIRING & PEOPLE (H1-H4)
            'init-H1': {
                title: 'H1: Cyber & IT Team Hirings',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">People Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Priority: High</span>
                    <span class="metric">Timeline: Q2 2026 - Q3 2027</span>
                </div>
                <p><strong>Objective:</strong> Add specialized resources to enhance department capabilities and eliminate single points of failure.</p>
                <p><strong>Current Gap:</strong> Critical functions (Business Analysis, PMO, Cybersecurity) missing or inadequately defined. Multiple roles handled by same individuals.</p>
                <h4 style="color: var(--accent-light); margin-top: 0.75rem;">Hiring Roadmap:</h4>
                <table style="width: 100%; font-size: 0.625rem; margin-top: 0.5rem;">
                    <tr style="border-bottom: 1px solid var(--gray-700);"><td style="padding: 0.25rem;"><strong>Role</strong></td><td><strong>Timeline</strong></td><td><strong>Type</strong></td></tr>
                    <tr style="border-bottom: 1px solid var(--gray-700);"><td style="padding: 0.25rem;">Cybersecurity Lead</td><td>Q2 2026</td><td>FTE In-House</td></tr>
                    <tr style="border-bottom: 1px solid var(--gray-700);"><td style="padding: 0.25rem;">Data & AI Lead</td><td>Q2 2026</td><td>FTE In-House</td></tr>
                    <tr style="border-bottom: 1px solid var(--gray-700);"><td style="padding: 0.25rem;">Business Analyst</td><td>Q3 2026</td><td>On-Demand → FTE</td></tr>
                    <tr style="border-bottom: 1px solid var(--gray-700);"><td style="padding: 0.25rem;">PMO Lead</td><td>Q3 2026</td><td>On-Demand</td></tr>
                    <tr style="border-bottom: 1px solid var(--gray-700);"><td style="padding: 0.25rem;">Cloud Engineer</td><td>Q2 2026</td><td>On-Demand</td></tr>
                    <tr style="border-bottom: 1px solid var(--gray-700);"><td style="padding: 0.25rem;">Network/Security Architect</td><td>Q3 2026</td><td>On-Demand</td></tr>
                    <tr style="border-bottom: 1px solid var(--gray-700);"><td style="padding: 0.25rem;">GRC Specialist</td><td>Q3 2026</td><td>On-Demand</td></tr>
                    <tr style="border-bottom: 1px solid var(--gray-700);"><td style="padding: 0.25rem;">Cybersecurity Engineer</td><td>Q3 2026</td><td>FTE In-House</td></tr>
                    <tr><td style="padding: 0.25rem;">App Developer</td><td>On Demand</td><td>Outsourced</td></tr>
                </table>
                <p style="margin-top: 0.75rem;"><strong>Investment:</strong> 11 new roles (3 in-house FTE, 8 on-demand/outsourced)</p>
                <p><strong>Impact:</strong> Reduced single points of failure, increased capacity, specialized expertise</p>`
            },
            'init-H2': {
                title: 'H2: Team Skilling & Reskilling',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix A & B</span>
                    <span class="ref-category">People Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Priority: High</span>
                    <span class="metric">Timeline: Q1 2026 onwards (Continuous)</span>
                </div>
                <p><strong>Objective:</strong> Close skills gaps through training and certification programs.</p>
                <p><strong>Current Gap:</strong> No budget for training, certifications, or skill development. No structured career development or certification path.</p>
                <h4 style="color: var(--accent-light); margin-top: 0.75rem;">Recommended Certifications by Role:</h4>
                <p>• <strong>IT Support:</strong> ITIL Foundation, CompTIA A+, Microsoft Modern Desktop</p>
                <p>• <strong>Systems Engineer:</strong> Azure Administrator, Veeam Backup Certified</p>
                <p>• <strong>Network Lead:</strong> CCNP Enterprise, Fortinet NSE 4, TOGAF</p>
                <p>• <strong>Cloud Engineer:</strong> AWS Solutions Architect, Cloud Security</p>
                <p>• <strong>Cybersecurity Lead:</strong> CISSP/CISM, ISO 27001 Lead Implementer</p>
                <p>• <strong>Cybersecurity Engineer:</strong> Security+, CEH, SC-200</p>
                <p>• <strong>Solution Architect:</strong> TOGAF 10, Cloud Architect</p>
                <p><strong>Investment:</strong> Training budget allocation required</p>
                <p><strong>Impact:</strong> Enhanced team capabilities, improved retention, career growth paths</p>`
            },
            'init-H3': {
                title: 'H3: In-house Security Team Enablement',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">People Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Medium-High</span>
                    <span class="metric">Timeline: Q2-Q3 2026</span>
                </div>
                <p><strong>Objective:</strong> Build internal security capabilities to reduce vendor dependency.</p>
                <p><strong>Current Gap:</strong> Strong dependency on third-party vendors for cybersecurity functions. No dedicated security team.</p>
                <p><strong>Solution:</strong></p>
                <p>• Hire Cybersecurity Lead (Q2 2026)</p>
                <p>• Hire Cybersecurity Engineer (Q3 2026)</p>
                <p>• Transfer knowledge from vendors to internal team</p>
                <p>• Establish security operations procedures</p>
                <p>• Build incident response capabilities</p>
                <p><strong>Dependencies:</strong> H1 (Cyber Lead hiring must complete first)</p>
                <p><strong>Impact:</strong> Faster incident response, reduced vendor costs, better security posture</p>`
            },
            'init-H4': {
                title: 'H4: IT Performance Assessment',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">People Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Medium</span>
                    <span class="metric">Timeline: Q3 2026</span>
                </div>
                <p><strong>Objective:</strong> Implement KPI framework and performance management for IT team.</p>
                <p><strong>Current Gap:</strong> No KPIs or performance tracking mechanism. No structured methodology to assess skill gaps.</p>
                <p><strong>Solution:</strong></p>
                <p>• Define IT performance metrics and KPIs</p>
                <p>• Implement performance management tools</p>
                <p>• Establish regular review cycles</p>
                <p>• Create skill gap assessment methodology</p>
                <p>• Link performance to career development</p>
                <p><strong>Key KPIs to Track:</strong></p>
                <p>• System uptime (target: 99.9%)</p>
                <p>• Ticket resolution time</p>
                <p>• User satisfaction scores</p>
                <p>• Project delivery on-time rate</p>
                <p>• Security incident response time</p>
                <p><strong>Investment:</strong> Performance management tools</p>
                <p><strong>Impact:</strong> Measurable team performance, accountability, continuous improvement</p>`
            },
            // PROCESS (P1-P6)
            'init-P1': {
                title: 'P1: Cyber & IT Governance Framework',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Process Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Priority: High (P0)</span>
                    <span class="metric">Timeline: Q1-Q2 2026 (In Progress)</span>
                </div>
                <p><strong>Objective:</strong> Establish formal governance aligned with ISO 27001/38000 standards.</p>
                <p><strong>Current Gap:</strong> No documented IT and security governance framework. Absence of formal cybersecurity governance. Policies developed but inconsistently applied.</p>
                <p><strong>Solution Components:</strong></p>
                <p>• IT Steering Committee establishment</p>
                <p>• Governance policies and procedures</p>
                <p>• Decision-making frameworks</p>
                <p>• Risk management processes</p>
                <p>• Compliance monitoring</p>
                <h4 style="color: var(--accent-light); margin-top: 0.75rem;">Governance Structure:</h4>
                <p>• <strong>IT Steering Committee:</strong> Strategic direction, budget approval</p>
                <p>• <strong>IT Management:</strong> Requirements translation, resource allocation</p>
                <p>• <strong>Project Review Boards:</strong> Standards adherence, delivery oversight</p>
                <p>• <strong>IT Team:</strong> Execution and implementation</p>
                <p><strong>Investment:</strong> Consulting + implementation resources (Deloitte engagement)</p>
                <p><strong>Impact:</strong> Risk reduction, compliance readiness, clear accountability</p>`
            },
            'init-P2': {
                title: 'P2: Data Governance & Data Management',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Process Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Priority: High</span>
                    <span class="metric">Timeline: Q2-Q4 2026</span>
                </div>
                <p><strong>Objective:</strong> Implement data quality, security, and lifecycle management framework.</p>
                <p><strong>Current Gap:</strong> Data Governance maturity at "Initial" level. No unified data standards. Data inconsistency and lack of readily available information.</p>
                <p><strong>Solution Components:</strong></p>
                <p>• Data governance policies and standards</p>
                <p>• Data quality management processes</p>
                <p>• Data classification framework</p>
                <p>• Master data management</p>
                <p>• Data lifecycle management</p>
                <p>• Data security and privacy controls</p>
                <p><strong>Dependencies:</strong> P1 (Governance Framework)</p>
                <p><strong>Impact:</strong> Single source of truth, improved data quality, regulatory compliance, better decision-making</p>`
            },
            'init-P3': {
                title: 'P3: IT & Security Architecture Definition',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Process Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Medium-High</span>
                    <span class="metric">Timeline: Q2-Q3 2026</span>
                </div>
                <p><strong>Objective:</strong> Create reference architecture for IT, security, network, and applications.</p>
                <p><strong>Current Gap:</strong> Enterprise Architecture maturity at "Initial" level. No standardized approach to system design.</p>
                <p><strong>Solution Components:</strong></p>
                <p>• Enterprise architecture framework (TOGAF)</p>
                <p>• Security architecture blueprint</p>
                <p>• Network architecture design</p>
                <p>• Application architecture standards</p>
                <p>• Integration patterns and standards</p>
                <p>• Technology roadmap alignment</p>
                <p><strong>Dependencies:</strong> P1, hiring of Solution Architect</p>
                <p><strong>Impact:</strong> Standardized system design, reduced technical debt, scalable infrastructure</p>`
            },
            'init-P4': {
                title: 'P4: Physical Security',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Process Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Medium</span>
                    <span class="metric">Timeline: Q3 2026</span>
                </div>
                <p><strong>Objective:</strong> Implement access controls, visitor management, and surveillance for IT assets.</p>
                <p><strong>Current Gap:</strong> Physical Security maturity at "Managed" level but needs enhancement for ISO 27001 compliance.</p>
                <p><strong>Solution Components:</strong></p>
                <p>• Access control systems for data centers</p>
                <p>• Visitor management procedures</p>
                <p>• CCTV surveillance upgrades</p>
                <p>• Environmental controls monitoring</p>
                <p>• Physical security policies</p>
                <p><strong>Investment:</strong> Access control systems, CCTV upgrades</p>
                <p><strong>Impact:</strong> Enhanced premises security, ISO 27001 compliance, asset protection</p>`
            },
            'init-P5': {
                title: 'P5: Process & Workflow Optimization',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Process Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Medium</span>
                    <span class="metric">Timeline: Q3 2026 - Q2 2027</span>
                </div>
                <p><strong>Objective:</strong> Streamline and automate manual processes across IT operations.</p>
                <p><strong>Current Gap:</strong> Optimized Workflows maturity at "Initial" level. Limited automation leads to time-consuming manual processes.</p>
                <p><strong>Solution Components:</strong></p>
                <p>• Process mapping and documentation</p>
                <p>• Workflow automation tools</p>
                <p>• Self-service portals</p>
                <p>• Approval workflow digitization</p>
                <p>• Integration between systems</p>
                <p><strong>Dependencies:</strong> P1, P2</p>
                <p><strong>Impact:</strong> Efficiency gains, error reduction, faster service delivery</p>`
            },
            'init-P6': {
                title: 'P6: SharePoint Legacy Data Cleansing',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Process Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Low-Medium</span>
                    <span class="metric">Timeline: Q4 2026</span>
                </div>
                <p><strong>Objective:</strong> Archive or delete outdated SharePoint data to improve data quality and reduce costs.</p>
                <p><strong>Current Gap:</strong> Accumulated legacy data in SharePoint causing storage bloat and data quality issues.</p>
                <p><strong>Solution Components:</strong></p>
                <p>• Data inventory and classification</p>
                <p>• Retention policy definition</p>
                <p>• Archive strategy for historical data</p>
                <p>• Deletion of obsolete content</p>
                <p>• Governance for ongoing maintenance</p>
                <p><strong>Investment:</strong> Data cleansing tools/resources</p>
                <p><strong>Impact:</strong> Reduced storage costs, improved data quality, better search results, compliance</p>`
            },
            // TECHNOLOGY (T1-T15)
            'init-T1': {
                title: 'T1: Document Management System',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Medium</span>
                    <span class="metric">Timeline: Q1-Q2 2026</span>
                </div>
                <p><strong>Objective:</strong> Implement centralized document repository with version control and collaboration features.</p>
                <p><strong>Current Gap:</strong> No dedicated document management system. Documents scattered across SharePoint, email, and local drives.</p>
                <p><strong>Solution Features:</strong></p>
                <p>• Centralized document repository</p>
                <p>• Version control and audit trails</p>
                <p>• Access control and permissions</p>
                <p>• Search and metadata tagging</p>
                <p>• Workflow integration</p>
                <p>• Mobile access</p>
                <p><strong>Investment:</strong> DMS platform license + implementation</p>
                <p><strong>Impact:</strong> Improved collaboration, regulatory compliance, reduced document loss</p>`
            },
            'init-T2': {
                title: 'T2: HR Application System (HRMS)',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B & C</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Priority: High</span>
                    <span class="metric">Timeline: Q3 2026 - Q1 2027</span>
                </div>
                <p><strong>Objective:</strong> Deploy unified human resource management system across the organization.</p>
                <p><strong>Current Gap:</strong> HRMS implementation is partial/ad-hoc (maturity level 1). Excessive reliance on manual processes for payroll, benefits, compensation.</p>
                <p><strong>Recommended Solutions:</strong> SAP SuccessFactors, Oracle HCM, or Darwinbox</p>
                <h4 style="color: var(--accent-light); margin-top: 0.75rem;">Key Modules:</h4>
                <p>• Employee Central (Core HR & Payroll)</p>
                <p>• Recruiting & Onboarding</p>
                <p>• Performance & Goals</p>
                <p>• Learning & Development</p>
                <p>• Compensation Management</p>
                <p>• Workforce Analytics</p>
                <p><strong>Investment:</strong> Covered under ERP budget</p>
                <p><strong>Impact:</strong> Automated HR processes, employee self-service, better talent management</p>`
            },
            'init-T3': {
                title: 'T3: Ticketing System Rollout',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Medium</span>
                    <span class="metric">Timeline: Q2 2026</span>
                </div>
                <p><strong>Objective:</strong> Roll out IT ticketing system (ServiceDesk Plus) to all employees across the organization.</p>
                <p><strong>Current Gap:</strong> IT Service Management at "Managed" level but not fully deployed to all users.</p>
                <p><strong>Solution Features:</strong></p>
                <p>• Self-service portal for all employees</p>
                <p>• Incident management</p>
                <p>• Service request catalog</p>
                <p>• SLA tracking and reporting</p>
                <p>• Knowledge base integration</p>
                <p>• Mobile app access</p>
                <p><strong>Investment:</strong> ServiceDesk Plus licenses expansion</p>
                <p><strong>Impact:</strong> Better IT service tracking, improved user satisfaction, SLA compliance</p>`
            },
            'init-T4': {
                title: 'T4: Inventory/Asset Management System',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Medium</span>
                    <span class="metric">Timeline: Q3 2026</span>
                </div>
                <p><strong>Objective:</strong> Implement comprehensive IT asset lifecycle management system.</p>
                <p><strong>Current Gap:</strong> Asset Management at "Managed" level but lacks full lifecycle visibility and automation.</p>
                <p><strong>Solution Features:</strong></p>
                <p>• Hardware asset tracking</p>
                <p>• Software license management</p>
                <p>• Asset lifecycle management</p>
                <p>• Automated discovery</p>
                <p>• Compliance reporting</p>
                <p>• Integration with ticketing system</p>
                <p><strong>Investment:</strong> Asset management platform</p>
                <p><strong>Impact:</strong> Full asset visibility, license compliance, cost optimization</p>`
            },
            'init-T5': {
                title: 'T5: L&D Platform',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Medium</span>
                    <span class="metric">Timeline: Q4 2026</span>
                </div>
                <p><strong>Objective:</strong> Deploy Learning Management System (LMS) for structured training and skill development.</p>
                <p><strong>Current Gap:</strong> Formalized IT Training "Doesn't exist". No budget for training or certifications.</p>
                <p><strong>Solution Features:</strong></p>
                <p>• Course catalog and enrollment</p>
                <p>• Learning paths by role</p>
                <p>• Progress tracking and reporting</p>
                <p>• Certification management</p>
                <p>• Compliance training tracking</p>
                <p>• Mobile learning support</p>
                <p><strong>Investment:</strong> Learning management system license</p>
                <p><strong>Impact:</strong> Structured training, skill development tracking, compliance assurance</p>`
            },
            'init-T6': {
                title: 'T6: IAM Solution (Identity & Access Management)',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Priority: High</span>
                    <span class="metric">Timeline: Q1-Q3 2026</span>
                </div>
                <p><strong>Objective:</strong> Implement centralized identity and access management platform.</p>
                <p><strong>Current Gap:</strong> IAM at "Managed" level but lacks centralized control and automation.</p>
                <p><strong>Solution Features:</strong></p>
                <p>• Single Sign-On (SSO)</p>
                <p>• Multi-Factor Authentication (MFA)</p>
                <p>• Privileged Access Management (PAM)</p>
                <p>• Access certification and reviews</p>
                <p>• Automated provisioning/deprovisioning</p>
                <p>• Role-based access control (RBAC)</p>
                <p><strong>Investment:</strong> IAM platform license + implementation</p>
                <p><strong>Impact:</strong> Centralized access control, security enhancement, audit compliance</p>`
            },
            'init-T7': {
                title: 'T7: Finance Analytics/EPM (Oracle EPM)',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B & C</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Priority: High (P0)</span>
                    <span class="metric">Timeline: Q1-Q4 2026 (In Progress)</span>
                </div>
                <p><strong>Objective:</strong> Implement Oracle EPM for enterprise performance management and financial analytics.</p>
                <p><strong>Current Gap:</strong> Business Intelligence at "Initial" level. No tools for planning, forecasting, budgeting. Slow close processes.</p>
                <p><strong>Solution Features:</strong></p>
                <p>• Automated data collection & integration</p>
                <p>• Real-time financial reporting</p>
                <p>• Standardized budgeting with audit trails</p>
                <p>• Advanced forecasting with predictive analytics</p>
                <p>• Tax module (Q3-Q4 2026)</p>
                <p>• Consolidation and close management</p>
                <p><strong>Investment:</strong> Covered under EPM implementation budget</p>
                <p><strong>Impact:</strong> Real-time financial reporting, faster close, better forecasting</p>`
            },
            'init-T8': {
                title: 'T8: Audit Platform/Automation',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Medium</span>
                    <span class="metric">Timeline: Q2-Q4 2026</span>
                </div>
                <p><strong>Objective:</strong> Implement internal audit management system with automation capabilities.</p>
                <p><strong>Current Gap:</strong> Audits & Compliance at "Managed" level but lacks automation and centralized tracking.</p>
                <p><strong>Solution Features:</strong></p>
                <p>• Audit planning and scheduling</p>
                <p>• Risk-based audit approach</p>
                <p>• Workpaper management</p>
                <p>• Finding tracking and remediation</p>
                <p>• Automated testing where possible</p>
                <p>• Reporting and dashboards</p>
                <p><strong>Investment:</strong> Internal audit management system</p>
                <p><strong>Impact:</strong> Streamlined audit processes, better compliance tracking, risk visibility</p>`
            },
            'init-T9': {
                title: 'T9: IT Knowledge Management',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Medium</span>
                    <span class="metric">Timeline: Q4 2026</span>
                </div>
                <p><strong>Objective:</strong> Implement knowledge base platform for IT documentation and self-service.</p>
                <p><strong>Current Gap:</strong> Knowledge Management "Doesn't exist". Critical knowledge in individuals' heads.</p>
                <p><strong>Solution Features:</strong></p>
                <p>• Searchable knowledge base</p>
                <p>• How-to articles and guides</p>
                <p>• FAQs and troubleshooting</p>
                <p>• Integration with ticketing system</p>
                <p>• Content versioning and review</p>
                <p>• Analytics on article usage</p>
                <p><strong>Investment:</strong> Knowledge base platform</p>
                <p><strong>Impact:</strong> Reduced support time, knowledge retention, improved onboarding</p>`
            },
            'init-T10': {
                title: 'T10: IT Compliance Automation (GRC)',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B & C</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Priority: High</span>
                    <span class="metric">Timeline: Q2-Q3 2027</span>
                </div>
                <p><strong>Objective:</strong> Implement GRC (Governance, Risk, Compliance) platform for automated compliance monitoring.</p>
                <p><strong>Current Gap:</strong> No GRC system. Manual compliance tracking. Potential non-compliance risks.</p>
                <p><strong>Recommended Solutions:</strong> ServiceNow GRC, SAP GRC, or Archer</p>
                <p><strong>Solution Features:</strong></p>
                <p>• Policy management</p>
                <p>• Risk register and assessment</p>
                <p>• Control testing automation</p>
                <p>• Compliance monitoring</p>
                <p>• Issue and remediation tracking</p>
                <p>• Regulatory change management</p>
                <p>• Reporting and dashboards</p>
                <p><strong>Investment:</strong> Covered under ERP budget</p>
                <p><strong>Impact:</strong> Automated compliance, risk visibility, audit readiness</p>`
            },
            'init-T11': {
                title: 'T11: Network Performance Monitoring',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Medium</span>
                    <span class="metric">Timeline: Q2-Q3 2026</span>
                </div>
                <p><strong>Objective:</strong> Implement comprehensive network monitoring tools for proactive management.</p>
                <p><strong>Current Gap:</strong> Logging & Monitoring at "Managed" level but needs enhancement for proactive alerting.</p>
                <p><strong>Solution Features:</strong></p>
                <p>• Real-time network monitoring</p>
                <p>• Performance metrics and trending</p>
                <p>• Automated alerting and escalation</p>
                <p>• Bandwidth utilization tracking</p>
                <p>• Device health monitoring</p>
                <p>• Historical reporting</p>
                <p><strong>Investment:</strong> Network monitoring tools</p>
                <p><strong>Impact:</strong> Proactive network management, improved uptime, faster issue resolution</p>`
            },
            'init-T12': {
                title: 'T12: Integrated SOC and NOC',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Priority: High</span>
                    <span class="metric">Timeline: Q3-Q4 2026</span>
                </div>
                <p><strong>Objective:</strong> Establish Security Operations Center (SOC) and Network Operations Center (NOC) for 24/7 monitoring.</p>
                <p><strong>Current Gap:</strong> SOC & Advanced Threat Protection at "Managed" level but no dedicated operations center.</p>
                <p><strong>Solution Features:</strong></p>
                <p>• 24/7 security monitoring</p>
                <p>• SIEM integration</p>
                <p>• Threat detection and response</p>
                <p>• Network performance monitoring</p>
                <p>• Incident management</p>
                <p>• Log aggregation and analysis</p>
                <p>• Threat intelligence feeds</p>
                <p><strong>Investment:</strong> SOC/NOC platform + resources (or managed service)</p>
                <p><strong>Impact:</strong> 24/7 monitoring, faster threat detection, reduced incident impact</p>`
            },
            'init-T13': {
                title: 'T13: Network Segmentation',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Priority: High</span>
                    <span class="metric">Timeline: Q2-Q3 2026</span>
                </div>
                <p><strong>Objective:</strong> Implement network security zones and micro-segmentation to contain threats.</p>
                <p><strong>Current Gap:</strong> Network Segregation at "Initial" level. Flat network increases blast radius of attacks.</p>
                <p><strong>Solution Features:</strong></p>
                <p>• Network zone architecture</p>
                <p>• VLAN segmentation</p>
                <p>• Micro-segmentation for critical assets</p>
                <p>• Firewall rule optimization</p>
                <p>• Zero Trust network principles</p>
                <p>• DMZ for external-facing services</p>
                <p><strong>Investment:</strong> Network equipment + configuration</p>
                <p><strong>Impact:</strong> Enhanced security, reduced blast radius, compliance with security frameworks</p>`
            },
            'init-T14': {
                title: 'T14: Full/Hybrid Cloud',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric">Priority: Medium</span>
                    <span class="metric">Timeline: 2027 onwards</span>
                </div>
                <p><strong>Objective:</strong> Complete transition to cloud-first infrastructure for scalability and agility.</p>
                <p><strong>Current Gap:</strong> Cloud Integration at "Managed" level but primarily on-premises infrastructure.</p>
                <p><strong>Solution Features:</strong></p>
                <p>• Cloud strategy and architecture</p>
                <p>• Workload assessment and migration</p>
                <p>• Hybrid cloud connectivity</p>
                <p>• Cloud security controls</p>
                <p>• Cost optimization (FinOps)</p>
                <p>• Cloud governance</p>
                <p><strong>Investment:</strong> Cloud migration costs (phased approach)</p>
                <p><strong>Impact:</strong> Scalability, reduced hardware dependency, improved disaster recovery</p>`
            },
            'init-T15': {
                title: 'T15: ERP Strategy Implementation',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix B & C</span>
                    <span class="ref-category">Technology Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Priority: High (P0)</span>
                    <span class="metric">Timeline: 2026-2028 (Phased)</span>
                </div>
                <p><strong>Objective:</strong> Modernize enterprise resource planning systems for integrated business processes.</p>
                <p><strong>Current Gap:</strong> ERP Core at maturity level 2. Heavy reliance on manual processes. Poor master data management.</p>
                <p><strong>Implementation Phases:</strong></p>
                <p>• <strong>Phase 1 (2026):</strong> Oracle EPM - Financial planning & analytics</p>
                <p>• <strong>Phase 2 (2026):</strong> ERP Core Upgrade (S/4 HANA)</p>
                <p>• <strong>Phase 3 (2026-27):</strong> HRMS Implementation</p>
                <p>• <strong>Phase 4 (2027):</strong> Treasury & Procurement</p>
                <p>• <strong>Phase 5 (2027+):</strong> Entity Integration & Automation</p>
                <p><strong>Investment:</strong> Major budget allocation required</p>
                <p><strong>Impact:</strong> Integrated processes, operational efficiency, real-time visibility</p>`
            },
            // ERP (E)
            'init-E': {
                title: 'E: ERP Solutions Overview',
                content: `<div class="detail-reference">
                    <span class="ref-badge">Deloitte Appendix C</span>
                    <span class="ref-category">ERP Initiative</span>
                </div>
                <div class="detail-metrics">
                    <span class="metric critical">Priority: High</span>
                    <span class="metric">Timeline: 2026-2028</span>
                </div>
                <p><strong>Objective:</strong> Comprehensive ERP modernization across finance, HR, treasury, and procurement.</p>
                <h4 style="color: var(--accent-light); margin-top: 0.75rem;">ERP Modules:</h4>
                <p><strong>1. Oracle EPM</strong> (Q1-Q4 2026)</p>
                <p>• Financial planning, budgeting, forecasting</p>
                <p>• Real-time reporting and consolidation</p>
                <p><strong>2. S/4 HANA Core ERP</strong> (Q1-Q3 2026)</p>
                <p>• Finance, controlling, materials management</p>
                <p>• Enhanced productivity and compliance</p>
                <p><strong>3. HRMS</strong> (Q3 2026 - Q1 2027)</p>
                <p>• SAP SuccessFactors / Oracle / Darwinbox</p>
                <p>• Unified HR management</p>
                <p><strong>4. Treasury Management - KYRIBA</strong> (Q1-Q2 2027)</p>
                <p>• Cash management, forecasting</p>
                <p>• Strategic supplier relationships</p>
                <p><strong>5. Procurement - SAP Ariba</strong> (Q2-Q4 2027)</p>
                <p>• Procurement efficiency</p>
                <p>• Cost savings and compliance</p>
                <p><strong>6. GRC - ServiceNow</strong> (Q2-Q3 2027)</p>
                <p>• Governance, risk, compliance automation</p>`
            },
            // ===== Slide 15: ERP Roadmap Phases =====
            'erp-epm': {
                title: 'Phase 1: EPM - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Phase</span>
                        <span class="gantt-quarter">Q1</span>
                        <span class="gantt-quarter">Q2</span>
                        <span class="gantt-quarter">Q3</span>
                        <span class="gantt-quarter">Q4</span>
                        <span class="gantt-quarter">Q1</span>
                        <span class="gantt-quarter">Q2</span>
                        <span class="gantt-quarter">Q3</span>
                        <span class="gantt-quarter">Q4</span>
                        <span class="gantt-quarter">Q1</span>
                        <span class="gantt-quarter">Q2</span>
                        <span class="gantt-quarter">Q3</span>
                        <span class="gantt-quarter">Q4</span>
                    </div>
                    <div class="gantt-year-labels">
                        <span class="gantt-year-spacer"></span>
                        <span class="gantt-year">2026</span>
                        <span class="gantt-year">2027</span>
                        <span class="gantt-year">2028</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Vendor Selection</span>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-1">RFP</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Blueprint & Design</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-2">Design</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Build & Configure</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-2">Build</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">UAT & Training</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar deployment span-1">Test</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Go-Live & Support</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar ongoing span-2">Live</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color planning"></span>Planning</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color implementation"></span>Build</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color deployment"></span>Testing</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color ongoing"></span>Operations</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Milestone:</strong> EPM Go-Live Q3 2027 | Deloitte Priority: P0</div>`
            },
            'erp-core': {
                title: 'Phase 2: Core ERP - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Phase</span>
                        <span class="gantt-quarter">Q1</span>
                        <span class="gantt-quarter">Q2</span>
                        <span class="gantt-quarter">Q3</span>
                        <span class="gantt-quarter">Q4</span>
                        <span class="gantt-quarter">Q1</span>
                        <span class="gantt-quarter">Q2</span>
                        <span class="gantt-quarter">Q3</span>
                        <span class="gantt-quarter">Q4</span>
                        <span class="gantt-quarter">Q1</span>
                        <span class="gantt-quarter">Q2</span>
                        <span class="gantt-quarter">Q3</span>
                        <span class="gantt-quarter">Q4</span>
                    </div>
                    <div class="gantt-year-labels">
                        <span class="gantt-year-spacer"></span>
                        <span class="gantt-year">2026</span>
                        <span class="gantt-year">2027</span>
                        <span class="gantt-year">2028</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Prepare & Discover</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-2">Prep</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Explore & Design</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-2">Design</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Realize & Build</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-3">Build</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Deploy & Test</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar deployment span-1">UAT</div></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Go-Live & Run</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar ongoing span-1">Live</div></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color planning"></span>Planning</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color implementation"></span>Build</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color deployment"></span>Testing</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color ongoing"></span>Operations</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Milestone:</strong> S/4 HANA Go-Live Q4 2028 | Deloitte Priority: P0</div>`
            },
            'erp-hrms': {
                title: 'Phase 3: HRMS - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Phase</span>
                        <span class="gantt-quarter">Q1</span>
                        <span class="gantt-quarter">Q2</span>
                        <span class="gantt-quarter">Q3</span>
                        <span class="gantt-quarter">Q4</span>
                        <span class="gantt-quarter">Q1</span>
                        <span class="gantt-quarter">Q2</span>
                        <span class="gantt-quarter">Q3</span>
                        <span class="gantt-quarter">Q4</span>
                        <span class="gantt-quarter">Q1</span>
                        <span class="gantt-quarter">Q2</span>
                        <span class="gantt-quarter">Q3</span>
                        <span class="gantt-quarter">Q4</span>
                    </div>
                    <div class="gantt-year-labels">
                        <span class="gantt-year-spacer"></span>
                        <span class="gantt-year">2026</span>
                        <span class="gantt-year">2027</span>
                        <span class="gantt-year">2028</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Requirements</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-1">Req</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Vendor & Design</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-2">Design</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Configuration</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-2">Config</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Data Migration</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar deployment span-1">Migrate</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Go-Live & Rollout</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar ongoing span-2">Live</div></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color planning"></span>Planning</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color implementation"></span>Build</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color deployment"></span>Migration</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color ongoing"></span>Operations</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Milestone:</strong> HRMS Go-Live Q3 2028 | Deloitte Priority: P0</div>`
            },
            'erp-treasury': {
                title: 'Phase 4: Treasury & Procurement - Timeline',
                content: `<div class="gantt-container">
                    <div class="gantt-header">
                        <span class="gantt-header-label">Phase</span>
                        <span class="gantt-quarter">Q1</span>
                        <span class="gantt-quarter">Q2</span>
                        <span class="gantt-quarter">Q3</span>
                        <span class="gantt-quarter">Q4</span>
                        <span class="gantt-quarter">Q1</span>
                        <span class="gantt-quarter">Q2</span>
                        <span class="gantt-quarter">Q3</span>
                        <span class="gantt-quarter">Q4</span>
                        <span class="gantt-quarter">Q1</span>
                        <span class="gantt-quarter">Q2</span>
                        <span class="gantt-quarter">Q3</span>
                        <span class="gantt-quarter">Q4</span>
                    </div>
                    <div class="gantt-year-labels">
                        <span class="gantt-year-spacer"></span>
                        <span class="gantt-year">2026</span>
                        <span class="gantt-year">2027</span>
                        <span class="gantt-year">2028</span>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Requirements</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-1">Req</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Design & Vendor</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar planning span-1">Design</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Implementation</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar implementation span-2">Build</div></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Bank Integration</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar deployment span-1">Integrate</div></div>
                        <div class="gantt-bar-cell"></div>
                    </div>
                    <div class="gantt-row">
                        <span class="gantt-task">Go-Live</span>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"></div>
                        <div class="gantt-bar-cell"><div class="gantt-bar ongoing span-1">Live</div></div>
                    </div>
                    <div class="gantt-legend">
                        <div class="gantt-legend-item"><span class="gantt-legend-color planning"></span>Planning</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color implementation"></span>Build</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color deployment"></span>Integration</div>
                        <div class="gantt-legend-item"><span class="gantt-legend-color ongoing"></span>Operations</div>
                    </div>
                </div>
                <div class="gantt-milestone"><strong>Milestone:</strong> Treasury/Procurement Go-Live Q4 2028 | Deloitte Priority: P0</div>`
            },
            // ===== Slide 21: Appendices =====
            'appendix-a': {
                title: 'Appendix A: Initiative Catalog',
                content: `<div class="section-header">H = Hiring & People (4 Initiatives)</div>
                <table class="panel-table">
                    <tr><th>Code</th><th>Initiative</th><th>Year</th></tr>
                    <tr><td class="code-col">H1</td><td>Cyber & IT Team Hirings (11 roles)</td><td class="priority-col"><span class="priority-y1">Y1-2</span></td></tr>
                    <tr><td class="code-col">H2</td><td>Team Skilling & Reskilling</td><td class="priority-col"><span class="priority-y1">Y1-3</span></td></tr>
                    <tr><td class="code-col">H3</td><td>In-house Security Team Enablement</td><td class="priority-col"><span class="priority-y2">Y2</span></td></tr>
                    <tr><td class="code-col">H4</td><td>IT Performance Assessment & KPIs</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                </table>

                <div class="section-header">P = Process (6 Initiatives)</div>
                <table class="panel-table">
                    <tr><th>Code</th><th>Initiative</th><th>Year</th></tr>
                    <tr><td class="code-col">P1</td><td>Cyber & IT Governance Framework</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">P2</td><td>Data Governance & Data Management</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">P3</td><td>IT & Security Architecture Definition</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">P4</td><td>Physical Security</td><td class="priority-col"><span class="priority-y2">Y2</span></td></tr>
                    <tr><td class="code-col">P5</td><td>Process & Workflow Optimization</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">P6</td><td>SharePoint Legacy Data Cleansing</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                </table>

                <div class="section-header">T = Technology (15 Initiatives)</div>
                <table class="panel-table">
                    <tr><th>Code</th><th>Initiative</th><th>Year</th></tr>
                    <tr><td class="code-col">T1</td><td>Document Management System</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">T2</td><td>HR Application System (HRMS)</td><td class="priority-col"><span class="priority-y2">Y2</span></td></tr>
                    <tr><td class="code-col">T3</td><td>Ticketing System Rollout</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">T4</td><td>Inventory/Asset Management</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">T5</td><td>L&D Platform</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">T6</td><td>IAM Solution (Identity & Access)</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">T7</td><td>Finance Analytics/EPM</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">T8</td><td>Audit Platform/Automation</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">T9</td><td>IT Knowledge Management</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">T10</td><td>IT Compliance Automation (GRC)</td><td class="priority-col"><span class="priority-y2">Y2</span></td></tr>
                    <tr><td class="code-col">T11</td><td>Network Performance Monitoring</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">T12</td><td>Integrated SOC and NOC</td><td class="priority-col"><span class="priority-y1">Y1-2</span></td></tr>
                    <tr><td class="code-col">T13</td><td>Network Segmentation</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">T14</td><td>Full/Hybrid Cloud Migration</td><td class="priority-col"><span class="priority-y2">Y2-3</span></td></tr>
                    <tr><td class="code-col">T15</td><td>ERP Strategy Implementation</td><td class="priority-col"><span class="priority-y2">Y2-3</span></td></tr>
                </table>

                <div class="section-header">E = ERP Solutions (4 Modules)</div>
                <table class="panel-table">
                    <tr><th>Code</th><th>Module</th><th>Year</th></tr>
                    <tr><td class="code-col">E1</td><td>Oracle EPM (Finance Analytics)</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td class="code-col">E2</td><td>S/4 HANA (Core ERP)</td><td class="priority-col"><span class="priority-y2">Y2-3</span></td></tr>
                    <tr><td class="code-col">E3</td><td>Treasury Management (KYRIBA)</td><td class="priority-col"><span class="priority-y3">Y3</span></td></tr>
                    <tr><td class="code-col">E4</td><td>Procurement (SAP Ariba)</td><td class="priority-col"><span class="priority-y3">Y3</span></td></tr>
                </table>

                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Deliverable</span>
                    <span class="ref-category">33 Initiatives | 3-Year Roadmap</span>
                </div>`
            },
            'appendix-b': {
                title: 'Appendix B: Technical Architecture',
                content: `<div class="section-header">Current State Assessment</div>
                <table class="panel-table">
                    <tr><th>Domain</th><th>Current State</th><th>Gap</th></tr>
                    <tr><td>ERP</td><td>Oracle EBS (aging)</td><td class="priority-col"><span class="risk-critical">Critical</span></td></tr>
                    <tr><td>Identity</td><td>No centralized IAM</td><td class="priority-col"><span class="risk-critical">Critical</span></td></tr>
                    <tr><td>Security</td><td>Manual monitoring</td><td class="priority-col"><span class="risk-critical">Critical</span></td></tr>
                    <tr><td>Cloud</td><td>0% workloads</td><td class="priority-col"><span class="risk-high">High</span></td></tr>
                    <tr><td>Network</td><td>Flat, unsegmented</td><td class="priority-col"><span class="risk-high">High</span></td></tr>
                    <tr><td>DR/BCP</td><td>No formal plan</td><td class="priority-col"><span class="risk-critical">Critical</span></td></tr>
                    <tr><td>Vendors</td><td>28 across 4 entities</td><td class="priority-col"><span class="risk-high">High</span></td></tr>
                </table>

                <div class="section-header">Target State Architecture (2028)</div>
                <table class="panel-table">
                    <tr><th>Domain</th><th>Target</th><th>KPI</th></tr>
                    <tr><td>ERP</td><td>S/4 HANA (Single Instance)</td><td>100% modules live</td></tr>
                    <tr><td>Identity</td><td>SSO + MFA + PAM</td><td>100% user coverage</td></tr>
                    <tr><td>Security</td><td>24/7 SOC/NOC</td><td>&lt;15min response</td></tr>
                    <tr><td>Cloud</td><td>Hybrid Cloud</td><td>70% migrated</td></tr>
                    <tr><td>Network</td><td>Segmented + NAC</td><td>Zero Trust enabled</td></tr>
                    <tr><td>DR/BCP</td><td>Active-Passive</td><td>RTO 4hr, RPO 1hr</td></tr>
                    <tr><td>Vendors</td><td>Consolidated</td><td>28 → 15 vendors</td></tr>
                    <tr><td>Availability</td><td>Critical Systems</td><td>99.9% uptime</td></tr>
                </table>

                <div class="section-header">Architecture Milestones</div>
                <table class="panel-table">
                    <tr><th>Quarter</th><th>Milestone</th><th>Status</th></tr>
                    <tr><td>Q2 2026</td><td>Governance & Architecture Defined</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td>Q4 2026</td><td>IAM & SSO Deployed</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td>Q2 2027</td><td>SOC/NOC 24/7 Operational</td><td class="priority-col"><span class="priority-y2">Y2</span></td></tr>
                    <tr><td>Q4 2027</td><td>Cloud Migration Started</td><td class="priority-col"><span class="priority-y2">Y2</span></td></tr>
                    <tr><td>Q3 2028</td><td>S/4 HANA Go-Live</td><td class="priority-col"><span class="priority-y3">Y3</span></td></tr>
                    <tr><td>Q4 2028</td><td>Full Cloud Migration</td><td class="priority-col"><span class="priority-y3">Y3</span></td></tr>
                </table>

                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Deliverable</span>
                    <span class="ref-category">Enterprise Architecture Roadmap</span>
                </div>`
            },
            'appendix-c': {
                title: 'Appendix C: Risk Register',
                content: `<div class="section-header">Risk Summary (60 Total)</div>
                <table class="panel-table">
                    <tr><th>Priority</th><th>Count</th><th>Status</th></tr>
                    <tr><td><span class="risk-critical">P0 Critical</span></td><td class="impact-col">13</td><td>Immediate action</td></tr>
                    <tr><td><span class="risk-high">P1 High</span></td><td class="impact-col">16</td><td>Year 1 priority</td></tr>
                    <tr><td><span class="priority-y2">P2 Medium</span></td><td class="impact-col">22</td><td>Year 2 addressed</td></tr>
                    <tr><td><span class="priority-y3">P3 Low</span></td><td class="impact-col">9</td><td>Monitored</td></tr>
                </table>

                <div class="section-header">Critical Risks (P0) - Top 13</div>
                <table class="panel-table">
                    <tr><th>Risk</th><th>Impact</th><th>Mitigation</th></tr>
                    <tr><td>No Cybersecurity Lead</td><td class="impact-col">10</td><td>H1: Hire by Q2'26</td></tr>
                    <tr><td>Missing IT Governance</td><td class="impact-col">9.5</td><td>P1: Framework Q1'26</td></tr>
                    <tr><td>Single Points of Failure</td><td class="impact-col">9</td><td>H1: Key roles backup</td></tr>
                    <tr><td>No Disaster Recovery</td><td class="impact-col">9</td><td>T14: DR by Q4'27</td></tr>
                    <tr><td>Aging ERP (Oracle EBS)</td><td class="impact-col">8.5</td><td>T15: S/4 HANA</td></tr>
                    <tr><td>No IAM/SSO</td><td class="impact-col">8.5</td><td>T6: IAM by Q4'26</td></tr>
                    <tr><td>Manual Security Monitoring</td><td class="impact-col">8</td><td>T12: SOC by Q2'27</td></tr>
                    <tr><td>Flat Network Architecture</td><td class="impact-col">8</td><td>T13: Segment Q4'26</td></tr>
                    <tr><td>No Data Classification</td><td class="impact-col">7.5</td><td>P2: Policy Q2'26</td></tr>
                    <tr><td>Vendor Sprawl (28)</td><td class="impact-col">7</td><td>Consolidate to 15</td></tr>
                    <tr><td>No Security Architecture</td><td class="impact-col">7</td><td>P3: Define Q1'26</td></tr>
                    <tr><td>Knowledge Loss Risk</td><td class="impact-col">7</td><td>T9: KM System</td></tr>
                    <tr><td>No BCP Testing</td><td class="impact-col">6.5</td><td>Annual DR drills</td></tr>
                </table>

                <div class="section-header">Risk Mitigation KPIs</div>
                <table class="panel-table">
                    <tr><th>KPI</th><th>Current</th><th>Target</th></tr>
                    <tr><td>Critical risks mitigated</td><td class="impact-col">0/13</td><td>13/13 by Q4'27</td></tr>
                    <tr><td>Risk review frequency</td><td class="impact-col">Ad-hoc</td><td>Bi-weekly</td></tr>
                    <tr><td>Avg time to mitigation</td><td class="impact-col">N/A</td><td>&lt;90 days</td></tr>
                    <tr><td>Risk escalation rate</td><td class="impact-col">N/A</td><td>&lt;10%</td></tr>
                    <tr><td>Controls effectiveness</td><td class="impact-col">40%</td><td>95%</td></tr>
                </table>

                <div class="detail-reference">
                    <span class="ref-badge">Deloitte Assessment</span>
                    <span class="ref-category">60 Risks | Bi-weekly Review</span>
                </div>`
            },
            'appendix-d': {
                title: 'Appendix D: Budget Details',
                content: `<div class="section-header">Investment by Category</div>
                <table class="panel-table">
                    <tr><th>Category</th><th>Allocation</th><th>Key Items</th></tr>
                    <tr><td class="code-col">H</td><td>~25%</td><td>11 roles: Cyber Lead, Data Lead, PMO, Engineers</td></tr>
                    <tr><td class="code-col">P</td><td>~5%</td><td>Governance, Policies, Training</td></tr>
                    <tr><td class="code-col">T</td><td>~45%</td><td>IAM, SOC/NOC, Cloud, Network</td></tr>
                    <tr><td class="code-col">E</td><td>~25%</td><td>S/4 HANA, Treasury, Procurement</td></tr>
                </table>

                <div class="section-header">3-Year Investment Phasing</div>
                <table class="panel-table">
                    <tr><th>Year</th><th>Phase</th><th>Focus Areas</th></tr>
                    <tr><td class="priority-col"><span class="priority-y1">Y1</span></td><td>Foundation</td><td>Hiring, Governance, Security Basics</td></tr>
                    <tr><td class="priority-col"><span class="priority-y2">Y2</span></td><td>Transform</td><td>ERP Build, Cloud Migration, SOC</td></tr>
                    <tr><td class="priority-col"><span class="priority-y3">Y3</span></td><td>Optimize</td><td>ERP Go-Live, Automation, AI</td></tr>
                </table>

                <div class="section-header">Major Investment Items</div>
                <table class="panel-table">
                    <tr><th>Initiative</th><th>Category</th><th>Year</th></tr>
                    <tr><td>S/4 HANA Implementation</td><td class="code-col">E</td><td class="priority-col"><span class="priority-y2">Y2-3</span></td></tr>
                    <tr><td>SOC/NOC Setup & Operations</td><td class="code-col">T</td><td class="priority-col"><span class="priority-y1">Y1-2</span></td></tr>
                    <tr><td>Cloud Migration (Hybrid)</td><td class="code-col">T</td><td class="priority-col"><span class="priority-y2">Y2-3</span></td></tr>
                    <tr><td>IAM/SSO Platform</td><td class="code-col">T</td><td class="priority-col"><span class="priority-y1">Y1</span></td></tr>
                    <tr><td>Cybersecurity Team (5 FTE)</td><td class="code-col">H</td><td class="priority-col"><span class="priority-y1">Y1-2</span></td></tr>
                    <tr><td>Treasury (KYRIBA)</td><td class="code-col">E</td><td class="priority-col"><span class="priority-y3">Y3</span></td></tr>
                    <tr><td>Procurement (SAP Ariba)</td><td class="code-col">E</td><td class="priority-col"><span class="priority-y3">Y3</span></td></tr>
                </table>

                <div class="section-header">Financial KPIs</div>
                <table class="panel-table">
                    <tr><th>KPI</th><th>Target</th><th>Benefit</th></tr>
                    <tr><td>Budget Variance</td><td>&lt;10%</td><td>Cost control</td></tr>
                    <tr><td>CapEx/OpEx Ratio</td><td>60/40</td><td>Cash flow balance</td></tr>
                    <tr><td>Contingency Reserve</td><td>15%</td><td>Risk buffer</td></tr>
                    <tr><td>ROI Timeline</td><td>3-5 years</td><td>Value realization</td></tr>
                    <tr><td>Vendor Consolidation</td><td>28→15</td><td>15% cost reduction</td></tr>
                    <tr><td>Automation Savings</td><td>60%</td><td>Manual process reduction</td></tr>
                    <tr><td>Security Incidents</td><td>-80%</td><td>Risk cost avoidance</td></tr>
                </table>

                <div class="detail-reference">
                    <span class="ref-badge">Financial Planning</span>
                    <span class="ref-category">Confidential | 3-Year Investment</span>
                </div>`
            }
        };
        this.init();
    }

    init() {
        this.panel = document.getElementById('sideDetailPanel');
        this.titleEl = document.getElementById('sidePanelTitle');
        this.contentEl = document.getElementById('sidePanelContent');
        this.closeBtn = document.getElementById('sidePanelClose');
        this.resizeHandle = document.getElementById('sidePanelResize');
        this.clickableItems = document.querySelectorAll('.clickable-item');
        this.activeItem = null;
        this.isResizing = false;
        this.panelWidth = 420; // Default width
        this.minWidth = 320;
        this.maxWidth = 900;

        if (!this.panel) return;

        this.bindEvents();
    }

    bindEvents() {
        // Click on clickable items
        this.clickableItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const detailId = item.dataset.detail;
                this.toggleDetail(detailId, item);
            });
        });

        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closePanel();
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.panel.classList.contains('visible')) {
                this.closePanel();
            }
        });

        // Resize functionality
        if (this.resizeHandle) {
            this.resizeHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.isResizing = true;
                this.panel.classList.add('resizing');
                document.body.classList.add('panel-resizing');
            });

            document.addEventListener('mousemove', (e) => {
                if (!this.isResizing) return;

                const newWidth = window.innerWidth - e.clientX;
                if (newWidth >= this.minWidth && newWidth <= this.maxWidth) {
                    this.panelWidth = newWidth;
                    this.panel.style.width = newWidth + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                if (this.isResizing) {
                    this.isResizing = false;
                    this.panel.classList.remove('resizing');
                    document.body.classList.remove('panel-resizing');
                }
            });
        }
    }

    toggleDetail(detailId, element) {
        // If clicking the same item, close it
        if (this.activeItem === detailId) {
            this.closePanel();
            return;
        }

        // Remove active class from all items
        this.clickableItems.forEach(item => item.classList.remove('active'));

        // Add active class to clicked item
        element.classList.add('active');

        // Update panel content
        const data = this.detailData[detailId];
        if (data) {
            this.titleEl.textContent = data.title;
            // Reorganize content: main content first, citations at bottom
            this.contentEl.innerHTML = this.reorganizeContent(data.content);
            this.panel.classList.add('visible');
            this.activeItem = detailId;

            // Shift slide content left
            document.querySelectorAll('.slide').forEach(slide => {
                slide.classList.add('panel-open');
            });
            document.querySelectorAll('.slide-content').forEach(content => {
                content.classList.add('panel-open');
            });
        }
    }

    reorganizeContent(html) {
        // Create a temporary container to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Check if content has special elements - if so, return as-is
        const ganttChart = temp.querySelector('.gantt-container');
        const initiativeDetails = temp.querySelector('.initiative-detail');
        const panelTable = temp.querySelector('.panel-table');
        if (ganttChart || initiativeDetails || panelTable) {
            return html;
        }

        // Extract all citation references
        const citations = [];
        const refs = temp.querySelectorAll('.detail-reference');
        refs.forEach(ref => {
            citations.push(ref.outerHTML);
            ref.remove();
        });

        // Remove metrics section if present
        const metrics = temp.querySelector('.detail-metrics');
        if (metrics) {
            metrics.remove();
        }

        // Check if content already has bullet list
        const existingList = temp.querySelector('.detail-bullets');
        let result = '';

        if (existingList) {
            // Already formatted as bullets, use as-is
            result = temp.innerHTML;
        } else {
            // Convert paragraphs to bullet points
            const paragraphs = temp.querySelectorAll('p');
            const bullets = [];

            paragraphs.forEach(p => {
                let text = p.innerHTML;
                // Remove bold labels
                text = text.replace(/<strong>[^<]*:<\/strong>\s*/gi, '');
                text = text.replace(/<strong>([^<]*)<\/strong>/gi, '$1');
                text = text.trim();
                if (text && text.length > 2) {
                    text = text.replace(/^[•\-]\s*/, '');
                    if (text) {
                        bullets.push(text);
                    }
                }
            });

            result = '<ul class="detail-bullets">';
            bullets.forEach(bullet => {
                result += `<li>${bullet}</li>`;
            });
            result += '</ul>';
        }

        // Add citations at bottom
        if (citations.length > 0) {
            result += '<div class="citations-section"><div class="citations-label">References</div>';
            result += citations.join('');
            result += '</div>';
        }

        return result;
    }

    closePanel() {
        this.panel.classList.remove('visible');
        this.clickableItems.forEach(item => item.classList.remove('active'));
        this.activeItem = null;

        // Remove shift from slide content
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('panel-open');
        });
        document.querySelectorAll('.slide-content').forEach(content => {
            content.classList.remove('panel-open');
        });
    }
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize preloader
    new Preloader();

    // Initialize main presentation controller
    const presentation = new PresentationController();

    // Initialize additional features
    new SlideAnimations();
    new DataVisualization();
    new HashNavigation(presentation);
    new PrintMode();
    const sidePanel = new SidePanelHandler();

    // Make all initiative codes clickable
    document.querySelectorAll('.init-code').forEach(codeEl => {
        const codeText = codeEl.textContent.trim();
        let detailKey = null;

        // Map code text to detail key
        if (/^H[1-4]$/.test(codeText)) {
            detailKey = 'init-' + codeText;
        } else if (/^P[1-6]$/.test(codeText)) {
            detailKey = 'init-' + codeText;
        } else if (/^T([1-9]|1[0-5])$/.test(codeText)) {
            detailKey = 'init-' + codeText;
        } else if (codeText === 'E') {
            detailKey = 'init-E';
        }

        // If we have a matching detail, make it clickable
        if (detailKey && sidePanel && sidePanel.detailContent && sidePanel.detailContent[detailKey]) {
            codeEl.classList.add('clickable-code');
            codeEl.setAttribute('data-detail', detailKey);
            codeEl.addEventListener('click', (e) => {
                e.stopPropagation();
                sidePanel.showDetail(detailKey);
            });
        }
    });

    // Expose to global
    window.presentation = presentation;
    window.sidePanel = sidePanel;

    // ===== PDF Download Feature =====
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', async () => {
            console.log('PDF button clicked');
            if (typeof html2pdf === 'undefined') {
                alert('PDF library not loaded. Please check your internet connection.');
                return;
            }
            await generatePDF();
        });
    }
});

// ===== PDF Generation Function =====
function generatePDF() {
    const slides = document.querySelectorAll('.slide');
    const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);

    // Build HTML content with slide-content preserved
    let slidesHTML = '';
    slides.forEach((slide, index) => {
        const slideContent = slide.querySelector('.slide-content');
        if (slideContent) {
            const clone = slideContent.cloneNode(true);
            slidesHTML += `<div class="print-slide">${clone.outerHTML}</div>`;
        }
    });

    // Create print window with comprehensive inline styles (no external CSS)
    const printWindow = window.open('', '_blank', 'width=1200,height=800');

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
    <title>NH IT Strategy 2026-2028</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
:root {
    --primary: #1e40af;
    --accent: #1e40af;
    --accent-light: #3b82f6;
    --success: #059669;
    --warning: #d97706;
    --danger: #dc2626;
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-300: #cbd5e1;
    --gray-400: #94a3b8;
    --gray-500: #64748b;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1e293b;
    --gray-900: #0f172a;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: white;
    color: var(--gray-800);
    line-height: 1.5;
    font-size: 14px;
}

/* Print slides */
.print-slide {
    page-break-after: always;
    page-break-inside: avoid;
    min-height: 100vh;
    padding: 25px 35px;
    background: white;
}
.print-slide:last-child { page-break-after: auto; }

.slide-content {
    max-width: 1100px;
    margin: 0 auto;
}

/* Headers */
.slide-header { margin-bottom: 1.25rem; text-align: center; }
.section-label { font-size: 0.75rem; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; font-weight: 500; }
.slide-title { font-size: 1.75rem; font-weight: 700; color: var(--gray-800); margin-bottom: 0.25rem; }
.slide-subtitle { font-size: 0.9rem; color: var(--gray-500); font-style: italic; }

/* Title slide */
.title-slide { text-align: center; padding-top: 20vh; }
.title-divider { width: 60px; height: 4px; background: var(--accent); margin: 1rem auto; border-radius: 2px; }
.main-title { font-size: 2.75rem; font-weight: 800; color: var(--gray-800); line-height: 1.2; }
.year-badge { display: inline-block; background: white; border: 2px solid var(--accent); color: var(--accent); padding: 0.5rem 1.5rem; border-radius: 50px; font-weight: 600; font-size: 0.9rem; }
.company-name { font-size: 1.25rem; color: var(--gray-600); margin-top: 0.75rem; }
.version-info { display: flex; justify-content: center; gap: 3rem; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--gray-200); }
.version-item { text-align: center; }
.version-label { font-size: 0.7rem; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.05em; }
.version-value { font-size: 1.1rem; font-weight: 600; color: var(--gray-700); }
.status-review { color: var(--warning); }

/* Grid layouts */
.agenda-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; }
.exec-layout { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.team-structure { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.team-departments { display: flex; gap: 1rem; justify-content: center; }
.skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
.tech-categories { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.problems-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.swot-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.vision-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.pillars-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.model-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.metrics-grid, .success-metrics, .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.hiring-timeline { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.year-initiatives { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.decisions-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.governance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.appendix-links { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.approach-phases { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

/* Cards base */
.agenda-card, .exec-card, .dept-card, .skill-item, .tech-card, .problem-card,
.swot-card, .vision-card, .pillar-card, .model-card, .metric-card, .kpi-card,
.hire-card, .initiative-card, .decision-card, .gov-card, .appendix-card, .phase-card {
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: 10px;
    padding: 1rem;
}

/* Card with accent top */
.pillar-card, .vision-card { border-top: 3px solid var(--accent); }

/* Card elements */
.card-icon, .metric-icon, .pillar-icon {
    width: 40px;
    height: 40px;
    background: var(--accent-light);
    color: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
}
.card-number { font-size: 0.7rem; color: var(--accent); font-weight: 600; margin-bottom: 0.25rem; }
.card-title, .metric-title, .pillar-title { font-weight: 600; color: var(--gray-800); font-size: 0.9rem; margin-bottom: 0.25rem; }
.card-desc, .metric-desc { font-size: 0.8rem; color: var(--gray-500); }
.card-value, .metric-value { font-size: 1.25rem; font-weight: 700; color: var(--accent); }
.metric-change { font-size: 0.75rem; color: var(--gray-400); }
.metric-change .arrow { color: var(--success); }

/* Executive cards */
.cio-card { background: var(--accent); color: white; text-align: center; padding: 1.25rem; }
.cio-card .exec-role { color: rgba(255,255,255,0.9); }
.cio-card .exec-name { color: white; font-weight: 600; }
.exec-role { font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.25rem; }
.exec-name { font-weight: 600; color: var(--gray-800); }

/* SWOT colors */
.swot-card.strength { border-left: 4px solid #10b981; }
.swot-card.weakness { border-left: 4px solid #ef4444; }
.swot-card.opportunity { border-left: 4px solid #3b82f6; }
.swot-card.threat { border-left: 4px solid #f59e0b; }
.swot-title { font-weight: 600; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }

/* Badges */
.status-badge, .priority-badge, .phase-badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
}
.badge-critical, .badge-high { background: #fef2f2; color: #dc2626; }
.badge-warning, .badge-medium { background: #fffbeb; color: #d97706; }
.badge-success, .badge-low { background: #f0fdf4; color: #059669; }
.badge-info { background: #eff6ff; color: #2563eb; }

/* Lists */
ul, ol { padding-left: 1.25rem; margin: 0.5rem 0; }
li { margin-bottom: 0.35rem; font-size: 0.85rem; color: var(--gray-700); }

/* Tables */
table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
th, td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--gray-200); }
th { background: var(--gray-50); font-weight: 600; color: var(--gray-700); font-size: 0.75rem; }

/* SVG icons */
svg { vertical-align: middle; }

/* Clickable items */
.clickable-metric, .clickable-code, .init-code { cursor: default; }

/* Timeline connectors */
.connector { width: 2px; height: 20px; background: var(--gray-300); margin: 0 auto; }

/* Org Structure */
.org-level { display: flex; gap: 1rem; justify-content: center; }
.org-box { background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 10px; padding: 1rem; text-align: center; min-width: 120px; }
.org-box.primary { background: var(--accent); color: white; }
.org-title { font-weight: 600; color: var(--gray-800); font-size: 0.85rem; }
.org-name { font-size: 0.75rem; color: var(--gray-500); }
.org-count { font-size: 0.75rem; color: var(--gray-400); }
.org-connector { width: 2px; height: 20px; background: var(--gray-300); margin: 0.25rem auto; }

/* Skills */
.skill-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; }
.skill-status { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.skill-status.missing { background: #ef4444; }
.skill-status.partial { background: #f59e0b; }
.skill-status.complete { background: #10b981; }
.skill-name { flex: 1; font-weight: 500; font-size: 0.85rem; }
.skill-badge { font-size: 0.65rem; padding: 0.15rem 0.5rem; border-radius: 50px; font-weight: 500; }
.skill-badge.missing { background: #fef2f2; color: #dc2626; }
.skill-badge.partial { background: #fffbeb; color: #d97706; }

/* Tech Stats */
.tech-stats { display: flex; gap: 2rem; justify-content: center; margin-bottom: 1rem; }
.tech-stat { text-align: center; padding: 1rem; background: var(--gray-50); border-radius: 10px; min-width: 100px; }
.stat-number { font-size: 2rem; font-weight: 800; color: var(--accent); }
.stat-label { font-size: 0.75rem; color: var(--gray-500); }
.tech-category { background: white; border: 1px solid var(--gray-200); border-radius: 10px; padding: 0.875rem; }
.cat-title { font-weight: 600; font-size: 0.85rem; color: var(--gray-800); margin-bottom: 0.5rem; }
.tech-tags { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.tech-tag { padding: 0.25rem 0.625rem; background: var(--gray-100); border-radius: 50px; font-size: 0.7rem; color: var(--gray-600); }

/* Problems */
.problem-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--gray-100); margin-bottom: 0.5rem; }
.problem-title { font-weight: 600; font-size: 0.9rem; color: var(--gray-800); margin-bottom: 0.25rem; }
.problem-desc { font-size: 0.8rem; color: var(--gray-500); }

/* KPI Cards */
.kpi-card { display: flex; align-items: flex-start; gap: 0.75rem; }
.kpi-icon { width: 36px; height: 36px; background: var(--gray-100); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--accent); flex-shrink: 0; }
.kpi-content { flex: 1; }
.kpi-label { font-size: 0.7rem; color: var(--gray-400); margin-bottom: 0.25rem; }
.kpi-values { display: flex; align-items: center; gap: 0.375rem; }
.kpi-current { font-size: 1rem; font-weight: 700; color: var(--gray-500); }
.kpi-arrow { color: var(--accent); font-size: 0.75rem; }
.kpi-target { font-size: 1rem; font-weight: 700; color: var(--success); }

/* Timeline Period */
.timeline-period { background: white; border: 1px solid var(--gray-200); border-radius: 10px; padding: 0.875rem; }
.period-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
.period-label { font-size: 0.9rem; font-weight: 600; color: var(--gray-800); }
.period-badge { padding: 0.125rem 0.5rem; border-radius: 50px; font-size: 0.6rem; font-weight: 600; }
.period-badge.now { background: var(--success); color: white; }
.period-roles { display: flex; flex-direction: column; gap: 0.375rem; }
.hire-card { display: flex; align-items: center; gap: 0.5rem; }
.hire-icon { font-size: 1rem; }
.hire-title { font-weight: 500; color: var(--gray-700); font-size: 0.8rem; }
.hire-urgency { font-size: 0.6rem; padding: 0.1rem 0.375rem; background: var(--danger); color: white; border-radius: 50px; }

/* Initiatives */
.initiatives-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
.initiative-category { background: white; border: 1px solid var(--gray-200); border-radius: 10px; padding: 0.875rem; }
.category-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.category-icon { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.category-title { font-weight: 600; font-size: 0.85rem; }
.init-code { display: inline-block; padding: 0.1rem 0.4rem; background: var(--gray-100); border-radius: 4px; font-size: 0.65rem; font-weight: 600; color: var(--accent); font-family: monospace; }
.initiative-item { display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.375rem 0; }
.initiative-text { font-size: 0.8rem; color: var(--gray-700); }

/* Year Summary */
.year-summary { display: flex; gap: 1.5rem; padding: 0.875rem; background: white; border: 1px solid var(--gray-200); border-radius: 8px; margin-bottom: 0.75rem; }
.summary-item { display: flex; align-items: center; gap: 0.5rem; }
.summary-label { font-size: 0.7rem; color: var(--gray-500); }
.summary-value { font-size: 0.85rem; font-weight: 600; color: var(--gray-700); }

/* ERP Timeline */
.erp-timeline { margin-bottom: 0.75rem; }
.erp-track { display: flex; align-items: stretch; }
.erp-phase { flex: 1; background: white; padding: 0.875rem; border: 1px solid var(--gray-200); }
.erp-phase:first-child { border-radius: 10px 0 0 10px; }
.erp-phase:last-child { border-radius: 0 10px 10px 0; }
.phase-header { margin-bottom: 0.375rem; }
.phase-year { font-size: 0.6rem; color: var(--gray-500); }
.phase-name { font-size: 0.9rem; font-weight: 700; color: var(--gray-800); }
.phase-status { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 50px; font-size: 0.6rem; font-weight: 600; }
.erp-connector { width: 16px; background: white; display: flex; align-items: center; justify-content: center; border-top: 1px solid var(--gray-200); border-bottom: 1px solid var(--gray-200); }

/* Decisions */
.decision-category { background: white; border: 1px solid var(--gray-200); border-radius: 10px; padding: 0.875rem; }
.category-title { font-weight: 600; font-size: 0.85rem; margin-bottom: 0.5rem; }
.decision-items { display: flex; flex-direction: column; gap: 0.375rem; }
.decision-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: var(--gray-50); border-radius: 6px; }
.decision-icon { width: 20px; height: 20px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.65rem; flex-shrink: 0; }
.decision-text { flex: 1; color: var(--gray-700); font-size: 0.75rem; }
.decision-deadline { font-size: 0.6rem; color: var(--gray-500); background: white; padding: 0.125rem 0.375rem; border-radius: 50px; border: 1px solid var(--gray-200); }

/* Reporting Structure */
.reporting-structure { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 0.75rem; }
.report-card { background: white; border: 1px solid var(--gray-200); border-radius: 10px; padding: 0.875rem; }
.report-frequency { display: inline-block; padding: 0.125rem 0.5rem; background: var(--accent); border-radius: 50px; font-size: 0.6rem; font-weight: 600; color: white; margin-bottom: 0.25rem; }
.report-audience { font-size: 0.9rem; font-weight: 600; color: var(--gray-800); margin-bottom: 0.5rem; }
.report-items { font-size: 0.75rem; color: var(--gray-600); }

/* Escalation */
.escalation-process { background: white; border: 1px solid var(--gray-200); border-radius: 8px; padding: 0.875rem; }
.escalation-title { font-weight: 600; font-size: 0.85rem; margin-bottom: 0.5rem; }
.escalation-flow { display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap; }
.escalation-step { padding: 0.375rem 0.75rem; background: var(--gray-100); border-radius: 6px; font-size: 0.75rem; color: var(--gray-700); }
.escalation-arrow { color: var(--accent); font-weight: 600; }

/* Appendix */
.appendix-card { display: flex; gap: 0.75rem; align-items: flex-start; }
.appendix-letter { width: 36px; height: 36px; background: var(--accent); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; flex-shrink: 0; }
.appendix-content { flex: 1; }
.appendix-title { font-weight: 600; font-size: 0.9rem; color: var(--gray-800); margin-bottom: 0.25rem; }
.appendix-pages { font-size: 0.7rem; color: var(--gray-500); }

/* Formats */
.formats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
.format-card { background: white; border: 1px solid var(--gray-200); border-radius: 10px; padding: 0.875rem; }
.format-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.format-icon { width: 24px; height: 24px; border-radius: 6px; background: var(--accent); }
.format-title { font-weight: 600; font-size: 0.85rem; }
.format-frequency { font-size: 0.6rem; padding: 0.1rem 0.375rem; background: var(--gray-100); border-radius: 50px; color: var(--gray-500); }
.format-slides { font-size: 1.1rem; font-weight: 700; color: var(--accent); }

/* Success Factors */
.success-factors { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
.factor-item { display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.5rem; background: var(--gray-50); border-radius: 6px; }
.factor-number { width: 24px; height: 24px; background: var(--accent); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.7rem; color: white; flex-shrink: 0; }
.factor-text { font-size: 0.8rem; color: var(--gray-700); }

/* Document Cards */
.document-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
.doc-card { display: flex; gap: 0.625rem; background: white; border: 1px solid var(--gray-200); border-radius: 8px; padding: 0.875rem; }
.doc-number { width: 28px; height: 28px; background: var(--accent); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: white; flex-shrink: 0; }
.doc-info { flex: 1; }
.doc-title { font-weight: 600; font-size: 0.85rem; color: var(--gray-800); margin-bottom: 0.25rem; }
.doc-pages { font-size: 0.6rem; color: var(--gray-500); background: var(--gray-100); padding: 0.1rem 0.375rem; border-radius: 50px; }

/* Vision */
.vision-container { text-align: center; }
.vision-quote { font-size: 1.25rem; font-style: italic; color: var(--gray-700); max-width: 700px; margin: 0 auto 1.5rem; }
.quote-mark { font-size: 3rem; color: var(--accent); opacity: 0.3; line-height: 0; }

/* Transform Visual */
.transformation-visual { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-bottom: 1rem; }
.transform-box { padding: 1.25rem 2rem; border-radius: 12px; text-align: center; background: var(--gray-50); }
.transform-box.current { border: 2px solid var(--gray-300); }
.transform-box.target { border: 2px solid var(--accent); background: rgba(30, 64, 175, 0.05); }
.transform-label { font-size: 0.65rem; text-transform: uppercase; color: var(--gray-500); margin-bottom: 0.25rem; }
.transform-number { font-size: 2.5rem; font-weight: 800; color: var(--gray-800); }
.transform-box.target .transform-number { color: var(--accent); }
.transform-desc { font-size: 0.75rem; color: var(--gray-500); }
.transform-arrow { color: var(--accent); font-size: 1.5rem; }

/* Target Org */
.target-org { background: white; border: 1px solid var(--gray-200); border-radius: 12px; padding: 1rem; }
.target-roles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.role-group-title { font-size: 0.7rem; color: var(--gray-500); margin-bottom: 0.5rem; text-transform: uppercase; }
.role-items { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.role-badge { padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.7rem; font-weight: 500; background: var(--gray-100); color: var(--gray-700); }
.role-badge.new { background: rgba(30, 64, 175, 0.1); color: var(--accent); }

/* Pillar Card Details */
.pillar-header { padding: 0.75rem; display: flex; align-items: center; gap: 0.75rem; background: var(--gray-50); }
.pillar-number { font-size: 0.65rem; font-weight: 700; color: var(--gray-500); }
.pillar-body { padding: 0.75rem; }
.pillar-desc { font-size: 0.8rem; color: var(--gray-600); }

/* Additional Misc */
.gradient-accent { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); }
.text-accent { color: var(--accent); }
.text-success { color: var(--success); }
.text-warning { color: var(--warning); }
.text-danger { color: var(--danger); }
.font-bold { font-weight: 700; }
.text-center { text-align: center; }
.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.gap-1 { gap: 0.5rem; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }

/* Agenda Slide */
.agenda-slide { display: flex; flex-direction: column; align-items: center; }
.agenda-slide .slide-title { margin-bottom: 1.5rem; }
.agenda-container { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; max-width: 700px; }
.agenda-item { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem 1.25rem; background: #ffffff; border-radius: 10px; border: 1px solid var(--gray-200); border-left: 4px solid var(--accent); }
.agenda-item[data-section="1"] { border-left-color: #3b82f6; }
.agenda-item[data-section="2"] { border-left-color: #8b5cf6; }
.agenda-item[data-section="3"] { border-left-color: #10b981; }
.agenda-item[data-section="4"] { border-left-color: #f59e0b; }
.agenda-item[data-section="5"] { border-left-color: #06b6d4; }
.agenda-number { display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; background: var(--accent); color: white; border-radius: 50%; font-size: 0.875rem; font-weight: 700; flex-shrink: 0; }
.agenda-item[data-section="1"] .agenda-number { background: #3b82f6; }
.agenda-item[data-section="2"] .agenda-number { background: #8b5cf6; }
.agenda-item[data-section="3"] .agenda-number { background: #10b981; }
.agenda-item[data-section="4"] .agenda-number { background: #f59e0b; }
.agenda-item[data-section="5"] .agenda-number { background: #06b6d4; }
.agenda-content { flex: 1; }
.agenda-content h3 { font-size: 1rem; font-weight: 600; color: var(--gray-800); margin-bottom: 0.375rem; }
.agenda-subitems { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; }
.agenda-subitems li { font-size: 0.75rem; color: var(--gray-500); position: relative; padding-left: 0.75rem; }
.agenda-subitems li::before { content: "•"; position: absolute; left: 0; color: var(--gray-400); }

/* Executive Summary */
.exec-summary .slide-title { margin-bottom: 0.75rem; }
.exec-layout { display: grid; grid-template-columns: 1fr 1.3fr; gap: 1rem; margin-bottom: 0.75rem; width: 100%; }
.exec-left { display: flex; flex-direction: column; gap: 0.625rem; }
.health-score-panel { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 1rem; text-align: center; border: 1px solid var(--gray-200); }
.health-score-display { display: flex; align-items: baseline; justify-content: center; gap: 0.125rem; }
.health-score-number { font-size: 2.75rem; font-weight: 800; color: var(--danger); line-height: 1; }
.health-score-max { font-size: 1rem; color: var(--gray-500); font-weight: 600; }
.health-score-label { font-size: 0.6875rem; color: var(--gray-500); margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.1em; }
.health-score-status { display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.625rem; font-weight: 600; }
.health-score-status.critical { background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3); }
.issues-breakdown { background: #ffffff; border-radius: 10px; padding: 0.75rem 1rem; border: 1px solid var(--gray-200); }
.issues-title { font-size: 0.75rem; font-weight: 600; color: var(--gray-800); margin-bottom: 0.5rem; }
.issues-bars { display: flex; flex-direction: column; gap: 0.375rem; }
.issue-bar { display: grid; grid-template-columns: 50px 1fr 24px; align-items: center; gap: 0.5rem; }
.issue-label { font-size: 0.5625rem; color: var(--gray-500); text-transform: uppercase; }
.issue-bar-track { height: 6px; background: var(--gray-200); border-radius: 3px; overflow: hidden; }
.issue-bar-fill { height: 100%; border-radius: 3px; }
.issue-bar-fill.critical { background: var(--danger); }
.issue-bar-fill.high { background: #f57c00; }
.issue-bar-fill.medium { background: var(--warning); }
.issue-bar-fill.low { background: var(--success); }
.issue-count { font-size: 0.75rem; font-weight: 700; color: var(--gray-700); text-align: right; }
.exec-right { display: flex; flex-direction: column; }
.exec-categories { display: flex; flex-direction: column; gap: 0.375rem; height: 100%; }
.exec-category { display: flex; align-items: center; gap: 0.625rem; padding: 0.5rem 0.75rem; background: #ffffff; border-radius: 8px; border: 1px solid var(--gray-200); flex: 1; }
.cat-icon { width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0; }
.cat-icon.people { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.cat-icon.process { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
.cat-icon.technology { background: linear-gradient(135deg, #06b6d4, #0891b2); }
.cat-icon.erp { background: linear-gradient(135deg, #f59e0b, #d97706); }
.cat-icon.data { background: linear-gradient(135deg, #10b981, #047857); }
.cat-info { flex: 1; display: flex; flex-direction: column; }
.cat-name { font-size: 0.75rem; font-weight: 600; color: var(--gray-800); }
.cat-count { font-size: 0.5625rem; color: var(--gray-500); }
.cat-critical { font-size: 0.5625rem; font-weight: 600; color: var(--danger); background: rgba(239, 68, 68, 0.1); padding: 0.125rem 0.5rem; border-radius: 50px; }
.exec-decisions { background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 0.625rem 0.875rem; }
.decisions-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.decisions-icon { width: 20px; height: 20px; background: var(--danger); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; }
.decisions-title { font-size: 0.75rem; font-weight: 600; color: var(--danger); }
.decisions-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.375rem; }
.decision-chip { display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.625rem; background: #ffffff; border-radius: 6px; border: 1px solid var(--gray-200); }
.chip-number { width: 16px; height: 16px; background: var(--accent); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.5625rem; font-weight: 700; flex-shrink: 0; }
.chip-text { font-size: 0.625rem; color: var(--gray-600); line-height: 1.3; }

/* Problems Detailed */
.problems-detailed { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; max-width: 900px; margin: 0 auto; }
.problem-row { display: grid; grid-template-columns: auto 1fr auto; gap: 0.75rem; align-items: start; background: #ffffff; border-radius: 8px; padding: 0.75rem 1rem; border: 1px solid var(--gray-200); }
.problem-header { display: flex; align-items: center; gap: 0.625rem; min-width: 280px; }
.problem-priority { display: inline-flex; align-items: center; justify-content: center; padding: 0.125rem 0.4rem; border-radius: 3px; font-size: 0.625rem; font-weight: 700; flex-shrink: 0; }
.problem-priority.p0 { background: var(--danger); color: white; }
.problem-priority.p1 { background: var(--warning); color: var(--gray-900); }
.problem-header h4 { font-size: 0.8125rem; font-weight: 600; color: var(--gray-800); margin: 0; }
.problem-items { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; }
.problem-items li { font-size: 0.6875rem; color: var(--gray-500); position: relative; padding-left: 0.625rem; }
.problem-items li::before { content: "•"; position: absolute; left: 0; color: var(--gray-400); }
.problem-ref { font-size: 0.5625rem; color: var(--gray-500); background: var(--gray-100); padding: 0.25rem 0.5rem; border-radius: 4px; white-space: nowrap; align-self: center; }
.problems-legend { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 0.75rem; font-size: 0.6875rem; color: var(--gray-400); }
.problems-legend .legend-label { color: var(--gray-500); }
.problems-legend .legend-p0, .problems-legend .legend-p1 { display: inline-flex; align-items: center; justify-content: center; padding: 0.125rem 0.3rem; border-radius: 3px; font-size: 0.5625rem; font-weight: 700; margin-left: 0.375rem; }
.problems-legend .legend-p0 { background: var(--danger); color: white; }
.problems-legend .legend-p1 { background: var(--warning); color: var(--gray-900); }

/* SWOT Enhanced */
.swot-card.strengths { background: rgba(5, 150, 105, 0.05); border-color: rgba(5, 150, 105, 0.25); }
.swot-card.weaknesses { background: rgba(220, 38, 38, 0.05); border-color: rgba(220, 38, 38, 0.25); }
.swot-card.opportunities { background: rgba(30, 64, 175, 0.05); border-color: rgba(30, 64, 175, 0.25); }
.swot-card.threats { background: rgba(217, 119, 6, 0.05); border-color: rgba(217, 119, 6, 0.25); }
.swot-card h4 { font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; padding-bottom: 0.375rem; border-bottom: 1px solid var(--gray-200); }
.swot-card.strengths h4 { color: var(--success); }
.swot-card.weaknesses h4 { color: var(--danger); }
.swot-card.opportunities h4 { color: var(--accent); }
.swot-card.threats h4 { color: var(--warning); }
.swot-card ul { list-style: none; }
.swot-card li { padding: 0.25rem 0; padding-left: 0.875rem; position: relative; font-size: 0.75rem; color: var(--gray-600); }
.swot-card li::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 4px; border-radius: 50%; }
.swot-card.strengths li::before { background: var(--success); }
.swot-card.weaknesses li::before { background: var(--danger); }
.swot-card.opportunities li::before { background: var(--accent); }
.swot-card.threats li::before { background: var(--warning); }

/* Pillar enhanced */
.pillar-header.governance { background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(29, 78, 216, 0.15)); }
.pillar-header.digital { background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(109, 40, 217, 0.15)); }
.pillar-header.security { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(185, 28, 28, 0.15)); }
.pillar-header.data { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(4, 120, 87, 0.15)); }
.pillar-card ul { list-style: none; padding: 0.75rem 1rem; background: #ffffff; }
.pillar-card li { padding: 0.25rem 0; padding-left: 1rem; position: relative; font-size: 0.75rem; color: var(--gray-600); }
.pillar-card li::before { content: '→'; position: absolute; left: 0; color: var(--accent); font-size: 0.75rem; }

/* Vision Enhanced */
.vision-pillars-preview { display: flex; gap: 1.5rem; justify-content: center; }
.pillar-preview { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.pillar-icon { width: 48px; height: 48px; border-radius: 12px; }
.pillar-icon.governance { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.pillar-icon.digital { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
.pillar-icon.security { background: linear-gradient(135deg, #ef4444, #b91c1c); }
.pillar-icon.data { background: linear-gradient(135deg, #10b981, #047857); }
.pillar-preview span { font-size: 0.75rem; font-weight: 500; color: var(--gray-500); }

/* Subsidiary Strategies */
.slide-subtitle { font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.75rem; }
.subsidiary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; width: 100%; }
.subsidiary-card { background: #ffffff; border-radius: 8px; padding: 0.75rem; border: 1px solid var(--gray-200); }
.subsidiary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding-bottom: 0.375rem; border-bottom: 1px solid var(--gray-200); }
.subsidiary-header h4 { font-size: 0.75rem; font-weight: 700; color: var(--gray-800); }
.initiative-count { font-size: 0.5625rem; color: var(--accent); background: rgba(30, 64, 175, 0.1); padding: 0.125rem 0.375rem; border-radius: 50px; }
.subsidiary-initiatives { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.subsidiary-initiatives li { font-size: 0.5625rem; color: var(--gray-600); display: flex; align-items: flex-start; gap: 0.375rem; }
.subsidiary-note { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: rgba(30, 64, 175, 0.05); border: 1px solid rgba(30, 64, 175, 0.2); border-radius: 6px; color: var(--gray-500); font-size: 0.625rem; margin-top: 0.75rem; }
.note-icon { font-size: 0.875rem; }

/* Legend Grid */
.legend-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; width: 100%; }
.legend-category { background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid var(--gray-200); }
.legend-category.technology-full { grid-column: span 2; }
.legend-category-header { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--gray-200); }
.legend-category-header.hiring { background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.02)); border-left: 3px solid #3b82f6; }
.legend-category-header.process { background: linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.02)); border-left: 3px solid #8b5cf6; }
.legend-category-header.technology { background: linear-gradient(90deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02)); border-left: 3px solid #10b981; }
.legend-category-header.erp { background: linear-gradient(90deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02)); border-left: 3px solid #f59e0b; }
.legend-icon { font-size: 1rem; }
.legend-category-header h4 { font-size: 0.75rem; font-weight: 700; color: var(--gray-800); flex: 1; }
.legend-count { font-size: 0.5625rem; color: var(--gray-500); background: var(--gray-100); padding: 0.125rem 0.375rem; border-radius: 50px; }
.legend-table { width: 100%; border-collapse: collapse; }
.legend-table tr { border-bottom: 1px solid var(--gray-200); }
.legend-table tr:last-child { border-bottom: none; }
.legend-table td { padding: 0.375rem 0.5rem; font-size: 0.5625rem; color: var(--gray-600); }
.legend-table .code-cell { width: 36px; font-weight: 700; color: var(--accent); background: var(--gray-50); text-align: center; }
.legend-table-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
.legend-table-grid .legend-table:first-child { border-right: 1px solid var(--gray-200); }
.legend-footer { margin-top: 0.75rem; padding: 0.5rem 0.75rem; background: var(--gray-50); border-radius: 6px; border-left: 3px solid var(--accent); }
.legend-footer p { font-size: 0.625rem; color: var(--gray-500); }

/* Governance Layout */
.governance-layout { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1.25rem; margin-bottom: 1rem; }
.milestones-section h3, .reporting-section h3 { font-size: 0.8125rem; font-weight: 600; color: var(--gray-600); margin-bottom: 0.625rem; }
.milestone-list { display: flex; flex-direction: column; gap: 0.375rem; }
.milestone-item { display: grid; grid-template-columns: 0.6fr 1.5fr 0.5fr; gap: 0.625rem; padding: 0.5rem 0.75rem; background: #ffffff; border-radius: 6px; border: 1px solid var(--gray-200); border-left: 3px solid var(--accent); align-items: center; }
.milestone-date { font-size: 0.6875rem; font-weight: 600; color: var(--accent); }
.milestone-text { font-size: 0.75rem; color: var(--gray-700); }
.milestone-owner { font-size: 0.6875rem; color: var(--gray-500); text-align: right; }
.report-cards-compact { display: flex; flex-direction: column; gap: 0.5rem; }
.report-card-mini { background: #ffffff; border-radius: 6px; padding: 0.625rem 0.75rem; border: 1px solid var(--gray-200); }
.report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
.report-freq { font-size: 0.75rem; font-weight: 600; color: var(--accent); }
.report-to { font-size: 0.6875rem; font-weight: 500; color: var(--gray-500); background: var(--gray-100); padding: 0.125rem 0.375rem; border-radius: 3px; }
.report-content { font-size: 0.6875rem; color: var(--gray-500); }
.success-metrics-bar { background: #ffffff; border-radius: 8px; padding: 0.875rem 1rem; border: 1px solid var(--gray-200); }
.success-metrics-bar h3 { font-size: 0.75rem; font-weight: 600; color: var(--gray-600); margin-bottom: 0.625rem; text-align: center; }
.metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
.metric-box { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.5rem; background: var(--gray-50); border-radius: 6px; border: 1px solid var(--gray-200); }
.metric-label { font-size: 0.625rem; font-weight: 500; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; }
.metric-target { font-size: 0.9375rem; font-weight: 700; color: var(--success); }

/* Decisions Table */
.decisions-action-header { display: flex; justify-content: center; align-items: center; gap: 1.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.priority-legend { font-size: 0.6875rem; color: var(--gray-400); display: flex; align-items: center; gap: 0.375rem; }
.legend-p0, .legend-p1, .legend-p2 { display: inline-flex; align-items: center; justify-content: center; padding: 0.125rem 0.3rem; border-radius: 3px; font-size: 0.5625rem; font-weight: 700; margin-left: 0.5rem; }
.legend-p0 { background: var(--danger); color: white; }
.legend-p1 { background: var(--warning); color: var(--gray-900); }
.legend-p2 { background: var(--gray-600); color: white; }
.action-badge { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.875rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; }
.action-badge.critical { background: rgba(239, 68, 68, 0.15); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3); }
.decisions-table { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
.decision-row { display: grid; grid-template-columns: 2fr 0.75fr 0.75fr 1.5fr; gap: 0.75rem; padding: 0.625rem 0.875rem; border-radius: 6px; align-items: center; font-size: 0.75rem; }
.decision-row.header { background: var(--gray-100); font-weight: 600; color: var(--gray-500); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; }
.decision-row.critical { background: rgba(220, 38, 38, 0.05); border: 1px solid rgba(220, 38, 38, 0.2); }
.decision-row.high { background: rgba(217, 119, 6, 0.05); border: 1px solid rgba(217, 119, 6, 0.2); }
.decision-row:not(.header):not(.critical):not(.high) { background: #ffffff; border: 1px solid var(--gray-200); }
.col-decision { display: flex; align-items: center; gap: 0.5rem; font-weight: 500; color: var(--gray-800); }
.col-owner { color: var(--accent); font-weight: 500; }
.col-deadline { color: var(--gray-600); }
.col-impact { color: var(--gray-500); font-size: 0.6875rem; }
.priority-flag { display: inline-flex; align-items: center; justify-content: center; padding: 0.125rem 0.375rem; border-radius: 3px; font-size: 0.625rem; font-weight: 700; background: var(--danger); color: white; flex-shrink: 0; }
.priority-flag.p1 { background: var(--warning); color: var(--gray-900); }
.priority-flag.p2 { background: var(--gray-600); color: white; }
.decision-cta { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 8px; padding: 0.875rem 1.25rem; text-align: center; }
.cta-text { font-size: 0.9375rem; font-weight: 600; color: white; margin-bottom: 0.25rem; }
.cta-sub { font-size: 0.75rem; color: rgba(255, 255, 255, 0.8); }

/* Gantt Chart */
.gantt-container { margin-top: 0.5rem; }
.gantt-header { display: grid; grid-template-columns: 130px repeat(12, 1fr); gap: 2px; margin-bottom: 0.375rem; padding-bottom: 0.375rem; border-bottom: 1px solid var(--gray-200); }
.gantt-header-label { font-size: 0.5625rem; color: var(--gray-500); text-align: center; font-weight: 500; }
.gantt-header-label:first-child { text-align: left; }
.gantt-quarter { font-size: 0.5625rem; color: var(--gray-500); text-align: center; font-weight: 500; }
.gantt-year-labels { display: grid; grid-template-columns: 1fr repeat(3, 4fr); gap: 2px; margin-bottom: 0.5rem; }
.gantt-year { font-size: 0.625rem; color: var(--accent); text-align: center; font-weight: 600; }
.gantt-row { display: grid; grid-template-columns: 130px repeat(12, 1fr); gap: 2px; margin-bottom: 0.375rem; align-items: center; }
.gantt-section-header { grid-column: 1 / -1; font-size: 0.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); padding: 0.5rem 0 0.25rem 0; margin-top: 0.25rem; border-bottom: 1px solid var(--gray-200); }
.gantt-container.quarterly .gantt-header, .gantt-container.quarterly .gantt-row { grid-template-columns: 130px repeat(4, 1fr); }
.gantt-container.quarterly .gantt-year-labels { grid-template-columns: 130px 1fr; }
.gantt-task { font-size: 0.6875rem; color: var(--gray-600); white-space: nowrap; padding-right: 0.5rem; }
.gantt-bar-cell { height: 18px; position: relative; }
.gantt-bar { position: absolute; height: 14px; top: 2px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 0.5rem; font-weight: 600; color: white; text-shadow: 0 1px 1px rgba(0,0,0,0.3); }
.gantt-bar.hiring { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.gantt-bar.implementation { background: linear-gradient(90deg, #10b981, #34d399); }
.gantt-bar.planning { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
.gantt-bar.deployment { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.gantt-bar.ongoing { background: linear-gradient(90deg, #06b6d4, #22d3ee); }
.gantt-bar.critical { background: linear-gradient(90deg, #ef4444, #f87171); }
.gantt-bar.training { background: linear-gradient(90deg, #6366f1, #818cf8); }
.gantt-bar.ai { background: linear-gradient(90deg, #ec4899, #f472b6); }
.gantt-bar.span-1 { width: 100%; left: 0; }
.gantt-bar.span-2 { width: calc(200% + 2px); left: 0; }
.gantt-bar.span-3 { width: calc(300% + 4px); left: 0; }
.gantt-bar.span-4 { width: calc(400% + 6px); left: 0; }
.gantt-bar.span-5 { width: calc(500% + 8px); left: 0; }
.gantt-bar.span-6 { width: calc(600% + 10px); left: 0; }
.gantt-bar.span-7 { width: calc(700% + 12px); left: 0; }
.gantt-bar.span-8 { width: calc(800% + 14px); left: 0; }
.gantt-bar.span-9 { width: calc(900% + 16px); left: 0; }
.gantt-bar.span-10 { width: calc(1000% + 18px); left: 0; }
.gantt-bar.span-11 { width: calc(1100% + 20px); left: 0; }
.gantt-bar.span-12 { width: calc(1200% + 22px); left: 0; }
.gantt-legend { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid var(--gray-200); }
.gantt-legend-item { display: flex; align-items: center; gap: 0.25rem; font-size: 0.5625rem; color: var(--gray-500); }
.gantt-legend-color { width: 12px; height: 8px; border-radius: 2px; }
.gantt-legend-color.hiring { background: #3b82f6; }
.gantt-legend-color.implementation { background: #10b981; }
.gantt-legend-color.planning { background: #8b5cf6; }
.gantt-legend-color.deployment { background: #f59e0b; }
.gantt-legend-color.ongoing { background: #06b6d4; }
.gantt-legend-color.critical { background: #ef4444; }
.gantt-legend-color.training { background: #6366f1; }
.gantt-legend-color.ai { background: #ec4899; }
.gantt-milestone { font-size: 0.625rem; color: var(--gray-500); margin-top: 0.5rem; padding: 0.375rem 0.5rem; background: var(--gray-50); border-radius: 4px; border-left: 3px solid var(--accent); }
.gantt-milestone strong { color: var(--gray-800); }

/* Additional Items */
.additional-items { background: #ffffff; border-radius: 8px; padding: 0.875rem; margin-bottom: 0.75rem; border: 1px solid var(--gray-200); }
.additional-items h4 { font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--gray-700); }
.additional-grid { display: flex; gap: 1.25rem; flex-wrap: wrap; }
.additional-item { display: flex; align-items: center; gap: 0.5rem; color: var(--gray-600); font-size: 0.75rem; }
.additional-icon { font-size: 1rem; }

/* End Slide CTA */
.end-slide-cta { text-align: center; padding: 1.25rem; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 10px; }
.end-slide-cta p { font-size: 1.125rem; font-weight: 600; color: white; margin-bottom: 0.25rem; }
.cta-subtitle { font-size: 0.8125rem; color: rgba(255, 255, 255, 0.8); }

/* Dependencies Note */
.dependencies-note { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; background: rgba(30, 64, 175, 0.05); border: 1px solid rgba(30, 64, 175, 0.2); border-radius: 6px; color: var(--accent); font-size: 0.6875rem; width: 100%; text-align: left; }
.dependencies-note svg { width: 14px; height: 14px; flex-shrink: 0; }

/* Year Badge variations */
.year-badge.must-do { background: var(--danger); color: white; }
.year-badge.should-do { background: var(--warning); color: var(--gray-900); }
.year-badge.nice-to-have { background: var(--success); color: white; }

/* Initiative compact list */
.initiative-compact-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.initiative-compact-list li { font-size: 0.625rem; color: var(--gray-600); line-height: 1.4; display: flex; align-items: flex-start; gap: 0.375rem; }

/* Click hint */
.click-hint { font-size: 0.75rem; color: var(--gray-500); font-style: italic; margin-bottom: 0.75rem; width: 100%; }

/* Clickable item arrow removal for PDF */
.clickable-item::after { content: none; }

/* Org chart simple */
.org-chart-simple { display: flex; flex-direction: column; align-items: center; margin-bottom: 1rem; width: 100%; }
.org-box.cio { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border: none; }
.org-box.cio .org-title { color: white; }
.org-box.cio .org-name { color: rgba(255, 255, 255, 0.8); }

/* Role badges */
.role-badge.leadership { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; }
.role-badge.new { background: rgba(5, 150, 105, 0.1); color: var(--success); border: 1px solid rgba(5, 150, 105, 0.25); }
.role-badge.expanded { background: var(--gray-100); color: var(--gray-600); }
.role-category h4 { font-size: 0.6875rem; font-weight: 600; color: var(--gray-500); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }

/* Hiring timeline priority */
.timeline-period.priority { border-color: var(--accent); border-width: 2px; }
.period-badge.priority { background: var(--accent); color: white; }
.hire-card.critical { background: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.25); }

/* ERP phase colors */
.erp-phase.phase-1 { border-left-color: var(--accent); border-left-width: 3px; }
.erp-phase.phase-2 { border-left-color: var(--success); border-left-width: 3px; }
.erp-phase.phase-3 { border-left-color: var(--warning); border-left-width: 3px; }
.erp-phase.phase-4 { border-left-color: var(--gray-400); border-left-width: 3px; }
.phase-status.in-progress { background: rgba(30, 64, 175, 0.1); color: var(--accent); }
.phase-status.planned { background: rgba(5, 150, 105, 0.1); color: var(--success); }
.phase-status.future { background: var(--gray-100); color: var(--gray-500); }

/* Decision category variations */
.decision-category.urgent { border-color: var(--danger); border-width: 2px; }
.decision-category.budget { border-left: 3px solid var(--success); }
.decision-category.urgent h3 { color: var(--danger); }
.decision-category.urgent .decision-icon { background: var(--danger); color: white; }
.decision-category.budget .decision-icon { background: var(--success); color: white; }
.decision-category.pending .decision-icon { background: var(--warning); color: var(--gray-900); }

@media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .print-slide { page-break-after: always; }
}
    </style>
</head>
<body>
${slidesHTML}
<script>
    setTimeout(function() { window.print(); }, 1000);
</script>
</body>
</html>`);
    printWindow.document.close();
}

// ===== Service Worker Registration (Optional - for offline support) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js');
    });
}
