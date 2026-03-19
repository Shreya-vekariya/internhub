import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const HASURA_URL = process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET;

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const query = `
                    query GetUser($email: String!) {
                        users(where: {email: {_eq: $email}}) {
                            id
                            name
                            email
                            password
                            role
							deptartment_id
                        }
                    }
                `;

                const res = await fetch(HASURA_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
                    },
                    body: JSON.stringify({ query, variables: { email: credentials.email.toLowerCase() } }),
                });

                const { data } = await res.json();
                const user = data?.users[0];

                if (!user) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                return {
                    id: String(user.id),
                    name: user.name,
                    email: user.email,
                    role: user.role,
					deptId: user.deptartment_id,
                };
            },
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;
			session.user.dept_id = token.dept_id;
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
				token.dept_id = user.deptId;
            }
            return token;
        },
    },
    pages: { signIn: "/Login" },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };