import { NextResponse } from "next/server";

const HASURA_URL = process.env.HASURA_PROJECT_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

export async function GET() {
    const query = `
        query GetAdminTaskBoard {
            tasks {
                id
                title
                description
                status
                department_name
                assigned_to
                priority
                due_date
            }
            users(where: { role: { _eq: "Intern" } }) {
                id
                name
            }
        }
    `;

    try {
        const res = await fetch(HASURA_URL, {
            method: "POST",
            headers: { "x-hasura-admin-secret": HASURA_ADMIN_SECRET },
            body: JSON.stringify({ query }),
        });

        const { data } = await res.json();
        
        const tasks = data?.tasks || [];
        const users = data?.users || [];

        // Manual Join: Attach intern name to each task
        const tasksWithInterns = tasks.map(task => ({
            ...task,
            intern_name: users.find(u => Number(u.id) === Number(task.assigned_to))?.name || "Unassigned"
        }));

        return NextResponse.json(tasksWithInterns);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}