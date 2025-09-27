import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Banknote, 
  Building2, 
  Check, 
  Sparkles,
  TrendingUp,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentOptionsProps {
  onPaymentSelect: (selection: string) => void;
  isProcessing?: boolean;
}

const paymentOptions = [
  {
    id: 'full_payment',
    title: 'Full Payment',
    description: 'Pay the complete amount upfront',
    icon: Banknote,
    badge: 'Recommended',
    badgeVariant: 'success' as const,
    benefits: ['No interest charges', 'Instant approval', 'Best value'],
    buttonText: 'Pay Full Amount',
    buttonClass: 'btn-secondary',
  },
  {
    id: 'credit_card',
    title: 'Credit Card',
    description: 'Pay using your credit card',
    icon: CreditCard,
    badge: 'Popular',
    badgeVariant: 'default' as const,
    benefits: ['Flexible payments', 'Reward points', 'Secure processing'],
    buttonText: 'Use Credit Card',
    buttonClass: 'btn-primary',
  },
  {
    id: 'nbfc_loan',
    title: '0% Interest Loan',
    description: 'Get financing through our NBFC partner',
    icon: Building2,
    badge: 'No Interest',
    badgeVariant: 'secondary' as const,
    benefits: ['0% interest rate', 'Flexible tenure', 'Quick approval'],
    buttonText: 'Apply for Loan',
    buttonClass: 'btn-accent',
  },
];

const PaymentOptions = ({ onPaymentSelect, isProcessing = false }: PaymentOptionsProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
    onPaymentSelect(optionId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold gradient-text">Choose Your Payment Method</h2>
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the payment option that works best for you. All methods are secure and processed instantly.
        </p>
      </div>

      {/* Payment Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paymentOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedOption === option.id;
          const isHovered = hoveredOption === option.id;

          return (
            <Card
              key={option.id}
              className={cn(
                "relative transition-all duration-300 cursor-pointer group",
                "hover:shadow-lg hover:-translate-y-1",
                {
                  "ring-2 ring-primary shadow-lg scale-105": isSelected,
                  "hover:shadow-glow": isHovered && !isSelected,
                }
              )}
              onMouseEnter={() => setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 text-success-foreground" />
                </div>
              )}

              <CardHeader className="text-center pb-4">
                {/* Badge */}
                <div className="flex justify-center mb-3">
                  <Badge variant={option.badgeVariant} className="text-xs">
                    {option.badge}
                  </Badge>
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4",
                    "transition-all duration-300 group-hover:scale-110",
                    {
                      "bg-secondary/20 text-secondary": option.id === 'full_payment',
                      "bg-primary/20 text-primary": option.id === 'credit_card',
                      "bg-accent/20 text-accent": option.id === 'nbfc_loan',
                    }
                  )}
                >
                  <IconComponent className="w-8 h-8" />
                </div>

                <CardTitle className="text-xl mb-2">{option.title}</CardTitle>
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Benefits */}
                <div className="space-y-2 mb-6">
                  {option.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-success rounded-full flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleSelect(option.id)}
                  disabled={isProcessing}
                  className={cn(
                    "w-full h-12 transition-all duration-300",
                    option.buttonClass,
                    {
                      "transform scale-105": isSelected,
                    }
                  )}
                >
                  {isProcessing && selectedOption === option.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      {option.buttonText}
                    </div>
                  )}
                </Button>
              </CardContent>

              {/* Hover Effect Overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 rounded-lg",
                  "opacity-0 transition-opacity duration-300",
                  {
                    "opacity-100": isHovered || isSelected,
                  }
                )}
              />
            </Card>
          );
        })}
      </div>

      {/* Security Notice */}
      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>All payments are secured with bank-level encryption</span>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-primary">
              Processing your selection...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentOptions;