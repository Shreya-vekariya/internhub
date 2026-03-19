import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("token");

        return NextResponse.json({ message: "Logged out" }, { status: 200 });
    } catch (error) {
        console.error("Logout Error:", error);
        return NextResponse.json({ error: "Error during logout" }, { status: 500 });
    }
}