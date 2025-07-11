// Portfolio Type Definitions
export interface PortfolioConfig {
  personal: PersonalInfo;
  navigation: NavigationStructure;
  theme: ThemeConfig;
  commands: CommandConfig[];
}

export interface PersonalInfo {
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  github: string;
  linkedin?: string;
  website?: string;
  avatar?: string;
}

export interface NavigationStructure {
  [key: string]: NavigationItem;
}

export interface NavigationItem {
  type: 'directory' | 'file';
  name: string;
  path: string;
  children?: NavigationStructure;
  content?: FileContent;
  icon?: string;
  permissions?: string;
  modified?: string;
  size?: string;
}

export interface FileContent {
  type: 'text' | 'json' | 'markdown' | 'image' | 'pdf';
  data: any;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    category?: string;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  category: ProjectCategory;
  status: ProjectStatus;
  links: {
    github?: string;
    demo?: string;
    documentation?: string;
  };
  images: string[];
  features: string[];
  challenges?: string[];
  achievements?: string[];
  dateCreated: string;
  dateUpdated?: string;
}

export type ProjectCategory = 
  | 'web-development'
  | 'cybersecurity'
  | 'open-source'
  | 'mobile-development'
  | 'devops'
  | 'ai-ml';

export type ProjectStatus = 
  | 'completed'
  | 'in-progress'
  | 'maintained'
  | 'archived';

export interface Skill {
  name: string;
  category: SkillCategory;
  proficiency: 1 | 2 | 3 | 4 | 5;
  yearsOfExperience: number;
  description?: string;
  certifications?: string[];
}

export type SkillCategory =
  | 'programming-languages'
  | 'frameworks-libraries'
  | 'databases'
  | 'tools-platforms'
  | 'cybersecurity'
  | 'cloud-platforms';

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    warning: string;
    error: string;
    success: string;
  };
  fonts: {
    primary: string;
    mono: string;
  };
  animations: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: string;
  };
}

export interface CommandConfig {
  command: string;
  description: string;
  usage: string;
  action: CommandAction;
  aliases?: string[];
}

export type CommandAction =
  | 'navigate'
  | 'list'
  | 'display'
  | 'help'
  | 'clear'
  | 'theme'
  | 'search'
  | 'contact'
  | 'download';

// Animation and Interaction Types
export interface AnimationConfig {
  type: 'typing' | 'fade' | 'slide' | 'matrix' | 'glitch';
  duration: number;
  delay?: number;
  easing?: string;
  repeat?: boolean;
}

export interface TerminalState {
  currentPath: string;
  commandHistory: string[];
  currentCommand: string;
  isExecuting: boolean;
  output: TerminalOutput[];
}

export interface TerminalOutput {
  id: string;
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

// Matrix Rain Effect Types
export interface MatrixCharacter {
  x: number;
  y: number;
  character: string;
  speed: number;
  opacity: number;
  trail: number;
}

// Component Props Types
export interface ComponentProps {
  className?: string;
  children?: HTMLElement | HTMLElement[];
  data?: any;
  config?: any;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// File System Types
export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  parent?: FileSystemNode;
  children?: FileSystemNode[];
  content?: any;
  metadata: {
    size: number;
    modified: Date;
    permissions: string;
    owner: string;
  };
}

// Event Types
export interface AppEvent {
  type: string;
  payload?: any;
  timestamp: Date;
}

export interface KeyboardEvent extends Event {
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Global Window Interface Extensions
declare global {
  interface Window {
    portfolioApp: any;
    matrixEffect: any;
  }
}
