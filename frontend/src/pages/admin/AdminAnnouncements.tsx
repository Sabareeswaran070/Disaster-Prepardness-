import {
    AlertTriangle,
    Check,
    Edit,
    Megaphone,
    Plus,
    Trash2,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    createAnnouncement,
    deleteAnnouncement,
    getAdminAnnouncements,
    publishAnnouncement,
    unpublishAnnouncement,
    updateAnnouncement,
} from "../../api/announcements";

import {
    getDisasters,
} from "../../api/disasters";

import type {
    Announcement,
} from "../../types/announcement";

import type {
    Disaster,
} from "../../types/disaster";


const AdminAnnouncements = () => {

    const [
        announcements,
        setAnnouncements,
    ] = useState<Announcement[]>([]);

    const [
        disasters,
        setDisasters,
    ] = useState<Disaster[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    const [
        showForm,
        setShowForm,
    ] = useState(false);

    const [
        editing,
        setEditing,
    ] = useState<Announcement | null>(null);

    const [
        title,
        setTitle,
    ] = useState("");

    const [
        message,
        setMessage,
    ] = useState("");

    const [
        priority,
        setPriority,
    ] = useState("NORMAL");

    const [
        targetRole,
        setTargetRole,
    ] = useState("ALL");

    const [
        disasterId,
        setDisasterId,
    ] = useState<number | "">("");


    const loadData = async () => {

        try {

            setLoading(true);
            setError(null);

            const [
                announcementData,
                disasterData,
            ] = await Promise.all([
                getAdminAnnouncements(),
                getDisasters(),
            ]);

            setAnnouncements(
                announcementData
            );

            setDisasters(
                disasterData
            );

        } catch (err) {

            console.error(err);

            setError(
                "Failed to load announcements."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadData();

    }, []);


    const resetForm = () => {

        setTitle("");
        setMessage("");
        setPriority("NORMAL");
        setTargetRole("ALL");
        setDisasterId("");
        setEditing(null);
        setShowForm(false);

    };


    const openCreate = () => {

        setEditing(null);
        setTitle("");
        setMessage("");
        setPriority("NORMAL");
        setTargetRole("ALL");
        setDisasterId("");
        setShowForm(true);

    };


    const openEdit = (
        announcement: Announcement
    ) => {

        setEditing(
            announcement
        );

        setTitle(
            announcement.title
        );

        setMessage(
            announcement.message
        );

        setPriority(
            announcement.priority
        );

        setTargetRole(
            announcement.target_role
        );

        setDisasterId(
            announcement.disaster_id ?? ""
        );

        setShowForm(true);

    };


    const handleSubmit = async (
        event: React.FormEvent
    ) => {

        event.preventDefault();

        try {

            setError(null);

            const data = {
                disaster_id:
                    disasterId === ""
                        ? null
                        : disasterId,

                title:
                    title.trim(),

                message:
                    message.trim(),

                priority,

                target_role:
                    targetRole,
            };


            if (editing) {

                await updateAnnouncement(
                    editing.id,
                    data
                );

            } else {

                await createAnnouncement(
                    data
                );

            }

            await loadData();

            resetForm();

        } catch (err) {

            console.error(err);

            setError(
                "Failed to save announcement."
            );

        }

    };


    const handlePublish = async (
        announcement: Announcement
    ) => {

        try {

            if (
                announcement.is_published
            ) {

                await unpublishAnnouncement(
                    announcement.id
                );

            } else {

                await publishAnnouncement(
                    announcement.id
                );

            }

            await loadData();

        } catch (err) {

            console.error(err);

            setError(
                "Failed to change publication status."
            );

        }

    };


    const handleDelete = async (
        announcement: Announcement
    ) => {

        const confirmed =
            window.confirm(
                `Delete "${announcement.title}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            await deleteAnnouncement(
                announcement.id
            );

            await loadData();

        } catch (err) {

            console.error(err);

            setError(
                "Failed to delete announcement."
            );

        }

    };


    return (
        <div className="p-6 lg:p-8">

            {/* Header */}

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Megaphone size={25} />
                        </div>

                        <div>

                            <h1 className="text-3xl font-bold text-slate-900">
                                Announcements
                            </h1>

                            <p className="mt-1 text-slate-500">
                                Create and manage important notices.
                            </p>

                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    onClick={openCreate}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    <Plus size={19} />
                    New Announcement
                </button>

            </div>


            {/* Error */}

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

                    <AlertTriangle size={20} />

                    <p>
                        {error}
                    </p>

                </div>
            )}


            {/* Form */}

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                    <div className="mb-6 flex items-center justify-between">

                        <h2 className="text-xl font-bold text-slate-900">
                            {editing
                                ? "Edit Announcement"
                                : "Create Announcement"}
                        </h2>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        >
                            <X size={20} />
                        </button>

                    </div>


                    <div className="grid gap-5 md:grid-cols-2">

                        <div className="md:col-span-2">

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Title
                            </label>

                            <input
                                value={title}
                                onChange={(event) =>
                                    setTitle(
                                        event.target.value
                                    )
                                }
                                required
                                maxLength={200}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="Announcement title"
                            />

                        </div>


                        <div className="md:col-span-2">

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Message
                            </label>

                            <textarea
                                value={message}
                                onChange={(event) =>
                                    setMessage(
                                        event.target.value
                                    )
                                }
                                required
                                rows={5}
                                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter announcement message"
                            />

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Priority
                            </label>

                            <select
                                value={priority}
                                onChange={(event) =>
                                    setPriority(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                            >
                                <option value="LOW">
                                    Low
                                </option>

                                <option value="NORMAL">
                                    Normal
                                </option>

                                <option value="HIGH">
                                    High
                                </option>

                                <option value="CRITICAL">
                                    Critical
                                </option>
                            </select>

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Target Role
                            </label>

                            <select
                                value={targetRole}
                                onChange={(event) =>
                                    setTargetRole(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                            >
                                <option value="ALL">
                                    All Users
                                </option>

                                <option value="STUDENT">
                                    Students
                                </option>

                                <option value="FACULTY">
                                    Faculty
                                </option>

                                <option value="INSTITUTION_ADMIN">
                                    Institution Admin
                                </option>
                            </select>

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Disaster
                            </label>

                            <select
                                value={disasterId}
                                onChange={(event) =>
                                    setDisasterId(
                                        event.target.value
                                            ? Number(
                                                event.target.value
                                            )
                                            : ""
                                    )
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                            >
                                <option value="">
                                    All Disasters
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

                    </div>


                    <div className="mt-6 flex gap-3">

                        <button
                            type="submit"
                            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                        >
                            {editing
                                ? "Update"
                                : "Create"}
                        </button>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                    </div>

                </form>
            )}


            {/* Loading */}

            {loading && (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Loading announcements...
                </div>
            )}


            {/* Empty */}

            {!loading &&
                announcements.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">

                        <Megaphone
                            size={45}
                            className="mx-auto text-slate-300"
                        />

                        <h2 className="mt-4 text-xl font-bold text-slate-900">
                            No announcements
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Create your first announcement.
                        </p>

                    </div>
                )}


            {/* Announcements */}

            {!loading &&
                announcements.length > 0 && (
                    <div className="space-y-4">

                        {announcements.map(
                            (announcement) => (
                                <div
                                    key={
                                        announcement.id
                                    }
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                                >

                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                        <div className="min-w-0 flex-1">

                                            <div className="flex flex-wrap items-center gap-3">

                                                <h2 className="text-xl font-bold text-slate-900">
                                                    {
                                                        announcement.title
                                                    }
                                                </h2>

                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                                    {
                                                        announcement.priority
                                                    }
                                                </span>

                                                <span
                                                    className={
                                                        announcement.is_published
                                                            ? "rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600"
                                                            : "rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600"
                                                    }
                                                >
                                                    {announcement.is_published
                                                        ? "Published"
                                                        : "Draft"}
                                                </span>

                                            </div>


                                            <p className="mt-3 whitespace-pre-wrap text-slate-600">
                                                {
                                                    announcement.message
                                                }
                                            </p>


                                            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">

                                                <span>
                                                    Target:{" "}
                                                    <strong>
                                                        {
                                                            announcement.target_role
                                                        }
                                                    </strong>
                                                </span>

                                                <span>
                                                    Disaster ID:{" "}
                                                    <strong>
                                                        {
                                                            announcement.disaster_id ??
                                                            "All"
                                                        }
                                                    </strong>
                                                </span>

                                                <span>
                                                    Created:{" "}
                                                    {new Date(
                                                        announcement.created_at
                                                    ).toLocaleDateString()}
                                                </span>

                                            </div>

                                        </div>


                                        <div className="flex flex-wrap gap-2">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEdit(
                                                        announcement
                                                    )
                                                }
                                                className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                <Edit size={16} />
                                                Edit
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handlePublish(
                                                        announcement
                                                    )
                                                }
                                                className={
                                                    announcement.is_published
                                                        ? "flex items-center gap-2 rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                                                        : "flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                                                }
                                            >
                                                {announcement.is_published ? (
                                                    <>
                                                        <X size={16} />
                                                        Unpublish
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={16} />
                                                        Publish
                                                    </>
                                                )}
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(
                                                        announcement
                                                    )
                                                }
                                                className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

        </div>
    );
};


export default AdminAnnouncements;