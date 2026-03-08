import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface Comment {
  id: string;
  author_name: string;
  text: string;
  created_at: string;
}

interface RecipeCommentsProps {
  recipeId: string;
  isOwner: boolean;
}

export function RecipeComments({ recipeId, isOwner }: RecipeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('recipe_comments')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: true });
    setComments((data as Comment[]) || []);
  }, [recipeId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('recipe_comments').insert({
      recipe_id: recipeId,
      author_name: name.trim(),
      text: text.trim(),
    });
    setSubmitting(false);
    if (error) { toast.error('Failed to post comment'); return; }
    setText('');
    toast.success('Comment posted!');
    fetchComments();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('recipe_comments').delete().eq('id', id);
    fetchComments();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-display">Comments</h2>
        <span className="text-sm text-muted-foreground">({comments.length})</span>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 bg-card border rounded-lg p-3 space-y-3">
        <Input
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <Textarea
          placeholder="Leave a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          required
        />
        <div className="flex justify-end">
          <Button size="sm" type="submit" disabled={submitting || !name.trim() || !text.trim()}>
            <Send className="h-3.5 w-3.5 mr-1" />
            Post
          </Button>
        </div>
      </form>

      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="group relative bg-card border rounded-lg p-4 transition-shadow hover:shadow-sm">
              <p className="text-sm font-medium">{c.author_name}</p>
              <p className="text-sm leading-relaxed mt-1 pr-6">{c.text}</p>
              <p className="text-xs text-muted-foreground mt-2">{formatDate(c.created_at)}</p>
              {isOwner && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  title="Delete comment"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
        </div>
      )}
    </section>
  );
}
