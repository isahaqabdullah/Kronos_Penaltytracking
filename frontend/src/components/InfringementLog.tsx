import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Pencil, Trash2 } from 'lucide-react';

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

interface InfringementLogProps {
  infringements: Infringement[];
  onEdit: (infringement: Infringement) => void;
  onDelete: (id: string) => void;
}

export function InfringementLog({ infringements, onEdit, onDelete }: InfringementLogProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Infringements</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Kart #</TableHead>
                <TableHead>Turn</TableHead>
                <TableHead>Infringement</TableHead>
                <TableHead>Penalty</TableHead>
                <TableHead>Observer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {infringements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No infringements logged yet
                  </TableCell>
                </TableRow>
              ) : (
                infringements.map((inf) => {
                  return (
                    <TableRow key={inf.id}>
                      <TableCell>{formatTime(inf.timestamp)}</TableCell>
                      <TableCell>{inf.kartNumber}</TableCell>
                      <TableCell>{inf.turn}</TableCell>
                      <TableCell>{inf.infringement}</TableCell>
                      <TableCell>{inf.penaltyDescription}</TableCell>
                      <TableCell>{inf.observer}</TableCell>
                      <TableCell>
                        {inf.penaltyApplied ? (
                          <Badge variant="destructive">Applied</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(inf)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(inf.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
