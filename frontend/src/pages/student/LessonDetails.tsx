import {
    useEffect,
    useState,
} from "react";

import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    PlayCircle,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getLesson,
    getLessonMaterials,
    updateLessonProgress,
} from "../../api/lessons";

import type {
    Lesson,
    LearningMaterial,
} from "../../types/lesson";

import {
    getLessonProgress,
} from "../../api/progress";

function LessonDetails() {
    const {
        lessonId,
    } = useParams<{
        lessonId: string;
    }>();

    const navigate = useNavigate();

    const [lesson, setLesson] =
        useState<Lesson | null>(
            null
        );

    const [materials, setMaterials] =
        useState<LearningMaterial[]>(
            []
        );

    const [progress, setProgress] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (!lessonId) {
            setError(
                "Invalid lesson."
            );
            setLoading(false);
            return;
        }

        const id =
            Number(lessonId);

        if (Number.isNaN(id)) {
            setError(
                "Invalid lesson."
            );
            setLoading(false);
            return;
        }

        const loadLesson =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const [
                        lessonData,
                        materialData,
                        progressData,
                    ] = await Promise.all([
                        getLesson(id),
                        getLessonMaterials(id),
                        getLessonProgress(),
                    ]);

                    setLesson(
                        lessonData
                    );

                    setMaterials(
                        materialData
                    );

                    const currentProgress =
                        progressData.find(
                            (item) =>
                                item.lesson_id ===
                                id
                        );

                    setProgress(
                        currentProgress
                            ?.progress_percentage ??
                        0
                    );
                } catch (err) {
                    console.error(
                        "Failed to load lesson:",
                        err
                    );

                    setError(
                        "Unable to load this lesson."
                    );
                } finally {
                    setLoading(false);
                }
            };

        loadLesson();
    }, [lessonId]);

    const saveProgress =
        async (
            percentage: number,
            status: string
        ) => {
            if (!lessonId) {
                return;
            }

            try {
                setSaving(true);

                const id =
                    Number(lessonId);

                await updateLessonProgress(
                    id,
                    percentage,
                    status
                );

                setProgress(
                    percentage
                );
            } catch (err) {
                console.error(
                    "Failed to update progress:",
                    err
                );

                setError(
                    "Progress could not be updated."
                );
            } finally {
                setSaving(false);
            }
        };

    const handleStart =
        async () => {
            await saveProgress(
                Math.max(
                    progress,
                    10
                ),
                "IN_PROGRESS"
            );
        };

    const handleComplete =
        async () => {
            await saveProgress(
                100,
                "COMPLETED"
            );
        };

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="flex items-center gap-3 text-slate-500">
                    <Loader2
                        size={22}
                        className="animate-spin"
                    />
                    Loading lesson...
                </div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="p-6 lg:p-8">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/student/lessons"
                        )
                    }
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                    <ArrowLeft size={17} />
                    Back to Lessons
                </button>

                <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                    {error ||
                        "Lesson not found."}
                </div>

            </div>
        );
    }

    const completed =
        progress >= 100;

    return (
        <div className="p-6 lg:p-8">

            <button
                type="button"
                onClick={() =>
                    navigate(
                        "/student/lessons"
                    )
                }
                className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
                <ArrowLeft size={17} />
                Back to Lessons
            </button>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">

                    <div className="flex flex-wrap items-center gap-3">

                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                            {lesson.difficulty}
                        </span>

                        {lesson.duration_minutes !==
                            null && (
                                <span className="flex items-center gap-1 text-sm text-blue-50">
                                    <Clock
                                        size={15}
                                    />
                                    {
                                        lesson.duration_minutes
                                    }{" "}
                                    minutes
                                </span>
                            )}

                    </div>

                    <h1 className="mt-4 text-3xl font-bold lg:text-4xl">
                        {lesson.title}
                    </h1>

                    {lesson.description && (
                        <p className="mt-3 max-w-3xl leading-7 text-blue-50">
                            {
                                lesson.description
                            }
                        </p>
                    )}

                </div>

                <div className="p-6 lg:p-8">

                    <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex-1">

                            <div className="mb-2 flex justify-between text-sm">
                                <span className="font-medium text-slate-600">
                                    Your progress
                                </span>

                                <span className="font-bold text-slate-900">
                                    {progress}%
                                </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all"
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                />
                            </div>

                        </div>

                        {completed ? (
                            <div className="flex items-center gap-2 font-semibold text-green-600">
                                <CheckCircle2
                                    size={21}
                                />
                                Completed
                            </div>
                        ) : (
                            <button
                                type="button"
                                disabled={saving}
                                onClick={
                                    handleStart
                                }
                                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <PlayCircle
                                    size={18}
                                />
                                {progress > 0
                                    ? "Continue"
                                    : "Start Lesson"}
                            </button>
                        )}

                    </div>

                    {error && (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <article className="mt-8">

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                                <BookOpen
                                    size={20}
                                    className="text-blue-600"
                                />
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900">
                                Lesson Content
                            </h2>
                        </div>

                        {lesson.content ? (
                            <div className="mt-6 whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-6 leading-8 text-slate-700">
                                {
                                    lesson.content
                                }
                            </div>
                        ) : (
                            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                                No lesson content is available yet.
                            </div>
                        )}

                    </article>

                    {materials.length >
                        0 && (
                            <section className="mt-10">

                                <div className="flex items-center gap-3">
                                    <FileText
                                        size={21}
                                        className="text-blue-600"
                                    />

                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Learning Materials
                                    </h2>
                                </div>

                                <div className="mt-5 grid gap-3">

                                    {materials.map(
                                        (
                                            material
                                        ) => (
                                            <div
                                                key={
                                                    material.id
                                                }
                                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {
                                                            material.title
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                                                        {
                                                            material.material_type
                                                        }
                                                    </p>
                                                </div>

                                                {/* {material.file_url && (
                                                <a
                                                    href={
                                                        material.file_url
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                                                >
                                                    Open
                                                </a>
                                            )} */}
                                                {material.file_url && (
                                                    <a
                                                        href={`${import.meta.env.VITE_BACKEND_URL}${material.file_url}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                                                    >
                                                        Open
                                                    </a>
                                                )}
                                            </div>
                                        )
                                    )}

                                </div>

                            </section>
                        )}

                    {!completed && (
                        <div className="mt-10 border-t border-slate-200 pt-6">

                            <button
                                type="button"
                                disabled={saving}
                                onClick={
                                    handleComplete
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                <CheckCircle2
                                    size={19}
                                />

                                {saving
                                    ? "Saving..."
                                    : "Mark Lesson Complete"}
                            </button>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}

export default LessonDetails;
