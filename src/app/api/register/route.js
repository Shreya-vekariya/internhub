import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const HASURA_URL = process.env.HASURA_PROJECT_ENDPOINT; 
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

export async function POST(req) {
    try {
        const body = await req.json();
        // Destructure all incoming fields
        const { name, email, password, role, college, gender, dept_id } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "All fields required" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. UPDATED MUTATION: Added $gender and $dept_id to the header
        // 2. Used the correct DB column name: deptartment_id
        const mutation = `
            mutation InsertUser(
                $name: String!, 
                $email: String!, 
                $password: String!, 
                $role: String!, 
                $college: String, 
                $gender: String, 
                $dept_id: Int
            ) {
                insert_users_one(object: {
                    name: $name, 
                    email: $email, 
                    password: $password, 
                    role: $role, 
                    college: $college,
                    gender: $gender,
                    deptartment_id: $dept_id
                }) {
                    id
                    email
                }
            }
        `;

        const res = await fetch(HASURA_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
            },
            body: JSON.stringify({
                query: mutation,
                variables: {
                    name,
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    // Keep the original case (e.g., "Admin") or use a standard format
                    role: role || "Intern", 
                    college: college || null,
                    gender: gender || null,
                    // Convert dept_id from string "1" to number 1
                    dept_id: dept_id ? parseInt(dept_id) : null 
                }
            }),
        });

        const responseData = await res.json();

        if (responseData.errors) {
            console.error("Hasura Errors:", responseData.errors);
            if (responseData.errors[0].message.includes("Uniqueness violation")) {
                return NextResponse.json({ error: "User already exists" }, { status: 400 });
            }
            return NextResponse.json({ error: responseData.errors[0].message }, { status: 400 });
        }

        return NextResponse.json({
            message: "User created successfully",
            user: responseData.data.insert_users_one,
        });
    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}