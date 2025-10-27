export const LOCALE_COOKIE_NAME = "locale";
export const AVAILABLE_LOCALES: { code: string; label: string }[] = [
	{ code: "en", label: "EN" },
	{ code: "cs", label: "CS" },
];

export const TRANSLATION_SECTION_KEYS = {
	common: "Common",
	errorBoundary: "ErrorBoundary",
	loginPage: "LoginPage",
	topBar: "TopBar",
	dashboardPage: "DashboardPage",
	exercisesPage: "ExercisesPage",
	exerciseForm: "ExerciseForm",
	scopedResourceList: "ScopedResourceList",
	workoutSessionPlansPage: "WorkoutSessionPlansPage",
	workoutSessionPlanForm: "WorkoutSessionPlanForm",
	trainingSplitsPage: "TrainingSplitsPage",
	trainingSplitsForm: "TrainingSplitsForm",
	sessionLoggingPage: "SessionLoggingPage",
	sessionLoggingSummaryPage: "SessionLoggingSummaryPage",
}