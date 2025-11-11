import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Infringement {
  id: string;
  kartNumber: string;
  turn: string;
  observer: string;
  infringement: string;
  penaltyDescription: string;
  penaltyApplied: boolean;
  timestamp: Date;
}

interface EditInfringementDialogProps {
  infringement: Infringement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (infringement: Infringement) => void;
}

export function EditInfringementDialog({
  infringement,
  open,
  onOpenChange,
  onSave,
}: EditInfringementDialogProps) {
  const [kartNumber, setKartNumber] = useState('');
  const [turn, setTurn] = useState('');
  const [observer, setObserver] = useState('');
  const [infringementType, setInfringementType] = useState('');
  const [penaltyDescription, setPenaltyDescription] = useState('');

  // Update form values when infringement changes
  useEffect(() => {
    if (infringement) {
      setKartNumber(infringement.kartNumber);
      setTurn(infringement.turn);
      setObserver(infringement.observer);
      setInfringementType(infringement.infringement);
      setPenaltyDescription(infringement.penaltyDescription);
    }
  }, [infringement]);

  const handleSave = () => {
    if (!infringement || !kartNumber || !turn || !observer || !infringementType || !penaltyDescription) {
      return;
    }

    const updatedInfringement: Infringement = {
      ...infringement,
      kartNumber,
      turn,
      observer,
      infringement: infringementType,
      penaltyDescription,
    };

    onSave(updatedInfringement);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!infringement) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Infringement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-kartNumber">Kart Number</Label>
              <Input
                id="edit-kartNumber"
                type="text"
                value={kartNumber}
                onChange={(e) => setKartNumber(e.target.value)}
                placeholder="e.g., 42"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-turn">Turn</Label>
              <Input
                id="edit-turn"
                type="text"
                value={turn}
                onChange={(e) => setTurn(e.target.value)}
                placeholder="e.g., Turn 3"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-observer">Observer</Label>
            <Input
              id="edit-observer"
              type="text"
              value={observer}
              onChange={(e) => setObserver(e.target.value)}
              placeholder="Observer name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-infringement">Infringement</Label>
            <Select value={infringementType} onValueChange={setInfringementType} required>
              <SelectTrigger id="edit-infringement">
                <SelectValue placeholder="Select infringement type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Track Limits">Track Limits</SelectItem>
                <SelectItem value="Dangerous Driving">Dangerous Driving</SelectItem>
                <SelectItem value="Blocking">Blocking</SelectItem>
                <SelectItem value="Collision">Collision</SelectItem>
                <SelectItem value="Unsafe Re-entry">Unsafe Re-entry</SelectItem>
                <SelectItem value="Ignoring Flags">Ignoring Flags</SelectItem>
                <SelectItem value="Pit Lane Speed">Pit Lane Speed</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-penaltyDescription">Penalty Description</Label>
            <Select value={penaltyDescription} onValueChange={setPenaltyDescription} required>
              <SelectTrigger id="edit-penaltyDescription">
                <SelectValue placeholder="Select penalty type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Warning">Warning</SelectItem>
                <SelectItem value="5 Sec">5 Sec</SelectItem>
                <SelectItem value="10 Sec">10 Sec</SelectItem>
                <SelectItem value="Stop and Go">Stop and Go</SelectItem>
                <SelectItem value="Drive Through">Drive Through</SelectItem>
                <SelectItem value="Time Penalty">Time Penalty</SelectItem>
                <SelectItem value="Disqualification">Disqualification</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
