import { PortfolioConfig, TerminalState, FileSystemNode } from '../types/portfolio';
import { DataService } from '../services/DataService';
import { Terminal } from './Terminal';
import { FileTree } from './FileTree';
import { ContentDisplay } from './ContentDisplay';
import { CommandLine } from './CommandLine';

export class PortfolioApp {
    private container: HTMLElement;
    private config: PortfolioConfig | null = null;
    private dataService: DataService;
    private terminal: Terminal | null = null;
    private fileTree: FileTree | null = null;
    private contentDisplay: ContentDisplay | null = null;
    private commandLine: CommandLine | null = null;
    private state: TerminalState;

    constructor(container: HTMLElement) {
        this.container = container;
        this.dataService = new DataService();
        this.state = {
            currentPath: '/home/chun/portfolio',
            commandHistory: [],
            currentCommand: '',
            isExecuting: false,
            output: []
        };
    }

    async init(): Promise<void> {
        try {
            // Load configuration and data
            await this.loadData();
            
            // Initialize components
            this.initComponents();
            
            // Setup event listeners
            this.bindEvents();
            
            // Apply theme
            this.applyTheme();
            
            console.log('Portfolio app initialized successfully');
        } catch (error) {
            console.error('Failed to initialize portfolio app:', error);
            throw error;
        }
    }

    private async loadData(): Promise<void> {
        this.config = await this.dataService.getPortfolioConfig();
        if (!this.config) {
            throw new Error('Failed to load portfolio configuration');
        }
    }

    private initComponents(): void {
        if (!this.config) return;

        // Initialize terminal window
        const terminalWindow = this.container.querySelector('#terminal-window') as HTMLElement;
        if (terminalWindow) {
            this.terminal = new Terminal(terminalWindow, this.config.theme);
        }

        // Initialize file tree
        const fileTreeContainer = this.container.querySelector('#file-tree') as HTMLElement;
        if (fileTreeContainer) {
            this.fileTree = new FileTree(fileTreeContainer, this.config.navigation);
        }

        // Initialize content display
        const contentContainer = this.container.querySelector('#content-display') as HTMLElement;
        if (contentContainer) {
            this.contentDisplay = new ContentDisplay(contentContainer, this.config.theme);
        }

        // Initialize command line
        const commandContainer = this.container.querySelector('#command-line') as HTMLElement;
        if (commandContainer) {
            this.commandLine = new CommandLine(commandContainer, this.config.commands);
        }

        // Set initial content
        this.showWelcomeMessage();
    }

