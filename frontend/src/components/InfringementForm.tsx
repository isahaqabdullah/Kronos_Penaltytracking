import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface InfringementFormProps {
  onSubmit: (infringement: {
    kartNumber: string;
    turn: string;
    observer: string;
    infringement: string;
    penaltyDescription: string;
    penaltyApplied: boolean;
    timestamp: Date;
  }) => void;
}

export function InfringementForm({ onSubmit }: InfringementFormProps) {
  const [kartNumber, setKartNumber] = useState('');
  const [turn, setTurn] = useState('');
  const [observer, setObserver] = useState('');
  const [infringement, setInfringement] = useState('');
  const [penaltyDescription, setPenaltyDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kartNumber || !turn || !observer || !infringement || !penaltyDescription) {
      return;
    }

    onSubmit({
      kartNumber,
      turn,
      observer,
      infringement,
      penaltyDescription,
      penaltyApplied: false,
      timestamp: new Date(),
    });

    // Reset form
    setKartNumber('');
    setTurn('');
    setObserver('');
    setInfringement('');
    setPenaltyDescription('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold">Log Infringement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kartNumber">Kart Number</Label>
              <Input
                id="kartNumber"
                type="text"
                value={kartNumber}
                onChange={(e) => setKartNumber(e.target.value)}
                placeholder="e.g., 42"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="turn">Turn</Label>
              <Input
                id="turn"
                type="text"
                value={turn}
                onChange={(e) => setTurn(e.target.value)}
                placeholder="e.g., Turn 3"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observer">Observer</Label>
            <Input
              id="observer"
              type="text"
              value={observer}
              onChange={(e) => setObserver(e.target.value)}
              placeholder="Observer name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="infringement">Infringement</Label>
            <Select value={infringement} onValueChange={setInfringement} required>
              <SelectTrigger id="infringement">
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
            <Label htmlFor="penaltyDescription">Penalty Description</Label>
            <Select value={penaltyDescription} onValueChange={setPenaltyDescription} required>
              <SelectTrigger id="penaltyDescription">
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

          <Button type="submit" className="w-full">
            Log Infringement
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
