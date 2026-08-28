import {
    AlertTriangle,
    Check,
    ChevronDown,
    ChevronUp,
    Edit,
    Plus,
    Trash2,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
    type FormEvent,
} from "react";

import {
    addQuestion,
    createQuiz,
    deleteQuiz,
    getAdminQuiz,
    getAdminQuizzes,
    publishQuiz,
    unpublishQuiz,
    updateQuiz,
} from "../../api/quizzes";

import {
    getDisasters,
} from "../../api/disasters";

import {
    getAdminLessons,
} from "../../api/lessons";

import type {
    Quiz,
    AdminQuizDetail,
    QuestionCreate,
} from "../../types/quiz";

import type {
    Disaster,
} from "../../types/disaster";

import type {
    Lesson,
} from "../../types/lesson";


interface QuizForm {
    disaster_id: string;
    lesson_id: string;
    title: string;
    description: string;
    passing_score: string;
    time_limit_minutes: string;
}


interface QuestionForm {
    question_text: string;
    points: string;
    options: string[];
    correct_option: number;
}


const emptyQuizForm: QuizForm = {
    disaster_id: "",
    lesson_id: "",
    title: "",
    description: "",
    passing_score: "60",
    time_limit_minutes: "",
};


const emptyQuestionForm: QuestionForm = {
    question_text: "",
    points: "1",
    options: ["", "", "", ""],
    correct_option: 0,
};


