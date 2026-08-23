import {
    AlertCircle,
    ArrowRight,
    BookOpen,
    Clock,
    FileQuestion,
    Loader2,
} from "lucide-react";
import {
    useEffect,
    useState,
} from "react";
import {
    useNavigate,
} from "react-router-dom";

import {
    getQuizzes,
} from "../../api/quizzes";

import type {
    Quiz,
} from "../../types/quiz";


const StudentQuizzes = () => {

    const navigate = useNavigate();

    const [
        quizzes,
        setQuizzes,
    ] = useState<Quiz[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(null);


    useEffect(() => {

        const loadQuizzes =
            async () => {

                try {

                    setLoading(true);
                    setError(null);

                    const data =
                        await getQuizzes();

                    setQuizzes(data);

                } catch (err) {

                    console.error(
                        "Failed to load quizzes:",
                        err
                    );

                    setError(
                        "Unable to load quizzes. Please try again."
                    );

                } finally {

                    setLoading(false);

                }
            };


        loadQuizzes();

    }, []);


    if (loading) {

        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="flex items-center gap-3 text-slate-500">

                    <Loader2
                        size={22}
                        className="animate-spin"
                    />

                    <span>
                        Loading quizzes...
                    </span>

                </div>

            </div>
        );

    }


    if (error) {

        return (
            <div className="p-6 lg:p-8">

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

                    <div className="flex items-start gap-3">

                        <AlertCircle
                            size={22}
                            className="mt-0.5 text-red-600"
                        />

                        <div>

                            <h2 className="font-semibold text-red-800">
                                Unable to load quizzes
                            </h2>

                            <p className="mt-1 text-sm text-red-600">
                                {error}
                            </p>

                        </div>

                    </div>

                </div>

            </div>
        );

    }


    return (
        <div className="p-6 lg:p-8">

            {/* Header */}

            <div className="mb-8">

                <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">

                        <FileQuestion
                            size={25}
                            className="text-blue-600"
                        />

                    </div>

                    <div>

                        <h1 className="text-3xl font-bold text-slate-900">
                            Quizzes
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Test your knowledge and track your progress.
                        </p>

                    </div>

                </div>

            </div>


            {/* Empty state */}

            {quizzes.length === 0 && (

                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">

                        <FileQuestion
                            size={30}
                            className="text-slate-400"
                        />

                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-slate-800">
                        No quizzes available
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                        There are no published quizzes available for you right now.
                    </p>

                </div>

            )}


            {/* Quiz cards */}

            {quizzes.length > 0 && (

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                    {quizzes.map(
                        (quiz) => (

                            <div
                                key={quiz.id}
                                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >

                                {/* Icon */}

                                <div className="flex items-start justify-between">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                                        <BookOpen
                                            size={22}
                                            className="text-blue-600"
                                        />

                                    </div>

                                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                        Published
                                    </span>

                                </div>


                                {/* Title */}

                                <h2 className="mt-5 text-lg font-bold text-slate-900">
                                    {quiz.title}
                                </h2>


                                {/* Description */}

                                <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                                    {quiz.description ||
                                        "Test your knowledge on this topic."}
                                </p>


                                {/* Quiz information */}

                                <div className="mt-5 flex flex-wrap gap-3">

                                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">

                                        <FileQuestion
                                            size={15}
                                        />

                                        Quiz

                                    </div>


                                    {quiz.time_limit_minutes !== null && (

                                        <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">

                                            <Clock
                                                size={15}
                                            />

                                            {quiz.time_limit_minutes} min

                                        </div>

                                    )}


                                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">

                                        Pass: {quiz.passing_score}%

                                    </div>

                                </div>


                                {/* Action */}

                                <div className="mt-6 border-t border-slate-100 pt-5">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/student/quizzes/${quiz.id}`
                                            )
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >

                                        Start Quiz

                                        <ArrowRight
                                            size={17}
                                            className="transition-transform group-hover:translate-x-1"
                                        />

                                    </button>

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}

        </div>
    );
};


export default StudentQuizzes;