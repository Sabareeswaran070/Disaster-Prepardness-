import { useEffect, useState } from "react";
import {
    BookOpen,
    Brain,
    CheckCircle2,
    ClipboardCheck,
    Flame,
    Target,
    Trophy,
} from "lucide-react";

import {
    getStudentDashboard,
    type StudentDashboardResponse,
} from "../../api/progress";

import { useAuth } from "../../context/AuthContext";

const StudentDashboard = () => {
    const { user } = useAuth();

    const [dashboard, setDashboard] =
        useState<StudentDashboardResponse | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setError("");

                const data =
                    await getStudentDashboard();

                setDashboard(data);
            } catch (err) {
                console.error(
                    "Failed to load dashboard:",
                    err
                );

                setError(
                    "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-slate-600">
                    Loading dashboard...
                </div>
            </div>
        );
    }

    if (error || !dashboard) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="rounded-xl bg-white p-6 text-red-600 shadow">
                    {error || "Dashboard unavailable"}
                </div>
            </div>
        );
    }

    const preparedness =
        dashboard.overall_preparedness_percentage;

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Header */}

            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            DisasterEdu
                        </h1>

                        <p className="text-sm text-slate-500">
                            Student Dashboard
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="font-semibold text-slate-900">
                            {user?.full_name}
                        </p>

                        <p className="text-sm text-slate-500">
                            {user?.email}
                        </p>
                    </div>

                </div>
            </header>


            {/* Main */}

            <main className="mx-auto max-w-7xl px-6 py-8">

                {/* Welcome */}

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900">
                        Welcome back, {user?.full_name}
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Continue your disaster preparedness training.
                    </p>
                </div>


                {/* Preparedness */}

                <div className="mb-8 grid gap-6 lg:grid-cols-3">

                    <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm lg:col-span-2">

                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-sm font-medium text-blue-100">
                                    Overall Preparedness
                                </p>

                                <h3 className="mt-2 text-5xl font-bold">
                                    {preparedness}%
                                </h3>

                                <p className="mt-3 text-sm text-blue-100">
                                    Based on lessons, quizzes, and simulations
                                </p>
                            </div>

                            <div className="rounded-xl bg-white/10 p-3">
                                <Target size={32} />
                            </div>

                        </div>

                        <div className="mt-6 h-3 overflow-hidden rounded-full bg-blue-400">
                            <div
                                className="h-full rounded-full bg-white transition-all"
                                style={{
                                    width: `${Math.min(
                                        preparedness,
                                        100
                                    )}%`,
                                }}
                            />
                        </div>

                    </div>


                    <div className="rounded-2xl bg-white p-6 shadow-sm">

                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                                <Trophy size={24} />
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">
                                    Learning Status
                                </p>

                                <p className="text-lg font-bold text-slate-900">
                                    {preparedness >= 80
                                        ? "Excellent"
                                        : preparedness >= 60
                                            ? "Good Progress"
                                            : "Needs Improvement"}
                                </p>
                            </div>
                        </div>

                        <p className="mt-5 text-sm text-slate-500">
                            Keep completing lessons, quizzes and
                            simulations to improve your preparedness.
                        </p>

                    </div>

                </div>


                {/* Statistics */}

                <div className="grid gap-5 md:grid-cols-3">

                    {/* Lessons */}

                    <div className="rounded-2xl bg-white p-6 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                                <BookOpen size={24} />
                            </div>

                            <CheckCircle2
                                size={22}
                                className="text-green-500"
                            />

                        </div>

                        <p className="mt-5 text-sm text-slate-500">
                            Lessons
                        </p>

                        <h3 className="mt-1 text-3xl font-bold text-slate-900">
                            {dashboard.completed_lessons}
                            <span className="text-lg font-medium text-slate-400">
                                {" "}
                                / {dashboard.total_lessons}
                            </span>
                        </h3>

                        <div className="mt-4 h-2 rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-blue-500"
                                style={{
                                    width: `${Math.min(
                                        dashboard.lesson_completion_percentage,
                                        100
                                    )}%`,
                                }}
                            />
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                            {dashboard.lesson_completion_percentage}%
                            completed
                        </p>

                    </div>


                    {/* Quizzes */}

                    <div className="rounded-2xl bg-white p-6 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                                <ClipboardCheck size={24} />
                            </div>

                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                {dashboard.quizzes_passed} Passed
                            </span>

                        </div>

                        <p className="mt-5 text-sm text-slate-500">
                            Quizzes
                        </p>

                        <h3 className="mt-1 text-3xl font-bold text-slate-900">
                            {dashboard.completed_quizzes}
                            <span className="text-lg font-medium text-slate-400">
                                {" "}
                                / {dashboard.total_quizzes}
                            </span>
                        </h3>

                        <p className="mt-4 text-sm text-slate-500">
                            Average score:{" "}
                            <span className="font-semibold text-slate-900">
                                {dashboard.quiz_average_percentage}%
                            </span>
                        </p>

                    </div>


                    {/* Simulations */}

                    <div className="rounded-2xl bg-white p-6 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                                <Brain size={24} />
                            </div>

                            <Flame
                                size={22}
                                className="text-orange-500"
                            />

                        </div>

                        <p className="mt-5 text-sm text-slate-500">
                            Simulations
                        </p>

                        <h3 className="mt-1 text-3xl font-bold text-slate-900">
                            {dashboard.completed_simulations}
                            <span className="text-lg font-medium text-slate-400">
                                {" "}
                                / {dashboard.total_simulations}
                            </span>
                        </h3>

                        <p className="mt-4 text-sm text-slate-500">
                            Average score:{" "}
                            <span className="font-semibold text-slate-900">
                                {dashboard.simulation_average_percentage}%
                            </span>
                        </p>

                    </div>

                </div>


                {/* Quick Actions */}

                <div className="mt-8">

                    <h3 className="mb-4 text-xl font-bold text-slate-900">
                        Continue Learning
                    </h3>

                    <div className="grid gap-4 md:grid-cols-3">

                        <button className="rounded-xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <BookOpen
                                size={22}
                                className="text-blue-600"
                            />

                            <p className="mt-3 font-semibold">
                                Browse Lessons
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Learn disaster preparedness concepts.
                            </p>
                        </button>


                        <button className="rounded-xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <ClipboardCheck
                                size={22}
                                className="text-purple-600"
                            />

                            <p className="mt-3 font-semibold">
                                Take a Quiz
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Test your disaster knowledge.
                            </p>
                        </button>


                        <button className="rounded-xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <Brain
                                size={22}
                                className="text-orange-600"
                            />

                            <p className="mt-3 font-semibold">
                                Practice Simulation
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Practice emergency decision-making.
                            </p>
                        </button>

                    </div>

                </div>

            </main>

        </div>
    );
};

export default StudentDashboard;