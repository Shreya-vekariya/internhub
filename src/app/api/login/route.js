import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const HASURA_URL = process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET;

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and Password required" }, { status: 400 });
        }

        const query = `
            query GetUser($email: String!) {
                users(where: {email: {_eq: $email}}) {
                    id
                    name
                    email
                    password
                    role
                }
            }
        `;

        const hasuraRes = await fetch(HASURA_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
            },
            body: JSON.stringify({ query, variables: { email: email.toLowerCase() } }),
        });

        const { data } = await hasuraRes.json();
        const user = data?.users[0];

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 3600,
            path: "/",
        });

        return NextResponse.json({
            message: "Login successful",
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token,
        });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}