const AdminQuizzes = () => {

    const [quizzes, setQuizzes] =
        useState<Quiz[]>([]);

    const [disasters, setDisasters] =
        useState<Disaster[]>([]);

    const [lessons, setLessons] =
        useState<Lesson[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState<string | null>(null);

    const [showQuizForm, setShowQuizForm] =
        useState(false);

    const [editingQuizId, setEditingQuizId] =
        useState<number | null>(null);

    const [quizForm, setQuizForm] =
        useState<QuizForm>(emptyQuizForm);

    const [selectedQuiz, setSelectedQuiz] =
        useState<AdminQuizDetail | null>(null);

    const [showQuestionForm, setShowQuestionForm] =
        useState(false);

    const [questionForm, setQuestionForm] =
        useState<QuestionForm>(
            emptyQuestionForm
        );

    const [expandedQuizId, setExpandedQuizId] =
        useState<number | null>(null);

    const [saving, setSaving] =
        useState(false);


    const loadData = async () => {

        try {

            setLoading(true);
            setError(null);

            const [
                quizData,
                disasterData,
            ] = await Promise.all([
                getAdminQuizzes(),
                getDisasters(),
            ]);

            setQuizzes(quizData);
            setDisasters(disasterData);

        } catch (err) {

            console.error(err);

            setError(
                "Failed to load quizzes."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadData();

    }, []);


    const loadLessons = async (
        disasterId: string
    ) => {

        if (!disasterId) {

            setLessons([]);
            return;

        }

        try {

            const data =
                await getAdminLessons(
                    Number(disasterId)
                );

            setLessons(data);

        } catch (err) {

            console.error(err);

            setError(
                "Failed to load lessons."
            );

        }

    };


    const handleDisasterChange = (
        value: string
    ) => {

        setQuizForm(
            previous => ({
                ...previous,
                disaster_id: value,
                lesson_id: "",
            })
        );

        loadLessons(value);
    };


    const resetQuizForm = () => {

        setQuizForm(
            emptyQuizForm
        );

        setEditingQuizId(null);
        setShowQuizForm(false);
        setLessons([]);

    };


    const handleQuizSubmit = async (
        event: FormEvent
    ) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError(null);
            setSuccess(null);

            if (!quizForm.title.trim()) {

                setError(
                    "Quiz title is required."
                );

                return;
            }

            if (!quizForm.disaster_id) {

                setError(
                    "Please select a disaster."
                );

                return;
            }

            const passingScore =
                Number(
                    quizForm.passing_score
                );

            if (
                Number.isNaN(passingScore) ||
                passingScore < 0 ||
                passingScore > 100
            ) {

                setError(
                    "Passing score must be between 0 and 100."
                );

                return;
            }


            if (editingQuizId !== null) {

                await updateQuiz(
                    editingQuizId,
                    {
                        title:
                            quizForm.title.trim(),

                        description:
                            quizForm.description.trim() ||
                            null,

                        passing_score:
                            passingScore,

                        time_limit_minutes:
                            quizForm.time_limit_minutes
                                ? Number(
                                    quizForm.time_limit_minutes
                                )
                                : null,
                    }
                );

                setSuccess(
                    "Quiz updated successfully."
                );

            } else {

                // await createQuiz({
                //     disaster_id:
                //         Number(
                //             quizForm.disaster_id
                //         ),

                //     lesson_id:
                //         quizForm.lesson_id
                //             ? Number(
                //                 quizForm.lesson_id
                //             )
                //             : null,

                //     title:
                //         quizForm.title.trim(),

                //     description:
                //         quizForm.description.trim() ||
                //         null,

                //     passing_score:
                //         passingScore,

                //     time_limit_minutes:
                //         quizForm.time_limit_minutes
                //             ? Number(
                //                 quizForm.time_limit_minutes
                //             )
                //             : null,
                // });
                await createQuiz({
                    ...(quizForm.lesson_id
                        ? {
                            lesson_id: Number(
                                quizForm.lesson_id
                            ),
                        }
                        : {
                            disaster_id: Number(
                                quizForm.disaster_id
                            ),
                        }),

                    title: quizForm.title.trim(),

                    description:
                        quizForm.description.trim() || null,

                    passing_score: passingScore,

                    time_limit_minutes:
                        quizForm.time_limit_minutes
                            ? Number(
                                quizForm.time_limit_minutes
                            )
                            : null,
                });

                setSuccess(
                    "Quiz created successfully."
                );
            }

            resetQuizForm();
            await loadData();

        } catch (err: any) {

            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Failed to save quiz."
            );

        } finally {

            setSaving(false);

        }

    };


    const handleEdit = async (
        quiz: Quiz
    ) => {

        if (quiz.is_published) {

            setError(
                "Unpublish the quiz before editing it."
            );

            return;
        }

        setEditingQuizId(quiz.id);

        setQuizForm({
            disaster_id:
                quiz.disaster_id
                    ? String(quiz.disaster_id)
                    : "",

            lesson_id:
                quiz.lesson_id
                    ? String(quiz.lesson_id)
                    : "",

            title:
                quiz.title,

            description:
                quiz.description || "",

            passing_score:
                String(
                    quiz.passing_score
                ),

            time_limit_minutes:
                quiz.time_limit_minutes !== null
                    ? String(
                        quiz.time_limit_minutes
                    )
                    : "",
        });

        if (quiz.disaster_id) {

            await loadLessons(
                String(
                    quiz.disaster_id
                )
            );

        }

        setShowQuizForm(true);
    };


    const handleDelete = async (
        quiz: Quiz
    ) => {

        if (
            !window.confirm(
                `Delete "${quiz.title}"? This cannot be undone.`
            )
        ) {

            return;
        }

        try {

            setError(null);

            await deleteQuiz(
                quiz.id
            );

            if (
                selectedQuiz?.id === quiz.id
            ) {

                setSelectedQuiz(null);

            }

            setSuccess(
                "Quiz deleted successfully."
            );

            await loadData();

        } catch (err: any) {

            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Failed to delete quiz."
            );

        }

    };


    const handlePublish = async (
        quiz: Quiz
    ) => {

        try {

            setError(null);

            if (quiz.is_published) {

                await unpublishQuiz(
                    quiz.id
                );

                setSuccess(
                    "Quiz unpublished."
                );

            } else {

                await publishQuiz(
                    quiz.id
                );

                setSuccess(
                    "Quiz published successfully."
                );

            }

            await loadData();

        } catch (err: any) {

            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Failed to change quiz status."
            );

        }

    };


    const openQuestions = async (
        quiz: Quiz
    ) => {

        try {

            setError(null);

            if (
                expandedQuizId === quiz.id
            ) {

                setExpandedQuizId(null);
                setSelectedQuiz(null);
                return;

            }

            const data =
                await getAdminQuiz(
                    quiz.id
                );

            setSelectedQuiz(data);
            setExpandedQuizId(quiz.id);

        } catch (err: any) {

            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Failed to load quiz questions."
            );

        }

    };


    const updateOption = (
        index: number,
        value: string
    ) => {

        setQuestionForm(
            previous => {

                const options =
                    [...previous.options];

                options[index] = value;

                return {
                    ...previous,
                    options,
                };

            }
        );

    };


    const handleAddQuestion =
        async (
            event: FormEvent
        ) => {

            event.preventDefault();

            if (!selectedQuiz) {
                return;
            }

            try {

                setSaving(true);
                setError(null);

                const questionText =
                    questionForm.question_text.trim();

                if (!questionText) {

                    setError(
                        "Question text is required."
                    );

                    return;
                }

                const validOptions =
                    questionForm.options.filter(
                        option =>
                            option.trim()
                    );

                if (
                    validOptions.length < 2
                ) {

                    setError(
                        "A question must have at least 2 options."
                    );

                    return;
                }

                if (
                    questionForm.correct_option >=
                    validOptions.length
                ) {

                    setError(
                        "Please select a valid correct option."
                    );

                    return;
                }


                const data: QuestionCreate = {
                    question_text:
                        questionText,

                    question_order:
                        selectedQuiz.questions.length + 1,

                    points:
                        Number(
                            questionForm.points
                        ) || 1,

                    options:
                        validOptions.map(
                            (
                                option,
                                index
                            ) => ({
                                option_text:
                                    option.trim(),

                                option_order:
                                    index + 1,

                                is_correct:
                                    index ===
                                    questionForm.correct_option,
                            })
                        ),
                };


                await addQuestion(
                    selectedQuiz.id,
                    data
                );

                const refreshed =
                    await getAdminQuiz(
                        selectedQuiz.id
                    );

                setSelectedQuiz(
                    refreshed
                );

                setQuestionForm(
                    emptyQuestionForm
                );

                setShowQuestionForm(
                    false
                );

                setSuccess(
                    "Question added successfully."
                );

            } catch (err: any) {

                console.error(err);

                setError(
                    err?.response?.data?.detail ||
                    "Failed to add question."
                );

            } finally {

                setSaving(false);

            }

        };


    const getDisasterName = (
        disasterId: number | null
    ) => {

        if (!disasterId) {
            return "General";
        }

        return (
            disasters.find(
                disaster =>
                    disaster.id === disasterId
            )?.name ||
            `Disaster #${disasterId}`
        );

    };


    return (
        <div className="p-6 lg:p-8">

            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Quizzes
                    </h1>

                    <p className="mt-1 text-slate-500">
                        Create quizzes, manage questions,
                        and publish assessments.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={() => {

                        resetQuizForm();
                        setShowQuizForm(true);

                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                    <Plus size={20} />
                    Create Quiz
                </button>

            </div>


            {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

                    <AlertTriangle
                        size={20}
                        className="mt-0.5 shrink-0"
                    />

                    <p className="flex-1">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setError(null)
                        }
                    >
                        <X size={18} />
                    </button>

                </div>
            )}


            {success && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">

                    <Check size={20} />

                    <p className="flex-1">
                        {success}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess(null)
                        }
                    >
                        <X size={18} />
                    </button>

                </div>
            )}


            {showQuizForm && (
                <form
                    onSubmit={
                        handleQuizSubmit
                    }
                    className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                    <div className="mb-6 flex items-center justify-between">

                        <h2 className="text-xl font-bold text-slate-900">
                            {editingQuizId !== null
                                ? "Edit Quiz"
                                : "Create Quiz"}
                        </h2>

                        <button
                            type="button"
                            onClick={
                                resetQuizForm
                            }
                            className="rounded-lg p-2 hover:bg-slate-100"
                        >
                            <X size={20} />
                        </button>

                    </div>


                    <div className="grid gap-5 md:grid-cols-2">

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Disaster
                            </label>

                            <select
                                value={
                                    quizForm.disaster_id
                                }
                                disabled={
                                    editingQuizId !== null
                                }
                                onChange={event =>
                                    handleDisasterChange(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                            >
                                <option value="">
                                    Select disaster
                                </option>

                                {disasters.map(
                                    disaster => (
                                        <option
                                            key={
                                                disaster.id
                                            }
                                            value={
                                                disaster.id
                                            }
                                        >
                                            {
                                                disaster.name
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Lesson
                            </label>

                            <select
                                value={
                                    quizForm.lesson_id
                                }
                                disabled={
                                    editingQuizId !== null ||
                                    !quizForm.disaster_id
                                }
                                onChange={event =>
                                    setQuizForm(
                                        previous => ({
                                            ...previous,
                                            lesson_id:
                                                event.target.value,
                                        })
                                    )
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                            >
                                <option value="">
                                    General / No lesson
                                </option>

                                {lessons.map(
                                    lesson => (
                                        <option
                                            key={
                                                lesson.id
                                            }
                                            value={
                                                lesson.id
                                            }
                                        >
                                            {
                                                lesson.title
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        <div className="md:col-span-2">

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Quiz Title
                            </label>

                            <input
                                value={
                                    quizForm.title
                                }
                                onChange={event =>
                                    setQuizForm(
                                        previous => ({
                                            ...previous,
                                            title:
                                                event.target.value,
                                        })
                                    )
                                }
                                placeholder="Example: Earthquake Safety Quiz"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                            />

                        </div>


                        <div className="md:col-span-2">

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Description
                            </label>

                            <textarea
                                value={
                                    quizForm.description
                                }
                                onChange={event =>
                                    setQuizForm(
                                        previous => ({
                                            ...previous,
                                            description:
                                                event.target.value,
                                        })
                                    )
                                }
                                rows={3}
                                placeholder="Brief description of the quiz"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                            />

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Passing Score (%)
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={
                                    quizForm.passing_score
                                }
                                onChange={event =>
                                    setQuizForm(
                                        previous => ({
                                            ...previous,
                                            passing_score:
                                                event.target.value,
                                        })
                                    )
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                            />

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Time Limit (minutes)
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={
                                    quizForm.time_limit_minutes
                                }
                                onChange={event =>
                                    setQuizForm(
                                        previous => ({
                                            ...previous,
                                            time_limit_minutes:
                                                event.target.value,
                                        })
                                    )
                                }
                                placeholder="Optional"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                            />

                        </div>

                    </div>


                    <div className="mt-6 flex justify-end gap-3">

                        <button
                            type="button"
                            onClick={
                                resetQuizForm
                            }
                            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {saving
                                ? "Saving..."
                                : editingQuizId !== null
                                    ? "Update Quiz"
                                    : "Create Quiz"}
                        </button>

                    </div>

                </form>
            )}


            {loading ? (

                <div className="rounded-2xl bg-white p-10 text-center text-slate-500">
                    Loading quizzes...
                </div>

            ) : quizzes.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

                    <h2 className="text-lg font-semibold text-slate-800">
                        No quizzes found
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Create your first quiz to get started.
                    </p>

                </div>

            ) : (

                <div className="space-y-4">

                    {quizzes.map(
                        quiz => {

                            const expanded =
                                expandedQuizId ===
                                quiz.id;

                            return (
                                <div
                                    key={
                                        quiz.id
                                    }
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                >

                                    <div className="p-5">

                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                            <div className="min-w-0">

                                                <div className="flex flex-wrap items-center gap-2">

                                                    <h2 className="text-lg font-bold text-slate-900">
                                                        {
                                                            quiz.title
                                                        }
                                                    </h2>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-bold ${quiz.is_published
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-amber-100 text-amber-700"
                                                            }`}
                                                    >
                                                        {
                                                            quiz.is_published
                                                                ? "Published"
                                                                : "Draft"
                                                        }
                                                    </span>

                                                </div>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {
                                                        getDisasterName(
                                                            quiz.disaster_id
                                                        )
                                                    }

                                                    {" • "}

                                                    Passing:
                                                    {" "}
                                                    {
                                                        quiz.passing_score
                                                    }%

                                                    {quiz.time_limit_minutes !== null && (
                                                        <>
                                                            {" • "}
                                                            {
                                                                quiz.time_limit_minutes
                                                            }{" "}
                                                            min
                                                        </>
                                                    )}
                                                </p>

                                                {quiz.description && (
                                                    <p className="mt-2 text-sm text-slate-600">
                                                        {
                                                            quiz.description
                                                        }
                                                    </p>
                                                )}

                                            </div>


                                            <div className="flex flex-wrap gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openQuestions(
                                                            quiz
                                                        )
                                                    }
                                                    className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                    {expanded
                                                        ? <ChevronUp size={17} />
                                                        : <ChevronDown size={17} />
                                                    }

                                                    Questions
                                                </button>


                                                {!quiz.is_published && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(
                                                                quiz
                                                            )
                                                        }
                                                        className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                                                    >
                                                        <Edit size={17} />
                                                        Edit
                                                    </button>
                                                )}


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handlePublish(
                                                            quiz
                                                        )
                                                    }
                                                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${quiz.is_published
                                                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                        : "bg-green-50 text-green-700 hover:bg-green-100"
                                                        }`}
                                                >
                                                    {quiz.is_published
                                                        ? "Unpublish"
                                                        : "Publish"}
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            quiz
                                                        )
                                                    }
                                                    className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                                >
                                                    <Trash2
                                                        size={17}
                                                    />
                                                </button>

                                            </div>

                                        </div>

                                    </div>


                                    {expanded &&
                                        selectedQuiz && (
                                            <div className="border-t border-slate-200 bg-slate-50 p-5">

                                                <div className="mb-4 flex items-center justify-between">

                                                    <div>

                                                        <h3 className="font-bold text-slate-900">
                                                            Questions
                                                        </h3>

                                                        <p className="text-sm text-slate-500">
                                                            {
                                                                selectedQuiz.questions.length
                                                            }{" "}
                                                            question(s)
                                                        </p>

                                                    </div>

                                                    {!quiz.is_published && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowQuestionForm(
                                                                    !showQuestionForm
                                                                )
                                                            }
                                                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                                        >
                                                            <Plus size={17} />
                                                            Add Question
                                                        </button>
                                                    )}

                                                </div>


                                                {showQuestionForm &&
                                                    !quiz.is_published &&
                                                    selectedQuiz.id ===
                                                    quiz.id && (

                                                        <form
                                                            onSubmit={
                                                                handleAddQuestion
                                                            }
                                                            className="mb-5 rounded-xl border border-blue-200 bg-white p-5"
                                                        >

                                                            <h4 className="mb-4 font-bold text-slate-900">
                                                                Add Question
                                                            </h4>


                                                            <textarea
                                                                value={
                                                                    questionForm.question_text
                                                                }
                                                                onChange={event =>
                                                                    setQuestionForm(
                                                                        previous => ({
                                                                            ...previous,
                                                                            question_text:
                                                                                event.target.value,
                                                                        })
                                                                    )
                                                                }
                                                                rows={3}
                                                                placeholder="Enter the question"
                                                                className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                                                            />


                                                            <div className="mb-4">

                                                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                                    Points
                                                                </label>

                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={
                                                                        questionForm.points
                                                                    }
                                                                    onChange={event =>
                                                                        setQuestionForm(
                                                                            previous => ({
                                                                                ...previous,
                                                                                points:
                                                                                    event.target.value,
                                                                            })
                                                                        )
                                                                    }
                                                                    className="w-32 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                                                                />

                                                            </div>


                                                            <div className="space-y-3">

                                                                {questionForm.options.map(
                                                                    (
                                                                        option,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="flex items-center gap-3"
                                                                        >

                                                                            <input
                                                                                type="radio"
                                                                                name="correct-option"
                                                                                checked={
                                                                                    questionForm.correct_option ===
                                                                                    index
                                                                                }
                                                                                onChange={() =>
                                                                                    setQuestionForm(
                                                                                        previous => ({
                                                                                            ...previous,
                                                                                            correct_option:
                                                                                                index,
                                                                                        })
                                                                                    )
                                                                                }
                                                                            />

                                                                            <input
                                                                                value={
                                                                                    option
                                                                                }
                                                                                onChange={event =>
                                                                                    updateOption(
                                                                                        index,
                                                                                        event.target.value
                                                                                    )
                                                                                }
                                                                                placeholder={`Option ${index + 1}`}
                                                                                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
                                                                            />

                                                                        </div>
                                                                    )
                                                                )}

                                                            </div>


                                                            <p className="mt-3 text-xs text-slate-500">
                                                                Select the radio button next to the correct answer.
                                                            </p>


                                                            <div className="mt-5 flex justify-end gap-2">

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setShowQuestionForm(
                                                                            false
                                                                        );
                                                                        setQuestionForm(
                                                                            emptyQuestionForm
                                                                        );
                                                                    }}
                                                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                                                                >
                                                                    Cancel
                                                                </button>

                                                                <button
                                                                    type="submit"
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                                                                >
                                                                    {saving
                                                                        ? "Adding..."
                                                                        : "Add Question"}
                                                                </button>

                                                            </div>

                                                        </form>

                                                    )}


                                                {selectedQuiz.questions.length ===
                                                    0 ? (

                                                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                                                        No questions yet.
                                                    </div>

                                                ) : (

                                                    <div className="space-y-3">

                                                        {selectedQuiz.questions.map(
                                                            (
                                                                question,
                                                                index
                                                            ) => (

                                                                <div
                                                                    key={
                                                                        question.id
                                                                    }
                                                                    className="rounded-xl border border-slate-200 bg-white p-4"
                                                                >

                                                                    <div className="flex gap-3">

                                                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                                                            {
                                                                                index + 1
                                                                            }
                                                                        </span>

                                                                        <div className="flex-1">

                                                                            <p className="font-semibold text-slate-800">
                                                                                {
                                                                                    question.question_text
                                                                                }
                                                                            </p>

                                                                            <div className="mt-3 space-y-2">

                                                                                {question.options.map(
                                                                                    option => (

                                                                                        <div
                                                                                            key={
                                                                                                option.id
                                                                                            }
                                                                                            className={`rounded-lg border px-3 py-2 text-sm ${option.is_correct
                                                                                                ? "border-green-300 bg-green-50 text-green-800"
                                                                                                : "border-slate-200 text-slate-600"
                                                                                                }`}
                                                                                        >

                                                                                            <div className="flex items-center justify-between">

                                                                                                <span>
                                                                                                    {
                                                                                                        option.option_order
                                                                                                    }.
                                                                                                    {" "}
                                                                                                    {
                                                                                                        option.option_text
                                                                                                    }
                                                                                                </span>

                                                                                                {option.is_correct && (
                                                                                                    <Check
                                                                                                        size={17}
                                                                                                        className="text-green-600"
                                                                                                    />
                                                                                                )}

                                                                                            </div>

                                                                                        </div>

                                                                                    )
                                                                                )}

                                                                            </div>

                                                                            <p className="mt-3 text-xs text-slate-400">
                                                                                {
                                                                                    question.points
                                                                                }{" "}
                                                                                point(s)
                                                                            </p>

                                                                        </div>

                                                                    </div>

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                )}

                                            </div>
                                        )}

                                </div>
                            );

                        }
                    )}

                </div>

            )}

        </div>
    );
};


export default AdminQuizzes;
