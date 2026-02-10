import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Wrench, Lock, Save, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface RepairNoteEditorProps {
  receiptId: string;
  currentNote: string | null;
  status: string;
}

export function RepairNoteEditor({ receiptId, currentNote, status }: RepairNoteEditorProps) {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [note, setNote] = useState(currentNote || '');
  const [isSaving, setIsSaving] = useState(false);

  // Only show for logged-in users
  if (!user) {
    return null;
  }

  // Check if repair is in progress or beyond (can view/edit notes)
  const canViewNote = status === 'completed' || status === 'delivered' || status === 'in_progress';
  // Only admin can edit
  const canEditNote = isAdmin && canViewNote;

  const handleSave = async () => {
    if (!isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Only admins can edit repair notes.',
      });
      return;
    }

    setIsSaving(true);
    
    const { error } = await supabase
      .from('receipts')
      .update({ repair_notes: note })
      .eq('id', receiptId);
    
    setIsSaving(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save repair note.',
      });
    } else {
      toast({
        title: 'Saved',
        description: 'Repair note updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['receipt', receiptId] });
    }
  };

  return (
    <Card className="shadow-card border-l-4 border-l-amber-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wrench className="w-5 h-5 text-amber-500" />
          Repair Notes
          <span className="text-xs font-normal text-muted-foreground ml-2">
            (Internal use only - not printed)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canViewNote ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Lock className="w-4 h-4" />
            <span className="text-sm">
              Repair notes can be added once repair work begins (status: In Progress or later)
            </span>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="repair-note">Technician Notes</Label>
              {isAdmin ? (
                <Textarea
                  id="repair-note"
                  placeholder="Enter detailed repair notes here..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md min-h-[100px] text-sm">
                  {note || <span className="text-muted-foreground italic">No repair notes added yet</span>}
                </div>
              )}
              {!isAdmin && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Only admins can add or edit repair notes
                </p>
              )}
            </div>
            
            {isAdmin && (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Note
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
