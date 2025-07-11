import './styles/main.scss';
import { PortfolioApp } from './components/PortfolioApp';
import { MatrixBackground } from './animations/MatrixBackground';
import { LoadingScreen } from './components/LoadingScreen';

class AppInitializer {
    private app: PortfolioApp | null = null;
    private matrixBg: MatrixBackground | null = null;
    private loadingScreen: LoadingScreen | null = null;

    async init(): Promise<void> {
        try {
            // Show loading screen
            this.loadingScreen = new LoadingScreen();
            this.loadingScreen.show();

            // Preload critical resources
            await this.preloadAssets();

            // Initialize matrix background
            this.initMatrixBackground();

            // Initialize main application
            await this.initPortfolioApp();

            // Expose for debugging
            (window as any).portfolioApp = this.app;
            (window as any).debugFileTree = () => this.app?.debugFileTree();
            (window as any).debugDataService = () => this.app?.debugDataService();

            // Hide loading screen with animation
            setTimeout(() => {
                this.loadingScreen?.hide();
                this.app?.show();
            }, 1500);

        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showErrorMessage('Failed to load application. Please refresh the page.');
        }
    }

    private async preloadAssets(): Promise<void> {
        const assets = [
            '/data/portfolio-config.json',
            '/data/projects.json'
        ];

        const promises = assets.map(async (asset) => {
            try {
                const response = await fetch(asset);
                if (!response.ok) {
                    throw new Error(`Failed to load ${asset}`);
                }
                return response.json();
            } catch (error) {
                console.warn(`Failed to preload ${asset}:`, error);
                return null;
            }
        });

        await Promise.allSettled(promises);
    }

    private initMatrixBackground(): void {
        const canvas = document.getElementById('matrix-bg') as HTMLCanvasElement;
        if (canvas) {
            this.matrixBg = new MatrixBackground(canvas);
            this.matrixBg.start();
        }
    }

    private async initPortfolioApp(): Promise<void> {
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            throw new Error('App container not found');
        }

        this.app = new PortfolioApp(appContainer);
        await this.app.init();
    }

    private showErrorMessage(message: string): void {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div style="text-align: center; color: #FF4444;">
                    <div style="font-size: 18px; margin-bottom: 10px;">⚠️ Error</div>
                    <div style="font-size: 14px;">${message}</div>
                    <button onclick="location.reload()" style="
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: #00FF41;
                        color: #0D1117;
                        border: none;
                        border-radius: 4px;
                        font-family: 'JetBrains Mono', monospace;
                        cursor: pointer;
                    ">Reload Page</button>
                </div>
            `;
        }
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const initializer = new AppInitializer();
    initializer.init();
});

// Handle window resize for responsive design
let resizeTimeout: number;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
        // Notify components of resize
        window.dispatchEvent(new CustomEvent('app:resize'));
    }, 150);
});

// Handle visibility change for performance optimization
document.addEventListener('visibilitychange', () => {
    const event = new CustomEvent('app:visibility', {
        detail: { hidden: document.hidden }
    });
    window.dispatchEvent(event);
});

// Prevent context menu in production
if (process.env.NODE_ENV === 'production') {
    document.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Export for debugging in development
if (process.env.NODE_ENV === 'development') {
    (window as any).portfolioApp = {
        version: '1.0.0',
        debug: true
    };
}
