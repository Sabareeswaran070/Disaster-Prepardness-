import {
    AlertTriangle,
    ChevronDown,
    Phone,
    ShieldAlert,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getEmergencies,
} from "../../api/emergency";

import {
    getDisasters,
} from "../../api/disasters";

import type {
    Emergency as EmergencyResource,
} from "../../types/emergency";

import type {
    Disaster,
} from "../../types/disaster";


const Emergency = () => {

    const [
        disasters,
        setDisasters,
    ] = useState<Disaster[]>([]);


    const [
        selectedDisasterId,
        setSelectedDisasterId,
    ] = useState<number | "all">("all");


    const [
        emergencies,
        setEmergencies,
    ] = useState<EmergencyResource[]>([]);


    const [
        loadingDisasters,
        setLoadingDisasters,
    ] = useState(true);


    const [
        loadingEmergencies,
        setLoadingEmergencies,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState<string | null>(null);


    /*
     * =========================
     * Load disasters
     * =========================
     */

    useEffect(() => {

        const loadDisasters =
            async () => {

                try {

                    setLoadingDisasters(true);
                    setError(null);

                    const data =
                        await getDisasters();

                    setDisasters(data);

                } catch (err) {

                    console.error(
                        "Failed to load disasters:",
                        err
                    );

                    setError(
                        "Unable to load disasters. Please try again."
                    );

                } finally {

                    setLoadingDisasters(false);

                }
            };


        loadDisasters();

    }, []);


    /*
     * =========================
     * Load emergency resources
     * =========================
     */

    useEffect(() => {

        const loadEmergencies =
            async () => {

                try {

                    setLoadingEmergencies(true);
                    setError(null);

                    const data =
                        await getEmergencies(
                            selectedDisasterId === "all"
                                ? undefined
                                : selectedDisasterId
                        );

                    setEmergencies(data);

                } catch (err) {

                    console.error(
                        "Failed to load emergency resources:",
                        err
                    );

                    setEmergencies([]);

                    setError(
                        "Unable to load emergency resources. Please try again."
                    );

                } finally {

                    setLoadingEmergencies(false);

                }
            };


        loadEmergencies();

    }, [
        selectedDisasterId,
    ]);


    /*
     * =========================
     * Group resources
     * =========================
     */

    const categories =
        useMemo(() => {

            return Array.from(
                new Set(
                    emergencies.map(
                        (item) =>
                            item.category
                    )
                )
            );

        }, [
            emergencies,
        ]);


    const groupedEmergencies =
        useMemo(() => {

            return categories.map(
                (category) => ({

                    category,

                    resources:
                        emergencies.filter(
                            (item) =>
                                item.category ===
                                category
                        ),

                })
            );

        }, [
            categories,
            emergencies,
        ]);


    /*
     * =========================
     * Loading
     * =========================
     */

    if (
        loadingDisasters ||
        loadingEmergencies
    ) {

        return (
            <div className="p-6 lg:p-8">

                <div className="animate-pulse">

                    <div className="h-10 w-72 rounded-lg bg-slate-200" />

                    <div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-200" />

                    <div className="mt-8 h-24 rounded-2xl bg-slate-100" />

                    <div className="mt-8 h-24 rounded-2xl bg-slate-100" />

                    <div className="mt-8 grid gap-5 md:grid-cols-2">

                        {[1, 2, 3, 4].map(
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


    /*
     * =========================
     * Error
     * =========================
     */

    if (error) {

        return (
            <div className="p-6 lg:p-8">

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

                    <div className="flex items-start gap-4">

                        <div className="rounded-xl bg-red-100 p-3">

                            <AlertTriangle
                                className="text-red-600"
                                size={24}
                            />

                        </div>

                        <div>

                            <h1 className="text-lg font-bold text-red-900">
                                Emergency resources unavailable
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

                <div className="rounded-2xl bg-red-100 p-4">

                    <ShieldAlert
                        size={32}
                        className="text-red-600"
                    />

                </div>

                <div>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Emergency
                    </h1>

                    <p className="mt-1 text-slate-500">
                        Important emergency resources and contact information.
                    </p>

                </div>

            </div>


            {/* =========================
                Warning
            ========================= */}

            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">

                <div className="flex items-start gap-4">

                    <AlertTriangle
                        size={24}
                        className="mt-0.5 shrink-0 text-red-600"
                    />

                    <div>

                        <h2 className="font-bold text-red-900">
                            Emergency situation?
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-red-800">
                            If you are in immediate danger, move to a safer
                            location and follow the appropriate disaster
                            safety procedures.
                        </p>

                        <p className="mt-2 text-sm font-semibold text-red-800">
                            Use the contact information below when appropriate.
                        </p>

                    </div>

                </div>

            </div>


            {/* =========================
                Disaster Selector
            ========================= */}

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <label
                    htmlFor="disaster-select"
                    className="block text-sm font-semibold text-slate-700"
                >
                    Disaster
                </label>

                <div className="relative mt-2">

                    <select
                        id="disaster-select"
                        value={selectedDisasterId}
                        onChange={(event) => {

                            const value =
                                event.target.value;

                            setSelectedDisasterId(
                                value === "all"
                                    ? "all"
                                    : Number(value)
                            );

                        }}
                        className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >

                        <option value="all">
                            All disasters
                        </option>

                        {disasters.map(
                            (disaster) => (

                                <option
                                    key={disaster.id}
                                    value={disaster.id}
                                >
                                    {disaster.name}
                                </option>

                            )
                        )}

                    </select>

                    <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                </div>

                {selectedDisasterId !== "all" && (

                    <p className="mt-2 text-xs text-slate-500">
                        Showing emergency resources for the selected disaster.
                    </p>

                )}

            </div>


            {/* =========================
                Empty state
            ========================= */}

            {emergencies.length === 0 && (

                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                    <ShieldAlert
                        size={42}
                        className="mx-auto text-slate-300"
                    />

                    <h2 className="mt-4 text-xl font-bold text-slate-800">
                        No emergency resources available
                    </h2>

                    <p className="mt-2 text-slate-500">

                        {selectedDisasterId === "all"
                            ? "Emergency resources have not been added yet."
                            : "No emergency resources have been added for this disaster yet."
                        }

                    </p>

                </div>

            )}


            {/* =========================
                Resources
            ========================= */}

            {groupedEmergencies.map(
                ({
                    category,
                    resources,
                }) => (

                    <section
                        key={category}
                        className="mt-8"
                    >

                        <div className="mb-4">

                            <h2 className="text-xl font-bold text-slate-900">
                                {category}
                            </h2>

                        </div>


                        <div className="grid gap-5 md:grid-cols-2">

                            {resources.map(
                                (resource) => (

                                    <article
                                        key={resource.id}
                                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                    >

                                        <div className="flex items-start justify-between gap-4">

                                            <div className="flex items-start gap-3">

                                                <div className="rounded-xl bg-red-50 p-3">

                                                    <Phone
                                                        size={22}
                                                        className="text-red-600"
                                                    />

                                                </div>

                                                <div>

                                                    <h3 className="text-lg font-bold text-slate-900">
                                                        {resource.name}
                                                    </h3>

                                                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        {resource.category}
                                                    </p>

                                                </div>

                                            </div>

                                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                                Available
                                            </span>

                                        </div>


                                        {resource.description && (

                                            <p className="mt-5 text-sm leading-6 text-slate-600">
                                                {resource.description}
                                            </p>

                                        )}


                                        {resource.phone && (

                                            <a
                                                href={`tel:${resource.phone}`}
                                                className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
                                            >

                                                <Phone
                                                    size={18}
                                                />

                                                Call{" "}
                                                {resource.phone}

                                            </a>

                                        )}

                                    </article>

                                )
                            )}

                        </div>

                    </section>

                )
            )}

        </div>
    );
};


export default Emergency;
