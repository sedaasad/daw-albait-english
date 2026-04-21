import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mic, Square, Play, Pause, Trash2, Volume2, ArrowLeft, CheckCircle2, Award } from "lucide-react";
import { toast } from "sonner";

interface Lesson {
  id: string;
  day_number: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  body_md: string;
  image_url: string | null;
  audio_url: string | null;
}

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: l }, { count }] = await Promise.all([
        supabase.from("lessons").select("*").eq("id", id).maybeSingle(),
        supabase.from("quiz_questions").select("*", { count: "exact", head: true }).eq("lesson_id", id),
      ]);
      setLesson(l as Lesson);
      setHasQuiz((count ?? 0) > 0);
      setLoading(false);
    })();
  }, [id]);

  const isCompleted = !!(profile?.completed_lessons.includes(id ?? ""));

  async function markComplete() {
    if (!user || !id || !profile) return;
    if (isCompleted) {
      navigate("/lessons");
      return;
    }
    setMarking(true);
    const next = [...profile.completed_lessons, id];
    const { error } = await supabase
      .from("profiles")
      .update({
        completed_lessons: next,
        total_points: profile.total_points + 10,
        last_login_date: new Date().toISOString(),
      })
      .eq("id", user.id);
    setMarking(false);
    if (error) {
      toast.error("تعذر حفظ التقدم");
      return;
    }
    toast.success("أحسنت! تم إنجاز الدرس (+10 نقاط)");
    await refreshProfile();
    navigate("/lessons");
  }

  if (loading) {
    return (
      <div dir="rtl">
        <PageHeader title="الدرس" back />
        <div className="max-w-md mx-auto px-4 space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div dir="rtl">
        <PageHeader title="الدرس" back />
        <div className="text-center text-muted-foreground p-10">الدرس غير موجود</div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <PageHeader
        title={`اليوم ${lesson.day_number}`}
        subtitle={lesson.title_ar}
        back
        variant="gradient"
      />

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-5">
        {lesson.image_url && (
          <Card className="overflow-hidden shadow-card animate-fade-in">
            <img src={lesson.image_url} alt={lesson.title_ar} className="w-full h-48 object-cover" />
          </Card>
        )}

        <Card className="p-5 shadow-card animate-fade-in">
          {lesson.title_en && (
            <p className="font-en text-lg font-semibold text-primary mb-2">{lesson.title_en}</p>
          )}
          {lesson.description_ar && (
            <p className="text-muted-foreground leading-relaxed mb-3">{lesson.description_ar}</p>
          )}
          {lesson.body_md && (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
              {lesson.body_md}
            </div>
          )}
          {!lesson.body_md && !lesson.description_ar && (
            <p className="text-muted-foreground text-sm">
              سيقوم المعلم بإضافة محتوى هذا الدرس قريباً.
            </p>
          )}
        </Card>

        {lesson.audio_url && (
          <Card className="p-4 shadow-card animate-fade-in">
            <div className="flex items-center gap-2 text-secondary text-sm font-semibold mb-3">
              <Volume2 className="size-4" />
              <span>استمع إلى النطق</span>
            </div>
            <audio controls src={lesson.audio_url} className="w-full" />
          </Card>
        )}

        <SpeakingPractice lessonId={lesson.id} userId={user?.id ?? ""} />

        <div className="space-y-3 pt-2">
          {hasQuiz && (
            <Button
              variant="secondary"
              className="w-full h-12"
              onClick={() => navigate(`/lessons/${lesson.id}/quiz`)}
            >
              <Award className="size-4" />
              ابدأ الاختبار
            </Button>
          )}
          <Button className="w-full h-12" onClick={markComplete} disabled={marking}>
            {isCompleted ? (
              <>
                <CheckCircle2 className="size-4" /> تم الإنجاز — رجوع
              </>
            ) : (
              <>
                <ArrowLeft className="size-4" /> إنهاء الدرس
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SpeakingPractice({ lessonId, userId }: { lessonId: string; userId: string }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      toast.error("تعذر الوصول إلى الميكروفون");
    }
  }

  function stop() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function toggle() {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  }

  function reset() {
    setAudioUrl(null);
    setPlaying(false);
  }

  async function save() {
    if (!audioUrl || !userId) return;
    setUploading(true);
    try {
      const blob = await fetch(audioUrl).then((r) => r.blob());
      const path = `${userId}/${lessonId}-${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage.from("recordings").upload(path, blob, {
        contentType: "audio/webm",
      });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase
        .from("recordings")
        .insert({ user_id: userId, lesson_id: lessonId, audio_path: path });
      if (insErr) throw insErr;
      toast.success("تم حفظ تسجيلك");
      reset();
    } catch {
      toast.error("تعذر حفظ التسجيل");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="p-5 shadow-card animate-fade-in">
      <div className="flex items-center gap-2 text-secondary text-sm font-semibold mb-3">
        <Mic className="size-4" />
        <span>تدرب على النطق</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        سجّل صوتك واستمع إلى أدائك ثم احفظه للمراجعة لاحقاً.
      </p>

      {!audioUrl ? (
        <Button
          onClick={recording ? stop : start}
          variant={recording ? "destructive" : "default"}
          className="w-full h-12"
        >
          {recording ? <Square className="size-4" /> : <Mic className="size-4" />}
          {recording ? "إيقاف التسجيل" : "ابدأ التسجيل"}
        </Button>
      ) : (
        <div className="space-y-3">
          <audio
            ref={audioRef}
            src={audioUrl}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            className="w-full"
            controls
          />
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={toggle} variant="outline" size="sm">
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <Button onClick={reset} variant="outline" size="sm">
              <Trash2 className="size-4" />
            </Button>
            <Button onClick={save} size="sm" disabled={uploading}>
              {uploading ? "..." : "حفظ"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
