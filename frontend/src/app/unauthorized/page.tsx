export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">403</h1>
                <p className="mt-2 text-lg text-gray-600">
                    You don't have permission to access this page.
                </p>
                <a
                    href="/dashboard"
                    className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Go to Dashboard
                </a>
            </div>
        </div>
    );
}
