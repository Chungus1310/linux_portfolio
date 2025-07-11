interface TypingEffectOptions {
    speed: number;
    delay: number;
    deleteSpeed: number;
    cursor: boolean;
    cursorChar: string;
    preserveMarkup: boolean;
}

export class TypingEffect {
    private readonly defaultOptions: TypingEffectOptions = {
        speed: 15,
        delay: 0,
        deleteSpeed: 10,
        cursor: true,
        cursorChar: '█',
        preserveMarkup: false
    };

    async typeText(
        element: HTMLElement, 
        text: string, 
        options: Partial<TypingEffectOptions> = {}
    ): Promise<void> {
        const config = { ...this.defaultOptions, ...options };
        
        // Clear element
        element.innerHTML = '';
        
        // Add cursor if enabled
        let cursor: HTMLElement | null = null;
        if (config.cursor) {
            cursor = this.createCursor(config.cursorChar);
            element.appendChild(cursor);
        }

        // Wait for initial delay
        if (config.delay > 0) {
            await this.sleep(config.delay);
        }

        // Type each character
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            // Create text node for character
            const textNode = document.createTextNode(char);
            
            // Insert before cursor (with safety check)
            if (cursor && cursor.parentNode === element) {
                element.insertBefore(textNode, cursor);
            } else {
                element.appendChild(textNode);
            }

            // Wait for typing speed
            await this.sleep(config.speed + Math.random() * 10);

            // Add small random pauses for realistic typing
            if (Math.random() < 0.1) {
                await this.sleep(100 + Math.random() * 200);
            }
        }

