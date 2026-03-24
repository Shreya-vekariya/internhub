"use server"
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const HASURA_URL = process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET;

// Helper function to talk to Hasura from the server
async function fetchHasura(query, variables = {}) {
    const res = await fetch(HASURA_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
        },
        body: JSON.stringify({ query, variables }),
    });
    return await res.json();
}

// Replacement for prisma.user.findMany()
export async function UserList() {
    const query = `
        query GetUsers {
            users {
                id
                name
                email
                role
                deptartment_id
            }
        }
    `;
    const { data, errors } = await fetchHasura(query);
    
    if (errors) {
        console.error("Hasura Error:", errors);
        return [];
    }
    
    return data?.users || [];
}

// Helper to get the logged-in user from the Cookie/JWT
export async function getSessionUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded; 
    } catch (err) {
        return null;
    }
}