import {
    BookOpen,
    Check,
    Edit,
    Loader2,
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
    createLesson,
    deleteLesson,
    getAdminLessons,
    publishLesson,
    unpublishLesson,
    updateLesson,
} from "../../api/lessons";

import {
    getDisasters,
} from "../../api/disasters";

import type {
    Lesson,
    LessonCreate,
    LessonUpdate,
} from "../../types/lesson";

import type {
    Disaster,
} from "../../types/disaster";


interface LessonForm {
    disaster_id: string;
    title: string;
    description: string;
    content: string;
    difficulty: string;
    duration_minutes: string;
}


const emptyForm: LessonForm = {
    disaster_id: "",
    title: "",
    description: "",
    content: "",
    difficulty: "BEGINNER",
    duration_minutes: "",
};


const AdminLessons = () => {

    const [lessons, setLessons] =
        useState<Lesson[]>([]);

    const [disasters, setDisasters] =
        useState<Disaster[]>([]);

    const [selectedDisaster, setSelectedDisaster] =
        useState<string>("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [showForm, setShowForm] =
        useState(false);

    const [editingLesson, setEditingLesson] =
        useState<Lesson | null>(null);

    const [form, setForm] =
        useState<LessonForm>(emptyForm);


    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const disasterId =
                selectedDisaster
                    ? Number(selectedDisaster)
                    : undefined;

            const [
                lessonData,
                disasterData,
            ] = await Promise.all([
                getAdminLessons(disasterId),
                getDisasters(),
            ]);

            setLessons(lessonData);
            setDisasters(disasterData);

        } catch (err) {

            console.error(
                "Failed to load lessons:",
                err
            );

            setError(
                "Unable to load lessons."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        loadData();
    }, [selectedDisaster]);


    const openCreate = () => {

        setEditingLesson(null);

        setForm(emptyForm);

        setShowForm(true);

        setError("");
    };


    const openEdit = (
        lesson: Lesson
    ) => {

        setEditingLesson(lesson);

        setForm({
            disaster_id:
                String(lesson.disaster_id),

            title:
                lesson.title,

            description:
                lesson.description ?? "",

            content:
                lesson.content ?? "",

            difficulty:
                lesson.difficulty,

            duration_minutes:
                lesson.duration_minutes !== null
                    ? String(
                        lesson.duration_minutes
                    )
                    : "",
        });

        setShowForm(true);

        setError("");
    };


    const closeForm = () => {

        if (saving) {
            return;
        }

        setShowForm(false);
        setEditingLesson(null);
        setForm(emptyForm);
    };


    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        if (!form.disaster_id) {

            setError(
                "Please select a disaster."
            );

            return;
        }

        if (!form.title.trim()) {

            setError(
                "Lesson title is required."
            );

            return;
        }

        try {

            setSaving(true);
            setError("");

            if (editingLesson) {

                const data: LessonUpdate = {
                    title:
                        form.title.trim(),

                    description:
                        form.description.trim()
                            || null,

                    content:
                        form.content.trim()
                            || null,

                    difficulty:
                        form.difficulty,

                    duration_minutes:
                        form.duration_minutes
                            ? Number(
                                form.duration_minutes
                            )
                            : null,
                };

                await updateLesson(
                    editingLesson.id,
                    data
                );

            } else {

                const data: LessonCreate = {
                    disaster_id:
                        Number(
                            form.disaster_id
                        ),

                    title:
                        form.title.trim(),

                    description:
                        form.description.trim()
                            || null,

                    content:
                        form.content.trim()
                            || null,

                    difficulty:
                        form.difficulty,

                    duration_minutes:
                        form.duration_minutes
                            ? Number(
                                form.duration_minutes
                            )
                            : null,
                };

                await createLesson(data);
            }

            closeForm();

            await loadData();

        } catch (err) {

            console.error(
                "Failed to save lesson:",
                err
            );

            setError(
                "Unable to save lesson."
            );

        } finally {

            setSaving(false);
        }
    };


    const handlePublish = async (
        lesson: Lesson
    ) => {

        try {

            setError("");

            if (lesson.is_published) {

                await unpublishLesson(
                    lesson.id
                );

            } else {

                await publishLesson(
                    lesson.id
                );
            }

            await loadData();

        } catch (err) {

            console.error(
                "Failed to change lesson status:",
                err
            );

            setError(
                "Unable to change lesson status."
            );
        }
    };


    const handleDelete = async (
        lesson: Lesson
    ) => {

        const confirmed =
            window.confirm(
                `Delete "${lesson.title}"? This cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await deleteLesson(
                lesson.id
            );

            await loadData();

        } catch (err) {

            console.error(
                "Failed to delete lesson:",
                err
            );

            setError(
                "Unable to delete lesson."
            );
        }
    };


    const getDisasterName = (
        disasterId: number
    ) => {

        return disasters.find(
            (disaster) =>
                disaster.id === disasterId
        )?.name ?? `Disaster #${disasterId}`;
    };


    return (
        <div className="p-6 lg:p-8">

            {/* Header */}

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">

                        <BookOpen
                            size={25}
                            className="text-blue-600"
                        />

                    </div>

                    <div>

                        <h1 className="text-3xl font-bold text-slate-900">
                            Lessons
                        </h1>

                        <p className="mt-1 text-slate-500">
                            Create and manage educational lessons.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    onClick={openCreate}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >

                    <Plus size={19} />

                    New Lesson

                </button>

            </div>


            {/* Filter */}

            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Filter by Disaster
                </label>

                <select
                    value={selectedDisaster}
                    onChange={(event) =>
                        setSelectedDisaster(
                            event.target.value
                        )
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:w-96"
                >

                    <option value="">
                        All disasters
                    </option>

                    {disasters.map(
                        (disaster) => (
                            <option
                                key={
                                    disaster.id
                                }
                                value={
                                    disaster.id
                                }
                            >
                                {disaster.name}
                            </option>
                        )
                    )}

                </select>

            </div>


            {/* Error */}

            {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}


            {/* Loading */}

            {loading ? (

                <div className="flex min-h-[300px] items-center justify-center">

                    <div className="flex items-center gap-3 text-slate-500">

                        <Loader2
                            size={22}
                            className="animate-spin"
                        />

                        Loading lessons...

                    </div>

                </div>

            ) : lessons.length === 0 ? (

                <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

                    <BookOpen
                        size={42}
                        className="mx-auto text-slate-300"
                    />

                    <h2 className="mt-4 text-xl font-semibold text-slate-800">
                        No lessons found
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Create your first lesson to get started.
                    </p>

                </div>

            ) : (

                <div className="mt-8 space-y-5">

                    {lessons.map(
                        (lesson) => (

                            <div
                                key={lesson.id}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                            >

                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                    <div className="min-w-0 flex-1">

                                        <div className="flex flex-wrap items-center gap-2">

                                            <h2 className="text-xl font-bold text-slate-900">
                                                {lesson.title}
                                            </h2>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    lesson.is_published
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {lesson.is_published
                                                    ? "Published"
                                                    : "Draft"}
                                            </span>

                                        </div>


                                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">

                                            <span>
                                                Disaster:{" "}
                                                <strong className="text-slate-700">
                                                    {
                                                        getDisasterName(
                                                            lesson.disaster_id
                                                        )
                                                    }
                                                </strong>
                                            </span>

                                            <span>
                                                Difficulty:{" "}
                                                <strong className="text-slate-700">
                                                    {
                                                        lesson.difficulty
                                                    }
                                                </strong>
                                            </span>

                                            {lesson.duration_minutes !== null && (
                                                <span>
                                                    Duration:{" "}
                                                    <strong className="text-slate-700">
                                                        {
                                                            lesson.duration_minutes
                                                        }{" "}
                                                        min
                                                    </strong>
                                                </span>
                                            )}

                                        </div>


                                        {lesson.description && (
                                            <p className="mt-4 leading-7 text-slate-600">
                                                {
                                                    lesson.description
                                                }
                                            </p>
                                        )}

                                    </div>


                                    <div className="flex flex-wrap gap-2">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEdit(
                                                    lesson
                                                )
                                            }
                                            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        >

                                            <Edit
                                                size={16}
                                            />

                                            Edit

                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handlePublish(
                                                    lesson
                                                )
                                            }
                                            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold ${
                                                lesson.is_published
                                                    ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                                                    : "border-green-300 text-green-700 hover:bg-green-50"
                                            }`}
                                        >

                                            {lesson.is_published ? (
                                                <X
                                                    size={16}
                                                />
                                            ) : (
                                                <Check
                                                    size={16}
                                                />
                                            )}

                                            {lesson.is_published
                                                ? "Unpublish"
                                                : "Publish"}

                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    lesson
                                                )
                                            }
                                            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                                        >

                                            <Trash2
                                                size={16}
                                            />

                                            Delete

                                        </button>

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}


            {/* Create / Edit Modal */}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b px-6 py-5">

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingLesson
                                        ? "Edit Lesson"
                                        : "New Lesson"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {editingLesson
                                        ? "Update the lesson details."
                                        : "Create a new educational lesson."}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={saving}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Disaster
                                </label>

                                <select
                                    value={
                                        form.disaster_id
                                    }
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            disaster_id:
                                                event.target.value,
                                        })
                                    }
                                    disabled={
                                        !!editingLesson
                                    }
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                >

                                    <option value="">
                                        Select disaster
                                    </option>

                                    {disasters.map(
                                        (disaster) => (
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
                                    Title
                                </label>

                                <input
                                    type="text"
                                    value={
                                        form.title
                                    }
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            title:
                                                event.target.value,
                                        })
                                    }
                                    placeholder="Enter lesson title"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <div className="grid gap-5 md:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Difficulty
                                    </label>

                                    <select
                                        value={
                                            form.difficulty
                                        }
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                difficulty:
                                                    event.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="BEGINNER">
                                            Beginner
                                        </option>

                                        <option value="INTERMEDIATE">
                                            Intermediate
                                        </option>

                                        <option value="ADVANCED">
                                            Advanced
                                        </option>

                                    </select>

                                </div>


                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Duration (minutes)
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={
                                            form.duration_minutes
                                        }
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                duration_minutes:
                                                    event.target.value,
                                            })
                                        }
                                        placeholder="30"
                                        className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    rows={3}
                                    value={
                                        form.description
                                    }
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            description:
                                                event.target.value,
                                        })
                                    }
                                    placeholder="Short description of the lesson"
                                    className="w-full resize-y rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Lesson Content
                                </label>

                                <textarea
                                    rows={10}
                                    value={
                                        form.content
                                    }
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            content:
                                                event.target.value,
                                        })
                                    }
                                    placeholder="Enter the lesson content..."
                                    className="w-full resize-y rounded-lg border border-slate-200 px-4 py-3 leading-7 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <div className="flex justify-end gap-3 border-t pt-5">

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className="rounded-lg border border-slate-200 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                >

                                    {saving && (
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                    )}

                                    {editingLesson
                                        ? "Save Changes"
                                        : "Create Lesson"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};


export default AdminLessons;