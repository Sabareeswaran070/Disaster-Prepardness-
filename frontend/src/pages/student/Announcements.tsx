import {
    AlertTriangle,
    Bell,
    CalendarDays,
    ChevronRight,
    Info,
    Megaphone,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    getAnnouncements,
} from "../../api/announcements";

import type {
    Announcement,
} from "../../types/announcement";


const priorityStyles: Record<
    string,
    {
        badge: string;
        icon: string;
        border: string;
    }
> = {

    CRITICAL: {
        badge: "bg-red-100 text-red-700",
        icon: "bg-red-100 text-red-600",
        border: "border-red-200",
    },

    HIGH: {
        badge: "bg-orange-100 text-orange-700",
        icon: "bg-orange-100 text-orange-600",
        border: "border-orange-200",
    },

    NORMAL: {
        badge: "bg-blue-100 text-blue-700",
        icon: "bg-blue-100 text-blue-600",
        border: "border-slate-200",
    },

    LOW: {
        badge: "bg-slate-100 text-slate-600",
        icon: "bg-slate-100 text-slate-600",
        border: "border-slate-200",
    },
};


const formatDate = (
    value: string | null
) => {

    if (!value) {
        return "Not specified";
    }

    return new Date(value).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
};


const getPriorityStyle = (
    priority: string
) => {

    return (
        priorityStyles[
            priority.toUpperCase()
        ] ??
        priorityStyles.NORMAL
    );
};


const Announcements = () => {

    const [
        announcements,
        setAnnouncements,
    ] = useState<Announcement[]>([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState<string | null>(null);


    useEffect(() => {

        const loadAnnouncements =
            async () => {

                try {

                    setLoading(true);
                    setError(null);

                    const data =
                        await getAnnouncements();

                    setAnnouncements(data);

                } catch (err) {

                    console.error(
                        "Failed to load announcements:",
                        err
                    );

                    setError(
                        "Unable to load announcements. Please try again."
                    );

                } finally {

                    setLoading(false);

                }
            };


        loadAnnouncements();

    }, []);


    if (loading) {

        return (
            <div className="p-6 lg:p-8">

                <div className="animate-pulse">

                    <div className="h-10 w-72 rounded-lg bg-slate-200" />

                    <div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-200" />

                    <div className="mt-8 space-y-5">

                        {[1, 2, 3].map(
                            (item) => (

                                <div
                                    key={item}
                                    className="h-40 rounded-2xl bg-slate-100"
                                />

                            )
                        )}

                    </div>

                </div>

            </div>
        );
    }


    if (error) {

        return (
            <div className="p-6 lg:p-8">

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

                    <div className="flex items-start gap-4">

                        <div className="rounded-xl bg-red-100 p-3">

                            <AlertTriangle
                                size={24}
                                className="text-red-600"
                            />

                        </div>

                        <div>

                            <h1 className="font-bold text-red-900">
                                Announcements unavailable
                            </h1>

                            <p className="mt-1 text-sm text-red-700">
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

            {/* =========================
                Header
            ========================= */}

            <div className="flex items-start gap-4">

                <div className="rounded-2xl bg-blue-100 p-4">

                    <Megaphone
                        size={32}
                        className="text-blue-600"
                    />

                </div>

                <div>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Announcements
                    </h1>

                    <p className="mt-1 text-slate-500">
                        Stay updated with important disaster
                        preparedness information and notices.
                    </p>

                </div>

            </div>


            {/* =========================
                Empty State
            ========================= */}

            {announcements.length === 0 && (

                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                    <div className="mx-auto w-fit rounded-full bg-slate-100 p-4">

                        <Bell
                            size={32}
                            className="text-slate-400"
                        />

                    </div>

                    <h2 className="mt-4 text-xl font-bold text-slate-800">
                        No announcements
                    </h2>

                    <p className="mt-2 text-slate-500">
                        There are no published announcements available for you right now.
                    </p>

                </div>
            )}


            {/* =========================
                Announcement List
            ========================= */}

            {announcements.length > 0 && (

                <div className="mt-8 space-y-5">

                    {announcements.map(
                        (announcement) => {

                            const style =
                                getPriorityStyle(
                                    announcement.priority
                                );

                            return (
                                <article
                                    key={announcement.id}
                                    className={`rounded-2xl border ${style.border} bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                                >

                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                                        <div className="flex items-start gap-4">

                                            <div
                                                className={`rounded-xl p-3 ${style.icon}`}
                                            >

                                                {announcement.priority.toUpperCase() ===
                                                "CRITICAL" ||
                                                announcement.priority.toUpperCase() ===
                                                "HIGH" ? (

                                                    <AlertTriangle
                                                        size={22}
                                                    />

                                                ) : (

                                                    <Info
                                                        size={22}
                                                    />

                                                )}

                                            </div>

                                            <div>

                                                <div className="flex flex-wrap items-center gap-2">

                                                    <h2 className="text-lg font-bold text-slate-900">
                                                        {announcement.title}
                                                    </h2>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${style.badge}`}
                                                    >
                                                        {announcement.priority}
                                                    </span>

                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">

                                                    <CalendarDays
                                                        size={14}
                                                    />

                                                    <span>
                                                        Published{" "}
                                                        {formatDate(
                                                            announcement.published_at
                                                        )}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                        {announcement.disaster_id && (

                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                Disaster #{announcement.disaster_id}
                                            </span>

                                        )}

                                    </div>


                                    <div className="mt-5 rounded-xl bg-slate-50 p-4">

                                        <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                                            {announcement.message}
                                        </p>

                                    </div>


                                    <div className="mt-5 flex items-center justify-end">

                                        <button
                                            type="button"
                                            className="flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                                        >

                                            View announcement

                                            <ChevronRight
                                                size={17}
                                            />

                                        </button>

                                    </div>

                                </article>
                            );
                        }
                    )}

                </div>
            )}

        </div>
    );
};


export default Announcements;
