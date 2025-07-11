import { FileContent, ThemeConfig } from '../types/portfolio';
import { TypingEffect } from '../animations/TypingEffect';

export class ContentDisplay {
    private container: HTMLElement;
    private theme: ThemeConfig;
    private header: HTMLElement | null = null;
    private body: HTMLElement | null = null;
    private typingEffect: TypingEffect | null = null;
    private currentContent: FileContent | null = null;

    constructor(container: HTMLElement, theme: ThemeConfig) {
        this.container = container;
        this.theme = theme;
        this.init();
    }

    private init(): void {
        this.header = this.container.querySelector('.content-header');
        this.body = this.container.querySelector('.content-body');
        this.typingEffect = new TypingEffect();
        this.setupScrolling();
    }

    private setupScrolling(): void {
        if (this.body) {
            this.body.style.scrollBehavior = 'smooth';
        }
    }

    async setContent(content: FileContent): Promise<void> {
        if (!this.body) return;

        this.currentContent = content;
        this.updateHeader(content);

        // Clear previous content
        this.body.innerHTML = '';

        // Show loading state
        this.showLoading();

        try {
            // Render content based on type
            const contentElement = await this.renderContent(content);
            
            // Replace loading with actual content
            this.body.innerHTML = '';
            this.body.appendChild(contentElement);

            // Apply syntax highlighting and animations
            this.applyEnhancements();

        } catch (error) {
            console.error('Failed to render content:', error);
            this.showError('Failed to display content');
        }
    }

    private updateHeader(content: FileContent): void {
        if (!this.header) return;

        const pathElement = this.header.querySelector('#current-path');
        const title = content.metadata?.title || 'Untitled';
        
        if (pathElement) {
            pathElement.textContent = title;
        }
    }

    private showLoading(): void {
        if (!this.body) return;

        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-content';
        loadingElement.innerHTML = `
            <div class="loading-spinner">
                <span class="cursor-blink">█</span>
                <span class="loading-text">Loading...</span>
            </div>
        `;

        this.body.appendChild(loadingElement);
    }

