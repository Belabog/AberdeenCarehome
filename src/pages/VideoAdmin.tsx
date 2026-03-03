import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Trash2, Check, X, Video as VideoIcon, Eye, EyeOff, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

interface Video {
  id: string;
  title: string;
  description: string | null;
  storage_path: string;
  thumbnail_url: string | null;
  section_name: string;
  is_active: boolean;
  file_size: number | null;
  duration: number | null;
  created_at: string;
}

export default function VideoAdmin() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
    } else {
      setVideos(data || []);
    }

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Video file size must be less than 100MB. Please compress your video first.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const title = prompt('Enter a title for this video:', file.name.replace(/\.[^/.]+$/, ''));
    if (!title) {
      setUploading(false);
      return;
    }

    const section = prompt('Enter section name (e.g., hero, about, services):', 'hero');
    if (!section) {
      setUploading(false);
      return;
    }

    try {
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('videos')
        .insert([{
          title,
          storage_path: filePath,
          section_name: section,
          is_active: false,
          file_size: file.size,
          thumbnail_url: publicUrl
        }]);

      if (dbError) throw dbError;

      alert('Video uploaded successfully!');
      fetchVideos();

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function toggleActive(video: Video) {
    if (!video.is_active) {
      const { error: deactivateError } = await supabase
        .from('videos')
        .update({ is_active: false })
        .eq('section_name', video.section_name);

      if (deactivateError) {
        console.error('Error deactivating other videos:', deactivateError);
        return;
      }
    }

    const { error } = await supabase
      .from('videos')
      .update({ is_active: !video.is_active })
      .eq('id', video.id);

    if (error) {
      console.error('Error updating video:', error);
      alert('Error updating video status');
    } else {
      fetchVideos();
    }
  }

  async function handleDelete(video: Video) {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      const { error: storageError } = await supabase.storage
        .from('videos')
        .remove([video.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', video.id);

      if (dbError) throw dbError;

      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video');
    }
  }

  function formatFileSize(bytes: number | null): string {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  function getVideoUrl(storagePath: string): string {
    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl(storagePath);
    return data.publicUrl;
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
              <h1 className="text-xl font-semibold text-gray-700">Video Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/admin/blog"
                className="text-gray-600 hover:text-[#48A2FF] transition"
              >
                Blog CMS
              </Link>
              <Link
                to="/admin/images"
                className="text-gray-600 hover:text-[#48A2FF] transition"
              >
                Image Manager
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
                {uploading ? 'Uploading...' : 'Upload Video'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
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
          <h3 className="font-bold text-blue-900 mb-2">Video Upload Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>Maximum file size: 100MB</li>
            <li>Recommended format: MP4 (H.264 codec) for best compatibility</li>
            <li>Recommended resolution: 1920x1080 (Full HD) or 1280x720 (HD)</li>
            <li>Only one video can be active per section at a time</li>
            <li>Videos will autoplay on mute and loop continuously</li>
            <li>Consider compressing videos using tools like HandBrake for better performance</li>
          </ul>
        </div>

        {uploading && (
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <VideoIcon className="text-[#48A2FF] animate-pulse" size={24} />
              <span className="font-semibold text-gray-900">Uploading video...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#48A2FF] to-[#2547A0] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {videos.length === 0 ? (
          <div className="text-center py-20">
            <VideoIcon className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-xl text-gray-600 mb-6">No videos uploaded yet</p>
            <label className="inline-flex items-center gap-2 bg-gradient-to-r from-[#48A2FF] to-[#2547A0] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer">
              <Upload size={20} />
              Upload Your First Video
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#48A2FF] transition-all hover:shadow-lg"
              >
                <div className="relative aspect-video bg-gray-900">
                  <video
                    src={getVideoUrl(video.storage_path)}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    preload="metadata"
                  />
                  {video.is_active && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        <Check size={12} />
                        Active
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{video.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded">{video.section_name}</span>
                    <span>{formatFileSize(video.file_size)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Uploaded {new Date(video.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(video)}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded transition ${
                        video.is_active
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                      title={video.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {video.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      <span className="text-sm">{video.is_active ? 'Active' : 'Activate'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(video)}
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
