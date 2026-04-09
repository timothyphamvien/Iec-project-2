export interface AdminPost {
  id: number;
  title: string;
  category: string;
  date: string;
  status: 'published' | 'draft';
  views: number;
  image: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface AdminMedia {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  size: string;
}

export interface AdminRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'partner' | 'event' | 'newsletter';
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'workshop' | 'event';
  location: string;
  image: string;
}

export interface AdminDoc {
  id: string;
  name: string;
  type: string;
  size: string;
  downloads: number;
}
