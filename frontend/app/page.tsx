"use client";

import { fetchTestData, TEST_QUERY_KEY } from "@/api/queries/test";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function HomePage() {
    const { data, isLoading, error } = useQuery({
        queryKey: [TEST_QUERY_KEY],
        queryFn: fetchTestData,
    });

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <main className="p-6">
            <h1 className="text-xl font-bold">Frontend → Backend test</h1>
            <p>Response: {data}</p>
        </main>
    );
}
