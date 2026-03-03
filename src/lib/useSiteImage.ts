import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function useSiteImage(sectionName: string, fallback: string): string {
  const [url, setUrl] = useState<string>(fallback);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('site_images')
        .select('storage_path')
        .eq('section_name', sectionName)
        .eq('is_active', true)
        .maybeSingle();

      if (data?.storage_path) {
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(data.storage_path);
        setUrl(urlData.publicUrl);
      }
    }
    load();
  }, [sectionName]);

  return url;
}

export function useSiteImages(sections: { key: string; fallback: string }[]): Record<string, string> {
  const [urls, setUrls] = useState<Record<string, string>>(() =>
    Object.fromEntries(sections.map((s) => [s.key, s.fallback]))
  );

  useEffect(() => {
    async function load() {
      const sectionNames = sections.map((s) => s.key);
      const { data } = await supabase
        .from('site_images')
        .select('section_name, storage_path')
        .in('section_name', sectionNames)
        .eq('is_active', true);

      if (data && data.length > 0) {
        const updates: Record<string, string> = {};
        for (const row of data) {
          const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(row.storage_path);
          updates[row.section_name] = urlData.publicUrl;
        }
        setUrls((prev) => ({ ...prev, ...updates }));
      }
    }
    load();
  }, []);

  return urls;
}
