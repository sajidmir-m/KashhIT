import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Cpu, Workflow, Target, MessageCircle, CheckCircle2, XCircle } from 'lucide-react';
import { iotProjects, WHATSAPP_NUMBER, WHATSAPP_MESSAGE_TEMPLATE } from '@/data/iotProjects';
import { toast } from 'sonner';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hasPurchased, setHasPurchased] = useState<string>('');
  const [name, setName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const project = iotProjects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Button onClick={() => navigate('/explore-projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !orderId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    // Create WhatsApp URL
    const message = WHATSAPP_MESSAGE_TEMPLATE(name, orderId);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    // Reset form
    setName('');
    setOrderId('');
    setHasPurchased('');
    setIsSubmitting(false);
    
    toast.success('Redirecting to WhatsApp...');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/explore-projects')}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>

          {/* Project Image */}
          <Card className="mb-6 overflow-hidden">
            <div className="w-full h-64 sm:h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
              {project.imageUrl ? (
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Package className="h-32 w-32 text-gray-400" />
              )}
            </div>
          </Card>

          {/* Project Name */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{project.name}</h1>

          {/* Full Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Project Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {project.fullDescription}
              </p>
            </CardContent>
          </Card>

          {/* Detailed Components */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Components Used
              </CardTitle>
              <CardDescription>Complete list of components required for this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.detailedComponents.map((comp, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{comp.name}</h4>
                      {comp.description && (
                        <p className="text-sm text-gray-600 mt-1">{comp.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-700">Qty: {comp.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workflow/Circuit Explanation */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Workflow & Circuit Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {project.workflow}
              </p>
            </CardContent>
          </Card>

          {/* Usage/Applications */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Usage & Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.applications.map((app, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{app}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Service Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                If You Want Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hardware Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Hardware Section</h3>
                
                {/* Message about purchasing components */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-gray-700">
                    <strong>1️⃣</strong> First, please buy the components from us to enjoy our free services.
                  Once you have purchased the components, you can proceed with the service request below.
                  Our team will help you with hardware setup, troubleshooting, and guidance.
                  </p>
                </div>

                {/* Purchase Question */}
                <div className="mb-4">
                  <Label className="text-base font-semibold mb-3 block">
                    2️⃣ Have you purchased the components?
                  </Label>
                  <RadioGroup
                    value={hasPurchased}
                    onValueChange={setHasPurchased}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes" className="cursor-pointer font-normal">
                        Yes, I have purchased the components
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no" className="cursor-pointer font-normal">
                        No, I haven't purchased yet
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Response based on selection */}
                {hasPurchased === 'no' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">
                        Please complete your purchase first. Once you have purchased the components from us,
                        you can return here to request our free services. Our services include hardware setup
                        assistance, troubleshooting, and project guidance.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form for Yes response */}
                {hasPurchased === 'yes' && (
                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">
                          Great! Please provide your details below, and we'll connect you with our service team
                          via WhatsApp. Our team will assist you with hardware setup, troubleshooting, and
                          project implementation.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="orderId">Order ID *</Label>
                        <Input
                          id="orderId"
                          type="text"
                          placeholder="Enter your order ID"
                          value={orderId}
                          onChange={(e) => setOrderId(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting || !name.trim() || !orderId.trim()}
                      >
                        {isSubmitting ? 'Processing...' : 'Request Service via WhatsApp'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              <Separator />

              {/* Software Section - Placeholder */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Software Section</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">
                    Software services will be available soon. This section will include code assistance,
                    programming help, and software troubleshooting services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;

