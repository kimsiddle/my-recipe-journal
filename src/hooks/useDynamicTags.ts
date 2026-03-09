import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type TagTable = 'protein_tag_options' | 'meal_category_options' | 'occasion_tag_options';

export function useDynamicTags(table: TagTable) {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    const { data, error } = await supabase
      .from(table)
      .select('name')
      .order('name');
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return;
    }
    setTags(data.map(t => t.name));
    setLoading(false);
  }, [table]);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const addTag = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || tags.includes(trimmed)) return false;
    const { error } = await supabase
      .from(table)
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
      .from(table)
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
