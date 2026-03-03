import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Trash2, Check, Image as ImageIcon, Eye, EyeOff, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

interface SiteImage {
  id: string;
  title: string;
  alt_text: string;
  storage_path: string;
  section_name: string;
  is_active: boolean;
  file_size: number | null;
  created_at: string;
}

const SECTION_OPTIONS = [
  'home-card-1',
  'home-card-2',
  'home-card-3',
  'home-location-top',
  'home-location-bottom-left',
  'home-location-bottom-right',
  'about-tenet-accountability',
  'about-tenet-benevolence',
  'about-tenet-compassion',
  'about-tenet-dignity',
  'about-tenet-empathy',
  'services-daily-living',
  'services-memory-care',
  'services-concierge',
  'services-dining',
  'logo',
  'other',
];

export default function ImageAdmin() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filterSection, setFilterSection] = useState<string>('all');

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    const { data, error } = await supabase
      .from('site_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching images:', error);
    } else {
      setImages(data || []);
    }

    setTimeout(() => setLoading(false), 500);
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Image file size must be less than 20MB.');
      return;
    }

    const title = prompt('Enter a title for this image:', file.name.replace(/\.[^/.]+$/, ''));
    if (!title) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const altText = prompt('Enter alt text (for accessibility):', title) ?? title;

    const sectionPrompt = SECTION_OPTIONS.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const sectionInput = prompt(
      `Enter the section name for this image.\n\nSuggested sections:\n${sectionPrompt}\n\nOr type a custom section name:`,
      'home-card-1'
    );
    if (!sectionInput) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('site_images')
        .insert([{
          title,
          alt_text: altText,
          storage_path: fileName,
          section_name: sectionInput.trim(),
          is_active: false,
          file_size: file.size,
        }]);

      if (dbError) throw dbError;

      await fetchImages();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function toggleActive(image: SiteImage) {
    if (!image.is_active) {
      const { error: deactivateError } = await supabase
        .from('site_images')
        .update({ is_active: false })
        .eq('section_name', image.section_name);

      if (deactivateError) {
        console.error('Error deactivating other images:', deactivateError);
        return;
      }
    }

    const { error } = await supabase
      .from('site_images')
      .update({ is_active: !image.is_active })
      .eq('id', image.id);

    if (error) {
      console.error('Error updating image status:', error);
      alert('Error updating image status');
    } else {
      fetchImages();
    }
  }

  async function handleDelete(image: SiteImage) {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('images')
        .remove([image.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('site_images')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;

      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image');
    }
  }

  function getImageUrl(storagePath: string): string {
    const { data } = supabase.storage.from('images').getPublicUrl(storagePath);
    return data.publicUrl;
  }

  function formatFileSize(bytes: number | null): string {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  }

  const allSections = ['all', ...Array.from(new Set(images.map((img) => img.section_name)))];
  const filtered = filterSection === 'all' ? images : images.filter((img) => img.section_name === filterSection);

  if (loading) return <LoadingScreen />;

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
              <h1 className="text-xl font-semibold text-gray-700">Image Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/blog" className="text-gray-600 hover:text-[#48A2FF] transition">
                Blog CMS
              </Link>
              <Link to="/admin/videos" className="text-gray-600 hover:text-[#48A2FF] transition">
                Video Manager
              </Link>
              <button
                onClick={async () => { await signOut(); navigate('/admin/login'); }}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition px-3 py-2 rounded-lg hover:bg-red-50"
                title="Sign out"
              >
                <LogOut size={18} />
                <span className="text-sm">Sign Out</span>
              </button>
              <label className="flex items-center gap-2 bg-gradient-to-r from-[#48A2FF] to-[#2547A0] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer">
                <Upload size={20} />
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">Image Upload Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>Maximum file size: 20MB per image</li>
            <li>Supported formats: JPEG, PNG, WebP, GIF</li>
            <li>Assign a section name so the correct page knows which image to display</li>
            <li>Only one image can be active per section at a time</li>
            <li>Activating a new image for a section will deactivate the previous one</li>
            <li>Pages fall back to local public folder images if no active Supabase image is set</li>
          </ul>
        </div>

        {images.length > 0 && (
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">Filter by section:</span>
            {allSections.map((section) => (
              <button
                key={section}
                onClick={() => setFilterSection(section)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                  filterSection === section
                    ? 'bg-[#2547A0] text-white border-[#2547A0]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#48A2FF]'
                }`}
              >
                {section === 'all' ? `All (${images.length})` : section}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-xl text-gray-600 mb-6">
              {images.length === 0 ? 'No images uploaded yet' : 'No images in this section'}
            </p>
            {images.length === 0 && (
              <label className="inline-flex items-center gap-2 bg-gradient-to-r from-[#48A2FF] to-[#2547A0] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer">
                <Upload size={20} />
                Upload Your First Image
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((image) => (
              <div
                key={image.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#48A2FF] transition-all hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={getImageUrl(image.storage_path)}
                    alt={image.alt_text}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {image.is_active && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        <Check size={12} />
                        Active
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{image.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="bg-gray-100 px-2 py-1 rounded truncate max-w-[120px]">{image.section_name}</span>
                    <span>{formatFileSize(image.file_size)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    {new Date(image.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(image)}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded transition text-sm ${
                        image.is_active
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {image.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      {image.is_active ? 'Active' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(image)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
