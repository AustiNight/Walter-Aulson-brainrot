
export interface Question {
  id: string;
  label: string;
  type: 'text' | 'select';
  placeholder?: string;
  options?: string[];
}

export interface QuestionPack {
  id: string;
  title: string;
  questions: Question[];
}

export interface Panel {
  title: string;
  visualDescription: string;
  caption: string;
  imageUrl?: string;
}

export interface StoryResult {
  fullScript: string;
  panels: Panel[];
}