    private showError(message: string): void {
        if (!this.body) return;

        this.body.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
            </div>
        `;
    }

    private async renderContent(content: FileContent): Promise<HTMLElement> {
        const container = document.createElement('div');
        container.className = `content-${content.type}`;

        switch (content.type) {
            case 'text':
                return this.renderText(content.data);
            case 'markdown':
                return this.renderMarkdown(content.data);
            case 'json':
                return this.renderJSON(content.data);
            case 'image':
                return this.renderImage(content.data);
            case 'pdf':
                return this.renderPDF(content.data);
            default:
                return this.renderText(String(content.data));
        }
    }

    private renderText(text: string): HTMLElement {
        const container = document.createElement('div');
        container.className = 'text-content';

        const pre = document.createElement('pre');
        pre.className = 'terminal-text';
        pre.textContent = text;

        container.appendChild(pre);
        return container;
    }

    private renderMarkdown(markdown: string): HTMLElement {
        const container = document.createElement('div');
        container.className = 'markdown-content';

        // Simple markdown parser for basic formatting
        let html = markdown
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<[h|u|p])/gm, '<p>')
            .replace(/(?!<\/[h|u|p]>)$/gm, '</p>');

        container.innerHTML = html;
        return container;
    }

    private renderJSON(data: any): HTMLElement {
        const container = document.createElement('div');
        container.className = 'json-content';

        if (typeof data === 'object' && data !== null) {
            // Check if it's project data
            if (data.id && data.name && data.technologies) {
                return this.renderProject(data);
            }
            
            // Check if it's skills data
            if (Array.isArray(data) && data[0]?.name && data[0]?.proficiency) {
                return this.renderSkills(data);
            }

            // Default JSON display
            const pre = document.createElement('pre');
            pre.className = 'json-formatted';
            pre.textContent = JSON.stringify(data, null, 2);
            container.appendChild(pre);
        } else {
            container.textContent = String(data);
        }

        return container;
    }

    private renderProject(project: any): HTMLElement {
        const container = document.createElement('div');
        container.className = 'project-content';

        container.innerHTML = `
            <div class="project-header">
                <h1>${project.name}</h1>
                <div class="project-status status-${project.status}">${project.status}</div>
            </div>
            
            <div class="project-description">
                <p>${project.description}</p>
                ${project.longDescription ? `<p class="long-description">${project.longDescription}</p>` : ''}
            </div>

            <div class="project-technologies">
                <h3>Technologies</h3>
                <div class="tech-tags">
                    ${project.technologies.map((tech: string) => 
                        `<span class="tech-tag">${tech}</span>`
                    ).join('')}
                </div>
            </div>

            ${project.features ? `
                <div class="project-features">
                    <h3>Features</h3>
                    <ul>
                        ${project.features.map((feature: string) => 
                            `<li>${feature}</li>`
                        ).join('')}
                    </ul>
                </div>
            ` : ''}

            ${project.links ? `
                <div class="project-links">
                    <h3>Links</h3>
                    <div class="link-buttons">
                        ${project.links.github ? `<a href="${project.links.github}" target="_blank" class="link-btn github">GitHub</a>` : ''}
                        ${project.links.demo ? `<a href="${project.links.demo}" target="_blank" class="link-btn demo">Live Demo</a>` : ''}
                        ${project.links.documentation ? `<a href="${project.links.documentation}" target="_blank" class="link-btn docs">Documentation</a>` : ''}
                    </div>
                </div>
            ` : ''}

            ${project.achievements ? `
                <div class="project-achievements">
                    <h3>Achievements</h3>
                    <ul class="achievements-list">
                        ${project.achievements.map((achievement: string) => 
                            `<li>🏆 ${achievement}</li>`
                        ).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="project-metadata">
                <div class="metadata-item">
                    <span class="label">Created:</span>
                    <span class="value">${project.dateCreated}</span>
                </div>
                ${project.dateUpdated ? `
                    <div class="metadata-item">
                        <span class="label">Updated:</span>
                        <span class="value">${project.dateUpdated}</span>
                    </div>
                ` : ''}
                <div class="metadata-item">
                    <span class="label">Category:</span>
                    <span class="value">${project.category}</span>
                </div>
            </div>
        `;

        return container;
    }

    private renderSkills(skills: any[]): HTMLElement {
        const container = document.createElement('div');
        container.className = 'skills-content';

        // Group skills by category
        const groupedSkills = skills.reduce((acc, skill) => {
            if (!acc[skill.category]) {
                acc[skill.category] = [];
            }
            acc[skill.category].push(skill);
            return acc;
        }, {} as Record<string, any[]>);

        container.innerHTML = `
            <h1>Technical Skills</h1>
            ${Object.entries(groupedSkills).map(([category, categorySkills]) => `
                <div class="skill-category">
                    <h2>${this.formatCategoryName(category)}</h2>
                    <div class="skills-grid">
                        ${(categorySkills as any[]).map((skill: any) => `
                            <div class="skill-item">
                                <div class="skill-header">
                                    <span class="skill-name">${skill.name}</span>
                                    <span class="skill-experience">${skill.yearsOfExperience}y</span>
                                </div>
                                <div class="skill-proficiency">
                                    <div class="proficiency-bar">
                                        ${Array.from({length: 5}, (_, i) => 
                                            `<div class="proficiency-dot ${i < skill.proficiency ? 'filled' : ''}"></div>`
                                        ).join('')}
                                    </div>
                                    <span class="proficiency-level">${this.getProficiencyLabel(skill.proficiency)}</span>
                                </div>
                                ${skill.description ? `<p class="skill-description">${skill.description}</p>` : ''}
                                ${skill.certifications ? `
                                    <div class="skill-certifications">
                                        <strong>Certifications:</strong> ${skill.certifications.join(', ')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        `;

        return container;
    }

    private formatCategoryName(category: string): string {
        return category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    private getProficiencyLabel(level: number): string {
        const labels = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Expert'];
        return labels[level - 1] || 'Unknown';
    }

    private renderImage(src: string): HTMLElement {
        const container = document.createElement('div');
        container.className = 'image-content';

        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Portfolio Image';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';

        container.appendChild(img);
        return container;
    }

    private renderPDF(src: string): HTMLElement {
        const container = document.createElement('div');
        container.className = 'pdf-content';

        container.innerHTML = `
            <div class="pdf-viewer">
                <div class="pdf-header">
                    <span class="pdf-title">PDF Document</span>
                    <a href="${src}" target="_blank" class="pdf-download">
                        📄 Open in New Tab
                    </a>
                </div>
                <iframe src="${src}" width="100%" height="600px" frameborder="0">
                    <p>Your browser does not support PDF viewing. 
                    <a href="${src}" target="_blank">Click here to download the PDF</a>.</p>
                </iframe>
            </div>
        `;

        return container;
    }

    private applyEnhancements(): void {
        if (!this.body) return;

        // Apply typing effect to text content
        this.applyTypingEffect();

        // Add syntax highlighting
        this.applySyntaxHighlighting();

        // Add scroll animations
        this.addScrollAnimations();
    }

    private applyTypingEffect(): void {
        if (!this.body) return;
        
        const textElements = this.body.querySelectorAll('pre, .terminal-text');
        textElements.forEach((element) => {
            if (this.typingEffect && element.textContent) {
                this.typingEffect.typeText(element as HTMLElement, element.textContent);
            }
        });
    }

    private applySyntaxHighlighting(): void {
        if (!this.body) return;
        
        const codeBlocks = this.body.querySelectorAll('pre code, .json-formatted');
        codeBlocks.forEach((block) => {
            this.highlightSyntax(block as HTMLElement);
        });
    }

    private highlightSyntax(element: HTMLElement): void {
        const content = element.textContent || '';
        
        // Simple JSON highlighting
        if (element.classList.contains('json-formatted')) {
            const highlighted = content
                .replace(/"([^"]+)":/g, '<span class="json-key">"$1":</span>')
                .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
                .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
                .replace(/: (true|false|null)/g, ': <span class="json-boolean">$1</span>');
                
            element.innerHTML = highlighted;
        }
    }

    private addScrollAnimations(): void {
        if (!this.body) return;
        
        const elements = this.body.querySelectorAll('.skill-item, .project-header, .project-features li');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));
    }

    // Public methods
    clear(): void {
        if (this.body) {
            this.body.innerHTML = `
                <div class="terminal-prompt">
                    <span class="prompt-text">chun@kali:~$ clear</span>
                </div>
                <div class="terminal-cursor">█</div>
            `;
        }
    }

    scrollToTop(): void {
        if (this.body) {
            this.body.scrollTop = 0;
        }
    }

    scrollToBottom(): void {
        if (this.body) {
            this.body.scrollTop = this.body.scrollHeight;
        }
    }

    handleResize(): void {
        // Responsive adjustments
        const isMobile = window.innerWidth < 768;
        this.container.classList.toggle('mobile-layout', isMobile);
    }

    getCurrentContent(): FileContent | null {
        return this.currentContent;
    }

    search(query: string): void {
        if (!this.body || !query) return;

        // Remove previous highlights
        this.clearSearchHighlights();

        // Highlight search terms
        this.highlightSearchTerms(query);
    }

    private clearSearchHighlights(): void {
        if (!this.body) return;

        const highlighted = this.body.querySelectorAll('.search-highlight');
        highlighted.forEach(el => {
            const parent = el.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(el.textContent || ''), el);
                parent.normalize();
            }
        });
    }

    private highlightSearchTerms(query: string): void {
        if (!this.body) return;

        const walker = document.createTreeWalker(
            this.body,
            NodeFilter.SHOW_TEXT
        );

        const textNodes: Text[] = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node as Text);
        }

        const regex = new RegExp(`(${query})`, 'gi');
        textNodes.forEach(textNode => {
            const content = textNode.textContent || '';
            if (regex.test(content)) {
                const highlightedContent = content.replace(regex, '<span class="search-highlight">$1</span>');
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = highlightedContent;
                
                const parent = textNode.parentNode;
                if (parent) {
                    while (tempDiv.firstChild) {
                        parent.insertBefore(tempDiv.firstChild, textNode);
                    }
                    parent.removeChild(textNode);
                }
            }
        });
    }
}
