import { MatrixCharacter } from '../types/portfolio';

export class MatrixBackground {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private characters: MatrixCharacter[] = [];
    private animationId: number = 0;
    private isRunning: boolean = false;
    
    // Matrix characters (mix of Latin, Japanese, and symbols)
    private readonly matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    
    private readonly colors = {
        primary: '#00FF41',
        secondary: '#39FF14', 
        fade: '#003d12'
    };

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2D context from canvas');
        }
        this.ctx = context;
        
        this.initCanvas();
        this.initCharacters();
        this.bindEvents();
    }

    private initCanvas(): void {
        this.resizeCanvas();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
    }

    private resizeCanvas(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    private initCharacters(): void {
        const columnWidth = 20;
        const columns = Math.floor(this.canvas.width / columnWidth);
        
        this.characters = [];
        
        for (let i = 0; i < columns; i++) {
            // Create multiple characters per column for trail effect
            const charactersInColumn = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < charactersInColumn; j++) {
                this.characters.push({
                    x: i * columnWidth + columnWidth / 2,
                    y: Math.random() * this.canvas.height,
                    character: this.getRandomCharacter(),
                    speed: Math.random() * 3 + 1,
                    opacity: Math.random(),
                    trail: Math.random() * 20 + 5
                });
            }
        }
    }

    private getRandomCharacter(): string {
        return this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
    }

    private bindEvents(): void {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.initCharacters();
        });

        // Performance optimization based on visibility
        window.addEventListener('app:visibility', (event: any) => {
            if (event.detail.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }

    pause(): void {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    resume(): void {
        if (!this.isRunning) {
            this.start();
        }
    }

    private animate(): void {
        if (!this.isRunning) return;

        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(13, 17, 23, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw characters
        this.characters.forEach((char, index) => {
            this.updateCharacter(char);
            this.drawCharacter(char);
            
            // Reset character if it goes off screen
            if (char.y > this.canvas.height + 50) {
                char.y = -50;
                char.character = this.getRandomCharacter();
                char.opacity = Math.random();
            }
        });

        // Occasionally change characters for dynamic effect
        if (Math.random() < 0.01) {
            const randomChar = this.characters[Math.floor(Math.random() * this.characters.length)];
            randomChar.character = this.getRandomCharacter();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    private updateCharacter(char: MatrixCharacter): void {
        char.y += char.speed;
        
        // Fade effect based on position
        const fadeStart = this.canvas.height * 0.7;
        if (char.y > fadeStart) {
            const fadeProgress = (char.y - fadeStart) / (this.canvas.height * 0.3);
            char.opacity = Math.max(0, 1 - fadeProgress);
        }
    }

    private drawCharacter(char: MatrixCharacter): void {
        // Draw character with glow effect
        this.ctx.font = '16px "Ubuntu Mono", monospace';
        
        // Glow effect
        this.ctx.shadowColor = this.colors.primary;
        this.ctx.shadowBlur = 10;
        
        // Main character
        this.ctx.fillStyle = `rgba(0, 255, 65, ${char.opacity})`;
        this.ctx.fillText(char.character, char.x, char.y);
        
        // Brighter head character
        if (char.opacity > 0.8) {
            this.ctx.fillStyle = this.colors.secondary;
            this.ctx.fillText(char.character, char.x, char.y);
        }
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }

    // Public method to create glitch effect
    glitch(): void {
        const glitchDuration = 200;
        const originalOpacity = this.canvas.style.opacity;
        
        // Random flicker effect
        const flicker = () => {
            this.canvas.style.opacity = Math.random() > 0.5 ? '0.8' : '1';
            this.canvas.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
        };
        
        const glitchInterval = setInterval(flicker, 50);
        
        setTimeout(() => {
            clearInterval(glitchInterval);
            this.canvas.style.opacity = originalOpacity;
            this.canvas.style.filter = 'none';
        }, glitchDuration);
    }

    // Method to adjust intensity based on system performance
    adjustPerformance(fps: number): void {
        if (fps < 30) {
            // Reduce character count for better performance
            this.characters = this.characters.slice(0, Math.floor(this.characters.length * 0.7));
        } else if (fps > 50 && this.characters.length < 100) {
            // Add more characters if performance is good
            this.initCharacters();
        }
    }
}
