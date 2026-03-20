import { NextResponse } from "next/server";

const HASURA_URL = process.env.HASURA_PROJECT_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const deptId = searchParams.get("deptId");

    if (!deptId) return NextResponse.json({ error: "Dept ID required" }, { status: 400 });

    // We fetch users AND tasks in one go. 
    // This works even without a formal relationship defined.
    const query = `
        query GetDeptInternsAndTasks($deptId: Int!) {
            users(where: { 
                deptartment_id: { _eq: $deptId }, 
                role: { _eq: "Intern" } 
            }) {
                id
                name
                email
                college
                gender
            }
            tasks {
                assigned_to
            }
        }
    `;

    try {
        const res = await fetch(HASURA_URL, {
            method: "POST",
            headers: { "x-hasura-admin-secret": HASURA_ADMIN_SECRET },
            body: JSON.stringify({ query, variables: { deptId: parseInt(deptId) } }),
        });

        const result = await res.json();

        // If Hasura returns an error (like a wrong column name), log it
        if (result.errors) {
            console.error("Hasura Query Errors:", result.errors);
            return NextResponse.json({ error: "Database query failed" }, { status: 500 });
        }

        const users = result.data?.users || [];
        const allTasks = result.data?.tasks || [];

        // Manually calculate the count for each intern
        const internsWithCount = users.map(user => {
            const count = allTasks.filter(t => Number(t.assigned_to) === Number(user.id)).length;
            return {
                ...user,
                task_count: count
            };
        });

        return NextResponse.json(internsWithCount);

    } catch (err) {
        console.error("API Route Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}