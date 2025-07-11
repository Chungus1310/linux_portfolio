export class LoadingScreen {
    private element: HTMLElement | null = null;

    constructor() {
        this.element = document.getElementById('loading-screen');
    }

    show(): void {
        if (this.element) {
            this.element.style.display = 'flex';
            this.element.style.opacity = '1';
            this.startTypingAnimation();
        }
    }

    hide(): void {
        if (this.element) {
            this.element.style.transition = 'opacity 0.5s ease-out';
            this.element.style.opacity = '0';
            
            setTimeout(() => {
                if (this.element) {
                    this.element.style.display = 'none';
                }
            }, 500);
        }
    }

    private startTypingAnimation(): void {
        const messages = [
            'Initializing terminal...',
            'Loading security protocols...',
            'Establishing secure connection...',
            'Mounting file systems...',
            'Starting portfolio services...',
            'Ready for infiltration...'
        ];

        let messageIndex = 0;
        let charIndex = 0;
        let currentMessage = '';
        
        const messageElement = this.element?.querySelector('.loading-message');
        if (!messageElement) return;

        const typeChar = () => {
            if (messageIndex >= messages.length) {
                messageElement.textContent = 'System ready.';
                return;
            }

            const targetMessage = messages[messageIndex];
            
            if (charIndex < targetMessage.length) {
                currentMessage += targetMessage[charIndex];
                messageElement.textContent = currentMessage;
                charIndex++;
                setTimeout(typeChar, 50 + Math.random() * 100);
            } else {
                setTimeout(() => {
                    currentMessage = '';
                    charIndex = 0;
                    messageIndex++;
                    typeChar();
                }, 800);
            }
        };

        // Create message element if it doesn't exist
        if (!messageElement) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'loading-message';
            messageDiv.style.cssText = `
                font-size: 14px;
                color: #8B949E;
                margin-top: 10px;
                min-height: 20px;
            `;
            this.element?.appendChild(messageDiv);
        }

        setTimeout(typeChar, 500);
    }
}
