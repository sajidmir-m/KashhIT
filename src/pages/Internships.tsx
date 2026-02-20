import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Code,
  Send,
  CheckCircle2,
  X,
  Loader2,
  GraduationCap,
  Briefcase,
  Calendar,
  FileText,
  Terminal,
  Shield,
  Zap,
  Eye,
  Clock,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { getInternshipProgram, internshipPrograms, type InternshipProgram } from '@/lib/internships';
import { SEOHead } from '@/components/SEOHead';

interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  year: string;
  portfolio: string;
  github: string;
  linkedin: string;
  coverLetter: string;
  availability: string;
  previousExperience: string;
  durationPreference: string;
  resumeUrl: string;
}

// Terminal typing animation component
const TerminalTyping = ({ text, delay = 50 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [text, delay]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className="font-mono">
      {displayedText}
      <span className={showCursor ? 'opacity-100' : 'opacity-0'}>█</span>
    </span>
  );
};

// Matrix rain background effect
const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = `rgba(0, 255, 65, ${Math.random() * 0.5 + 0.5})`;
        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-20 z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

// Glitch text effect
const GlitchText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 text-red-500 opacity-75 blur-sm animate-pulse"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
          transform: 'translate(-2px, -2px)',
        }}
      >
        {children}
      </span>
      <span
        className="absolute inset-0 text-cyan-500 opacity-75 blur-sm animate-pulse"
        style={{
          clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
          transform: 'translate(2px, 2px)',
          animationDelay: '0.1s',
        }}
      >
        {children}
      </span>
    </span>
  );
};

