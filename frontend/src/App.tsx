import { useState, useEffect } from 'react';
import { InfringementForm } from './components/InfringementForm';
import { InfringementLog } from './components/InfringementLog';
import { PendingPenalties } from './components/PendingPenalties';
import { EditInfringementDialog } from './components/EditInfringementDialog';
import { CheckeredFlag } from './components/CheckeredFlag';
import { KronosLogo } from './components/KronosLogo';

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

export default function App() {
  // Sample data for demonstration
  const sampleData: Infringement[] = [
    {
      id: '1',
      kartNumber: '42',
      turn: 'Turn 3',
      observer: 'John Smith',
      infringement: 'Track Limits',
      penaltyDescription: '5 Sec',
      penaltyApplied: false,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    },
    {
      id: '2',
      kartNumber: '17',
      turn: 'Turn 7',
      observer: 'Sarah Johnson',
      infringement: 'Blocking',
      penaltyDescription: 'Warning',
      penaltyApplied: false,
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
    },
    {
      id: '3',
      kartNumber: '88',
      turn: 'Turn 1',
      observer: 'Mike Davis',
      infringement: 'Dangerous Driving',
      penaltyDescription: 'Stop and Go',
      penaltyApplied: true,
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    },
    {
      id: '4',
      kartNumber: '23',
      turn: 'Turn 5',
      observer: 'John Smith',
      infringement: 'Track Limits',
      penaltyDescription: 'Warning',
      penaltyApplied: false,
      timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
    },
  ];

  const [infringements, setInfringements] = useState<Infringement[]>(sampleData);
  const [editingInfringement, setEditingInfringement] = useState<Infringement | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Load infringements from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('kronos-infringements');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const withDates = parsed.map((inf: any) => ({
          ...inf,
          timestamp: new Date(inf.timestamp),
        }));
        setInfringements(withDates);
      } catch (e) {
        console.error('Failed to load infringements:', e);
      }
    }
  }, []);

  // Save infringements to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('kronos-infringements', JSON.stringify(infringements));
  }, [infringements]);

  const handleNewInfringement = (infringement: Omit<Infringement, 'id'>) => {
    const newInfringement: Infringement = {
      ...infringement,
      id: crypto.randomUUID(),
    };

    // Add to the beginning of the array to show most recent first
    setInfringements((prev) => [newInfringement, ...prev]);
  };

  const handleApplyPenalty = (id: string) => {
    setInfringements((prev) =>
      prev.map((inf) =>
        inf.id === id ? { ...inf, penaltyApplied: true } : inf
      )
    );
  };

  const handleEditInfringement = (infringement: Infringement) => {
    setEditingInfringement(infringement);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedInfringement: Infringement) => {
    setInfringements((prev) =>
      prev.map((inf) =>
        inf.id === updatedInfringement.id ? updatedInfringement : inf
      )
    );
  };

  const handleDeleteInfringement = (id: string) => {
    setInfringements((prev) => prev.filter((inf) => inf.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b relative overflow-hidden">
        <CheckeredFlag />
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center gap-4">
            <KronosLogo />
            <div>
              <h1 className="text-[36px] font-bold not-italic">Kronos</h1>
              <p className="text-muted-foreground">Karting Infringement Management System</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Form and Pending Penalties Section - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <InfringementForm onSubmit={handleNewInfringement} />
            </div>
            <div>
              <PendingPenalties 
                infringements={infringements}
                onApplyPenalty={handleApplyPenalty}
              />
            </div>
          </div>

          {/* Recent Infringements - Full Width */}
          <InfringementLog 
            infringements={infringements} 
            onEdit={handleEditInfringement}
            onDelete={handleDeleteInfringement}
          />
        </div>

        {/* Edit Dialog */}
        <EditInfringementDialog
          infringement={editingInfringement}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSaveEdit}
        />
      </main>
    </div>
  );
}