        // Hide cursor after typing is complete
        if (cursor && config.cursor) {
            setTimeout(() => {
                cursor!.style.opacity = '0.3';
            }, 1000);
        }
    }

    async typeHTML(
        element: HTMLElement,
        html: string,
        options: Partial<TypingEffectOptions> = {}
    ): Promise<void> {
        const config = { ...this.defaultOptions, ...options };
        
        // Parse HTML to extract text content and markup
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
        const container = doc.querySelector('div');
        
        if (!container) {
            return this.typeText(element, html, options);
        }

        element.innerHTML = '';
        
        let cursor: HTMLElement | null = null;
        if (config.cursor) {
            cursor = this.createCursor(config.cursorChar);
            element.appendChild(cursor);
        }

        await this.typeElementContent(container, element, cursor, config);

        if (cursor) {
            setTimeout(() => {
                cursor!.style.opacity = '0.3';
            }, 1000);
        }
    }

    private async typeElementContent(
        source: Element,
        target: HTMLElement,
        cursor: HTMLElement | null,
        config: TypingEffectOptions
    ): Promise<void> {
        for (const node of Array.from(source.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE) {
                // Type text content
                const text = node.textContent || '';
                for (const char of text) {
                    const textNode = document.createTextNode(char);
                    if (cursor) {
                        target.insertBefore(textNode, cursor);
                    } else {
                        target.appendChild(textNode);
                    }
                    await this.sleep(config.speed + Math.random() * 10);
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Create element and type its content
                const element = node.cloneNode(false) as HTMLElement;
                if (cursor) {
                    target.insertBefore(element, cursor);
                } else {
                    target.appendChild(element);
                }
                
                await this.typeElementContent(
                    node as Element,
                    element,
                    null,
                    config
                );
            }
        }
    }

    async deleteText(
        element: HTMLElement, 
        options: Partial<TypingEffectOptions> = {}
    ): Promise<void> {
        const config = { ...this.defaultOptions, ...options };
        const text = element.textContent || '';
        
        let cursor: HTMLElement | null = null;
        if (config.cursor) {
            cursor = this.createCursor(config.cursorChar);
            element.appendChild(cursor);
        }

        // Delete each character
        for (let i = text.length - 1; i >= 0; i--) {
            // Remove the last character
            if (cursor) {
                const lastChild = element.lastChild;
                if (lastChild && lastChild !== cursor && lastChild.nodeType === Node.TEXT_NODE) {
                    const textContent = lastChild.textContent || '';
                    if (textContent.length > 0) {
                        lastChild.textContent = textContent.slice(0, -1);
                        if (textContent.length === 1) {
                            element.removeChild(lastChild);
                        }
                    }
                }
            } else {
                const textContent = element.textContent || '';
                element.textContent = textContent.slice(0, -1);
            }

            // Wait for delete speed
            await this.sleep(config.deleteSpeed + Math.random() * 5);
        }

        // Remove cursor if added
        if (cursor) {
            setTimeout(() => {
                if (cursor && cursor.parentNode) {
                    cursor.parentNode.removeChild(cursor);
                }
            }, 500);
        }
    }

    async typewriter(
        element: HTMLElement,
        texts: string[],
        options: Partial<TypingEffectOptions> = {}
    ): Promise<void> {
        const config = { ...this.defaultOptions, ...options };
        
        for (const text of texts) {
            await this.typeText(element, text, { ...config, cursor: false });
            await this.sleep(2000); // Pause between texts
            await this.deleteText(element, config);
            await this.sleep(500);
        }
    }

    createTypingPrompt(
        container: HTMLElement,
        promptText: string = 'chun@kali:~$ '
    ): HTMLElement {
        const promptElement = document.createElement('div');
        promptElement.className = 'typing-prompt';
        promptElement.innerHTML = `
            <span class="prompt-prefix">${promptText}</span>
            <span class="prompt-input"></span>
            <span class="prompt-cursor">█</span>
        `;
        
        container.appendChild(promptElement);
        return promptElement;
    }

    async simulateCommand(
        promptElement: HTMLElement,
        command: string,
        output?: string,
        options: Partial<TypingEffectOptions> = {}
    ): Promise<void> {
        const config = { ...this.defaultOptions, ...options };
        const inputElement = promptElement.querySelector('.prompt-input') as HTMLElement;
        const cursorElement = promptElement.querySelector('.prompt-cursor') as HTMLElement;
        
        if (!inputElement || !cursorElement) return;

        // Type the command
        await this.typeText(inputElement, command, { ...config, cursor: false });
        
        // Hide cursor and simulate enter
        cursorElement.style.display = 'none';
        
        // Add output if provided
        if (output) {
            const outputElement = document.createElement('div');
            outputElement.className = 'command-output';
            promptElement.insertAdjacentElement('afterend', outputElement);
            
            await this.sleep(200);
            await this.typeText(outputElement, output, { ...config, cursor: false });
        }
    }

    private createCursor(char: string): HTMLElement {
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.textContent = char;
        cursor.style.cssText = `
            animation: blink 1s infinite;
            color: var(--color-primary, #00FF41);
        `;
        return cursor;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Utility method for creating realistic typing patterns
    getVariableSpeed(baseSpeed: number, variation: number = 0.3): number {
        const variance = baseSpeed * variation;
        return baseSpeed + (Math.random() - 0.5) * variance;
    }

    // Method to simulate typing errors and corrections
    async typeWithErrors(
        element: HTMLElement,
        text: string,
        errorRate: number = 0.05,
        options: Partial<TypingEffectOptions> = {}
    ): Promise<void> {
        const config = { ...this.defaultOptions, ...options };
        element.innerHTML = '';
        
        let cursor: HTMLElement | null = null;
        if (config.cursor) {
            cursor = this.createCursor(config.cursorChar);
            element.appendChild(cursor);
        }

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            // Randomly introduce typing errors
            if (Math.random() < errorRate && char.match(/[a-zA-Z]/)) {
                // Type wrong character
                const wrongChar = String.fromCharCode(char.charCodeAt(0) + 1);
                const wrongNode = document.createTextNode(wrongChar);
                
                if (cursor) {
                    element.insertBefore(wrongNode, cursor);
                } else {
                    element.appendChild(wrongNode);
                }
                
                await this.sleep(config.speed);
                
                // Pause (realize mistake)
                await this.sleep(300 + Math.random() * 500);
                
                // Delete wrong character
                element.removeChild(wrongNode);
                await this.sleep(config.deleteSpeed);
                
                // Brief pause before typing correct character
                await this.sleep(100);
            }
            
            // Type correct character
            const textNode = document.createTextNode(char);
            if (cursor) {
                element.insertBefore(textNode, cursor);
            } else {
                element.appendChild(textNode);
            }
            
            await this.sleep(this.getVariableSpeed(config.speed));
        }

        if (cursor) {
            setTimeout(() => {
                cursor!.style.opacity = '0.3';
            }, 1000);
        }
    }

    // Chain multiple typing effects
    async typeSequence(
        sequences: Array<{
            element: HTMLElement;
            text: string;
            options?: Partial<TypingEffectOptions>;
        }>
    ): Promise<void> {
        for (const sequence of sequences) {
            await this.typeText(sequence.element, sequence.text, sequence.options);
            await this.sleep(500); // Brief pause between sequences
        }
    }
}
