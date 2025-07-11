import { CommandConfig } from '../types/portfolio';

export class CommandLine {
    private container: HTMLElement;
    private commands: CommandConfig[];
    private input: HTMLInputElement | null = null;
    private promptElement: HTMLElement | null = null;
    private pathElement: HTMLElement | null = null;
    private onCommandCallback?: (command: string) => void;
    private commandHistory: string[] = [];
    private historyIndex: number = -1;
    private currentPath: string = '~';

    constructor(container: HTMLElement, commands: CommandConfig[]) {
        this.container = container;
        this.commands = commands;
        this.init();
    }

    private init(): void {
        this.input = this.container.querySelector('#command-input') as HTMLInputElement;
        this.promptElement = this.container.querySelector('.prompt') as HTMLElement;
        this.pathElement = this.container.querySelector('.path') as HTMLElement;
        
        if (this.input) {
            this.setupInput();
            this.bindEvents();
            this.setupAutoComplete();
        }
    }

    private setupInput(): void {
        if (!this.input) return;

        this.input.setAttribute('autocomplete', 'off');
        this.input.setAttribute('spellcheck', 'false');
        this.input.style.cssText = `
            background: transparent;
            border: none;
            outline: none;
            color: var(--color-text, #F0F6FC);
            font-family: var(--font-mono, 'Ubuntu Mono', monospace);
            font-size: 14px;
            flex: 1;
            padding: 0;
            margin: 0;
        `;
    }

