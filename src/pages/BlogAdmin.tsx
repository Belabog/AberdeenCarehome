import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, CreditCard as Edit, Trash2, Eye, EyeOff, Save, X, Upload, Image as ImageIcon, LogOut } from 'lucide-react';
import { supabase, BlogPost } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

export default function BlogAdmin() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }

  function createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function openEditor(post?: Partial<BlogPost>) {
    const initial: Partial<BlogPost> = post ?? {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: 'Aberdeen Manor Team',
      image_url: '',
      published: true,
    };
    setEditingPost(initial);
    setImagePreview(initial.image_url ?? '');
    setIsEditing(true);
  }

  function closeEditor() {
    setIsEditing(false);
    setEditingPost(null);
    setImagePreview('');
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);

    const ext = file.name.split('.').pop();
    const filename = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filename, file, { upsert: false });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      alert('Image upload failed: ' + uploadError.message);
      setUploadingImage(false);
      return;
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filename);
    const publicUrl = data.publicUrl;

    setEditingPost((prev) => prev ? { ...prev, image_url: publicUrl } : prev);
    setImagePreview(publicUrl);
    setUploadingImage(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    handleImageUpload(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    handleImageUpload(file);
  }

  function handleUrlChange(url: string) {
    setEditingPost((prev) => prev ? { ...prev, image_url: url } : prev);
    setImagePreview(url);
  }

  async function handleSave() {
    if (!editingPost || !editingPost.title || !editingPost.content) {
      alert('Please fill in required fields');
      return;
    }

    setSaving(true);

    const slug = editingPost.slug || createSlug(editingPost.title);
    const postData = {
      ...editingPost,
      slug,
      updated_at: new Date().toISOString()
    };

    let error;
    if (editingPost.id) {
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', editingPost.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('blog_posts')
        .insert([postData]);
      error = insertError;
    }

    if (error) {
      console.error('Error saving post:', error);
      alert('Error saving post: ' + error.message);
    } else {
      closeEditor();
      fetchPosts();
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    } else {
      fetchPosts();
    }
  }

  async function togglePublished(post: BlogPost) {
    const { error } = await supabase
      .from('blog_posts')
      .update({ published: !post.published })
      .eq('id', post.id);

    if (error) {
      console.error('Error updating post:', error);
    } else {
      fetchPosts();
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-[#2547A0] via-[#48A2FF] to-[#2547A0] bg-clip-text text-transparent">
                  Aberdeen Manor
                </span>
              </Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-xl font-semibold text-gray-700">Blog CMS</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/admin/videos"
                className="text-gray-600 hover:text-[#48A2FF] transition"
              >
                Video Manager
              </Link>
              <Link
                to="/blog"
                className="text-gray-600 hover:text-[#48A2FF] transition"
              >
                View Blog
              </Link>
              <button
                onClick={() => openEditor()}
                className="flex items-center gap-2 bg-gradient-to-r from-[#48A2FF] to-[#2547A0] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <Plus size={20} />
                New Post
              </button>
              <button
                onClick={async () => { await signOut(); navigate('/admin/login'); }}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition px-3 py-2 rounded-lg hover:bg-red-50"
                title="Sign out"
              >
                <LogOut size={18} />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 mb-6">No blog posts yet</p>
            <button
              onClick={() => openEditor()}
              className="flex items-center gap-2 bg-gradient-to-r from-[#48A2FF] to-[#2547A0] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 mx-auto"
            >
              <Plus size={20} />
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#48A2FF] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {post.image_url && (
                      <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img
                          src={post.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                        {post.published ? (
                          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            <Eye size={12} />
                            Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            <EyeOff size={12} />
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{post.excerpt}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePublished(post)}
                      className="p-2 text-gray-600 hover:text-[#48A2FF] hover:bg-gray-50 rounded transition"
                      title={post.published ? 'Unpublish' : 'Publish'}
                    >
                      {post.published ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button
                      onClick={() => openEditor(post)}
                      className="p-2 text-gray-600 hover:text-[#48A2FF] hover:bg-gray-50 rounded transition"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditing && editingPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-6">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPost.id ? 'Edit Post' : 'New Post'}
              </h2>
              <button
                onClick={closeEditor}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#48A2FF] focus:border-transparent"
                  placeholder="Enter blog post title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={editingPost.slug}
                  onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#48A2FF] focus:border-transparent"
                  placeholder="auto-generated-from-title"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from title</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt *
                </label>
                <textarea
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#48A2FF] focus:border-transparent"
                  placeholder="Short preview text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  rows={12}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#48A2FF] focus:border-transparent font-mono text-sm"
                  placeholder="Full blog post content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={editingPost.author}
                  onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#48A2FF] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div
                  className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
                    uploadingImage
                      ? 'border-[#48A2FF] bg-blue-50'
                      : 'border-gray-300 hover:border-[#48A2FF] hover:bg-gray-50 cursor-pointer'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => !uploadingImage && fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-56 object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                        <span className="text-white font-medium text-sm bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                          Click or drag to replace
                        </span>
                      </div>
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-3 border-[#48A2FF] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-medium text-gray-700">Uploading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center gap-3 text-gray-500">
                      {uploadingImage ? (
                        <>
                          <div className="w-10 h-10 border-2 border-[#48A2FF] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-medium text-[#48A2FF]">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                            <Upload size={24} className="text-gray-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP, GIF supported</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <ImageIcon size={12} />
                    or paste a URL
                  </span>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                <input
                  type="text"
                  value={editingPost.image_url ?? ''}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="mt-3 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#48A2FF] focus:border-transparent text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={editingPost.published}
                  onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                  className="w-4 h-4 text-[#48A2FF] rounded focus:ring-[#48A2FF]"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">
                  Publish immediately
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex items-center justify-end gap-3">
              <button
                onClick={closeEditor}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploadingImage}
                className="flex items-center gap-2 bg-gradient-to-r from-[#48A2FF] to-[#2547A0] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
