import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useProteinTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    const { data, error } = await supabase
      .from('protein_tag_options')
      .select('name')
      .order('name');
    if (error) {
      console.error('Error fetching protein tags:', error);
      return;
    }
    setTags(data.map(t => t.name));
    setLoading(false);
  }, []);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const addTag = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || tags.includes(trimmed)) return false;
    const { error } = await supabase
      .from('protein_tag_options')
      .insert({ name: trimmed });
    if (error) {
      toast({ title: 'Error', description: 'Could not add tag', variant: 'destructive' });
      return false;
    }
    setTags(prev => [...prev, trimmed].sort());
    return true;
  };

  const removeTag = async (name: string) => {
    const { error } = await supabase
      .from('protein_tag_options')
      .delete()
      .eq('name', name);
    if (error) {
      toast({ title: 'Error', description: 'Could not remove tag', variant: 'destructive' });
      return false;
    }
    setTags(prev => prev.filter(t => t !== name));
    return true;
  };

  return { tags, loading, addTag, removeTag, refetch: fetchTags };
}
