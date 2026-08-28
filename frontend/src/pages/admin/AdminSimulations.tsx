import {
    Brain,
    Check,
    Edit,
    Loader2,
    Plus,
    Power,
    Trash2,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    getAdminSimulations,
    getAdminSimulation,
    createSimulation,
    updateSimulation,
    addScenario,
    publishSimulation,
    unpublishSimulation,
    deleteSimulation,
} from "../../api/simulations";

import {
    getDisasters,
} from "../../api/disasters";

import type {
    Simulation,
    SimulationDetail,
    SimulationCreate,
    SimulationUpdate,
} from "../../types/simulation";

import type {
    Disaster,
} from "../../types/disaster";


// ============================================================
// TYPES
// ============================================================

interface SimulationForm {
    disaster_id: string;
    title: string;
    description: string;
    difficulty: string;
}

interface ScenarioForm {
    situation: string;
    choices: string;
    correct_choice: string;
    explanation: string;
    points: string;
}


// ============================================================
// EMPTY FORMS
// ============================================================

const emptySimulationForm: SimulationForm = {
    disaster_id: "",
    title: "",
    description: "",
    difficulty: "BEGINNER",
};

const emptyScenarioForm: ScenarioForm = {
    situation: "",
    choices: "",
    correct_choice: "",
    explanation: "",
    points: "1",
};


// ============================================================
// COMPONENT
// ============================================================

