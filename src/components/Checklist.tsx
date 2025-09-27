import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  CreditCard as IdCard, 
  Building2, 
  Check, 
  AlertCircle,
  Camera,
  Upload,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  required: boolean;
  tips: string[];
}

interface ChecklistProps {
  className?: string;
  onDocumentStatus?: (status: { completed: number; total: number }) => void;
}

const documentItems: ChecklistItem[] = [
  {
    id: 'pan_card',
    title: 'PAN Card',
    description: 'Permanent Account Number card for identity verification',
    icon: IdCard,
    status: 'pending',
    required: true,
    tips: [
      'Ensure the card is clearly visible',
      'All corners should be in frame',
      'Text should be readable without glare'
    ]
  },
  {
    id: 'aadhaar_card',
    title: 'Aadhaar Card',
    description: 'Government issued identity document',
    icon: FileText,
    status: 'pending',
    required: true,
    tips: [
      'Both front and back required',
      'QR code should be visible',
      'Avoid shadows and reflections'
    ]
  },
  {
    id: 'bank_proof',
    title: 'Bank Statement',
    description: 'Recent bank statement or passbook',
    icon: Building2,
    status: 'pending',
    required: true,
    tips: [
      'Statement should be recent (within 3 months)',
      'Bank letterhead must be visible',
      'Account details should be clear'
    ]
  }
];

const Checklist = ({ className, onDocumentStatus }: ChecklistProps) => {
  const [items, setItems] = useState<ChecklistItem[]>(documentItems);
  const [progress, setProgress] = useState(0);

  // Simulate document status updates (in real app, this would come from backend)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate some progress
      setItems(prev => prev.map((item, index) => {
        if (index === 0) return { ...item, status: 'uploaded' as const };
        if (index === 1) return { ...item, status: 'verified' as const };
        return item;
      }));
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Update progress when items change
  useEffect(() => {
    const completedItems = items.filter(item => 
      item.status === 'verified' || item.status === 'uploaded'
    ).length;
    const newProgress = (completedItems / items.length) * 100;
    setProgress(newProgress);
    
    onDocumentStatus?.({ 
      completed: completedItems, 
      total: items.length 
    });
  }, [items, onDocumentStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <Check className="w-4 h-4 text-success" />;
      case 'uploaded':
        return <Upload className="w-4 h-4 text-primary" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Camera className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-success">Verified</Badge>;
      case 'uploaded':
        return <Badge variant="default" className="bg-primary">Uploaded</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Document has been verified successfully';
      case 'uploaded':
        return 'Document uploaded, verification in progress';
      case 'rejected':
        return 'Document rejected, please upload again';
      default:
        return 'Waiting for document upload';
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold gradient-text">Document Verification</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
          Please ensure you have the following documents ready for verification. 
          All documents will be processed securely and verified instantly.
        </p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Document Checklist */}
      <div className="space-y-4">
        {items.map((item, index) => {
          const IconComponent = item.icon;
          const isCompleted = item.status === 'verified' || item.status === 'uploaded';
          const hasError = item.status === 'rejected';

          return (
            <Card
              key={item.id}
              className={cn(
                "transition-all duration-300",
                {
                  "border-success shadow-success/10": item.status === 'verified',
                  "border-primary shadow-primary/10": item.status === 'uploaded',
                  "border-destructive shadow-destructive/10": item.status === 'rejected',
                  "hover:shadow-md": item.status === 'pending',
                }
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        {
                          "bg-success/20": item.status === 'verified',
                          "bg-primary/20": item.status === 'uploaded',
                          "bg-destructive/20": item.status === 'rejected',
                          "bg-muted": item.status === 'pending',
                        }
                      )}
                    >
                      <IconComponent
                        className={cn(
                          "w-5 h-5",
                          {
                            "text-success": item.status === 'verified',
                            "text-primary": item.status === 'uploaded',
                            "text-destructive": item.status === 'rejected',
                            "text-muted-foreground": item.status === 'pending',
                          }
                        )}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        {item.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    {getStatusDescription(item.status)}
                  </span>
                  
                  {item.status === 'uploaded' && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-xs text-primary">Verifying...</span>
                    </div>
                  )}
                </div>

                {/* Tips */}
                {item.status === 'pending' && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      Tips for best results:
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {item.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Error State */}
                {hasError && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Document needs attention</span>
                    </div>
                    <p className="text-xs text-destructive/80 mt-1">
                      Please check image quality and try uploading again.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>All documents are processed securely and stored encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default Checklist;