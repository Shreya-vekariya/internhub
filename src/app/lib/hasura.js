import { getSession } from "next-auth/react";

export async function hasuraFetch(query, variables = {}) {
	const ss = getSession();
	// console.log(ss);

	const res = await fetch(process.env.HASURA_PROJECT_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",

			"x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET,
		},
		body: JSON.stringify({
			query,
			variables,
		}),
	});

	const json = await res.json();

	if (json.errors) {
		console.error("Hasura GraphQL Errors:", json.errors);
	}

	// console.log("Full Hasura response:", json);

	return json.data;
}