import { NavigationStructure, NavigationItem } from '../types/portfolio';

export class FileTree {
    private container: HTMLElement;
    private navigation: NavigationStructure;
    private onFileSelectCallback?: (path: string) => void;
    private onDirectoryExpandCallback?: (path: string) => void;
    private expandedDirs = new Set<string>();

    constructor(container: HTMLElement, navigation: NavigationStructure) {
        this.container = container;
        this.navigation = navigation;
        this.init();
    }

    private init(): void {
        this.render();
        this.bindEvents();
    }

    private render(): void {
        const treeContent = this.container.querySelector('.tree-content');
        if (!treeContent) return;

        treeContent.innerHTML = '';
        this.renderDirectory(this.navigation, treeContent, '/home/chun/portfolio', 0);
    }

    private renderDirectory(nav: NavigationStructure, parent: Element, basePath: string, depth: number): void {
        Object.entries(nav).forEach(([name, item]) => {
            const itemPath = `${basePath}/${name}`.replace(/\/+/g, '/');
            const element = this.createTreeItem(item, itemPath, depth);
            parent.appendChild(element);

            if (item.type === 'directory' && item.children && this.expandedDirs.has(itemPath)) {
                const childContainer = element.querySelector('.tree-children');
                if (childContainer) {
                    this.renderDirectory(item.children, childContainer, itemPath, depth + 1);
                }
            }
        });
    }

    private createTreeItem(item: NavigationItem, path: string, depth: number): HTMLElement {
        const itemElement = document.createElement('div');
        itemElement.className = `tree-item depth-${depth}`;
        itemElement.dataset.path = path;
        itemElement.dataset.type = item.type;

        const indent = '  '.repeat(depth);
        const icon = this.getItemIcon(item);
        const expandIcon = item.type === 'directory' ? 
            (this.expandedDirs.has(path) ? '▼' : '▶') : '';

        itemElement.innerHTML = `
            <div class="tree-item-content">
                <span class="expand-icon">${expandIcon}</span>
                <span class="item-icon">${icon}</span>
                <span class="item-name">${item.name}</span>
                <span class="item-size">${item.size || ''}</span>
            </div>
            ${item.type === 'directory' ? '<div class="tree-children"></div>' : ''}
        `;

        // Add styling based on depth
        itemElement.style.paddingLeft = `${depth * 20 + 10}px`;

        return itemElement;
    }

