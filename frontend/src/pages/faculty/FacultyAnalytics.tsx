import {
    BarChart3,
    BookOpen,
    ClipboardCheck,
    Brain,
    Users,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    getAnalyticsDashboard,
} from "../../api/analytics";

import type {
    AnalyticsDashboard,
} from "../../api/analytics";


const FacultyAnalytics = () => {

    const [
        analytics,
        setAnalytics,
    ] = useState<AnalyticsDashboard | null>(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");


    useEffect(() => {

        const loadAnalytics = async () => {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getAnalyticsDashboard();

                setAnalytics(data);

            } catch (err) {

                console.error(
                    "Failed to load analytics:",
                    err
                );

                setError(
                    "Failed to load analytics."
                );

            } finally {

                setLoading(false);

            }
        };


        loadAnalytics();

    }, []);


    if (loading) {
        return (
            <div className="p-8">
                <p className="text-slate-600">
                    Loading analytics...
                </p>
            </div>
        );
    }


    if (error) {
        return (
            <div className="p-8">

                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>

            </div>
        );
    }


    if (!analytics) {
        return (
            <div className="p-8">
                No analytics available.
            </div>
        );
    }


    const cards = [
        {
            title: "Students",
            value: analytics.users.total_students,
            icon: Users,
        },
        {
            title: "Lessons Completed",
            value: analytics.learning.completed_lessons,
            icon: BookOpen,
        },
        {
            title: "Quiz Attempts",
            value: analytics.quizzes.total_attempts,
            icon: ClipboardCheck,
        },
        {
            title: "Simulation Responses",
            value: analytics.simulations.total_responses,
            icon: Brain,
        },
    ];


    return (
        <div className="p-6 lg:p-8">

            {/* Header */}

            <div className="mb-8">

                <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-blue-50 p-3">
                        <BarChart3
                            size={26}
                            className="text-blue-600"
                        />
                    </div>

                    <div>

                        <h1 className="text-3xl font-bold text-slate-900">
                            Analytics
                        </h1>

                        <p className="mt-1 text-slate-500">
                            Monitor student learning and performance.
                        </p>

                    </div>

                </div>

            </div>


            {/* Summary Cards */}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {cards.map(
                    ({
                        title,
                        value,
                        icon: Icon,
                    }) => (

                        <div
                            key={title}
                            className="rounded-xl border bg-white p-6 shadow-sm"
                        >

                            <div className="mb-4 flex items-center justify-between">

                                <div className="rounded-lg bg-blue-50 p-3">

                                    <Icon
                                        size={22}
                                        className="text-blue-600"
                                    />

                                </div>

                            </div>

                            <p className="text-sm text-slate-500">
                                {title}
                            </p>

                            <p className="mt-1 text-3xl font-bold text-slate-900">
                                {value}
                            </p>

                        </div>

                    )
                )}

            </div>


            {/* Learning */}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">

                <div className="rounded-xl border bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-semibold text-slate-900">
                        Learning Progress
                    </h2>

                    <div className="mt-6">

                        <div className="mb-2 flex justify-between">

                            <span className="text-sm text-slate-500">
                                Lesson completion
                            </span>

                            <span className="font-semibold text-slate-900">
                                {analytics.learning.lesson_completion_percentage}%
                            </span>

                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                            <div
                                className="h-full rounded-full bg-blue-600"
                                style={{
                                    width: `${Math.min(
                                        analytics.learning.lesson_completion_percentage,
                                        100
                                    )}%`,
                                }}
                            />

                        </div>

                        <p className="mt-4 text-sm text-slate-500">

                            {analytics.learning.completed_lessons}
                            {" "}
                            completed lesson records

                        </p>

                    </div>

                </div>


                {/* Quiz */}

                <div className="rounded-xl border bg-white p-6 shadow-sm">

                    <h2 className="text-lg font-semibold text-slate-900">
                        Quiz Performance
                    </h2>

                    <div className="mt-6 grid grid-cols-2 gap-5">

                        <div>

                            <p className="text-sm text-slate-500">
                                Average Score
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {analytics.quizzes.average_percentage}%
                            </p>

                        </div>

                        <div>

                            <p className="text-sm text-slate-500">
                                Pass Rate
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {analytics.quizzes.pass_percentage}%
                            </p>

                        </div>

                        <div>

                            <p className="text-sm text-slate-500">
                                Completed
                            </p>

                            <p className="mt-1 text-xl font-semibold text-slate-900">
                                {analytics.quizzes.completed_attempts}
                            </p>

                        </div>

                        <div>

                            <p className="text-sm text-slate-500">
                                Passed
                            </p>

                            <p className="mt-1 text-xl font-semibold text-slate-900">
                                {analytics.quizzes.passed_attempts}
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* Simulations */}

            <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">

                <h2 className="text-lg font-semibold text-slate-900">
                    Simulation Performance
                </h2>

                <div className="mt-6 grid gap-6 sm:grid-cols-3">

                    <div>

                        <p className="text-sm text-slate-500">
                            Total Simulations
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {analytics.simulations.total_simulations}
                        </p>

                    </div>

                    <div>

                        <p className="text-sm text-slate-500">
                            Completed
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {analytics.simulations.completed_simulations}
                        </p>

                    </div>

                    <div>

                        <p className="text-sm text-slate-500">
                            Average Score
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {analytics.simulations.average_percentage}%
                        </p>

                    </div>

                </div>

            </div>


            {/* Disaster Breakdown */}

            <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">

                <h2 className="text-lg font-semibold text-slate-900">
                    Disaster Performance
                </h2>

                <div className="mt-5 overflow-x-auto">

                    <table className="w-full text-left">

                        <thead>

                            <tr className="border-b text-sm text-slate-500">

                                <th className="px-4 py-3">
                                    Disaster
                                </th>

                                <th className="px-4 py-3">
                                    Lessons
                                </th>

                                <th className="px-4 py-3">
                                    Lesson Completion
                                </th>

                                <th className="px-4 py-3">
                                    Quiz Attempts
                                </th>

                                <th className="px-4 py-3">
                                    Quiz Average
                                </th>

                                <th className="px-4 py-3">
                                    Simulation Responses
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {analytics.disasters.map(
                                (disaster) => (

                                    <tr
                                        key={disaster.disaster_id}
                                        className="border-b last:border-0"
                                    >

                                        <td className="px-4 py-4 font-medium text-slate-900">
                                            {disaster.disaster_name}
                                        </td>

                                        <td className="px-4 py-4 text-slate-600">
                                            {disaster.completed_lessons}
                                            /
                                            {disaster.total_lessons}
                                        </td>

                                        <td className="px-4 py-4 text-slate-600">
                                            {disaster.lesson_completion_percentage}%
                                        </td>

                                        <td className="px-4 py-4 text-slate-600">
                                            {disaster.quiz_attempts}
                                        </td>

                                        <td className="px-4 py-4 text-slate-600">
                                            {disaster.quiz_average_percentage}%
                                        </td>

                                        <td className="px-4 py-4 text-slate-600">
                                            {disaster.simulation_responses}
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
};


export default FacultyAnalytics;