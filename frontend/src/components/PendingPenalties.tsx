import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { AlertCircle } from 'lucide-react';

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

interface PendingPenaltiesProps {
  infringements: Infringement[];
  onApplyPenalty: (id: string) => void;
}

export function PendingPenalties({ infringements, onApplyPenalty }: PendingPenaltiesProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Filter for pending penalties: not applied AND not just a warning
  const pendingPenalties = infringements.filter(
    (inf) => !inf.penaltyApplied && inf.penaltyDescription !== 'Warning'
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <CardTitle>Pending Penalties</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Penalties requiring action
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kart #</TableHead>
                <TableHead>Infringement</TableHead>
                <TableHead>Penalty</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPenalties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No pending penalties
                  </TableCell>
                </TableRow>
              ) : (
                pendingPenalties.map((inf) => (
                  <TableRow key={inf.id} className="bg-red-50 dark:bg-red-900/10">
                    <TableCell>{inf.kartNumber}</TableCell>
                    <TableCell>{inf.infringement}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-md bg-red-600 text-white">
                        {inf.penaltyDescription}
                      </span>
                    </TableCell>
                    <TableCell>{formatTime(inf.timestamp)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onApplyPenalty(inf.id)}
                        >
                          Apply Penalty
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
