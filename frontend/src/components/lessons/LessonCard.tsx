import {
    BookOpen,
    CheckCircle2,
    Clock,
    PlayCircle,
} from "lucide-react";

import type { Lesson } from "../../types/lesson";

interface LessonCardProps {
    lesson: Lesson;
    progress: number;
    onOpen: () => void;
}

const difficultyStyles: Record<
    string,
    string
> = {
    BEGINNER:
        "bg-green-50 text-green-700",
    INTERMEDIATE:
        "bg-amber-50 text-amber-700",
    ADVANCED:
        "bg-red-50 text-red-700",
};

function LessonCard({
    lesson,
    progress,
    onOpen,
}: LessonCardProps) {
    const normalizedProgress = Math.min(
        100,
        Math.max(0, progress)
    );

    const completed =
        normalizedProgress >= 100;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="flex h-36 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <BookOpen
                        size={30}
                        className="text-blue-600"
                    />
                </div>
            </div>

            <div className="p-6">

                <div className="flex items-start justify-between gap-3">

                    <h2 className="text-xl font-bold text-slate-900">
                        {lesson.title}
                    </h2>

                    {completed && (
                        <CheckCircle2
                            size={22}
                            className="shrink-0 text-green-500"
                        />
                    )}

                </div>

                {lesson.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {lesson.description}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">

                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            difficultyStyles[
                                lesson.difficulty
                            ] ??
                            "bg-slate-100 text-slate-700"
                        }`}
                    >
                        {lesson.difficulty}
                    </span>

                    {lesson.duration_minutes !==
                        null && (
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                            <Clock size={15} />
                            {lesson.duration_minutes} min
                        </span>
                    )}

                </div>

                <div className="mt-6">

                    <div className="mb-2 flex justify-between text-sm">
                        <span className="text-slate-500">
                            Progress
                        </span>

                        <span className="font-semibold text-slate-700">
                            {normalizedProgress}%
                        </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                                width: `${normalizedProgress}%`,
                            }}
                        />
                    </div>

                </div>

                <button
                    type="button"
                    onClick={onOpen}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                    <PlayCircle size={18} />

                    {completed
                        ? "Review Lesson"
                        : normalizedProgress > 0
                            ? "Continue Lesson"
                            : "Start Lesson"}
                </button>

            </div>
        </div>
    );
}

export default LessonCard;
