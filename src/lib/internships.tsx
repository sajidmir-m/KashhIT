import type { ComponentType } from "react";
import { Brain, Cloud, Code, Cpu, Database, Server, Shield, Smartphone } from "lucide-react";

export type InternshipId =
  | "frontend"
  | "backend"
  | "fullstack"
  | "mobile"
  | "devops"
  | "data-science"
  | "cybersecurity"
  | "iot";

export type InternshipProgram = {
  id: InternshipId;
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
  duration: string;
  durationMonths: number;
  skills: string[];
  color: string;
  terminalColor: string;
  provider: string;
  whatToDo: string[];
  responsibilities: string[];
  learningOutcomes: string[];
};

export const internshipPrograms: InternshipProgram[] = [
  {
    id: "frontend",
    title: "Frontend Development",
    description:
      "Build modern, responsive user interfaces using React, Vue, Angular, and modern CSS frameworks.",
    Icon: Code,
    duration: "3-4 months",
    durationMonths: 3,
    skills: ["React", "Vue.js", "Angular", "TypeScript", "HTML/CSS", "Tailwind CSS"],
    color: "text-cyan-400",
    terminalColor: "border-cyan-500/50 bg-cyan-500/5",
    provider: "Kassh.IT",
    whatToDo: [
      "Develop responsive web applications using React, Vue.js, or Angular",
      "Implement modern UI/UX designs with CSS frameworks like Tailwind CSS",
      "Build reusable component libraries and design systems",
      "Optimize applications for performance and accessibility",
      "Collaborate with designers and backend developers",
      "Write clean, maintainable code following best practices",
    ],
    responsibilities: [
      "Create pixel-perfect UI components from design mockups",
      "Implement responsive designs for mobile, tablet, and desktop",
      "Debug and fix frontend issues and bugs",
      "Participate in code reviews and team meetings",
      "Stay updated with latest frontend technologies and trends",
    ],
    learningOutcomes: [
      "Master modern JavaScript frameworks and libraries",
      "Understand component-based architecture",
      "Learn state management and routing",
      "Gain experience with build tools and bundlers",
      "Develop portfolio-worthy projects",
    ],
  },
  {
    id: "backend",
    title: "Backend Development",
    description:
      "Develop robust server-side applications, APIs, and databases using Node.js, Python, Java.",
    Icon: Server,
    duration: "3-4 months",
    durationMonths: 3,
    skills: ["Node.js", "Python", "Java", "REST APIs", "PostgreSQL", "MongoDB"],
    color: "text-green-400",
    terminalColor: "border-green-500/50 bg-green-500/5",
    provider: "Kassh.IT",
    whatToDo: [
      "Design and develop RESTful APIs and GraphQL endpoints",
      "Build scalable server-side applications using Node.js, Python, or Java",
      "Work with databases (PostgreSQL, MongoDB) and optimize queries",
      "Implement authentication, authorization, and security best practices",
      "Create microservices and handle system architecture",
      "Write unit tests and integration tests for backend services",
    ],
    responsibilities: [
      "Develop and maintain backend services and APIs",
      "Optimize database queries and improve performance",
      "Implement security measures and handle data validation",
      "Collaborate with frontend team to integrate APIs",
      "Document API endpoints and technical specifications",
    ],
    learningOutcomes: [
      "Master server-side programming languages and frameworks",
      "Understand database design and optimization",
      "Learn API design principles and best practices",
      "Gain experience with cloud services and deployment",
      "Develop secure and scalable backend systems",
    ],
  },
  {
    id: "fullstack",
    title: "Full Stack Development",
    description: "Master both frontend and backend technologies to build complete web applications from scratch.",
    Icon: Database,
    duration: "3-4 months",
    durationMonths: 3,
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "AWS", "Docker"],
    color: "text-emerald-400",
    terminalColor: "border-emerald-500/50 bg-emerald-500/5",
    provider: "Kassh.IT",
    whatToDo: [
      "Build end-to-end web applications from design to deployment",
      "Develop both frontend interfaces and backend APIs",
      "Design and implement database schemas and models",
      "Deploy applications to cloud platforms (AWS, Vercel, etc.)",
      "Implement authentication, payment gateways, and third-party integrations",
      "Work on real-world projects with full development lifecycle",
    ],
    responsibilities: [
      "Develop complete features from frontend to backend",
      "Write clean, maintainable, and well-documented code",
      "Participate in agile development processes",
      "Debug and troubleshoot issues across the stack",
      "Collaborate with team members and stakeholders",
    ],
    learningOutcomes: [
      "Become proficient in both frontend and backend technologies",
      "Understand full-stack architecture and design patterns",
      "Learn DevOps and deployment practices",
      "Gain experience with version control and collaboration tools",
      "Build production-ready applications for your portfolio",
    ],
  },
  {
    id: "mobile",
    title: "Mobile App Development",
    description: "Create cross-platform mobile applications using React Native, Flutter, and native development.",
    Icon: Smartphone,
    duration: "3-4 months",
    durationMonths: 3,
    skills: ["React Native", "Flutter", "iOS", "Android", "Firebase", "Redux"],
    color: "text-yellow-400",
    terminalColor: "border-yellow-500/50 bg-yellow-500/5",
    provider: "Kassh.IT",
    whatToDo: [
      "Develop cross-platform mobile applications using React Native or Flutter",
      "Build native iOS and Android apps using Swift/Kotlin",
      "Implement mobile UI/UX designs and animations",
      "Integrate APIs, push notifications, and third-party services",
      "Work with mobile databases and local storage",
      "Test apps on various devices and handle platform-specific issues",
    ],
    responsibilities: [
      "Design and develop mobile app features and screens",
      "Implement responsive layouts for different screen sizes",
      "Optimize app performance and battery usage",
      "Handle app store submissions and updates",
      "Debug and fix mobile-specific issues",
    ],
    learningOutcomes: [
      "Master mobile app development frameworks",
      "Understand mobile UI/UX principles",
      "Learn app deployment and distribution",
      "Gain experience with mobile testing and debugging",
      "Build apps ready for app store release",
    ],
  },
  {
    id: "devops",
    title: "DevOps & Cloud",
    description: "Learn cloud infrastructure, CI/CD pipelines, containerization, and automation tools.",
    Icon: Cloud,
    duration: "3-4 months",
    durationMonths: 3,
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux"],
    color: "text-blue-400",
    terminalColor: "border-blue-500/50 bg-blue-500/5",
    provider: "Kassh.IT",
    whatToDo: [
      "Set up and manage cloud infrastructure on AWS, Azure, or GCP",
      "Create and maintain CI/CD pipelines using GitHub Actions, Jenkins, or GitLab",
      "Containerize applications using Docker and orchestrate with Kubernetes",
      "Automate infrastructure provisioning using Terraform or CloudFormation",
      "Monitor applications and infrastructure using logging and monitoring tools",
      "Implement security best practices and manage access controls",
    ],
    responsibilities: [
      "Maintain and optimize cloud infrastructure",
      "Automate deployment and scaling processes",
      "Monitor system performance and troubleshoot issues",
      "Implement backup and disaster recovery strategies",
      "Document infrastructure and deployment procedures",
    ],
    learningOutcomes: [
      "Master cloud platforms and services",
      "Understand containerization and orchestration",
      "Learn infrastructure as code principles",
      "Gain experience with CI/CD and automation",
      "Develop skills in system monitoring and troubleshooting",
    ],
  },
  {
    id: "data-science",
    title: "Data Science & AI",
    description: "Explore machine learning, data analysis, AI models, and data visualization techniques.",
    Icon: Brain,
    duration: "3-4 months",
    durationMonths: 3,
    skills: ["Python", "Machine Learning", "TensorFlow", "Pandas", "SQL", "Data Visualization"],
    color: "text-purple-400",
    terminalColor: "border-purple-500/50 bg-purple-500/5",
    provider: "Kassh.IT",
    whatToDo: [
      "Analyze large datasets and extract meaningful insights",
      "Build and train machine learning models using Python libraries",
      "Create data visualizations and dashboards",
      "Implement AI solutions for real-world problems",
      "Work with NLP, computer vision, or predictive analytics",
      "Clean, preprocess, and transform data for analysis",
    ],
    responsibilities: [
      "Collect and analyze data from various sources",
      "Develop and evaluate machine learning models",
      "Create reports and visualizations for stakeholders",
      "Optimize models for performance and accuracy",
      "Stay updated with latest AI/ML research and tools",
    ],
    learningOutcomes: [
      "Master data analysis and visualization tools",
      "Understand machine learning algorithms and techniques",
      "Learn to build and deploy ML models",
      "Gain experience with big data technologies",
      "Develop AI solutions for practical applications",
    ],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity & Ethical Hacking",
    description:
      "Master security protocols, penetration testing, vulnerability assessment, and ethical hacking techniques.",
    Icon: Shield,
    duration: "3-4 months",
    durationMonths: 3,
    skills: ["Kali Linux", "Penetration Testing", "Network Security", "Cryptography", "OWASP", "Forensics"],
    color: "text-red-400",
    terminalColor: "border-red-500/50 bg-red-500/5",
    provider: "Kassh.IT",
    whatToDo: [
      "Perform security assessments and penetration testing",
      "Identify and exploit vulnerabilities in web applications and networks",
      "Implement security measures and best practices",
      "Conduct security audits and risk assessments",
      "Work with security tools like Burp Suite, Metasploit, and Wireshark",
      "Learn about cryptography, network security, and incident response",
    ],
    responsibilities: [
      "Conduct security testing and vulnerability assessments",
      "Document security findings and provide remediation recommendations",
      "Implement security controls and monitoring systems",
      "Respond to security incidents and threats",
      "Stay updated with latest security threats and countermeasures",
    ],
    learningOutcomes: [
      "Master ethical hacking and penetration testing",
      "Understand security protocols and best practices",
      "Learn to identify and mitigate vulnerabilities",
      "Gain experience with security tools and frameworks",
      "Develop skills in cybersecurity and threat analysis",
    ],
  },
  {
    id: "iot",
    title: "IoT Development",
    description: "Build Internet of Things solutions, work with sensors, microcontrollers, and embedded systems.",
    Icon: Cpu,
    duration: "3-4 months",
    durationMonths: 3,
    skills: ["Arduino", "Raspberry Pi", "ESP32", "MQTT", "Python", "Embedded C"],
    color: "text-orange-400",
    terminalColor: "border-orange-500/50 bg-orange-500/5",
    provider: "Kassh.IT",
    whatToDo: [
      "Develop IoT solutions using Arduino, Raspberry Pi, and ESP32",
      "Work with sensors, actuators, and microcontrollers",
      "Build IoT applications for smart homes, agriculture, and industrial automation",
      "Implement MQTT protocols and cloud connectivity",
      "Create embedded systems and firmware development",
      "Integrate hardware with software applications and cloud services",
    ],
    responsibilities: [
      "Design and develop IoT hardware and software solutions",
      "Program microcontrollers and work with sensor data",
      "Build and test IoT prototypes and proof of concepts",
      "Integrate IoT devices with cloud platforms",
      "Troubleshoot hardware and software issues",
    ],
    learningOutcomes: [
      "Master IoT hardware and embedded systems",
      "Understand sensor integration and data collection",
      "Learn cloud connectivity and MQTT protocols",
      "Gain experience with microcontroller programming",
      "Build complete IoT solutions from hardware to cloud",
    ],
  },
];

export function getInternshipProgram(id: string | undefined | null): InternshipProgram | null {
  if (!id) return null;
  const found = internshipPrograms.find((p) => p.id === id);
  return found || null;
}


