import {
    ArrowRight,
    Brain,
    Clock,
    Loader2,
    Play,
    Shield,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    getSimulations,
} from "../../api/simulations";

import type {
    Simulation,
} from "../../types/simulation";


const StudentSimulations = () => {

    const navigate = useNavigate();


    const [
        simulations,
        setSimulations,
    ] = useState<Simulation[]>([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState<string | null>(null);


    useEffect(() => {

        const loadSimulations =
            async () => {

                try {

                    setLoading(true);
                    setError(null);

                    const data =
                        await getSimulations();

                    setSimulations(data);

                } catch (err) {

                    console.error(
                        "Failed to load simulations:",
                        err
                    );

                    setError(
                        "Unable to load simulations."
                    );

                } finally {

                    setLoading(false);

                }

            };


        loadSimulations();

    }, []);


    if (loading) {

        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="flex items-center gap-3 text-slate-500">

                    <Loader2
                        size={24}
                        className="animate-spin"
                    />

                    Loading simulations...

                </div>

            </div>
        );

    }


    return (
        <div className="p-6 lg:p-8">

            <div className="mx-auto max-w-6xl">

                {/* Header */}

                <div className="mb-8">

                    <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">

                            <Brain
                                size={28}
                                className="text-orange-600"
                            />

                        </div>

                        <div>

                            <h1 className="text-3xl font-bold text-slate-900">
                                Simulations
                            </h1>

                            <p className="mt-1 text-slate-500">
                                Practice making decisions during disaster situations.
                            </p>

                        </div>

                    </div>

                </div>


                {/* Error */}

                {error && (

                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                        {error}

                    </div>

                )}


                {/* Empty */}

                {!error &&
                    simulations.length === 0 && (

                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

                            <Shield
                                size={48}
                                className="mx-auto text-slate-300"
                            />

                            <h2 className="mt-4 text-xl font-bold text-slate-800">
                                No simulations available
                            </h2>

                            <p className="mt-2 text-slate-500">
                                New disaster simulations will appear here when published.
                            </p>

                        </div>

                    )}


                {/* Simulation cards */}

                <div className="grid gap-6 lg:grid-cols-2">

                    {simulations.map(
                        (simulation) => (

                            <div
                                key={
                                    simulation.id
                                }
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >

                                <div className="flex items-start justify-between">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">

                                        <Brain
                                            size={24}
                                            className="text-orange-600"
                                        />

                                    </div>


                                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">

                                        Published

                                    </span>

                                </div>


                                <h2 className="mt-6 text-xl font-bold text-slate-900">

                                    {simulation.title}

                                </h2>


                                <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">

                                    {simulation.description ||
                                        "Practice your decision-making skills during an emergency."}

                                </p>


                                <div className="mt-6 flex flex-wrap gap-3">

                                    <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">

                                        <Brain
                                            size={16}
                                        />

                                        Simulation

                                    </span>


                                    <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">

                                        <Clock
                                            size={16}
                                        />

                                        Scenario Based

                                    </span>


                                    <span className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">

                                        {simulation.difficulty}

                                    </span>

                                </div>


                                <div className="mt-6 border-t border-slate-100 pt-5">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/student/simulations/${simulation.id}`
                                            )
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                                    >

                                        <Play
                                            size={18}
                                        />

                                        Start Simulation

                                        <ArrowRight
                                            size={18}
                                        />

                                    </button>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </div>

        </div>
    );
};


export default StudentSimulations;