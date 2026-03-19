import { NextResponse } from "next/server";

const HASURA_URL = process.env.HASURA_PROJECT_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const deptId = searchParams.get("deptId");

    console.log("FETCHING FOR DEPT ID:", deptId);

    if (!deptId) return NextResponse.json({ error: "Dept ID required" }, { status: 400 });

    const query = `
        query GetDeptInterns($deptId: Int!) {
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
        }
    `;

    const res = await fetch(HASURA_URL, {
        method: "POST",
        headers: { "x-hasura-admin-secret": HASURA_ADMIN_SECRET },
        body: JSON.stringify({ query, variables: { deptId: parseInt(deptId) } }),
    });

    const { data } = await res.json();
    return NextResponse.json(data?.users || []);
}