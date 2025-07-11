import { ThemeConfig } from '../types/portfolio';

export class Terminal {
    private container: HTMLElement;
    private theme: ThemeConfig;
    private header: HTMLElement | null = null;
    private isMaximized: boolean = false;
    private isDragging: boolean = false;
    private dragOffset = { x: 0, y: 0 };

    constructor(container: HTMLElement, theme: ThemeConfig) {
        this.container = container;
        this.theme = theme;
        this.init();
    }

    private init(): void {
        this.setupTerminalWindow();
        this.bindEvents();
        this.applyTheme();
    }

    private setupTerminalWindow(): void {
        // Add terminal window styling
        this.container.classList.add('terminal-window');
        
        this.header = this.container.querySelector('.terminal-header');
        if (this.header) {
            this.setupWindowControls();
        }
    }

    private setupWindowControls(): void {
        if (!this.header) return;

        const controls = this.header.querySelectorAll('.control');
        
        controls.forEach((control, index) => {
            control.addEventListener('click', (e) => {
                e.stopPropagation();
                
                switch (index) {
                    case 0: // Close
                        this.closeWindow();
                        break;
                    case 1: // Minimize
                        this.minimizeWindow();
                        break;
                    case 2: // Maximize
                        this.toggleMaximize();
                        break;
                }
            });
        });
    }

    private bindEvents(): void {
        // Window dragging
        if (this.header) {
            this.header.addEventListener('mousedown', (e) => {
                if (!this.isMaximized) {
                    this.startDrag(e);
                }
            });
        }

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && !this.isMaximized) {
                this.drag(e);
            }
        });

        document.addEventListener('mouseup', () => {
            this.stopDrag();
        });

        // Double-click to maximize
        if (this.header) {
            this.header.addEventListener('dblclick', () => {
                this.toggleMaximize();
            });
        }

        // Resize handling
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
    }

    private applyTheme(): void {
        const root = document.documentElement;
        
        // Set CSS custom properties for terminal
        root.style.setProperty('--terminal-bg', this.theme.colors.background);
        root.style.setProperty('--terminal-surface', this.theme.colors.surface);
        root.style.setProperty('--terminal-border', this.theme.colors.primary);
        root.style.setProperty('--terminal-text', this.theme.colors.text);
        root.style.setProperty('--terminal-accent', this.theme.colors.accent);
    }

    private startDrag(e: MouseEvent): void {
        this.isDragging = true;
        const rect = this.container.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        this.container.style.userSelect = 'none';
        document.body.style.userSelect = 'none';
    }

    private drag(e: MouseEvent): void {
        if (!this.isDragging) return;

        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;

        // Constrain to viewport
        const maxX = window.innerWidth - this.container.offsetWidth;
        const maxY = window.innerHeight - this.container.offsetHeight;

        const constrainedX = Math.max(0, Math.min(x, maxX));
        const constrainedY = Math.max(0, Math.min(y, maxY));

        this.container.style.left = `${constrainedX}px`;
        this.container.style.top = `${constrainedY}px`;
    }

    private stopDrag(): void {
        this.isDragging = false;
        this.container.style.userSelect = '';
        document.body.style.userSelect = '';
    }

    private closeWindow(): void {
        // Create closing animation
        this.container.style.transition = 'all 0.3s ease-out';
        this.container.style.transform = 'scale(0.9)';
        this.container.style.opacity = '0';
        
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 300);
    }

    private minimizeWindow(): void {
        // Create minimize animation
        this.container.style.transition = 'all 0.3s ease-out';
        this.container.style.transform = 'scale(0.1) translateY(100vh)';
        this.container.style.opacity = '0';
        
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 300);
    }

    private toggleMaximize(): void {
        this.isMaximized = !this.isMaximized;
        
        if (this.isMaximized) {
            this.container.style.transition = 'all 0.3s ease-out';
            this.container.style.position = 'fixed';
            this.container.style.top = '0';
            this.container.style.left = '0';
            this.container.style.width = '100vw';
            this.container.style.height = '100vh';
            this.container.style.borderRadius = '0';
        } else {
            this.container.style.transition = 'all 0.3s ease-out';
            this.container.style.position = 'absolute';
            this.container.style.top = '5%';
            this.container.style.left = '5%';
            this.container.style.width = '90%';
            this.container.style.height = '90%';
            this.container.style.borderRadius = '8px';
        }

        // Update maximize button appearance
        const maximizeBtn = this.header?.querySelector('.control.maximize');
        if (maximizeBtn) {
            maximizeBtn.classList.toggle('maximized', this.isMaximized);
        }
    }

    private handleWindowResize(): void {
        if (this.isMaximized) {
            this.container.style.width = '100vw';
            this.container.style.height = '100vh';
        } else {
            // Ensure window stays within viewport
            const rect = this.container.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;

            if (rect.left > maxX) {
                this.container.style.left = `${maxX}px`;
            }
            if (rect.top > maxY) {
                this.container.style.top = `${maxY}px`;
            }
        }
    }

    // Public methods
    handleResize(): void {
        this.handleWindowResize();
    }

    focus(): void {
        this.container.focus();
    }

    blur(): void {
        this.container.blur();
    }

    setTitle(title: string): void {
        const titleElement = this.header?.querySelector('.window-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    show(): void {
        this.container.style.display = 'block';
        this.container.style.transition = 'all 0.3s ease-in';
        this.container.style.transform = 'scale(1)';
        this.container.style.opacity = '1';
    }

    hide(): void {
        this.container.style.transition = 'all 0.3s ease-out';
        this.container.style.transform = 'scale(0.9)';
        this.container.style.opacity = '0';
        
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 300);
    }

    getContainer(): HTMLElement {
        return this.container;
    }

    isVisible(): boolean {
        return this.container.style.display !== 'none';
    }

    isWindowMaximized(): boolean {
        return this.isMaximized;
    }
}
