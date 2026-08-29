import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PublicLayout } from '@/components/PublicLayout';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { BlogListPage } from '@/pages/BlogListPage';
import { BlogPostPage } from '@/pages/BlogPostPage';
import { ResourcesPage } from '@/pages/ResourcesPage';
import { ContactPage } from '@/pages/ContactPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import {
  PrivacyPolicyPage,
  DisclaimerPage,
  TermsOfUsePage,
} from '@/pages/LegalPages';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminPostList } from '@/pages/admin/AdminPostList';
import { AdminPostEditor } from '@/pages/admin/AdminPostEditor';
import { AdminCategories } from '@/pages/admin/AdminCategories';
import { AdminTags } from '@/pages/admin/AdminTags';
import { AdminResources } from '@/pages/admin/AdminResources';
import { AdminMessages } from '@/pages/admin/AdminMessages';
import { AdminProfile } from '@/pages/admin/AdminProfile';
import { AdminSettings } from '@/pages/admin/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/category/:categorySlug" element={<BlogListPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/terms-of-use" element={<TermsOfUsePage />} />
          </Route>

          {/* Admin login (no layout) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin routes (protected) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="posts" element={<AdminPostList />} />
            <Route path="posts/new" element={<AdminPostEditor />} />
            <Route path="posts/:id/edit" element={<AdminPostEditor />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="tags" element={<AdminTags />} />
            <Route path="resources" element={<AdminResources />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