const Internships = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedInternship, setSelectedInternship] = useState<InternshipProgram | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [terminalCommand, setTerminalCommand] = useState('');
  const [showTerminal, setShowTerminal] = useState(true);
  const formDataRef = useRef<ApplicationFormData>({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    college: '',
    course: '',
    year: '',
    portfolio: '',
    github: '',
    linkedin: '',
    coverLetter: '',
    availability: '',
    previousExperience: '',
    durationPreference: '',
    resumeUrl: '',
  });
  const [formData, setFormData] = useState<ApplicationFormData>(formDataRef.current);

  // Terminal command typing effect
  useEffect(() => {
    const commands = [
      '$ ./init_internship_program.sh',
      '$ git clone https://github.com/kashit/internships.git',
      '$ cd internships && npm install',
      '$ ./start_learning.sh',
      '$ echo "Welcome to the Matrix..."',
    ];
    let commandIndex = 0;
    let charIndex = 0;

    const typeCommand = () => {
      if (charIndex < commands[commandIndex].length) {
        setTerminalCommand(commands[commandIndex].slice(0, charIndex + 1));
        charIndex++;
        setTimeout(typeCommand, 50);
      } else {
        setTimeout(() => {
          setTerminalCommand('');
          charIndex = 0;
          commandIndex = (commandIndex + 1) % commands.length;
          setTimeout(typeCommand, 1000);
        }, 2000);
      }
    };

    const timeout = setTimeout(typeCommand, 500);
    return () => clearTimeout(timeout);
  }, []);

  const handleOpenDialog = (internship: InternshipProgram) => {
    if (!user) {
      toast.error('Please login to apply for internships');
      navigate('/auth');
      return;
    }
    setSelectedInternship(internship);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedInternship(null);
    setFormData(formDataRef.current);
  };

  // Deep-link support: /career?apply=frontend or /internships?apply=frontend
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const applyId = params.get('apply');
    if (!applyId) return;

    const program = getInternshipProgram(applyId);
    if (program) {
      // Clear query param to prevent reopening on state changes
      const currentPath = location.pathname;
      navigate(currentPath, { replace: true });
      handleOpenDialog(program);
    }
  }, [location.search, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternship || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('internship_applications')
        .insert({
          user_id: user.id,
          internship_type: selectedInternship.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          college: formData.college,
          course: formData.course,
          year: formData.year,
          portfolio_url: formData.portfolio,
          github_url: formData.github,
          linkedin_url: formData.linkedin,
          resume_url: formData.resumeUrl,
          cover_letter: formData.coverLetter,
          availability: formData.availability,
          previous_experience: formData.previousExperience,
          duration_preference: formData.durationPreference,
          status: 'pending'
        });

      if (error) {
        // 42P01: table not found, 42703: column not found
        if (error.code === '42P01' || error.code === '42703') {
          console.warn('Internship applications schema mismatch, but application submitted locally', error);
        } else {
          throw error;
        }
      }

      toast.success(`Application submitted successfully for ${selectedInternship.title}!`);
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 relative overflow-hidden">
      <SEOHead
        title="Internship Programs - Software & Hardware Development | Kasshit"
        description="Join Kasshit's internship programs in Frontend, Backend, Full Stack, Mobile, DevOps, Data Science, Cybersecurity, and IoT Development. Gain hands-on experience with real projects."
        keywords="internship programs, software development internship, hardware internship, frontend development, backend development, full stack internship, mobile app development, DevOps internship, data science internship, cybersecurity internship, IoT internship"
        canonical="https://www.kasshit.in/career"
      />
      <MatrixRain />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* Terminal Header */}
        <div className="mb-8 sm:mb-12 border border-green-500/50 bg-black/80 backdrop-blur-sm p-6 rounded-lg font-mono shadow-[0_0_20px_rgba(0,255,65,0.3)]">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-5 w-5 text-green-400 animate-pulse" />
            <span className="text-green-400">root@kasshit:~$</span>
            <span className="text-green-300">{terminalCommand}</span>
            <span className="animate-blink">█</span>
          </div>
          <div className="text-green-400/80 text-sm">
            <div className="mb-2">
              <span className="text-cyan-400">[INFO]</span> Initializing internship program...
            </div>
            <div className="mb-2">
              <span className="text-yellow-400">[WARN]</span> Only serious candidates need apply
            </div>
            <div>
              <span className="text-green-400">[SUCCESS]</span> System ready. Select your path below.
            </div>
          </div>
        </div>

        {/* Header Section with Glitch Effect */}
        <div className="text-center mb-8 sm:mb-12 relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/50 animate-pulse">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-green-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono">
              <GlitchText className="text-green-400">INTERNSHIP_PROGRAMS</GlitchText>
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-green-300/80 max-w-3xl mx-auto font-mono">
            {'>'} Kickstart your career in software and hardware development.{'\n'}
            {'>'} Gain hands-on experience, work on real projects, learn from experts.
          </p>
        </div>

        {/* Benefits Section - Terminal Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 sm:mb-12">
          {[
            { icon: Briefcase, title: 'Real Projects', desc: 'Work on live projects and build your portfolio', colorClass: 'text-cyan-400' },
            { icon: GraduationCap, title: 'Mentorship', desc: 'Learn from experienced developers and industry experts', colorClass: 'text-green-400' },
            { icon: CheckCircle2, title: 'Certificate', desc: 'Receive a certificate upon successful completion', colorClass: 'text-yellow-400' },
          ].map((benefit, idx) => (
            <div
              key={idx}
              className="border border-green-500/30 bg-black/60 backdrop-blur-sm p-6 rounded-lg font-mono hover:border-green-500/70 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,65,0.4)] hover:scale-105"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <benefit.icon className={`h-10 w-10 ${benefit.colorClass} mx-auto mb-3 animate-pulse`} />
              <h3 className={`font-semibold text-lg mb-2 ${benefit.colorClass}`}>{benefit.title}</h3>
              <p className="text-sm text-green-300/70">{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* Internship Types Grid - Terminal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {internshipPrograms.map((internship, idx) => (
            <div
              key={internship.id}
              className={`border-2 ${internship.terminalColor} bg-black/70 backdrop-blur-sm rounded-lg p-6 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,255,65,0.5)] hover:scale-105 hover:border-opacity-100 font-mono group relative overflow-hidden`}
              style={{
                animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
              }}
            >
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Terminal prompt */}
              <div className="flex items-center gap-2 mb-3 text-xs text-green-400/60">
                <span className="text-cyan-400">$</span>
                <span>./select_program.sh</span>
                <span className="text-green-400">{internship.id}</span>
              </div>

              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg bg-black/50 border border-green-500/30 ${internship.color} group-hover:animate-pulse`}>
                  <internship.Icon className="h-8 w-8" />
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50 font-mono text-xs">
                  {internship.duration}
                </Badge>
              </div>

              <CardTitle className={`text-xl mb-2 ${internship.color} font-mono`}>
                {internship.title.toUpperCase()}
              </CardTitle>
              <CardDescription className="text-sm mb-4 text-green-300/70 font-mono">
                {internship.description}
              </CardDescription>

              <div className="flex flex-wrap gap-2 mb-4">
                {internship.skills.slice(0, 4).map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-black/50 text-green-400 border-green-500/30 font-mono text-xs hover:bg-green-500/20 transition-colors"
                  >
                    {'>'} {skill}
                  </Badge>
                ))}
                {internship.skills.length > 4 && (
                  <Badge className="bg-black/50 text-cyan-400 border-cyan-500/30 font-mono text-xs">
                    +{internship.skills.length - 4} more
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/career/${internship.id}`);
                  }}
                  className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50 font-mono transition-all"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {'>'} VIEW_DETAILS
                </Button>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDialog(internship);
                  }}
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 font-mono group-hover:shadow-[0_0_15px_rgba(0,255,65,0.5)] transition-all"
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  {'>'} APPLY_NOW
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Application Dialog - Terminal Style */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black border-2 border-green-500/50 font-mono text-green-400">
            <DialogHeader className="border-b border-green-500/30 pb-4">
              <div className="flex items-center gap-2 text-xs text-green-400/60 mb-2">
                <Terminal className="h-4 w-4" />
                <span>root@kasshit:~$ ./apply.sh</span>
                <span className="text-cyan-400">{selectedInternship?.id}</span>
              </div>
              <DialogTitle className="text-2xl flex items-center gap-2 text-green-400">
                {selectedInternship ? <selectedInternship.Icon className="h-8 w-8" /> : null}
                <GlitchText>APPLY_FOR_{selectedInternship?.title.toUpperCase().replace(/\s+/g, '_')}</GlitchText>
              </DialogTitle>
              <DialogDescription className="text-green-300/70 font-mono space-y-2">
                <div>{'>'} Fill out the form below to apply for this internship program.</div>
                <div className="flex items-center gap-4 text-sm pt-2 border-t border-green-500/20">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-400" />
                    <span className="text-green-400/80">
                      Provider:{' '}
                      <span className="text-green-400 font-semibold">{selectedInternship?.provider}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-400" />
                    <span className="text-green-400/80">
                      Duration:{' '}
                      <span className="text-green-400 font-semibold">{selectedInternship?.duration || '3-4 months'}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-400" />
                    <span className="text-green-400/80">
                      Provider:{' '}
                      <span className="text-green-400 font-semibold">{selectedInternship?.provider}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-400" />
                    <span className="text-green-400/80">
                      Duration:{' '}
                      <span className="text-green-400 font-semibold">
                        {selectedInternship?.duration || '3-4 months'} (3 or 4 months)
                      </span>
                    </span>
                  </div>
                </div>
                <div>{'>'} We'll review your application and get back to you soon.</div>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div className="space-y-4 border border-green-500/30 rounded-lg p-4 bg-black/50">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-cyan-400">
                  <FileText className="h-5 w-5" />
                  {'>'} PERSONAL_INFORMATION
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'fullName', label: 'Full Name', placeholder: 'John Doe', required: true },
                    { id: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com', required: true },
                    { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 9876543210', required: true },
                    { id: 'college', label: 'College/University', placeholder: 'Your College Name', required: true },
                    { id: 'course', label: 'Course/Stream', placeholder: 'B.Tech Computer Science', required: true },
                    { id: 'year', label: 'Current Year', placeholder: '2nd Year, 3rd Year, etc.', required: true },
                  ].map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-green-400 font-mono text-sm">
                        {'$'} {field.label} {field.required && '*'}
                      </Label>
                      <Input
                        id={field.id}
                        type={field.type || 'text'}
                        value={formData[field.id as keyof ApplicationFormData] as string}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="bg-black/50 border-green-500/50 text-green-400 font-mono placeholder:text-green-400/30 focus:border-green-500 focus:ring-green-500/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio, Resume & Links */}
              <div className="space-y-4 border border-green-500/30 rounded-lg p-4 bg-black/50">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-cyan-400">
                  <Code className="h-5 w-5" />
                  {'>'} PORTFOLIO_&_LINKS
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'portfolio', label: 'Portfolio Website (optional)', placeholder: 'https://yourportfolio.com', required: false },
                    { id: 'github', label: 'GitHub Profile', placeholder: 'https://github.com/username', required: true },
                    { id: 'linkedin', label: 'LinkedIn Profile (optional)', placeholder: 'https://linkedin.com/in/username', required: false },
                    { id: 'resumeUrl', label: 'Resume (URL)', placeholder: 'https://drive.google.com/your-resume', required: true, span: 2 },
                  ].map((field) => (
                    <div key={field.id} className={`space-y-2 ${field.span === 2 ? 'sm:col-span-2' : ''}`}>
                      <Label htmlFor={field.id} className="text-green-400 font-mono text-sm">
                        {'$'} {field.label} {field.required && '*'}
                      </Label>
                      <Input
                        id={field.id}
                        type="url"
                        value={formData[field.id as keyof ApplicationFormData] as string}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="bg-black/50 border-green-500/50 text-green-400 font-mono placeholder:text-green-400/30 focus:border-green-500 focus:ring-green-500/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience & Availability */}
              <div className="space-y-4 border border-green-500/30 rounded-lg p-4 bg-black/50">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-cyan-400">
                  <Calendar className="h-5 w-5" />
                  {'>'} EXPERIENCE_&_AVAILABILITY
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="previousExperience" className="text-green-400 font-mono text-sm">
                    {'$'} Previous Experience/Projects
                  </Label>
                  <Textarea
                    id="previousExperience"
                    value={formData.previousExperience}
                    onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                    placeholder="Describe your previous projects, internships, or relevant experience..."
                    rows={4}
                    className="bg-black/50 border-green-500/50 text-green-400 font-mono placeholder:text-green-400/30 focus:border-green-500 focus:ring-green-500/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="durationPreference" className="text-green-400 font-mono text-sm">
                    {'$'} Preferred Internship Duration *
                  </Label>
                  <select
                    id="durationPreference"
                    value={formData.durationPreference}
                    onChange={(e) => setFormData({ ...formData, durationPreference: e.target.value })}
                    required
                    className="bg-black/50 border-green-500/50 text-green-400 font-mono text-sm rounded-md px-3 py-2 focus:border-green-500 focus:ring-green-500/50"
                  >
                    <option value="">Select duration</option>
                    <option value="3 months">3 months</option>
                    <option value="4 months">4 months</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability" className="text-green-400 font-mono text-sm">
                    {'$'} Availability (Hours per week) *
                  </Label>
                  <Input
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    required
                    placeholder="e.g., 20-30 hours per week"
                    className="bg-black/50 border-green-500/50 text-green-400 font-mono placeholder:text-green-400/30 focus:border-green-500 focus:ring-green-500/50"
                  />
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-2 border border-green-500/30 rounded-lg p-4 bg-black/50">
                <Label htmlFor="coverLetter" className="text-green-400 font-mono text-sm">
                  {'$'} Cover Letter *
                </Label>
                <Textarea
                  id="coverLetter"
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  required
                  placeholder="Tell us why you're interested in this internship and what you hope to learn..."
                  rows={5}
                  className="bg-black/50 border-green-500/50 text-green-400 font-mono placeholder:text-green-400/30 focus:border-green-500 focus:ring-green-500/50"
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 border-t border-green-500/30 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-black/50 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 font-mono"
                >
                  <X className="h-4 w-4 mr-2" />
                  {'>'} CANCEL
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 font-mono hover:shadow-[0_0_15px_rgba(0,255,65,0.5)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {'>'} SUBMITTING...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {'>'} SUBMIT_APPLICATION
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default Internships;
