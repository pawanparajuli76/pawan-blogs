export type BlogPostStatus = 'draft' | 'published';
export type ResourceStatus = 'draft' | 'published';
export type MessageStatus = 'new' | 'read' | 'replied';

export interface Profile {
  id: string;
  full_name: string;
  professional_title: string | null;
  bio: string | null;
  profile_image: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category_id: string | null;
  author_id: string | null;
  status: BlogPostStatus;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  category?: Category;
  tags?: Tag[];
  author?: Profile;
}

export interface BlogPostTag {
  post_id: string;
  tag_id: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  created_at: string;
  status: MessageStatus;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  category: string | null;
  created_at: string;
  status: ResourceStatus;
}

export interface BlogPostWithRelations extends BlogPost {
  category?: Category;
  tags?: Tag[];
  author?: Profile;
}
