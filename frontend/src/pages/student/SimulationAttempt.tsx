import {
    ArrowLeft,
    ArrowRight,
    Brain,
    CheckCircle2,
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
    getSimulation,
    submitSimulation,
} from "../../api/simulations";

import type {
    SimulationDetail,
    SimulationResult,
} from "../../types/simulation";


const SimulationAttempt = () => {

    const {
        simulationId,
    } = useParams<{
        simulationId: string;
    }>();


    const navigate =
        useNavigate();


    const [
        simulation,
        setSimulation,
    ] = useState<SimulationDetail | null>(
        null
    );


    const [
        currentScenario,
        setCurrentScenario,
    ] = useState(0);


    const [
        answers,
        setAnswers,
    ] = useState<Record<number, string>>({});


    const [
        result,
        setResult,
    ] = useState<SimulationResult | null>(
        null
    );


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
     * Load Simulation
     * =========================
     */

    useEffect(() => {

        const loadSimulation =
            async () => {

                if (!simulationId) {

                    setError(
                        "Invalid simulation."
                    );

                    setLoading(false);

                    return;

                }


                try {

                    const data =
                        await getSimulation(
                            Number(simulationId)
                        );

                    setSimulation(
                        data
                    );

                } catch (err) {

                    console.error(
                        "Failed to load simulation:",
                        err
                    );

                    setError(
                        "Unable to load this simulation."
                    );

                } finally {

                    setLoading(false);

                }

            };


        loadSimulation();

    }, [simulationId]);


    /*
     * =========================
     * Current Scenario
     * =========================
     */

    const scenario =
        simulation?.scenarios[
            currentScenario
        ];


    /*
     * =========================
     * Choices
     * =========================
     */

    const choices =
        useMemo(() => {

            if (!scenario) {

                return [];

            }

            return scenario.choices
                .split(",")
                .map(
                    (choice) =>
                        choice.trim()
                )
                .filter(Boolean);

        }, [scenario]);


    /*
     * =========================
     * Answer
     * =========================
     */

    const selectChoice = (
        scenarioId: number,
        choice: string
    ) => {

        setAnswers(
            (previous) => ({
                ...previous,
                [scenarioId]:
                    choice,
            })
        );

    };


    /*
     * =========================
     * Submit
     * =========================
     */

    const handleSubmit =
        async () => {

            if (
                !simulation ||
                submitting
            ) {

                return;

            }


            try {

                setSubmitting(true);
                setError(null);


                const decisions =
                    simulation.scenarios.map(
                        (item) => ({
                            scenario_id:
                                item.id,

                            selected_choice:
                                answers[
                                    item.id
                                ] ?? "",
                        })
                    );


                const data =
                    await submitSimulation(
                        simulation.id,
                        {
                            decisions,
                        }
                    );


                setResult(
                    data
                );

            } catch (err) {

                console.error(
                    "Failed to submit simulation:",
                    err
                );

                setError(
                    "Unable to submit the simulation."
                );

            } finally {

                setSubmitting(false);

            }

        };


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

                    Loading simulation...

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
        !simulation
    ) {

        return (
            <div className="p-8">

                <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6">

                    <h2 className="font-bold text-red-800">
                        Simulation unavailable
                    </h2>

                    <p className="mt-2 text-sm text-red-600">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/student/simulations"
                            )
                        }
                        className="mt-5 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
                    >
                        Back to Simulations
                    </button>

                </div>

            </div>
        );

    }


    /*
     * =========================
     * Result
     * =========================
     */

    if (result) {

        return (
            <div className="p-6 lg:p-8">

                <div className="mx-auto max-w-2xl">

                    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">

                            <Trophy
                                size={40}
                                className="text-orange-500"
                            />

                        </div>


                        <h1 className="mt-6 text-3xl font-bold text-slate-900">
                            Simulation Complete
                        </h1>


                        <p className="mt-2 text-slate-500">
                            You have completed the emergency response simulation.
                        </p>


                        <div className="mt-8 rounded-2xl bg-slate-50 p-6">

                            <p className="text-sm text-slate-500">
                                Your Score
                            </p>

                            <p className="mt-2 text-5xl font-bold text-orange-500">

                                {result.percentage}%

                            </p>

                            <p className="mt-2 text-sm text-slate-500">

                                {result.score}
                                {" / "}
                                {result.max_score}
                                {" points"}

                            </p>

                        </div>


                        <div className="mt-6 grid grid-cols-2 gap-4">

                            <div className="rounded-xl border border-slate-200 p-4">

                                <p className="text-xs text-slate-500">
                                    Scenarios
                                </p>

                                <p className="mt-1 text-lg font-bold text-slate-800">

                                    {result.responses_saved}

                                </p>

                            </div>


                            <div className="rounded-xl border border-slate-200 p-4">

                                <p className="text-xs text-slate-500">
                                    Status
                                </p>

                                <p className="mt-1 text-lg font-bold text-green-600">
                                    Completed
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/student/simulations"
                                )
                            }
                            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                        >

                            Back to Simulations

                            <ArrowRight
                                size={18}
                            />

                        </button>

                    </div>

                </div>

            </div>
        );

    }


    if (
        !simulation ||
        !scenario
    ) {

        return null;

    }


    const selected =
        answers[
            scenario.id
        ];


    const answeredCount =
        Object.keys(
            answers
        ).length;


    return (
        <div className="p-6 lg:p-8">

            <div className="mx-auto max-w-4xl">

                {/* Header */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/student/simulations"
                        )
                    }
                    className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-600"
                >

                    <ArrowLeft
                        size={17}
                    />

                    Back to Simulations

                </button>


                <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-sm">

                    <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">

                            <Brain
                                size={25}
                            />

                        </div>

                        <div>

                            <p className="text-sm font-medium text-white/80">
                                Emergency Simulation
                            </p>

                            <h1 className="text-2xl font-bold">
                                {simulation.title}
                            </h1>

                        </div>

                    </div>

                </div>


                {/* Progress */}

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-semibold text-slate-700">
                                Scenario Progress
                            </p>

                            <p className="mt-1 text-xs text-slate-500">

                                {answeredCount}
                                {" of "}
                                {simulation.scenarios.length}
                                {" answered"}

                            </p>

                        </div>


                        <span className="text-sm font-bold text-orange-600">

                            {currentScenario + 1}
                            {" / "}
                            {simulation.scenarios.length}

                        </span>

                    </div>


                    <div className="mt-3 h-2 rounded-full bg-slate-100">

                        <div
                            className="h-full rounded-full bg-orange-500 transition-all"
                            style={{
                                width: `${
                                    (
                                        (
                                            currentScenario +
                                            1
                                        ) /
                                        simulation.scenarios.length
                                    ) *
                                    100
                                }%`,
                            }}
                        />

                    </div>

                </div>


                {/* Scenario navigation */}

                <div className="mt-6 flex flex-wrap gap-2">

                    {simulation.scenarios.map(
                        (
                            item,
                            index
                        ) => (

                            <button
                                key={
                                    item.id
                                }
                                type="button"
                                onClick={() =>
                                    setCurrentScenario(
                                        index
                                    )
                                }
                                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold ${
                                    index ===
                                    currentScenario
                                        ? "bg-orange-500 text-white"
                                        : answers[
                                            item.id
                                        ]
                                            ? "bg-green-100 text-green-700"
                                            : "border border-slate-200 bg-white text-slate-600"
                                }`}
                            >

                                {index + 1}

                            </button>

                        )
                    )}

                </div>


                {/* Scenario */}

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                    <div className="flex items-center justify-between">

                        <span className="text-sm font-semibold text-orange-600">

                            Scenario{" "}
                            {currentScenario + 1}

                        </span>


                        <span className="text-sm text-slate-500">

                            {scenario.points}
                            {" "}
                            {scenario.points === 1
                                ? "point"
                                : "points"}

                        </span>

                    </div>


                    <h2 className="mt-5 text-xl font-bold leading-8 text-slate-900">

                        {scenario.situation}

                    </h2>


                    {/* Choices */}

                    <div className="mt-7 space-y-3">

                        {choices.map(
                            (
                                choice,
                                index
                            ) => {

                                const isSelected =
                                    selected ===
                                    choice;


                                return (
                                    <button
                                        key={
                                            `${scenario.id}-${choice}`
                                        }
                                        type="button"
                                        onClick={() =>
                                            selectChoice(
                                                scenario.id,
                                                choice
                                            )
                                        }
                                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                                            isSelected
                                                ? "border-orange-500 bg-orange-50"
                                                : "border-slate-200 hover:border-orange-300 hover:bg-slate-50"
                                        }`}
                                    >

                                        <span
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                                isSelected
                                                    ? "bg-orange-500 text-white"
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
                                                isSelected
                                                    ? "text-orange-800"
                                                    : "text-slate-700"
                                            }`}
                                        >

                                            {choice}

                                        </span>


                                        {isSelected && (

                                            <CheckCircle2
                                                size={20}
                                                className="text-orange-500"
                                            />

                                        )}

                                    </button>
                                );

                            }
                        )}

                    </div>


                    {error && (

                        <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">

                            {error}

                        </div>

                    )}


                    {/* Navigation */}

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">

                        <button
                            type="button"
                            disabled={
                                currentScenario ===
                                0
                            }
                            onClick={() =>
                                setCurrentScenario(
                                    (previous) =>
                                        Math.max(
                                            0,
                                            previous - 1
                                        )
                                )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 disabled:opacity-40"
                        >

                            <ArrowLeft
                                size={17}
                            />

                            Previous

                        </button>


                        {currentScenario <
                        simulation.scenarios.length - 1 ? (

                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentScenario(
                                        (previous) =>
                                            Math.min(
                                                simulation.scenarios.length - 1,
                                                previous + 1
                                            )
                                    )
                                }
                                className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
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
                                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
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
                                        Complete Simulation

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


export default SimulationAttempt;