    private getItemIcon(item: NavigationItem): string {
        if (item.icon) return item.icon;
        
        if (item.type === 'directory') {
            return this.expandedDirs.has(item.path) ? '📂' : '📁';
        }

        // File type icons based on extension
        const ext = item.name.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'txt': return '📄';
            case 'md': return '📝';
            case 'json': return '📋';
            case 'pdf': return '📕';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return '🖼️';
            case 'js':
            case 'ts': return '⚡';
            case 'html': return '🌐';
            case 'css':
            case 'scss': return '🎨';
            default: return '📄';
        }
    }

    private bindEvents(): void {
        this.container.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const treeItem = target.closest('.tree-item') as HTMLElement;
            
            if (!treeItem) return;

            const path = treeItem.dataset.path!;
            const type = treeItem.dataset.type!;

            if (target.classList.contains('expand-icon') || target.closest('.expand-icon')) {
                e.stopPropagation();
                if (type === 'directory') {
                    this.toggleDirectory(path);
                }
                return;
            }

            // Handle item selection
            this.selectItem(treeItem);

            if (type === 'file') {
                this.onFileSelectCallback?.(path);
            } else if (type === 'directory') {
                this.onDirectoryExpandCallback?.(path);
                this.toggleDirectory(path);
            }
        });

        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Right-click context menu
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e);
        });
    }

    private toggleDirectory(path: string): void {
        if (this.expandedDirs.has(path)) {
            this.expandedDirs.delete(path);
        } else {
            this.expandedDirs.add(path);
        }

        const treeItem = this.container.querySelector(`[data-path="${path}"]`) as HTMLElement;
        if (treeItem) {
            const expandIcon = treeItem.querySelector('.expand-icon');
            const childContainer = treeItem.querySelector('.tree-children');
            
            if (expandIcon && childContainer) {
                const isExpanded = this.expandedDirs.has(path);
                expandIcon.textContent = isExpanded ? '▼' : '▶';
                
                if (isExpanded) {
                    (childContainer as HTMLElement).style.display = 'block';
                    this.renderDirectoryChildren(path, childContainer);
                    this.animateExpand(childContainer);
                } else {
                    this.animateCollapse(childContainer);
                }
            }
        }
    }

    private renderDirectoryChildren(path: string, container: Element): void {
        const navItem = this.findNavigationItem(path);
        if (navItem?.children) {
            const depth = path.split('/').length - 2; // Adjust for base path
            container.innerHTML = '';
            this.renderDirectory(navItem.children, container, path, depth + 1);
        }
    }

    private findNavigationItem(path: string): NavigationItem | null {
        console.log('🔍 FileTree: Finding navigation item for path:', path);
        
        // Remove the base path and split into parts
        const pathParts = path.split('/').filter(p => p && p !== 'home' && p !== 'chun' && p !== 'portfolio');
        console.log('📂 FileTree: Path parts:', pathParts);
        
        let current: any = this.navigation;

        for (const part of pathParts) {
            console.log(`🔎 FileTree: Looking for "${part}" in:`, Object.keys(current));
            
            if (current[part]) {
                current = current[part];
                console.log(`✅ FileTree: Found "${part}":`, current.name || 'unnamed');
            } else if (current.children && current.children[part]) {
                current = current.children[part];
                console.log(`✅ FileTree: Found "${part}" in children:`, current.name || 'unnamed');
            } else {
                console.log(`❌ FileTree: Part "${part}" not found`);
                return null;
            }
        }

        console.log('🎉 FileTree: Final result:', current);
        return current;
    }

    private animateExpand(element: Element): void {
        const htmlElement = element as HTMLElement;
        htmlElement.style.height = '0';
        htmlElement.style.overflow = 'hidden';
        htmlElement.style.transition = 'height 0.3s ease-out';
        
        requestAnimationFrame(() => {
            htmlElement.style.height = `${htmlElement.scrollHeight}px`;
            
            setTimeout(() => {
                htmlElement.style.height = 'auto';
                htmlElement.style.overflow = 'visible';
            }, 300);
        });
    }

    private animateCollapse(element: Element): void {
        const htmlElement = element as HTMLElement;
        htmlElement.style.height = `${htmlElement.scrollHeight}px`;
        htmlElement.style.overflow = 'hidden';
        htmlElement.style.transition = 'height 0.3s ease-out';
        
        requestAnimationFrame(() => {
            htmlElement.style.height = '0';
            
            setTimeout(() => {
                htmlElement.style.display = 'none';
                htmlElement.style.height = 'auto';
                htmlElement.style.overflow = 'visible';
            }, 300);
        });
    }

    private selectItem(treeItem: HTMLElement): void {
        // Remove previous selection
        this.container.querySelectorAll('.tree-item.selected').forEach(item => {
            item.classList.remove('selected');
        });

        // Add selection to current item
        treeItem.classList.add('selected');

        // Scroll item into view if needed
        treeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    private handleKeyboardNavigation(e: KeyboardEvent): void {
        const selected = this.container.querySelector('.tree-item.selected') as HTMLElement;
        if (!selected) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectNextItem(selected);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectPreviousItem(selected);
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (selected.dataset.type === 'directory') {
                    this.expandDirectory(selected.dataset.path!);
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (selected.dataset.type === 'directory') {
                    this.collapseDirectory(selected.dataset.path!);
                }
                break;
            case 'Enter':
                e.preventDefault();
                selected.click();
                break;
        }
    }

    private selectNextItem(current: HTMLElement): void {
        const allItems = Array.from(this.container.querySelectorAll('.tree-item'));
        const currentIndex = allItems.indexOf(current);
        const nextItem = allItems[currentIndex + 1] as HTMLElement;
        
        if (nextItem) {
            this.selectItem(nextItem);
        }
    }

    private selectPreviousItem(current: HTMLElement): void {
        const allItems = Array.from(this.container.querySelectorAll('.tree-item'));
        const currentIndex = allItems.indexOf(current);
        const prevItem = allItems[currentIndex - 1] as HTMLElement;
        
        if (prevItem) {
            this.selectItem(prevItem);
        }
    }

    private expandDirectory(path: string): void {
        if (!this.expandedDirs.has(path)) {
            this.toggleDirectory(path);
        }
    }

    private collapseDirectory(path: string): void {
        if (this.expandedDirs.has(path)) {
            this.toggleDirectory(path);
        }
    }

    private showContextMenu(e: MouseEvent): void {
        const target = e.target as HTMLElement;
        const treeItem = target.closest('.tree-item') as HTMLElement;
        
        if (!treeItem) return;

        const path = treeItem.dataset.path!;
        const type = treeItem.dataset.type!;

        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${e.clientY}px;
            left: ${e.clientX}px;
            background: var(--color-surface);
            border: 1px solid var(--color-primary);
            border-radius: 4px;
            padding: 8px 0;
            z-index: 1000;
            min-width: 120px;
            font-size: 14px;
        `;

        const menuItems = type === 'file' 
            ? ['Open', 'Copy Path', 'Properties']
            : ['Open', 'Expand All', 'Copy Path', 'Properties'];

        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item;
            menuItem.style.cssText = `
                padding: 8px 16px;
                cursor: pointer;
                transition: background-color 0.2s;
            `;
            
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.backgroundColor = 'var(--color-primary)';
                menuItem.style.color = 'var(--color-background)';
            });
            
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.backgroundColor = 'transparent';
                menuItem.style.color = 'var(--color-text)';
            });

            menuItem.addEventListener('click', () => {
                this.handleContextMenuAction(item, path, type);
                document.body.removeChild(menu);
            });

            menu.appendChild(menuItem);
        });

        document.body.appendChild(menu);

        // Remove menu on click outside
        const removeMenu = (e: MouseEvent) => {
            if (!menu.contains(e.target as Node)) {
                document.body.removeChild(menu);
                document.removeEventListener('click', removeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', removeMenu);
        }, 0);
    }

    private handleContextMenuAction(action: string, path: string, type: string): void {
        switch (action) {
            case 'Open':
                if (type === 'file') {
                    this.onFileSelectCallback?.(path);
                } else {
                    this.onDirectoryExpandCallback?.(path);
                }
                break;
            case 'Copy Path':
                navigator.clipboard.writeText(path);
                break;
            case 'Expand All':
                if (type === 'directory') {
                    this.expandAllDirectories(path);
                }
                break;
            case 'Properties':
                this.showProperties(path);
                break;
        }
    }

    private expandAllDirectories(basePath: string): void {
        const navItem = this.findNavigationItem(basePath);
        if (navItem?.children) {
            this.expandDirectoryRecursive(navItem.children, basePath);
        }
        this.render();
    }

    private expandDirectoryRecursive(nav: NavigationStructure, basePath: string): void {
        Object.entries(nav).forEach(([name, item]) => {
            const itemPath = `${basePath}/${name}`;
            if (item.type === 'directory') {
                this.expandedDirs.add(itemPath);
                if (item.children) {
                    this.expandDirectoryRecursive(item.children, itemPath);
                }
            }
        });
    }

    private showProperties(path: string): void {
        const navItem = this.findNavigationItem(path);
        if (!navItem) return;

        const properties = {
            'Name': navItem.name,
            'Type': navItem.type,
            'Path': path,
            'Size': navItem.size || 'N/A',
            'Modified': navItem.modified || 'N/A',
            'Permissions': navItem.permissions || 'N/A'
        };

        const content = Object.entries(properties)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

        alert(`Properties:\n\n${content}`);
    }

    // Public methods
    onFileSelect(callback: (path: string) => void): void {
        this.onFileSelectCallback = callback;
    }

    onDirectoryExpand(callback: (path: string) => void): void {
        this.onDirectoryExpandCallback = callback;
    }

    expandPath(path: string): void {
        const pathParts = path.split('/').filter(p => p);
        let currentPath = '';
        
        pathParts.forEach(part => {
            currentPath += `/${part}`;
            this.expandedDirs.add(currentPath);
        });
        
        this.render();
    }

    selectPath(path: string): void {
        const treeItem = this.container.querySelector(`[data-path="${path}"]`) as HTMLElement;
        if (treeItem) {
            this.selectItem(treeItem);
        }
    }

    refresh(): void {
        this.render();
    }

    handleResize(): void {
        // Adjust layout for mobile
        const isMobile = window.innerWidth < 768;
        this.container.classList.toggle('mobile-layout', isMobile);
    }

    // Debug method to test navigation structure
    public debugNavigationStructure(): void {
        console.log('🐛 Navigation structure:', this.navigation);
        console.log('🐛 Projects folder:', this.navigation.projects);
        if (this.navigation.projects?.children) {
            console.log('🐛 Project children:', Object.keys(this.navigation.projects.children));
            Object.entries(this.navigation.projects.children).forEach(([key, value]: [string, any]) => {
                console.log(`🐛 ${key}:`, value?.children ? Object.keys(value.children) : 'no children');
            });
        }
    }
}
