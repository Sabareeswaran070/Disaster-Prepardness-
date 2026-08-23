export interface Simulation {
    id: number;
    disaster_id: number;
    title: string;
    description: string | null;
    difficulty: string;
    is_published: boolean;
    created_at: string;
}

export interface SimulationScenario {
    id: number;
    simulation_id: number;
    scenario_order: number;
    situation: string;
    choices: string;
    points: number;
}

export interface SimulationDetail
    extends Simulation {
    scenarios: SimulationScenario[];
}

export interface SimulationDecision {
    scenario_id: number;
    selected_choice: string | null;
}

export interface SubmitSimulationRequest {
    decisions: SimulationDecision[];
}

export interface SimulationResult {
    simulation_id: number;
    score: number;
    max_score: number;
    percentage: number;
    completed: boolean;
    responses_saved: number;
}
