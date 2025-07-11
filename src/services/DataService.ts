import { 
    PortfolioConfig, 
    NavigationItem, 
    FileContent, 
    Project, 
    ApiResponse,
    CommandAction 
} from '../types/portfolio';

export class DataService {
    private config: PortfolioConfig | null = null;
    private projectsData: any = null;

    async getPortfolioConfig(): Promise<PortfolioConfig> {
        if (this.config) {
            return this.config;
        }

        try {
            const response = await fetch('/data/portfolio-config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.config = await response.json();
            return this.config!;
        } catch (error) {
            console.error('Failed to load portfolio config:', error);
            throw new Error('Failed to load portfolio configuration');
        }
    }

    async getProjectsData(): Promise<any> {
        if (this.projectsData) {
            return this.projectsData;
        }

        try {
            const response = await fetch('/data/projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.projectsData = await response.json();
            return this.projectsData;
        } catch (error) {
            console.error('Failed to load projects data:', error);
            throw new Error('Failed to load projects data');
        }
    }

    async getFileContent(filePath: string): Promise<NavigationItem | null> {
        if (!this.config) {
            await this.getPortfolioConfig();
        }

        try {
            const fileNode = this.findFileByPath(filePath, this.config!.navigation);
            if (!fileNode || fileNode.type !== 'file') {
                return null;
            }

            // Create a deep copy to avoid modifying the original config
            const fileCopy = JSON.parse(JSON.stringify(fileNode));

            // Handle dynamic content loading
            if (fileCopy.content?.type === 'json' && typeof fileCopy.content.data === 'string') {
                const projectsData = await this.getProjectsData();
                const dataKey = fileCopy.content.data;
                if (projectsData[dataKey]) {
                    fileCopy.content.data = projectsData[dataKey];
                } else {
                    console.warn(`Data key "${dataKey}" not found in projects.json`);
                }
            }

            return fileCopy;
        } catch (error) {
            console.error('Failed to get file content:', error);
            return null;
        }
    }

    async executeCommand(command: string, currentPath: string): Promise<ApiResponse<any>> {
        const args = command.trim().split(/\s+/);
        const cmd = args[0].toLowerCase();
        const param = args.slice(1).join(' ');

        try {
            switch (cmd) {
                case 'ls':
                case 'dir':
                    return this.handleListCommand(param || currentPath);
                
                case 'cd':
                    return this.handleChangeDirectory(param, currentPath);
                
                case 'cat':
                    return this.handleDisplayFile(param);
                
                case 'help':
                    return this.handleHelpCommand(param);
                
                case 'clear':
                    return {
                        success: true,
                        data: { action: 'clear' },
                        timestamp: new Date().toISOString()
                    };
                
                case 'find':
                    return this.handleSearchCommand(param);
                
                case 'contact':
                    return this.handleContactCommand();
                
                case 'download':
                    return this.handleDownloadCommand(param);
                
                default:
                    return {
                        success: false,
                        error: `Command not found: ${cmd}. Type 'help' for available commands.`,
                        timestamp: new Date().toISOString()
                    };
            }
        } catch (error) {
            return {
                success: false,
                error: `Command execution failed: ${error}`,
                timestamp: new Date().toISOString()
            };
        }
    }

    private async handleListCommand(path: string): Promise<ApiResponse<any>> {
        if (!this.config) {
            await this.getPortfolioConfig();
        }

        const directory = this.findFileByPath(path, this.config!.navigation);
        if (!directory || directory.type !== 'directory') {
            return {
                success: false,
                error: `Directory not found: ${path}`,
                timestamp: new Date().toISOString()
            };
        }

        const listing = this.formatDirectoryListing(directory);
        return {
            success: true,
            data: {
                action: 'list',
                listing: listing
            },
            timestamp: new Date().toISOString()
        };
    }

    private handleChangeDirectory(path: string, currentPath: string): ApiResponse<any> {
        if (!path) {
            return {
                success: false,
                error: 'Usage: cd <directory>',
                timestamp: new Date().toISOString()
            };
        }

        let targetPath = path;
        if (!path.startsWith('/')) {
            // Handle relative paths
            targetPath = this.resolvePath(currentPath, path);
        }

        const directory = this.findFileByPath(targetPath, this.config!.navigation);
        if (!directory || directory.type !== 'directory') {
            return {
                success: false,
                error: `Directory not found: ${path}`,
                timestamp: new Date().toISOString()
            };
        }

        return {
            success: true,
            data: {
                action: 'navigate',
                path: targetPath
            },
            timestamp: new Date().toISOString()
        };
    }

    private async handleDisplayFile(filename: string): Promise<ApiResponse<any>> {
        if (!filename) {
            return {
                success: false,
                error: 'Usage: cat <filename>',
                timestamp: new Date().toISOString()
            };
        }

        const fileContent = await this.getFileContent(filename);
        if (!fileContent || !fileContent.content) {
            return {
                success: false,
                error: `File not found: ${filename}`,
                timestamp: new Date().toISOString()
            };
        }

        return {
            success: true,
            data: {
                action: 'display',
                content: fileContent.content
            },
            timestamp: new Date().toISOString()
        };
    }

    private handleHelpCommand(command?: string): ApiResponse<any> {
        return {
            success: true,
            data: {
                action: 'help',
                command: command
            },
            timestamp: new Date().toISOString()
        };
    }

    private async handleSearchCommand(query: string): Promise<ApiResponse<any>> {
        if (!query) {
            return {
                success: false,
                error: 'Usage: find <search term>',
                timestamp: new Date().toISOString()
            };
        }

        const results = await this.searchContent(query);
        const resultText = results.length > 0 
            ? results.map(r => `${r.path}: ${r.match}`).join('\n')
            : 'No results found.';

        return {
            success: true,
            data: {
                action: 'display',
                content: {
                    type: 'text',
                    data: `Search results for "${query}":\n\n${resultText}`
                }
            },
            timestamp: new Date().toISOString()
        };
    }

    private async handleContactCommand(): Promise<ApiResponse<any>> {
        const contactFile = await this.getFileContent('/home/chun/portfolio/contact/social-links.json');
        
        return {
            success: true,
            data: {
                action: 'display',
                content: contactFile?.content || {
                    type: 'text',
                    data: 'Contact information not available.'
                }
            },
            timestamp: new Date().toISOString()
        };
    }

    private handleDownloadCommand(filename: string): ApiResponse<any> {
        if (!filename) {
            return {
                success: false,
                error: 'Usage: download <filename>',
                timestamp: new Date().toISOString()
            };
        }

        // Simulate download
        const downloadUrl = `/assets/documents/${filename}`;
        window.open(downloadUrl, '_blank');

        return {
            success: true,
            data: {
                action: 'display',
                content: {
                    type: 'text',
                    data: `Downloading ${filename}...`
                }
            },
            timestamp: new Date().toISOString()
        };
    }

    private findFileByPath(path: string, navigation: any): NavigationItem | null {
        console.log('🔍 Finding file by path:', path);
        
        // Normalize path - remove leading slash and handle root portfolio path
        let normalizedPath = path.replace(/^\/+/, '');
        console.log('📍 Normalized path:', normalizedPath);
        
        // Handle special cases for portfolio root paths
        if (normalizedPath === 'home/chun/portfolio' || normalizedPath === '') {
            console.log('🏠 Returning root directory');
            // Return a virtual root directory
            return {
                type: 'directory',
                name: 'portfolio',
                path: '/home/chun/portfolio',
                children: navigation
            };
        }
        
        // Remove common prefix paths to get to the actual navigation structure
        normalizedPath = normalizedPath
            .replace(/^home\/chun\/portfolio\//, '')
            .replace(/^portfolio\//, '');
        
        console.log('🎯 Final normalized path:', normalizedPath);
        
        if (normalizedPath === '') {
            console.log('🏠 Returning root directory (empty path)');
            return {
                type: 'directory',
                name: 'portfolio',
                path: '/home/chun/portfolio',
                children: navigation
            };
        }
        
        const pathParts = normalizedPath.split('/').filter(part => part);
        console.log('📂 Path parts:', pathParts);
        let current = navigation;

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            console.log(`🔎 Looking for part "${part}" in:`, Object.keys(current));
            
            if (current[part]) {
                current = current[part];
                console.log(`✅ Found "${part}":`, current.name || 'unnamed');
            } else if (current.children && current.children[part]) {
                current = current.children[part];
                console.log(`✅ Found "${part}" in children:`, current.name || 'unnamed');
            } else {
                console.log(`❌ Part "${part}" not found`);
                return null;
            }
        }

        console.log('🎉 Final result:', current);
        return current;
    }

    private formatDirectoryListing(directory: NavigationItem): string {
        if (!directory.children) {
            return 'Empty directory';
        }

        const entries = Object.values(directory.children).map(item => {
            const permissions = item.permissions || '----------';
            const size = item.size || '0';
            const modified = item.modified || '2024-12-15';
            const icon = item.type === 'directory' ? '📁' : item.icon || '📄';
            
            return `${permissions} ${size.padStart(8)} ${modified} ${icon} ${item.name}`;
        });

        return `total ${entries.length}\n${entries.join('\n')}`;
    }

    private resolvePath(currentPath: string, relativePath: string): string {
        if (relativePath === '..') {
            const parts = currentPath.split('/').filter(p => p);
            parts.pop();
            return '/' + parts.join('/');
        }
        
        if (relativePath === '.') {
            return currentPath;
        }

        return `${currentPath}/${relativePath}`.replace(/\/+/g, '/');
    }

    private async searchContent(query: string): Promise<Array<{path: string, match: string}>> {
        const results: Array<{path: string, match: string}> = [];
        const searchTerms = query.toLowerCase().split(/\s+/);

        const searchInNavigation = (nav: any, basePath: string = '') => {
            Object.values(nav).forEach((item: any) => {
                const fullPath = `${basePath}/${item.name}`;
                
                // Search in file names
                if (searchTerms.some(term => item.name.toLowerCase().includes(term))) {
                    results.push({
                        path: fullPath,
                        match: `Filename matches: ${item.name}`
                    });
                }

                // Search in content
                if (item.content?.data && typeof item.content.data === 'string') {
                    const content = item.content.data.toLowerCase();
                    if (searchTerms.some(term => content.includes(term))) {
                        results.push({
                            path: fullPath,
                            match: 'Content contains search term'
                        });
                    }
                }

                // Search in children
                if (item.children) {
                    searchInNavigation(item.children, fullPath);
                }
            });
        };

        if (this.config) {
            searchInNavigation(this.config.navigation, '/home/chun/portfolio');
        }

        return results.slice(0, 10); // Limit results
    }
}
