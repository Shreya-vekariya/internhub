import { NextResponse } from 'next/server';

export async function GET() {
    const query = `
        query GetAllInterns {
            users(where: {role: {_eq: "Intern"}}) {
                id
                name
                email
                college
                gender
                # Fetching the related department name
                department {
                    name
                }
            }
        }
    `;

    try {
        const response = await fetch(process.env.HASURA_PROJECT_ENDPOINT, {
            method: 'POST',
            headers: { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET },
            body: JSON.stringify({ query })
        });
        
        const result = await response.json();
        
        // Safety check for Hasura errors
        if (result.errors) {
            console.error("Hasura Error:", result.errors);
            return NextResponse.json({ error: result.errors[0].message }, { status: 400 });
        }

        return NextResponse.json(result.data.users);
    } catch (error) {
        console.error("Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch interns" }, { status: 500 });
    }
}