const AdminSimulations = () => {

    const [
        simulations,
        setSimulations,
    ] = useState<Simulation[]>([]);

    const [
        disasters,
        setDisasters,
    ] = useState<Disaster[]>([]);

    const [
        selectedDisaster,
        setSelectedDisaster,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        savingScenario,
        setSavingScenario,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        success,
        setSuccess,
    ] = useState("");

    const [
        showForm,
        setShowForm,
    ] = useState(false);

    const [
        editingSimulation,
        setEditingSimulation,
    ] = useState<Simulation | null>(null);

    const [
        simulationDetail,
        setSimulationDetail,
    ] = useState<SimulationDetail | null>(null);

    const [
        form,
        setForm,
    ] = useState<SimulationForm>(
        emptySimulationForm
    );

    const [
        scenarioForm,
        setScenarioForm,
    ] = useState<ScenarioForm>(
        emptyScenarioForm
    );


    // ============================================================
    // LOAD DATA
    // ============================================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const disasterId =
                selectedDisaster
                    ? Number(selectedDisaster)
                    : undefined;

            const [
                simulationData,
                disasterData,
            ] = await Promise.all([
                getAdminSimulations(disasterId),
                getDisasters(),
            ]);

            setSimulations(
                simulationData
            );

            setDisasters(
                disasterData
            );

        } catch (err) {

            console.error(
                "Failed to load simulations:",
                err
            );

            setError(
                "Failed to load simulations."
            );

        } finally {

            setLoading(false);
        }
    };


    // ============================================================
    // LOAD SIMULATION DETAIL
    // ============================================================

    const loadSimulationDetail = async (
        simulationId: number
    ) => {

        try {

            const detail =
                await getAdminSimulation(
                    simulationId
                );

            setSimulationDetail(
                detail
            );

            return detail;

        } catch (err) {

            console.error(
                "Failed to load simulation detail:",
                err
            );

            setError(
                "Failed to load simulation details."
            );

            return null;
        }
    };


    // ============================================================
    // INITIAL LOAD / FILTER
    // ============================================================

    useEffect(() => {

        loadData();

    }, [selectedDisaster]);


    // ============================================================
    // OPEN CREATE
    // ============================================================

    const openCreate = () => {

        setEditingSimulation(null);

        setSimulationDetail(null);

        setForm({
            ...emptySimulationForm,
        });

        setScenarioForm({
            ...emptyScenarioForm,
        });

        setError("");
        setSuccess("");

        setShowForm(true);

        window.setTimeout(() => {

            document
                .getElementById("simulation-form")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

        }, 50);
    };


    // ============================================================
    // OPEN EDIT
    // ============================================================

    const openEdit = async (
        simulation: Simulation
    ) => {

        if (simulation.is_published) {

            setError(
                "Published simulations cannot be edited."
            );

            return;
        }

        setEditingSimulation(
            simulation
        );

        setForm({
            disaster_id:
                String(
                    simulation.disaster_id
                ),

            title:
                simulation.title,

            description:
                simulation.description ?? "",

            difficulty:
                simulation.difficulty,
        });

        setScenarioForm({
            ...emptyScenarioForm,
        });

        setError("");
        setSuccess("");

        setShowForm(true);

        await loadSimulationDetail(
            simulation.id
        );

        window.setTimeout(() => {

            document
                .getElementById("simulation-form")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

        }, 50);
    };


    // ============================================================
    // CLOSE FORM
    // ============================================================

    const closeForm = () => {

        if (
            saving ||
            savingScenario
        ) {
            return;
        }

        setShowForm(false);

        setEditingSimulation(null);

        setSimulationDetail(null);

        setForm({
            ...emptySimulationForm,
        });

        setScenarioForm({
            ...emptyScenarioForm,
        });

        setError("");
        setSuccess("");
    };


    // ============================================================
    // SIMULATION FORM CHANGE
    // ============================================================

    const handleSimulationChange = (
        field: keyof SimulationForm,
        value: string
    ) => {

        setForm(
            previous => ({
                ...previous,
                [field]: value,
            })
        );
    };


    // ============================================================
    // SCENARIO FORM CHANGE
    // ============================================================

    const handleScenarioChange = (
        field: keyof ScenarioForm,
        value: string
    ) => {

        setScenarioForm(
            previous => ({
                ...previous,
                [field]: value,
            })
        );
    };


    // ============================================================
    // SAVE SIMULATION
    // ============================================================

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
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
                "Simulation title is required."
            );

            return;
        }

        try {

            setSaving(true);

            setError("");
            setSuccess("");

            // ====================================================
            // UPDATE
            // ====================================================

            if (editingSimulation) {

                const data: SimulationUpdate = {

                    title:
                        form.title.trim(),

                    description:
                        form.description.trim()
                        || null,

                    difficulty:
                        form.difficulty,
                };

                const updated =
                    await updateSimulation(
                        editingSimulation.id,
                        data
                    );

                setEditingSimulation(
                    updated
                );

                await loadSimulationDetail(
                    updated.id
                );

                setSuccess(
                    "Simulation updated successfully."
                );
            }

            // ====================================================
            // CREATE
            // ====================================================

            else {

                const data: SimulationCreate = {

                    disaster_id:
                        Number(
                            form.disaster_id
                        ),

                    title:
                        form.title.trim(),

                    description:
                        form.description.trim()
                        || null,

                    difficulty:
                        form.difficulty,
                };

                const created =
                    await createSimulation(
                        data
                    );

                // IMPORTANT:
                // Keep the form open after creation.
                // The user must now add scenarios.

                setEditingSimulation(
                    created
                );

                setForm({
                    disaster_id:
                        String(
                            created.disaster_id
                        ),

                    title:
                        created.title,

                    description:
                        created.description ?? "",

                    difficulty:
                        created.difficulty,
                });

                const detail =
                    await getAdminSimulation(
                        created.id
                    );

                setSimulationDetail(
                    detail
                );

                setSuccess(
                    "Simulation created. Now add at least one scenario before publishing."
                );
            }

            await loadData();

        } catch (err) {

            console.error(
                "Failed to save simulation:",
                err
            );

            setError(
                "Failed to save simulation."
            );

        } finally {

            setSaving(false);
        }
    };


    // ============================================================
    // ADD SCENARIO
    // ============================================================

    const handleAddScenario = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        if (!editingSimulation) {

            setError(
                "Create the simulation first."
            );

            return;
        }

        if (!scenarioForm.situation.trim()) {

            setError(
                "Scenario situation is required."
            );

            return;
        }

        if (!scenarioForm.choices.trim()) {

            setError(
                "Please enter the scenario choices."
            );

            return;
        }

        if (!scenarioForm.correct_choice.trim()) {

            setError(
                "Correct choice is required."
            );

            return;
        }

        // --------------------------------------------------------
        // Choices are entered one per line.
        // Example:
        //
        // Evacuate immediately
        // Stay inside
        // Use elevator
        // --------------------------------------------------------

        const choices = scenarioForm.choices
            .split("\n")
            .map(choice => choice.trim())
            .filter(Boolean);

        if (choices.length < 2) {

            setError(
                "Please enter at least two choices, one per line."
            );

            return;
        }

        const correctChoice =
            scenarioForm.correct_choice.trim();
        console.log("DEBUG choices:", choices);
        console.log(
            "DEBUG correctChoice:",
            JSON.stringify(correctChoice)
        );

        const matchingChoice =
            choices.find(
                choice =>
                    choice.trim().toLowerCase() ===
                    correctChoice.trim().toLowerCase()
            );

        if (!matchingChoice) {

            setError(
                "Correct choice must exactly match one of the choices."
            );

            return;
        }

        const points =
            Number(
                scenarioForm.points
            );

        if (
            !Number.isInteger(points) ||
            points < 1
        ) {

            setError(
                "Points must be a positive whole number."
            );

            return;
        }

        try {

            setSavingScenario(true);

            setError("");
            setSuccess("");

            const existingScenarios =
                simulationDetail?.scenarios ?? [];

            const nextOrder =
                existingScenarios.length > 0
                    ? Math.max(
                        ...existingScenarios.map(
                            scenario =>
                                scenario.scenario_order
                        )
                    ) + 1
                    : 1;

            await addScenario(
                editingSimulation.id,
                {
                    scenario_order:
                        nextOrder,

                    situation:
                        scenarioForm.situation.trim(),

                    choices:
                        choices.join("\n"),

                    correct_choice:
                        matchingChoice,

                    explanation:
                        scenarioForm.explanation.trim()
                        || null,

                    points,
                }
            );

            const detail =
                await loadSimulationDetail(
                    editingSimulation.id
                );

            setSimulationDetail(
                detail
            );

            setScenarioForm({
                ...emptyScenarioForm,
            });

            setSuccess(
                `Scenario ${nextOrder} added successfully.`
            );

            await loadData();

        } catch (err) {

            console.error(
                "Failed to add scenario:",
                err
            );

            setError(
                "Failed to add scenario."
            );

        } finally {

            setSavingScenario(false);
        }
    };


    // ============================================================
    // PUBLISH
    // ============================================================

    const handlePublish = async (
        simulation: Simulation
    ) => {

        try {

            setError("");
            setSuccess("");

            // ----------------------------------------------------
            // FIRST FETCH THE REAL SCENARIOS
            // ----------------------------------------------------

            const detail =
                await getAdminSimulation(
                    simulation.id
                );

            if (
                !detail.scenarios ||
                detail.scenarios.length === 0
            ) {

                setError(
                    "Cannot publish this simulation. Add at least one scenario first."
                );

                // Open editor so user can add scenario
                await openEdit(
                    simulation
                );

                return;
            }

            await publishSimulation(
                simulation.id
            );

            setSuccess(
                "Simulation published successfully."
            );

            await loadData();

        } catch (err) {

            console.error(
                "Failed to publish simulation:",
                err
            );

            setError(
                "Failed to publish simulation."
            );
        }
    };


    // ============================================================
    // UNPUBLISH
    // ============================================================

    const handleUnpublish = async (
        simulation: Simulation
    ) => {

        try {

            setError("");
            setSuccess("");

            await unpublishSimulation(
                simulation.id
            );

            setSuccess(
                "Simulation unpublished successfully."
            );

            await loadData();

        } catch (err) {

            console.error(
                "Failed to unpublish simulation:",
                err
            );

            setError(
                "Failed to unpublish simulation."
            );
        }
    };


    // ============================================================
    // DELETE
    // ============================================================

    const handleDelete = async (
        simulation: Simulation
    ) => {

        const confirmed =
            window.confirm(
                `Delete "${simulation.title}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setError("");
            setSuccess("");

            await deleteSimulation(
                simulation.id
            );

            if (
                editingSimulation?.id ===
                simulation.id
            ) {
                closeForm();
            }

            setSuccess(
                "Simulation deleted successfully."
            );

            await loadData();

        } catch (err) {

            console.error(
                "Failed to delete simulation:",
                err
            );

            setError(
                "Failed to delete simulation."
            );
        }
    };


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="p-6 lg:p-8">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <div className="flex items-center gap-3">

                        <Brain
                            className="text-blue-600"
                            size={30}
                        />

                        <h1 className="text-3xl font-bold text-slate-900">
                            Simulations
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Create and manage disaster simulation exercises.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700"
                >

                    <Plus size={18} />

                    Create Simulation

                </button>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="mb-5 flex items-start justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                    >
                        <X size={17} />
                    </button>

                </div>
            )}


            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (

                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>

            )}


            {/* ==================================================
                CREATE / EDIT FORM
            ================================================== */}

            {showForm && (

                <div
                    id="simulation-form"
                    className="mb-8 border-b border-slate-300 pb-8"
                >

                    <div className="mb-6">

                        <h2 className="text-xl font-bold text-slate-900">

                            {editingSimulation
                                ? "Edit Simulation"
                                : "Create Simulation"}

                        </h2>

                        <p className="mt-1 text-sm text-slate-500">

                            {editingSimulation
                                ? "Update the simulation and manage its scenarios."
                                : "Create a new disaster simulation exercise."}

                        </p>

                    </div>


                    {/* ==================================================
                        SIMULATION DETAILS
                    ================================================== */}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* DISASTER */}

                        <div>

                            <label
                                htmlFor="simulation-disaster"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Disaster
                            </label>

                            <select
                                id="simulation-disaster"
                                value={form.disaster_id}
                                onChange={event =>
                                    handleSimulationChange(
                                        "disaster_id",
                                        event.target.value
                                    )
                                }
                                disabled={
                                    !!editingSimulation ||
                                    saving ||
                                    savingScenario
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                            >

                                <option value="">
                                    Select disaster
                                </option>

                                {disasters.map(
                                    disaster => (

                                        <option
                                            key={disaster.id}
                                            value={disaster.id}
                                        >
                                            {disaster.name}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* TITLE */}

                        <div>

                            <label
                                htmlFor="simulation-title"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Title
                            </label>

                            <input
                                id="simulation-title"
                                type="text"
                                value={form.title}
                                onChange={event =>
                                    handleSimulationChange(
                                        "title",
                                        event.target.value
                                    )
                                }
                                placeholder="Enter simulation title"
                                disabled={
                                    saving ||
                                    savingScenario
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                            />

                        </div>


                        {/* DESCRIPTION */}

                        <div>

                            <label
                                htmlFor="simulation-description"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Description
                            </label>

                            <textarea
                                id="simulation-description"
                                value={form.description}
                                onChange={event =>
                                    handleSimulationChange(
                                        "description",
                                        event.target.value
                                    )
                                }
                                rows={4}
                                placeholder="Describe the simulation"
                                disabled={
                                    saving ||
                                    savingScenario
                                }
                                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                            />

                        </div>


                        {/* DIFFICULTY */}

                        <div>

                            <label
                                htmlFor="simulation-difficulty"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Difficulty
                            </label>

                            <select
                                id="simulation-difficulty"
                                value={form.difficulty}
                                onChange={event =>
                                    handleSimulationChange(
                                        "difficulty",
                                        event.target.value
                                    )
                                }
                                disabled={
                                    saving ||
                                    savingScenario
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
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


                        {/* SIMULATION BUTTONS */}

                        <div className="flex justify-end gap-3 pt-3">

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={
                                    saving ||
                                    savingScenario
                                }
                                className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                                Close
                            </button>


                            <button
                                type="submit"
                                disabled={
                                    saving ||
                                    savingScenario
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {saving && (
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                )}

                                {editingSimulation
                                    ? "Update Simulation"
                                    : "Create Simulation"}

                            </button>

                        </div>

                    </form>


                    {/* ==================================================
                        SCENARIO SECTION
                    ================================================== */}

                    {editingSimulation && (

                        <div className="mt-10 border-t border-slate-200 pt-8">

                            <div className="mb-6">

                                <h2 className="text-xl font-bold text-slate-900">
                                    Scenarios
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Add decision-making situations to this simulation.
                                    At least one scenario is required before publishing.
                                </p>

                            </div>


                            {/* ==================================================
                                EXISTING SCENARIOS
                            ================================================== */}

                            {simulationDetail &&
                                simulationDetail.scenarios.length > 0 && (

                                    <div className="mb-8 space-y-4">

                                        {simulationDetail.scenarios
                                            .slice()
                                            .sort(
                                                (
                                                    a,
                                                    b
                                                ) =>
                                                    a.scenario_order -
                                                    b.scenario_order
                                            )
                                            .map(
                                                scenario => (

                                                    <div
                                                        key={scenario.id}
                                                        className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                                                    >

                                                        <div className="mb-3 flex items-center justify-between">

                                                            <div className="flex items-center gap-3">

                                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                                                    {scenario.scenario_order}
                                                                </span>

                                                                <h3 className="font-semibold text-slate-900">
                                                                    Scenario {scenario.scenario_order}
                                                                </h3>

                                                            </div>

                                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                                                                {scenario.points} point
                                                                {scenario.points !== 1
                                                                    ? "s"
                                                                    : ""}
                                                            </span>

                                                        </div>


                                                        <p className="whitespace-pre-wrap text-sm text-slate-700">
                                                            {scenario.situation}
                                                        </p>


                                                        <div className="mt-4">

                                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                Choices
                                                            </p>

                                                            <div className="space-y-1">

                                                                {scenario.choices
                                                                    .split("\n")
                                                                    .map(
                                                                        (
                                                                            choice,
                                                                            index
                                                                        ) => (

                                                                            <div
                                                                                key={index}
                                                                                className="rounded-md bg-white px-3 py-2 text-sm text-slate-700"
                                                                            >
                                                                                {choice}
                                                                            </div>

                                                                        )
                                                                    )}

                                                            </div>

                                                        </div>


                                                        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">

                                                            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                                                Correct Choice
                                                            </p>

                                                            <p className="mt-1 text-sm font-semibold text-green-800">
                                                                {scenario.correct_choice}
                                                            </p>

                                                        </div>


                                                        {scenario.explanation && (

                                                            <div className="mt-3">

                                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                    Explanation
                                                                </p>

                                                                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                                                                    {scenario.explanation}
                                                                </p>

                                                            </div>

                                                        )}

                                                    </div>

                                                )
                                            )}

                                    </div>

                                )}


                            {/* ==================================================
                                ADD SCENARIO FORM
                            ================================================== */}

                            <form
                                onSubmit={handleAddScenario}
                                className="space-y-5"
                            >

                                <div>

                                    <h3 className="mb-4 text-lg font-semibold text-slate-900">
                                        Add Scenario
                                    </h3>

                                </div>


                                {/* SITUATION */}

                                <div>

                                    <label
                                        htmlFor="scenario-situation"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Situation
                                    </label>

                                    <textarea
                                        id="scenario-situation"
                                        value={
                                            scenarioForm.situation
                                        }
                                        onChange={event =>
                                            handleScenarioChange(
                                                "situation",
                                                event.target.value
                                            )
                                        }
                                        rows={5}
                                        placeholder="Describe the emergency situation..."
                                        disabled={
                                            savingScenario
                                        }
                                        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                                    />

                                </div>


                                {/* CHOICES */}

                                <div>

                                    <label
                                        htmlFor="scenario-choices"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Choices
                                    </label>

                                    <textarea
                                        id="scenario-choices"
                                        value={
                                            scenarioForm.choices
                                        }
                                        onChange={event =>
                                            handleScenarioChange(
                                                "choices",
                                                event.target.value
                                            )
                                        }
                                        rows={5}
                                        placeholder={
                                            "Enter one choice per line:\nEvacuate immediately\nStay inside the building\nUse the elevator"
                                        }
                                        disabled={
                                            savingScenario
                                        }
                                        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                                    />

                                    <p className="mt-1.5 text-xs text-slate-500">
                                        Enter each choice on a separate line.
                                    </p>

                                </div>


                                {/* CORRECT CHOICE */}

                                <div>

                                    <label
                                        htmlFor="scenario-correct-choice"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Correct Choice
                                    </label>

                                    <input
                                        id="scenario-correct-choice"
                                        type="text"
                                        value={
                                            scenarioForm.correct_choice
                                        }
                                        onChange={event =>
                                            handleScenarioChange(
                                                "correct_choice",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Must exactly match one of the choices"
                                        disabled={
                                            savingScenario
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                                    />

                                    <p className="mt-1.5 text-xs text-slate-500">
                                        Enter the correct choice exactly as written above.
                                    </p>

                                </div>


                                {/* EXPLANATION */}

                                <div>

                                    <label
                                        htmlFor="scenario-explanation"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Explanation
                                    </label>

                                    <textarea
                                        id="scenario-explanation"
                                        value={
                                            scenarioForm.explanation
                                        }
                                        onChange={event =>
                                            handleScenarioChange(
                                                "explanation",
                                                event.target.value
                                            )
                                        }
                                        rows={4}
                                        placeholder="Explain why this is the correct decision..."
                                        disabled={
                                            savingScenario
                                        }
                                        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                                    />

                                </div>


                                {/* POINTS */}

                                <div>

                                    <label
                                        htmlFor="scenario-points"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Points
                                    </label>

                                    <input
                                        id="scenario-points"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={
                                            scenarioForm.points
                                        }
                                        onChange={event =>
                                            handleScenarioChange(
                                                "points",
                                                event.target.value
                                            )
                                        }
                                        disabled={
                                            savingScenario
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100 sm:w-40"
                                    />

                                </div>


                                {/* ADD BUTTON */}

                                <div className="flex justify-end pt-2">

                                    <button
                                        type="submit"
                                        disabled={
                                            savingScenario
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >

                                        {savingScenario ? (
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Plus
                                                size={17}
                                            />
                                        )}

                                        Add Scenario

                                    </button>

                                </div>

                            </form>


                            {/* ==================================================
                                PUBLISH FROM EDITOR
                            ================================================== */}

                            <div className="mt-8 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-5">

                                <div>

                                    <p className="font-semibold text-slate-900">
                                        Publication Status
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">

                                        {simulationDetail?.scenarios.length ?? 0}
                                        {" "}
                                        scenario
                                        {(simulationDetail?.scenarios.length ?? 0) !== 1
                                            ? "s"
                                            : ""}
                                        {" "}available

                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        handlePublish(
                                            editingSimulation
                                        )
                                    }
                                    disabled={
                                        !simulationDetail ||
                                        simulationDetail.scenarios.length === 0
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    <Check
                                        size={17}
                                    />

                                    Publish Simulation

                                </button>

                            </div>

                        </div>

                    )}

                </div>

            )}


            {/* ==================================================
                FILTER
            ================================================== */}

            <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">

                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Filter by Disaster
                </label>

                <select
                    value={selectedDisaster}
                    onChange={event =>
                        setSelectedDisaster(
                            event.target.value
                        )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:w-80"
                >

                    <option value="">
                        All Disasters
                    </option>

                    {disasters.map(
                        disaster => (

                            <option
                                key={disaster.id}
                                value={disaster.id}
                            >
                                {disaster.name}
                            </option>

                        )
                    )}

                </select>

            </div>


            {/* ==================================================
                CONTENT
            ================================================== */}

            {loading ? (

                <div className="flex min-h-60 items-center justify-center">

                    <Loader2
                        className="animate-spin text-blue-600"
                        size={32}
                    />

                </div>

            ) : simulations.length === 0 ? (

                <div className="rounded-xl border bg-white p-12 text-center shadow-sm">

                    <Brain
                        className="mx-auto mb-4 text-slate-400"
                        size={42}
                    />

                    <h2 className="text-lg font-semibold text-slate-900">
                        No simulations found
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Create your first simulation to get started.
                    </p>

                </div>

            ) : (

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[900px]">

                            <thead className="border-b bg-slate-50">

                                <tr>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Simulation
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Disaster
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Difficulty
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y">

                                {simulations.map(
                                    simulation => {

                                        const disaster =
                                            disasters.find(
                                                item =>
                                                    item.id ===
                                                    simulation.disaster_id
                                            );

                                        return (

                                            <tr
                                                key={simulation.id}
                                                className="hover:bg-slate-50"
                                            >

                                                {/* SIMULATION */}

                                                <td className="px-5 py-4">

                                                    <p className="font-semibold text-slate-900">
                                                        {simulation.title}
                                                    </p>

                                                    {simulation.description && (

                                                        <p className="mt-1 max-w-md truncate text-sm text-slate-500">
                                                            {simulation.description}
                                                        </p>

                                                    )}

                                                </td>


                                                {/* DISASTER */}

                                                <td className="px-5 py-4 text-sm text-slate-700">

                                                    {disaster?.name ??
                                                        "Unknown"}

                                                </td>


                                                {/* DIFFICULTY */}

                                                <td className="px-5 py-4">

                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                        {simulation.difficulty}
                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td className="px-5 py-4">

                                                    {simulation.is_published ? (

                                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">

                                                            <Check
                                                                size={13}
                                                            />

                                                            Published

                                                        </span>

                                                    ) : (

                                                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                            Draft
                                                        </span>

                                                    )}

                                                </td>


                                                {/* ACTIONS */}

                                                <td className="px-5 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        {/* EDIT */}

                                                        {!simulation.is_published && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEdit(
                                                                        simulation
                                                                    )
                                                                }
                                                                title="Edit and manage scenarios"
                                                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                                                            >

                                                                <Edit
                                                                    size={17}
                                                                />

                                                            </button>

                                                        )}


                                                        {/* PUBLISH / UNPUBLISH */}

                                                        {simulation.is_published ? (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUnpublish(
                                                                        simulation
                                                                    )
                                                                }
                                                                title="Unpublish"
                                                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-orange-600"
                                                            >

                                                                <Power
                                                                    size={17}
                                                                />

                                                            </button>

                                                        ) : (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handlePublish(
                                                                        simulation
                                                                    )
                                                                }
                                                                title="Publish"
                                                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-green-600"
                                                            >

                                                                <Check
                                                                    size={17}
                                                                />

                                                            </button>

                                                        )}


                                                        {/* DELETE */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    simulation
                                                                )
                                                            }
                                                            title="Delete"
                                                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-red-600"
                                                        >

                                                            <Trash2
                                                                size={17}
                                                            />

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
};


export default AdminSimulations;