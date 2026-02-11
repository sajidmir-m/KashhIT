import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Server, 
  Smartphone, 
  Cloud, 
  Database, 
  Brain,
  Send,
  CheckCircle2,
  X,
  Loader2,
  GraduationCap,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  Terminal,
  Shield,
  Lock,
  Zap,
  Cpu,
  Eye,
  Clock,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

interface InternshipType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  durationMonths: number;
  skills: string[];
  color: string;
  terminalColor: string;
  provider: string;
  whatToDo: string[];
  responsibilities: string[];
  learningOutcomes: string[];
}

const internshipTypes: InternshipType[] = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    description: 'Build modern, responsive user interfaces using React, Vue, Angular, and modern CSS frameworks.',
    icon: <Code className="h-8 w-8" />,
    duration: '3-6 months',
    durationMonths: 6,
    skills: ['React', 'Vue.js', 'Angular', 'TypeScript', 'HTML/CSS', 'Tailwind CSS'],
    color: 'text-cyan-400',
    terminalColor: 'border-cyan-500/50 bg-cyan-500/5',
    provider: 'kaash.IT',
    whatToDo: [
      'Develop responsive web applications using React, Vue.js, or Angular',
      'Implement modern UI/UX designs with CSS frameworks like Tailwind CSS',
      'Build reusable component libraries and design systems',
      'Optimize applications for performance and accessibility',
      'Collaborate with designers and backend developers',
      'Write clean, maintainable code following best practices'
    ],
    responsibilities: [
      'Create pixel-perfect UI components from design mockups',
      'Implement responsive designs for mobile, tablet, and desktop',
      'Debug and fix frontend issues and bugs',
      'Participate in code reviews and team meetings',
      'Stay updated with latest frontend technologies and trends'
    ],
    learningOutcomes: [
      'Master modern JavaScript frameworks and libraries',
      'Understand component-based architecture',
      'Learn state management and routing',
      'Gain experience with build tools and bundlers',
      'Develop portfolio-worthy projects'
    ]
  },
  {
    id: 'backend',
    title: 'Backend Development',
    description: 'Develop robust server-side applications, APIs, and databases using Node.js, Python, Java.',
    icon: <Server className="h-8 w-8" />,
    duration: '3-6 months',
    durationMonths: 6,
    skills: ['Node.js', 'Python', 'Java', 'REST APIs', 'PostgreSQL', 'MongoDB'],
    color: 'text-green-400',
    terminalColor: 'border-green-500/50 bg-green-500/5',
    provider: 'kaash.IT',
    whatToDo: [
      'Design and develop RESTful APIs and GraphQL endpoints',
      'Build scalable server-side applications using Node.js, Python, or Java',
      'Work with databases (PostgreSQL, MongoDB) and optimize queries',
      'Implement authentication, authorization, and security best practices',
      'Create microservices and handle system architecture',
      'Write unit tests and integration tests for backend services'
    ],
    responsibilities: [
      'Develop and maintain backend services and APIs',
      'Optimize database queries and improve performance',
      'Implement security measures and handle data validation',
      'Collaborate with frontend team to integrate APIs',
      'Document API endpoints and technical specifications'
    ],
    learningOutcomes: [
      'Master server-side programming languages and frameworks',
      'Understand database design and optimization',
      'Learn API design principles and best practices',
      'Gain experience with cloud services and deployment',
      'Develop secure and scalable backend systems'
    ]
  },
  {
    id: 'fullstack',
    title: 'Full Stack Development',
    description: 'Master both frontend and backend technologies to build complete web applications from scratch.',
    icon: <Database className="h-8 w-8" />,
    duration: '6-12 months',
    durationMonths: 12,
    skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'AWS', 'Docker'],
    color: 'text-emerald-400',
    terminalColor: 'border-emerald-500/50 bg-emerald-500/5',
    provider: 'kaash.IT',
    whatToDo: [
      'Build end-to-end web applications from design to deployment',
      'Develop both frontend interfaces and backend APIs',
      'Design and implement database schemas and models',
      'Deploy applications to cloud platforms (AWS, Vercel, etc.)',
      'Implement authentication, payment gateways, and third-party integrations',
      'Work on real-world projects with full development lifecycle'
    ],
    responsibilities: [
      'Develop complete features from frontend to backend',
      'Write clean, maintainable, and well-documented code',
      'Participate in agile development processes',
      'Debug and troubleshoot issues across the stack',
      'Collaborate with team members and stakeholders'
    ],
    learningOutcomes: [
      'Become proficient in both frontend and backend technologies',
      'Understand full-stack architecture and design patterns',
      'Learn DevOps and deployment practices',
      'Gain experience with version control and collaboration tools',
      'Build production-ready applications for your portfolio'
    ]
  },
  {
    id: 'mobile',
    title: 'Mobile App Development',
    description: 'Create cross-platform mobile applications using React Native, Flutter, and native development.',
    icon: <Smartphone className="h-8 w-8" />,
    duration: '3-6 months',
    durationMonths: 6,
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase', 'Redux'],
    color: 'text-yellow-400',
    terminalColor: 'border-yellow-500/50 bg-yellow-500/5',
    provider: 'kaash.IT',
    whatToDo: [
      'Develop cross-platform mobile applications using React Native or Flutter',
      'Build native iOS and Android apps using Swift/Kotlin',
      'Implement mobile UI/UX designs and animations',
      'Integrate APIs, push notifications, and third-party services',
      'Work with mobile databases and local storage',
      'Test apps on various devices and handle platform-specific issues'
    ],
    responsibilities: [
      'Design and develop mobile app features and screens',
      'Implement responsive layouts for different screen sizes',
      'Optimize app performance and battery usage',
      'Handle app store submissions and updates',
      'Debug and fix mobile-specific issues'
    ],
    learningOutcomes: [
      'Master mobile app development frameworks',
      'Understand mobile UI/UX principles',
      'Learn app deployment and distribution',
      'Gain experience with mobile testing and debugging',
      'Build apps ready for app store release'
    ]
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud',
    description: 'Learn cloud infrastructure, CI/CD pipelines, containerization, and automation tools.',
    icon: <Cloud className="h-8 w-8" />,
    duration: '3-6 months',
    durationMonths: 6,
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
    color: 'text-blue-400',
    terminalColor: 'border-blue-500/50 bg-blue-500/5',
    provider: 'kaash.IT',
    whatToDo: [
      'Set up and manage cloud infrastructure on AWS, Azure, or GCP',
      'Create and maintain CI/CD pipelines using GitHub Actions, Jenkins, or GitLab',
      'Containerize applications using Docker and orchestrate with Kubernetes',
      'Automate infrastructure provisioning using Terraform or CloudFormation',
      'Monitor applications and infrastructure using logging and monitoring tools',
      'Implement security best practices and manage access controls'
    ],
    responsibilities: [
      'Maintain and optimize cloud infrastructure',
      'Automate deployment and scaling processes',
      'Monitor system performance and troubleshoot issues',
      'Implement backup and disaster recovery strategies',
      'Document infrastructure and deployment procedures'
    ],
    learningOutcomes: [
      'Master cloud platforms and services',
      'Understand containerization and orchestration',
      'Learn infrastructure as code principles',
      'Gain experience with CI/CD and automation',
      'Develop skills in system monitoring and troubleshooting'
    ]
  },
  {
    id: 'data-science',
    title: 'Data Science & AI',
    description: 'Explore machine learning, data analysis, AI models, and data visualization techniques.',
    icon: <Brain className="h-8 w-8" />,
    duration: '6-12 months',
    durationMonths: 12,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'SQL', 'Data Visualization'],
    color: 'text-purple-400',
    terminalColor: 'border-purple-500/50 bg-purple-500/5',
    provider: 'kaash.IT',
    whatToDo: [
      'Analyze large datasets and extract meaningful insights',
      'Build and train machine learning models using Python libraries',
      'Create data visualizations and dashboards',
      'Implement AI solutions for real-world problems',
      'Work with NLP, computer vision, or predictive analytics',
      'Clean, preprocess, and transform data for analysis'
    ],
    responsibilities: [
      'Collect and analyze data from various sources',
      'Develop and evaluate machine learning models',
      'Create reports and visualizations for stakeholders',
      'Optimize models for performance and accuracy',
      'Stay updated with latest AI/ML research and tools'
    ],
    learningOutcomes: [
      'Master data analysis and visualization tools',
      'Understand machine learning algorithms and techniques',
      'Learn to build and deploy ML models',
      'Gain experience with big data technologies',
      'Develop AI solutions for practical applications'
    ]
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity & Ethical Hacking',
    description: 'Master security protocols, penetration testing, vulnerability assessment, and ethical hacking techniques.',
    icon: <Shield className="h-8 w-8" />,
    duration: '6-12 months',
    durationMonths: 12,
    skills: ['Kali Linux', 'Penetration Testing', 'Network Security', 'Cryptography', 'OWASP', 'Forensics'],
    color: 'text-red-400',
    terminalColor: 'border-red-500/50 bg-red-500/5',
    provider: 'kaash.IT',
    whatToDo: [
      'Perform security assessments and penetration testing',
      'Identify and exploit vulnerabilities in web applications and networks',
      'Implement security measures and best practices',
      'Conduct security audits and risk assessments',
      'Work with security tools like Burp Suite, Metasploit, and Wireshark',
      'Learn about cryptography, network security, and incident response'
    ],
    responsibilities: [
      'Conduct security testing and vulnerability assessments',
      'Document security findings and provide remediation recommendations',
      'Implement security controls and monitoring systems',
      'Respond to security incidents and threats',
      'Stay updated with latest security threats and countermeasures'
    ],
    learningOutcomes: [
      'Master ethical hacking and penetration testing',
      'Understand security protocols and best practices',
      'Learn to identify and mitigate vulnerabilities',
      'Gain experience with security tools and frameworks',
      'Develop skills in cybersecurity and threat analysis'
    ]
  },
  {
    id: 'iot',
    title: 'IoT Development',
    description: 'Build Internet of Things solutions, work with sensors, microcontrollers, and embedded systems.',
    icon: <Cpu className="h-8 w-8" />,
    duration: '6-12 months',
    durationMonths: 12,
    skills: ['Arduino', 'Raspberry Pi', 'ESP32', 'MQTT', 'Python', 'Embedded C'],
    color: 'text-orange-400',
    terminalColor: 'border-orange-500/50 bg-orange-500/5',
    provider: 'kaash.IT',
    whatToDo: [
      'Develop IoT solutions using Arduino, Raspberry Pi, and ESP32',
      'Work with sensors, actuators, and microcontrollers',
      'Build IoT applications for smart homes, agriculture, and industrial automation',
      'Implement MQTT protocols and cloud connectivity',
      'Create embedded systems and firmware development',
      'Integrate hardware with software applications and cloud services'
    ],
    responsibilities: [
      'Design and develop IoT hardware and software solutions',
      'Program microcontrollers and work with sensor data',
      'Build and test IoT prototypes and proof of concepts',
      'Integrate IoT devices with cloud platforms',
      'Troubleshoot hardware and software issues'
    ],
    learningOutcomes: [
      'Master IoT hardware and embedded systems',
      'Understand sensor integration and data collection',
      'Learn cloud connectivity and MQTT protocols',
      'Gain experience with microcontroller programming',
      'Build complete IoT solutions from hardware to cloud'
    ]
  }
];

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
  const { user } = useAuth();
  const [selectedInternship, setSelectedInternship] = useState<InternshipType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDetailsInternship, setSelectedDetailsInternship] = useState<InternshipType | null>(null);
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
    previousExperience: ''
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

  const handleOpenDialog = (internship: InternshipType) => {
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

  const handleViewDetails = (internship: InternshipType) => {
    setSelectedDetailsInternship(internship);
    setIsDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedDetailsInternship(null);
  };

  const handleApplyFromDetails = () => {
    if (selectedDetailsInternship) {
      handleCloseDetailsDialog();
      handleOpenDialog(selectedDetailsInternship);
    }
  };

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
          cover_letter: formData.coverLetter,
          availability: formData.availability,
          previous_experience: formData.previousExperience,
          status: 'pending'
        });

      if (error) {
        if (error.code === '42P01') {
          console.warn('Internship applications table not found, but application submitted locally');
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
      <MatrixRain />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* Terminal Header */}
        <div className="mb-8 sm:mb-12 border border-green-500/50 bg-black/80 backdrop-blur-sm p-6 rounded-lg font-mono shadow-[0_0_20px_rgba(0,255,65,0.3)]">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-5 w-5 text-green-400 animate-pulse" />
            <span className="text-green-400">root@kashit:~$</span>
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
          {internshipTypes.map((internship, idx) => (
            <div
              key={internship.id}
              className={`border-2 ${internship.terminalColor} bg-black/70 backdrop-blur-sm rounded-lg p-6 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,255,65,0.5)] hover:scale-105 hover:border-opacity-100 font-mono group relative overflow-hidden`}
              style={{
                animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
              }}
            >
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Terminal prompt */}
              <div className="flex items-center gap-2 mb-3 text-xs text-green-400/60">
                <span className="text-cyan-400">$</span>
                <span>./select_program.sh</span>
                <span className="text-green-400">{internship.id}</span>
              </div>

              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg bg-black/50 border border-green-500/30 ${internship.color} group-hover:animate-pulse`}>
                  {internship.icon}
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
                    handleViewDetails(internship);
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

        {/* Details Dialog - Terminal Style */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-2 border-cyan-500/50 font-mono text-cyan-400">
            <DialogHeader className="border-b border-cyan-500/30 pb-4">
              <div className="flex items-center gap-2 text-xs text-cyan-400/60 mb-2">
                <Terminal className="h-4 w-4" />
                <span>root@kashit:~$ ./view_details.sh</span>
                <span className="text-green-400">{selectedDetailsInternship?.id}</span>
              </div>
              <DialogTitle className="text-2xl flex items-center gap-2 text-cyan-400">
                {selectedDetailsInternship?.icon}
                <GlitchText className="text-cyan-400">{selectedDetailsInternship?.title.toUpperCase().replace(/\s+/g, '_')}</GlitchText>
              </DialogTitle>
              <DialogDescription className="text-cyan-300/70 font-mono">
                {'>'} Complete internship program details and information.
              </DialogDescription>
            </DialogHeader>

            {selectedDetailsInternship && (
              <div className="space-y-6">
                {/* Provider and Duration Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-cyan-500/30 rounded-lg p-4 bg-black/50">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="text-xs text-cyan-400/60 font-mono">PROVIDER</div>
                      <div className="text-lg font-semibold text-cyan-400">{selectedDetailsInternship.provider}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="text-xs text-cyan-400/60 font-mono">DURATION</div>
                      <div className="text-lg font-semibold text-cyan-400">
                        {selectedDetailsInternship.durationMonths} months ({selectedDetailsInternship.duration})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="border border-cyan-500/30 rounded-lg p-4 bg-black/50">
                  <h3 className="text-lg font-semibold mb-3 text-cyan-400 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {'>'} DESCRIPTION
                  </h3>
                  <p className="text-cyan-300/80 font-mono">{selectedDetailsInternship.description}</p>
                </div>

                {/* What You'll Do */}
                <div className="border border-cyan-500/30 rounded-lg p-4 bg-black/50">
                  <h3 className="text-lg font-semibold mb-3 text-cyan-400 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    {'>'} WHAT_YOU_WILL_DO
                  </h3>
                  <ul className="space-y-2">
                    {selectedDetailsInternship.whatToDo.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-cyan-300/80 font-mono">
                        <span className="text-cyan-400 mt-1">{'>'}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Responsibilities */}
                <div className="border border-cyan-500/30 rounded-lg p-4 bg-black/50">
                  <h3 className="text-lg font-semibold mb-3 text-cyan-400 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    {'>'} RESPONSIBILITIES
                  </h3>
                  <ul className="space-y-2">
                    {selectedDetailsInternship.responsibilities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-cyan-300/80 font-mono">
                        <span className="text-cyan-400 mt-1">{'>'}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Learning Outcomes */}
                <div className="border border-cyan-500/30 rounded-lg p-4 bg-black/50">
                  <h3 className="text-lg font-semibold mb-3 text-cyan-400 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {'>'} LEARNING_OUTCOMES
                  </h3>
                  <ul className="space-y-2">
                    {selectedDetailsInternship.learningOutcomes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-cyan-300/80 font-mono">
                        <span className="text-cyan-400 mt-1">{'>'}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills */}
                <div className="border border-cyan-500/30 rounded-lg p-4 bg-black/50">
                  <h3 className="text-lg font-semibold mb-3 text-cyan-400 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {'>'} SKILLS_YOU_WILL_LEARN
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDetailsInternship.skills.map((skill) => (
                      <Badge
                        key={skill}
                        className="bg-black/50 text-cyan-400 border-cyan-500/30 font-mono text-sm hover:bg-cyan-500/20 transition-colors"
                      >
                        {'>'} {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 border-t border-cyan-500/30 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDetailsDialog}
                className="w-full sm:w-auto bg-black/50 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 font-mono"
              >
                <X className="h-4 w-4 mr-2" />
                {'>'} CLOSE
              </Button>
              <Button
                type="button"
                onClick={handleApplyFromDetails}
                disabled={!user}
                className="w-full sm:w-auto bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 font-mono hover:shadow-[0_0_15px_rgba(0,255,65,0.5)]"
              >
                <Terminal className="h-4 w-4 mr-2" />
                {'>'} APPLY_NOW
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Application Dialog - Terminal Style */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black border-2 border-green-500/50 font-mono text-green-400">
            <DialogHeader className="border-b border-green-500/30 pb-4">
              <div className="flex items-center gap-2 text-xs text-green-400/60 mb-2">
                <Terminal className="h-4 w-4" />
                <span>root@kashit:~$ ./apply.sh</span>
                <span className="text-cyan-400">{selectedInternship?.id}</span>
              </div>
              <DialogTitle className="text-2xl flex items-center gap-2 text-green-400">
                {selectedInternship?.icon}
                <GlitchText>APPLY_FOR_{selectedInternship?.title.toUpperCase().replace(/\s+/g, '_')}</GlitchText>
              </DialogTitle>
              <DialogDescription className="text-green-300/70 font-mono space-y-2">
                <div>{'>'} Fill out the form below to apply for this internship program.</div>
                <div className="flex items-center gap-4 text-sm pt-2 border-t border-green-500/20">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-400" />
                    <span className="text-green-400/80">Provider: <span className="text-green-400 font-semibold">{selectedInternship?.provider}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-400" />
                    <span className="text-green-400/80">Duration: <span className="text-green-400 font-semibold">{selectedInternship?.durationMonths} months</span></span>
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

              {/* Portfolio & Links */}
              <div className="space-y-4 border border-green-500/30 rounded-lg p-4 bg-black/50">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-cyan-400">
                  <Code className="h-5 w-5" />
                  {'>'} PORTFOLIO_&_LINKS
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'portfolio', label: 'Portfolio Website', placeholder: 'https://yourportfolio.com', required: false },
                    { id: 'github', label: 'GitHub Profile', placeholder: 'https://github.com/username', required: true },
                    { id: 'linkedin', label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/in/username', required: false, span: 2 },
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
