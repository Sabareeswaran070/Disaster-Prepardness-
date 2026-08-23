import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock,
    Loader2,
    Trophy,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getQuiz,
    startQuiz,
    submitQuiz,
} from "../../api/quizzes";

import type {
    QuizResult,
    StartQuizResponse,
    StudentQuizDetail,
} from "../../types/quiz";


const QuizAttempt = () => {

    const {
        quizId,
    } = useParams<{
        quizId: string;
    }>();

    const navigate = useNavigate();


    const [
        quiz,
        setQuiz,
    ] = useState<StudentQuizDetail | null>(null);


    const [
        attempt,
        setAttempt,
    ] = useState<StartQuizResponse | null>(null);


    const [
        answers,
        setAnswers,
    ] = useState<Record<number, number | null>>({});


    const [
        currentQuestion,
        setCurrentQuestion,
    ] = useState(0);


    const [
        remainingSeconds,
        setRemainingSeconds,
    ] = useState<number | null>(null);


    const [
        result,
        setResult,
    ] = useState<QuizResult | null>(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        submitting,
        setSubmitting,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState<string | null>(null);


    /*
     * =========================
     * Load Quiz + Start Attempt
     * =========================
     */

    useEffect(() => {

        const initializeQuiz =
            async () => {

                if (!quizId) {

                    setError(
                        "Invalid quiz."
                    );

                    setLoading(false);

                    return;
                }


                try {

                    setLoading(true);
                    setError(null);


                    const id =
                        Number(quizId);


                    if (Number.isNaN(id)) {

                        throw new Error(
                            "Invalid quiz ID."
                        );

                    }


                    const [
                        quizData,
                        attemptData,
                    ] = await Promise.all([
                        getQuiz(id),
                        startQuiz(id),
                    ]);


                    setQuiz(
                        quizData
                    );


                    setAttempt(
                        attemptData
                    );


                    /*
                     * Initialize answers
                     */

                    const initialAnswers:
                        Record<number, number | null> = {};


                    quizData.questions.forEach(
                        (question) => {

                            initialAnswers[
                                question.id
                            ] = null;

                        }
                    );


                    setAnswers(
                        initialAnswers
                    );


                    /*
                     * Timer
                     */

                    if (
                        quizData.time_limit_minutes !==
                        null
                    ) {

                        setRemainingSeconds(
                            quizData.time_limit_minutes *
                            60
                        );

                    } else {

                        setRemainingSeconds(
                            null
                        );

                    }

                } catch (err) {

                    console.error(
                        "Failed to initialize quiz:",
                        err
                    );


                    setError(
                        "Unable to start this quiz. Please try again."
                    );

                } finally {

                    setLoading(false);

                }

            };


        initializeQuiz();

    }, [quizId]);


    /*
     * =========================
     * Timer
     * =========================
     */

    useEffect(() => {

        if (
            remainingSeconds === null ||
            result !== null ||
            submitting
        ) {

            return;

        }


        if (remainingSeconds <= 0) {

            handleSubmit();

            return;

        }


        const timer =
            window.setInterval(() => {

                setRemainingSeconds(
                    (previous) => {

                        if (
                            previous === null
                        ) {

                            return null;

                        }

                        return Math.max(
                            0,
                            previous - 1
                        );

                    }
                );

            }, 1000);


        return () => {

            window.clearInterval(
                timer
            );

        };

    }, [
        remainingSeconds,
        result,
        submitting,
    ]);


    /*
     * =========================
     * Current Question
     * =========================
     */

    const current =
        quiz?.questions[
            currentQuestion
        ];


    /*
     * =========================
     * Progress
     * =========================
     */

    const answeredCount =
        useMemo(() => {

            return Object.values(
                answers
            ).filter(
                (value) =>
                    value !== null
            ).length;

        }, [answers]);


    /*
     * =========================
     * Timer Formatting
     * =========================
     */

    const formattedTime =
        useMemo(() => {

            if (
                remainingSeconds === null
            ) {

                return null;

            }


            const minutes =
                Math.floor(
                    remainingSeconds / 60
                );


            const seconds =
                remainingSeconds % 60;


            return `${String(minutes).padStart(
                2,
                "0"
            )}:${String(seconds).padStart(
                2,
                "0"
            )}`;

        }, [remainingSeconds]);


    /*
     * =========================
     * Select Answer
     * =========================
     */

    const selectAnswer = (
        questionId: number,
        optionId: number
    ) => {

        setAnswers(
            (previous) => ({
                ...previous,
                [questionId]:
                    optionId,
            })
        );

    };


    /*
     * =========================
     * Submit Quiz
     * =========================
     */

    async function handleSubmit() {

        if (
            !attempt ||
            submitting ||
            result
        ) {

            return;

        }


        try {

            setSubmitting(true);
            setError(null);


            const answerPayload =
                quiz?.questions.map(
                    (question) => ({
                        question_id:
                            question.id,

                        selected_option_id:
                            answers[
                                question.id
                            ] ?? null,
                    })
                ) ?? [];


            const response =
                await submitQuiz(
                    attempt.attempt_id,
                    {
                        answers:
                            answerPayload,
                    }
                );


            setResult(
                response
            );

        } catch (err) {

            console.error(
                "Failed to submit quiz:",
                err
            );


            setError(
                "Unable to submit the quiz. Please try again."
            );

        } finally {

            setSubmitting(false);

        }

    }


    /*
     * =========================
     * Loading
     * =========================
     */

    if (loading) {

        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="flex items-center gap-3 text-slate-500">

                    <Loader2
                        size={24}
                        className="animate-spin"
                    />

                    <span>
                        Preparing your quiz...
                    </span>

                </div>

            </div>
        );

    }


    /*
     * =========================
     * Error
     * =========================
     */

    if (
        error &&
        !quiz
    ) {

        return (
            <div className="p-6 lg:p-8">

                <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6">

                    <div className="flex items-start gap-3">

                        <AlertCircle
                            size={24}
                            className="mt-0.5 text-red-600"
                        />

                        <div>

                            <h2 className="font-semibold text-red-800">
                                Quiz unavailable
                            </h2>

                            <p className="mt-1 text-sm text-red-600">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/student/quizzes"
                                    )
                                }
                                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Back to Quizzes
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        );

    }


    /*
     * =========================
     * Result Screen
     * =========================
     */

    if (result) {

        return (
            <div className="p-6 lg:p-8">

                <div className="mx-auto max-w-2xl">

                    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                        <div
                            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
                                result.passed
                                    ? "bg-green-100"
                                    : "bg-red-100"
                            }`}
                        >

                            {result.passed ? (

                                <Trophy
                                    size={38}
                                    className="text-green-600"
                                />

                            ) : (

                                <AlertCircle
                                    size={38}
                                    className="text-red-600"
                                />

                            )}

                        </div>


                        <h1 className="mt-6 text-3xl font-bold text-slate-900">

                            {result.passed
                                ? "Quiz Passed!"
                                : "Quiz Completed"}

                        </h1>


                        <p className="mt-2 text-slate-500">

                            {result.passed
                                ? "Great job! You passed this quiz."
                                : "Review the lesson and try again to improve your score."}

                        </p>


                        {/* Score */}

                        <div className="mt-8 rounded-2xl bg-slate-50 p-6">

                            <p className="text-sm font-medium text-slate-500">
                                Your Score
                            </p>

                            <p
                                className={`mt-2 text-5xl font-bold ${
                                    result.passed
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {result.percentage}%
                            </p>


                            <p className="mt-2 text-sm text-slate-500">

                                {result.score}
                                {" / "}
                                {result.total_points}
                                {" points"}

                            </p>

                        </div>


                        {/* Result details */}

                        <div className="mt-6 grid grid-cols-2 gap-4">

                            <div className="rounded-xl border border-slate-200 p-4">

                                <p className="text-xs text-slate-500">
                                    Passing Score
                                </p>

                                <p className="mt-1 text-lg font-bold text-slate-800">

                                    {quiz?.passing_score}%

                                </p>

                            </div>


                            <div className="rounded-xl border border-slate-200 p-4">

                                <p className="text-xs text-slate-500">
                                    Status
                                </p>

                                <p
                                    className={`mt-1 text-lg font-bold ${
                                        result.passed
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >

                                    {result.passed
                                        ? "Passed"
                                        : "Not Passed"}

                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/student/quizzes"
                                )
                            }
                            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                        >

                            Back to Quizzes

                            <ArrowRight
                                size={18}
                            />

                        </button>

                    </div>

                </div>

            </div>
        );

    }


    /*
     * =========================
     * No Quiz
     * =========================
     */

    if (
        !quiz ||
        !current
    ) {

        return null;

    }


    /*
     * =========================
     * Main Quiz UI
     * =========================
     */

    return (
        <div className="p-6 lg:p-8">

            <div className="mx-auto max-w-4xl">

                {/* Header */}

                <div className="mb-6">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/student/quizzes"
                            )
                        }
                        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
                    >

                        <ArrowLeft
                            size={17}
                        />

                        Back to Quizzes

                    </button>


                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                        <div>

                            <h1 className="text-2xl font-bold text-slate-900">
                                {quiz.title}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Answer all questions carefully.
                            </p>

                        </div>


                        {formattedTime !== null && (

                            <div
                                className={`flex items-center gap-2 rounded-xl px-4 py-3 font-semibold ${
                                    remainingSeconds !== null &&
                                    remainingSeconds <= 60
                                        ? "bg-red-100 text-red-700"
                                        : "bg-blue-50 text-blue-700"
                                }`}
                            >

                                <Clock
                                    size={20}
                                />

                                {formattedTime}

                            </div>

                        )}

                    </div>

                </div>


                {/* Progress */}

                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-semibold text-slate-700">
                                Quiz Progress
                            </p>

                            <p className="mt-1 text-xs text-slate-500">

                                {answeredCount}
                                {" of "}
                                {quiz.questions.length}
                                {" answered"}

                            </p>

                        </div>


                        <span className="text-sm font-bold text-blue-600">

                            {Math.round(
                                (
                                    answeredCount /
                                    quiz.questions.length
                                ) *
                                100
                            )}
                            %

                        </span>

                    </div>


                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                        <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                                width: `${
                                    (
                                        answeredCount /
                                        quiz.questions.length
                                    ) *
                                    100
                                }%`,
                            }}
                        />

                    </div>

                </div>


                {/* Question Navigation */}

                <div className="mb-6 flex flex-wrap gap-2">

                    {quiz.questions.map(
                        (
                            question,
                            index
                        ) => {

                            const answered =
                                answers[
                                    question.id
                                ] !== null;


                            return (
                                <button
                                    key={
                                        question.id
                                    }
                                    type="button"
                                    onClick={() =>
                                        setCurrentQuestion(
                                            index
                                        )
                                    }
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition ${
                                        index ===
                                        currentQuestion
                                            ? "bg-blue-600 text-white"
                                            : answered
                                                ? "bg-green-100 text-green-700"
                                                : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
                                    }`}
                                >

                                    {index + 1}

                                </button>
                            );

                        }
                    )}

                </div>


                {/* Question */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                    <div className="flex items-center justify-between">

                        <span className="text-sm font-semibold text-blue-600">

                            Question{" "}
                            {currentQuestion + 1}
                            {" / "}
                            {quiz.questions.length}

                        </span>


                        <span className="text-sm text-slate-500">

                            {current.points}
                            {" "}
                            {current.points === 1
                                ? "point"
                                : "points"}

                        </span>

                    </div>


                    <h2 className="mt-5 text-xl font-bold leading-8 text-slate-900">

                        {current.question_text}

                    </h2>


                    {/* Options */}

                    <div className="mt-7 space-y-3">

                        {current.options
                            .slice()
                            .sort(
                                (
                                    a,
                                    b
                                ) =>
                                    a.option_order -
                                    b.option_order
                            )
                            .map(
                                (
                                    option,
                                    index
                                ) => {

                                    const selected =
                                        answers[
                                            current.id
                                        ] ===
                                        option.id;


                                    return (
                                        <button
                                            key={
                                                option.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                selectAnswer(
                                                    current.id,
                                                    option.id
                                                )
                                            }
                                            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                                                selected
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                                            }`}
                                        >

                                            <span
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                                    selected
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >

                                                {String.fromCharCode(
                                                    65 +
                                                    index
                                                )}

                                            </span>


                                            <span
                                                className={`flex-1 text-sm font-medium ${
                                                    selected
                                                        ? "text-blue-800"
                                                        : "text-slate-700"
                                                }`}
                                            >

                                                {
                                                    option.option_text
                                                }

                                            </span>


                                            {selected && (

                                                <CheckCircle2
                                                    size={20}
                                                    className="shrink-0 text-blue-600"
                                                />

                                            )}

                                        </button>
                                    );

                                }
                            )}

                    </div>


                    {/* Error */}

                    {error && (

                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                            {error}

                        </div>

                    )}


                    {/* Navigation */}

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

                        <button
                            type="button"
                            disabled={
                                currentQuestion === 0
                            }
                            onClick={() =>
                                setCurrentQuestion(
                                    (previous) =>
                                        Math.max(
                                            0,
                                            previous - 1
                                        )
                                )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >

                            <ArrowLeft
                                size={17}
                            />

                            Previous

                        </button>


                        {currentQuestion <
                        quiz.questions.length - 1 ? (

                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentQuestion(
                                        (previous) =>
                                            Math.min(
                                                quiz.questions.length - 1,
                                                previous + 1
                                            )
                                    )
                                }
                                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                            >

                                Next

                                <ArrowRight
                                    size={17}
                                />

                            </button>

                        ) : (

                            <button
                                type="button"
                                disabled={
                                    submitting
                                }
                                onClick={
                                    handleSubmit
                                }
                                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {submitting ? (

                                    <>
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />

                                        Submitting...

                                    </>

                                ) : (

                                    <>
                                        Submit Quiz

                                        <CheckCircle2
                                            size={17}
                                        />

                                    </>

                                )}

                            </button>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};


export default QuizAttempt;