// app/api/departmentdetails/[id]/route.js
import { NextResponse } from "next/server";
import { hasuraFetch } from "../../../../lib/hasura";

export async function GET(request, { params }) {
	const { id } = await params;
	const deptId = parseInt(id);

	const query = `
        query GetDeptAndUsers($id: Int!) {
            departments_by_pk(id: $id) {
                id
                name
            }
            users(where: {department_id: {_eq: $id}}, order_by: {role: asc}) {
                id
                name
                role
                gender
                email
                department_id
            }
        }
    `;

	try {
		// hasuraFetch returns { data, errors }
		const result = await hasuraFetch(query, { id: deptId });

		if (result.errors) {
			return NextResponse.json(
				{ error: result.errors[0].message },
				{ status: 400 },
			);
		}

		// Use .json() static method
		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		console.error("API Route Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}