    private bindEvents(): void {
        // File tree navigation
        if (this.fileTree) {
            this.fileTree.onFileSelect((filePath: string) => {
                this.handleFileSelection(filePath);
            });

            this.fileTree.onDirectoryExpand((dirPath: string) => {
                this.handleDirectoryExpansion(dirPath);
            });
        }

        // Command execution
        if (this.commandLine) {
            this.commandLine.onCommand((command: string) => {
                this.executeCommand(command);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window resize
        window.addEventListener('app:resize', () => {
            this.handleResize();
        });
    }

    private applyTheme(): void {
        if (!this.config?.theme) return;

        const root = document.documentElement;
        const colors = this.config.theme.colors;

        // Apply CSS custom properties
        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-secondary', colors.secondary);
        root.style.setProperty('--color-background', colors.background);
        root.style.setProperty('--color-surface', colors.surface);
        root.style.setProperty('--color-text', colors.text);
        root.style.setProperty('--color-text-secondary', colors.textSecondary);
        root.style.setProperty('--color-accent', colors.accent);
        root.style.setProperty('--color-warning', colors.warning);
        root.style.setProperty('--color-error', colors.error);
        root.style.setProperty('--color-success', colors.success);

        // Apply fonts
        root.style.setProperty('--font-primary', colors.primary);
        root.style.setProperty('--font-mono', this.config.theme.fonts.mono);
    }

    private showWelcomeMessage(): void {
        if (!this.contentDisplay || !this.config) return;

        const welcomeContent = `
# Welcome to Chun's Portfolio Terminal

<pre style="color: #00FF41; font-family: 'Fira Code', 'Courier New', monospace; font-size: 12px; line-height: 1.1; background: rgba(0,255,65,0.1); padding: 15px; border-radius: 5px;">
 ██████╗██╗  ██╗██╗   ██╗███╗   ██╗
██╔════╝██║  ██║██║   ██║████╗  ██║
██║     ███████║██║   ██║██╔██╗ ██║
██║     ██╔══██║██║   ██║██║╚██╗██║
╚██████╗██║  ██║╚██████╔╝██║ ╚████║
 ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
                                   
  🛡️  Cybersecurity Specialist & Developer 🛡️
</pre>

## System Information
- **User:** ${this.config.personal.name}
- **System:** Kali Linux (Portfolio Edition)
- **Shell:** /bin/bash
- **Uptime:** Available 24/7
- **Security Level:** Maximum

## Available Commands
Type \`help\` to see all available commands or use the file tree to navigate.

## Quick Navigation
- **about/** - Personal information and skills
- **projects/** - Portfolio projects and demos  
- **contact/** - Get in touch
- **achievements/** - Certifications and awards

---
*Use \`ls\` to list directory contents or click on folders in the file tree.*
        `;

        this.contentDisplay.setContent({
            type: 'markdown',
            data: welcomeContent,
            metadata: {
                title: 'Welcome',
                description: 'Portfolio terminal welcome screen'
            }
        });

        this.updatePath('/home/chun/portfolio');
    }

    private async handleFileSelection(filePath: string): Promise<void> {
        if (!this.config || !this.contentDisplay) return;

        try {
            const fileData = await this.dataService.getFileContent(filePath);
            if (fileData && fileData.content) {
                this.contentDisplay.setContent(fileData.content);
                this.updatePath(filePath);
                
                // Add to command history
                this.state.commandHistory.push(`cat ${filePath}`);
            }
        } catch (error) {
            console.error('Failed to load file:', error);
            this.showError(`Failed to load file: ${filePath}`);
        }
    }

    private handleDirectoryExpansion(dirPath: string): void {
        this.updatePath(dirPath);
        
        // Add to command history
        this.state.commandHistory.push(`cd ${dirPath}`);
    }

    private async executeCommand(command: string): Promise<void> {
        if (!this.config || !this.contentDisplay) return;

        this.state.isExecuting = true;
        this.state.commandHistory.push(command);

        try {
            const result = await this.dataService.executeCommand(command, this.state.currentPath);
            
            if (result.success && result.data) {
                switch (result.data.action) {
                    case 'navigate':
                        this.updatePath(result.data.path);
                        break;
                    case 'display':
                        this.contentDisplay.setContent(result.data.content);
                        break;
                    case 'list':
                        this.contentDisplay.setContent({
                            type: 'text',
                            data: result.data.listing
                        });
                        break;
                    case 'help':
                        this.showHelpContent();
                        break;
                    case 'clear':
                        this.contentDisplay.clear();
                        break;
                }
            } else {
                this.showError(result.error || 'Command failed');
            }
        } catch (error) {
            console.error('Command execution failed:', error);
            this.showError('Command execution failed');
        } finally {
            this.state.isExecuting = false;
        }
    }

    private showHelpContent(): void {
        if (!this.config || !this.contentDisplay) return;

        const helpText = this.config.commands.map(cmd => 
            `${cmd.command.padEnd(12)} - ${cmd.description}\n    Usage: ${cmd.usage}`
        ).join('\n\n');

        this.contentDisplay.setContent({
            type: 'text',
            data: `Available Commands:\n\n${helpText}\n\nNavigation:\n- Click on folders/files in the file tree\n- Use cd to change directories\n- Use cat to display file contents`
        });
    }

    private showError(message: string): void {
        if (!this.contentDisplay) return;

        this.contentDisplay.setContent({
            type: 'text',
            data: `Error: ${message}`
        });
    }

    private updatePath(newPath: string): void {
        this.state.currentPath = newPath;
        
        // Update path display
        const pathElement = document.getElementById('current-path');
        if (pathElement) {
            pathElement.textContent = newPath;
        }

        // Update terminal header
        const headerElement = document.querySelector('.window-title');
        if (headerElement) {
            const dirName = newPath.split('/').pop() || 'portfolio';
            headerElement.textContent = `chun@kali: ${dirName}`;
        }

        // Update command line prompt
        if (this.commandLine) {
            this.commandLine.updatePath(newPath);
        }
    }

    private handleKeyboardShortcuts(e: KeyboardEvent): void {
        // Ctrl+L to clear terminal
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            this.contentDisplay?.clear();
        }

        // Ctrl+C to cancel current operation
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            this.state.isExecuting = false;
        }

        // Focus command line on any typing (except when in input)
        if (!e.ctrlKey && !e.altKey && e.key.length === 1) {
            const target = e.target as HTMLElement;
            if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                this.commandLine?.focus();
            }
        }
    }

    private handleResize(): void {
        // Responsive adjustments
        const width = window.innerWidth;
        
        if (width < 768) {
            // Mobile layout adjustments
            this.container.classList.add('mobile-layout');
        } else {
            this.container.classList.remove('mobile-layout');
        }

        // Notify components of resize
        this.terminal?.handleResize();
        this.fileTree?.handleResize();
        this.contentDisplay?.handleResize();
    }

    show(): void {
        this.container.style.opacity = '0';
        this.container.style.display = 'block';
        
        // Fade in animation
        setTimeout(() => {
            this.container.style.transition = 'opacity 0.5s ease-in';
            this.container.style.opacity = '1';
        }, 100);
    }

    hide(): void {
        this.container.style.transition = 'opacity 0.3s ease-out';
        this.container.style.opacity = '0';
        
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 300);
    }

    // Public methods for external control
    getCurrentPath(): string {
        return this.state.currentPath;
    }

    getCommandHistory(): string[] {
        return [...this.state.commandHistory];
    }

    isExecutingCommand(): boolean {
        return this.state.isExecuting;
    }

    // Debug methods for testing
    public debugFileTree(): void {
        if (this.fileTree) {
            (this.fileTree as any).debugNavigationStructure();
        }
    }

    public debugDataService(): void {
        console.log('🐛 DataService config loaded:', !!this.dataService);
        this.dataService.getPortfolioConfig().then(config => {
            console.log('🐛 Portfolio config:', config);
        });
    }
}