    private bindEvents(): void {
        if (!this.input) return;

        this.input.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        this.input.addEventListener('input', (e) => {
            this.handleInput(e);
        });

        this.input.addEventListener('focus', () => {
            this.showCursor();
        });

        this.input.addEventListener('blur', () => {
            this.hideCursor();
        });

        // Auto-focus when clicking anywhere in the terminal
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.closest('.terminal-window')) {
                this.focus();
            }
        });
    }

    private handleKeyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                this.executeCommand();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.navigateHistory(-1);
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                this.navigateHistory(1);
                break;
                
            case 'Tab':
                e.preventDefault();
                this.autoComplete();
                break;
                
            case 'c':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.clearInput();
                }
                break;
                
            case 'l':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.onCommandCallback?.('clear');
                }
                break;
        }
    }

    private handleInput(e: Event): void {
        const target = e.target as HTMLInputElement;
        this.updateInputDisplay(target.value);
    }

    private executeCommand(): void {
        if (!this.input) return;

        const command = this.input.value.trim();
        if (command) {
            this.addToHistory(command);
            this.onCommandCallback?.(command);
        }
        
        this.clearInput();
    }

    private navigateHistory(direction: number): void {
        if (!this.input || this.commandHistory.length === 0) return;

        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.input.value = '';
            return;
        }

        this.input.value = this.commandHistory[this.historyIndex] || '';
        this.updateInputDisplay(this.input.value);
        
        // Move cursor to end
        setTimeout(() => {
            if (this.input) {
                this.input.setSelectionRange(this.input.value.length, this.input.value.length);
            }
        }, 0);
    }

    private autoComplete(): void {
        if (!this.input) return;

        const currentValue = this.input.value;
        const words = currentValue.split(' ');
        const lastWord = words[words.length - 1];

        if (words.length === 1) {
            // Complete command
            const matchingCommands = this.commands
                .filter(cmd => cmd.command.startsWith(lastWord))
                .map(cmd => cmd.command);

            if (matchingCommands.length === 1) {
                this.input.value = matchingCommands[0] + ' ';
                this.updateInputDisplay(this.input.value);
            } else if (matchingCommands.length > 1) {
                this.showAutoCompleteOptions(matchingCommands);
            }
        } else {
            // Complete file paths or arguments
            this.completeFilePath(lastWord, words);
        }
    }

    private completeFilePath(partial: string, words: string[]): void {
        // Simplified file path completion
        const commonPaths = [
            'about/',
            'projects/',
            'contact/',
            'about/bio.txt',
            'about/skills.json',
            'about/experience.md',
            'projects/web-development/',
            'projects/cybersecurity/',
            'projects/open-source/',
            'contact/social-links.json',
            'contact/resume.pdf'
        ];

        const matches = commonPaths.filter(path => 
            path.startsWith(partial) || path.includes(partial)
        );

        if (matches.length === 1) {
            words[words.length - 1] = matches[0];
            if (this.input) {
                this.input.value = words.join(' ');
                this.updateInputDisplay(this.input.value);
            }
        } else if (matches.length > 1) {
            this.showAutoCompleteOptions(matches);
        }
    }

    private showAutoCompleteOptions(options: string[]): void {
        // Create temporary display of options
        const optionsDisplay = document.createElement('div');
        optionsDisplay.className = 'autocomplete-options';
        optionsDisplay.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 0;
            right: 0;
            background: var(--color-surface);
            border: 1px solid var(--color-primary);
            border-bottom: none;
            max-height: 200px;
            overflow-y: auto;
            font-family: var(--font-mono);
            font-size: 12px;
            z-index: 100;
        `;

        options.slice(0, 10).forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'autocomplete-option';
            optionElement.textContent = option;
            optionElement.style.cssText = `
                padding: 4px 8px;
                cursor: pointer;
                transition: background-color 0.2s;
            `;
            
            optionElement.addEventListener('mouseenter', () => {
                optionElement.style.backgroundColor = 'var(--color-primary)';
                optionElement.style.color = 'var(--color-background)';
            });
            
            optionElement.addEventListener('mouseleave', () => {
                optionElement.style.backgroundColor = 'transparent';
                optionElement.style.color = 'var(--color-text)';
            });

            optionElement.addEventListener('click', () => {
                if (this.input) {
                    const words = this.input.value.split(' ');
                    words[words.length - 1] = option;
                    this.input.value = words.join(' ') + ' ';
                    this.updateInputDisplay(this.input.value);
                    this.focus();
                }
                this.container.removeChild(optionsDisplay);
            });

            optionsDisplay.appendChild(optionElement);
        });

        this.container.style.position = 'relative';
        this.container.appendChild(optionsDisplay);

        // Remove options after delay
        setTimeout(() => {
            if (this.container.contains(optionsDisplay)) {
                this.container.removeChild(optionsDisplay);
            }
        }, 3000);
    }

    private setupAutoComplete(): void {
        // Add common command aliases
        const aliases = new Map([
            ['l', 'ls'],
            ['ll', 'ls -la'],
            ['la', 'ls -a'],
            ['..', 'cd ..'],
            ['~', 'cd ~'],
            ['cls', 'clear']
        ]);

        // Expand aliases when typing
        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === ' ' && this.input) {
                    const words = this.input.value.split(' ');
                    const firstWord = words[0];
                    
                    if (aliases.has(firstWord)) {
                        words[0] = aliases.get(firstWord)!;
                        this.input.value = words.join(' ');
                        this.updateInputDisplay(this.input.value);
                    }
                }
            });
        }
    }

    private addToHistory(command: string): void {
        // Don't add duplicate consecutive commands
        if (this.commandHistory.length === 0 || 
            this.commandHistory[this.commandHistory.length - 1] !== command) {
            this.commandHistory.push(command);
        }

        // Limit history size
        if (this.commandHistory.length > 100) {
            this.commandHistory.shift();
        }

        this.historyIndex = this.commandHistory.length;
    }

    private clearInput(): void {
        if (this.input) {
            this.input.value = '';
            this.updateInputDisplay('');
        }
    }

    private updateInputDisplay(value: string): void {
        // Update any visual indicators or custom display logic
        this.animateCursor();
    }

    private showCursor(): void {
        const cursor = this.container.querySelector('.cursor');
        if (cursor) {
            (cursor as HTMLElement).style.opacity = '1';
        }
    }

    private hideCursor(): void {
        const cursor = this.container.querySelector('.cursor');
        if (cursor) {
            (cursor as HTMLElement).style.opacity = '0.5';
        }
    }

    private animateCursor(): void {
        const cursor = this.container.querySelector('.cursor') as HTMLElement;
        if (cursor) {
            cursor.style.animation = 'none';
            setTimeout(() => {
                cursor.style.animation = 'blink 1s infinite';
            }, 10);
        }
    }

    // Public methods
    onCommand(callback: (command: string) => void): void {
        this.onCommandCallback = callback;
    }

    updatePath(newPath: string): void {
        this.currentPath = newPath;
        
        if (this.pathElement) {
            // Show simplified path
            const simplePath = newPath.replace('/home/chun/portfolio', '~');
            this.pathElement.textContent = simplePath;
        }
    }

    focus(): void {
        if (this.input) {
            this.input.focus();
        }
    }

    blur(): void {
        if (this.input) {
            this.input.blur();
        }
    }

    getCurrentCommand(): string {
        return this.input?.value || '';
    }

    setCommand(command: string): void {
        if (this.input) {
            this.input.value = command;
            this.updateInputDisplay(command);
        }
    }

    getCommandHistory(): string[] {
        return [...this.commandHistory];
    }

    clearHistory(): void {
        this.commandHistory = [];
        this.historyIndex = -1;
    }

    insertText(text: string): void {
        if (!this.input) return;

        const start = this.input.selectionStart || 0;
        const end = this.input.selectionEnd || 0;
        const value = this.input.value;

        this.input.value = value.substring(0, start) + text + value.substring(end);
        this.input.setSelectionRange(start + text.length, start + text.length);
        this.updateInputDisplay(this.input.value);
    }

    showHelp(): void {
        const helpText = this.commands.map(cmd => 
            `${cmd.command.padEnd(10)} - ${cmd.description}`
        ).join('\n');

        console.log('Available commands:\n' + helpText);
    }

    // Method to simulate typing a command (for demos)
    async simulateCommand(command: string, delay: number = 100): Promise<void> {
        if (!this.input) return;

        this.input.value = '';
        
        for (const char of command) {
            this.input.value += char;
            this.updateInputDisplay(this.input.value);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        this.executeCommand();
    }

    // Enable/disable command input
    setEnabled(enabled: boolean): void {
        if (this.input) {
            this.input.disabled = !enabled;
            this.input.style.opacity = enabled ? '1' : '0.5';
        }
    }

    isEnabled(): boolean {
        return this.input ? !this.input.disabled : false;
    }
}
