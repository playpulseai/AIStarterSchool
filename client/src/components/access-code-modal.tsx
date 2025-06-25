import { useState } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, AlertCircle, Briefcase } from 'lucide-react';

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AccessCodeModal({ isOpen, onClose, onSuccess }: AccessCodeModalProps) {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Demo access code - in real implementation this would be validated server-side
    const DEMO_ACCESS_CODE = '2025';
    
    if (code === DEMO_ACCESS_CODE) {
      setTimeout(() => {
        setLoading(false);
        localStorage.setItem('investorDemoAccess', 'true');
        onSuccess();
        onClose();
        // Navigate to dashboard after successful access
        setLocation('/dashboard');
      }, 1000);
    } else {
      setTimeout(() => {
        setError('Invalid access code. Please contact your representative for the correct code.');
        setLoading(false);
      }, 1000);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(value);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Briefcase className="h-6 w-6 mr-2 text-primary" />
            Investor Demo Access
          </DialogTitle>
          <DialogDescription>
            Enter your 4-digit access code to view the AIStarter School platform demonstration
          </DialogDescription>
        </DialogHeader>

        <Alert className="mb-4">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <strong>Investor Demo Mode:</strong> This demo showcases the full platform capabilities for potential investors and partners.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="access-code">Access Code</Label>
            <Input
              id="access-code"
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="Enter 4-digit code"
              className="mt-1 text-center text-2xl tracking-widest font-mono"
              maxLength={4}
              required
            />
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading || code.length !== 4}>
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Access Demo
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Demo includes:</h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              <span>Full Platform Access</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              <span>AI Learning Engine</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              <span>Student Analytics</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              <span>Admin Dashboard</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Demo code: <span className="font-mono font-semibold">2025</span> (for demonstration purposes)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}