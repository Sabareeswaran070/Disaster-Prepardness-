import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AlertCircle,
    BookOpen,
    Loader2,
    Search,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import LessonCard from "../../components/lessons/LessonCard";

import {
    getLessons,
} from "../../api/lessons";

import {
    getLessonProgress,
} from "../../api/progress";

import type {
    Lesson,
} from "../../types/lesson";

import type {
    LessonProgressResponse,
} from "../../api/progress";

function StudentLessons() {
    const navigate = useNavigate();

    const [lessons, setLessons] =
        useState<Lesson[]>([]);

    const [progress, setProgress] =
        useState<LessonProgressResponse[]>(
            []
        );

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadLessons =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const [
                        lessonData,
                        progressData,
                    ] = await Promise.all([
                        getLessons(),
                        getLessonProgress(),
                    ]);

                    setLessons(
                        lessonData
                    );

                    setProgress(
                        progressData
                    );
                } catch (err) {
                    console.error(
                        "Failed to load lessons:",
                        err
                    );

                    setError(
                        "Unable to load lessons. Please try again."
                    );
                } finally {
                    setLoading(false);
                }
            };

        loadLessons();
    }, []);

    const progressMap =
        useMemo(() => {
            return new Map(
                progress.map(
                    (item) => [
                        item.lesson_id,
                        item,
                    ]
                )
            );
        }, [progress]);

    const filteredLessons =
        useMemo(() => {
            const value =
                search
                    .trim()
                    .toLowerCase();

            if (!value) {
                return lessons;
            }

            return lessons.filter(
                (lesson) =>
                    lesson.title
                        .toLowerCase()
                        .includes(value) ||
                    lesson.description
                        ?.toLowerCase()
                        .includes(value) ||
                    lesson.difficulty
                        .toLowerCase()
                        .includes(value)
            );
        }, [lessons, search]);

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="flex items-center gap-3 text-slate-500">
                    <Loader2
                        size={22}
                        className="animate-spin"
                    />
                    Loading lessons...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                            <BookOpen
                                size={23}
                                className="text-blue-600"
                            />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Lessons
                            </h1>

                            <p className="mt-1 text-slate-500">
                                Build your disaster preparedness knowledge.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative w-full lg:w-80">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search lessons..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

            </div>

            {error && (
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {!error &&
                filteredLessons.length === 0 && (
                    <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                        <BookOpen
                            size={40}
                            className="mx-auto text-slate-300"
                        />

                        <h2 className="mt-4 text-xl font-semibold text-slate-800">
                            No lessons found
                        </h2>

                        <p className="mt-2 text-slate-500">
                            {search
                                ? "Try a different search term."
                                : "There are no published lessons available yet."}
                        </p>
                    </div>
                )}

            {filteredLessons.length > 0 && (
                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                    {filteredLessons.map(
                        (lesson) => {
                            const lessonProgress =
                                progressMap.get(
                                    lesson.id
                                );

                            return (
                                <LessonCard
                                    key={
                                        lesson.id
                                    }
                                    lesson={
                                        lesson
                                    }
                                    progress={
                                        lessonProgress
                                            ?.progress_percentage ??
                                        0
                                    }
                                    onOpen={() =>
                                        navigate(
                                            `/student/lessons/${lesson.id}`
                                        )
                                    }
                                />
                            );
                        }
                    )}

                </div>
            )}

        </div>
    );
}

export default StudentLessons;
