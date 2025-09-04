import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Phone, User, CreditCard, Globe } from 'lucide-react';

export function CustomerInfoPanel() {
  const customerInfo = {
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    accountType: 'Premium Banking',
    accountNumber: '****7892',
    language: 'English',
    callDuration: '03:45',
    location: 'Mumbai, Maharashtra'
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Customer Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Customer Name</label>
              <p className="font-medium">{customerInfo.name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Phone Number</label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{customerInfo.phone}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Account Type</label>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary">{customerInfo.accountType}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Account Number</label>
              <p className="font-medium">{customerInfo.accountNumber}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Preferred Language</label>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{customerInfo.language}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Call Duration</label>
              <Badge variant="outline" className="font-mono">
                {customerInfo.callDuration}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}