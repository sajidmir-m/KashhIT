import { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Briefcase, Code, FileText, GraduationCap, Terminal, Zap, ArrowLeft, Building2, Clock } from "lucide-react";
import { getInternshipProgram } from "@/lib/internships";

// Matrix rain background effect (kept lightweight and pointer-events none)
const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setSize();

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ";
    const fontSize = 14;
    const drops: number[] = [];

    const resetDrops = () => {
      const columns = Math.floor(canvas.width / fontSize);
      drops.length = 0;
      for (let i = 0; i < columns; i++) drops[i] = Math.random() * -100;
    };

    resetDrops();

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = `rgba(0, 255, 65, ${Math.random() * 0.45 + 0.35})`;
        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const interval = window.setInterval(draw, 50);

    const onResize = () => {
      setSize();
      resetDrops();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-20 z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

const InternshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const program = getInternshipProgram(id);

  if (!program) {
    return (
      <div className="min-h-screen bg-black text-green-400 relative overflow-hidden">
        <MatrixRain />
        <Navbar />
        <div className="container mx-auto px-4 py-10 relative z-10">
          <Card className="bg-black/70 border border-green-500/40 p-6 font-mono">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="h-5 w-5 text-green-400" />
              <div className="text-green-400/80 text-sm">root@kasshit:~$ ./internship_not_found.sh</div>
            </div>
            <div className="text-xl font-semibold text-green-400 mb-2">{">"} Internship not found</div>
            <p className="text-green-300/70 text-sm mb-6">The internship id you requested does not exist.</p>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate("/internships")}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/50 font-mono"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {">"} BACK_TO_INTERNSHIPS
              </Button>
              <Link to="/home">
                <Button
                  variant="outline"
                  className="bg-black/50 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 font-mono"
                >
                  {">"} GO_HOME
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const Icon = program.Icon;

  return (
    <div className="min-h-screen bg-black text-green-400 relative overflow-hidden">
      <MatrixRain />
      <Navbar />

      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="flex items-center justify-between gap-3 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/internships")}
            className="bg-black/50 border-green-500/40 text-green-300 hover:bg-green-500/10 font-mono"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {">"} BACK
          </Button>

          <Link to={`/internships?apply=${program.id}`}>
            <Button className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/50 font-mono">
              <Terminal className="h-4 w-4 mr-2" />
              {">"} APPLY_NOW
            </Button>
          </Link>
        </div>

        <Card className={`bg-black/70 border-2 ${program.terminalColor} p-6 sm:p-8 font-mono relative overflow-hidden`}>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-green-500/5 to-transparent opacity-60" />

          <div className="relative">
            <div className="flex items-center gap-2 text-xs text-green-400/70 mb-3">
              <span className="text-cyan-400">$</span>
              <span>./view_program.sh</span>
              <span className="text-green-400">{program.id}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-lg bg-black/50 border border-green-500/30 ${program.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-bold ${program.color}`}>{program.title}</div>
                  <div className="text-green-300/70 text-sm mt-1">{program.description}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-green-300/80">
                  <Building2 className="h-4 w-4 text-cyan-400" />
                  <span>Provider:</span>
                  <span className="text-green-300 font-semibold">{program.provider}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-300/80">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span>Duration:</span>
                  <span className="text-green-300 font-semibold">{program.duration || "3-4 months"} (3 or 4 months)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {program.skills.map((skill) => (
                <Badge
                  key={skill}
                  className="bg-black/50 text-green-300 border-green-500/30 font-mono text-xs hover:bg-green-500/15 transition-colors"
                >
                  {">"} {skill}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 border border-green-500/30 rounded-lg p-4 bg-black/50">
                <div className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {">"} WHAT_YOU_WILL_DO
                </div>
                <ul className="space-y-2 text-green-300/80 text-sm">
                  {program.whatToDo.map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-cyan-400">{">"}</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-1 border border-green-500/30 rounded-lg p-4 bg-black/50">
                <div className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {">"} RESPONSIBILITIES
                </div>
                <ul className="space-y-2 text-green-300/80 text-sm">
                  {program.responsibilities.map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-cyan-400">{">"}</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-1 border border-green-500/30 rounded-lg p-4 bg-black/50">
                <div className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  {">"} LEARNING_OUTCOMES
                </div>
                <ul className="space-y-2 text-green-300/80 text-sm">
                  {program.learningOutcomes.map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-cyan-400">{">"}</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 border border-green-500/30 rounded-lg p-4 bg-black/50">
              <div className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {">"} NOTES
              </div>
              <div className="text-green-300/70 text-sm flex items-start gap-2">
                <Code className="h-4 w-4 text-cyan-400 mt-0.5" />
                <span>
                  To apply, click <span className="text-green-300 font-semibold">APPLY_NOW</span>. You’ll be redirected to the
                  application form for this program.
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InternshipDetail;


