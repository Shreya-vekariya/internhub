"use server";
const HASURA_URL = process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET;

import { hash, compare } from "bcryptjs";
import { sendMail } from "./mail";

// Helper for Hasura Requests
async function hasuraRequest(query, variables = {}) {
    const res = await fetch(HASURA_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
        },
        body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    return json.data;
}

// 1. Fetch All Users
// src/lib/useAdmin.js

export const userlist = async () => {
    const query = `
       query GetUsersAndDepts {
  users {
    id
    name
    email
    role
    college
    department_id
    end_date
    start_date
    status
  }
  departments {
    id
    name
  }
}
    `;
    const data = await hasuraRequest(query);
    
    // Manual Join: Attach department_name to each user 
    return data.users.map(user => {
        const dept = data.departments.find(d => d.id === user.department_id);
        return {
            ...user,
            department_name: dept ? dept.name : "Not Assigned"
        };
    });
};

// 2. Fetch Single User (The missing export!)
// src/lib/useAdmin.js

export const getSingleUser = async (id) => {
    // We fetch the user AND the full list of departments
    const query = `
        query GetUserAndDepartments($id: Int!) {
            users_by_pk(id: $id) {
                id
                name
                email
                role
                college
                gender
                department_id
                start_date   
                end_date     
                status
            }
            departments {
                id
                name
            }
        }
    `;
    
    const data = await hasuraRequest(query, { id: parseInt(id) });
    const user = data.users_by_pk;
    
    // Manually find the matching department name
    const dept = data.departments.find(d => d.id === user.department_id);
    
    return {
        ...user,
        department_name: dept ? dept.name : "Not Assigned"
    };
};

// 4. Delete User
export const deleteUser = async (id) => {
    const query = `
        mutation DeleteUser($id: Int!) {
            delete_users_by_pk(id: $id) {
                id
            }
        }
    `;
    return await hasuraRequest(query, { id: parseInt(id) });
};

// Add this to your existing useAdmin.js file

// Fetch all departments for the dropdown list
export const getDepartments = async () => {
    const query = `
        query {
            departments {
                id
                name
            }
        }
    `;
    
    const res = await fetch(HASURA_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
        },
        body: JSON.stringify({ query }),
    });

    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    return json.data.departments;
};

export const updateUser = async (id, updates) => {
    const isHead = updates.role === "Head";
    const userId = parseInt(id);

    if (isHead) {
        // 1. Check if the department already has a head (excluding this user)
        const checkQuery = `
            query CheckDeptHead($dept_id: Int!) {
                departments_by_pk(id: $dept_id) {
                    name
                    head_id
                }
            }
        `;
        
        const checkRes = await hasuraRequest(checkQuery, { 
            dept_id: parseInt(updates.department_id) 
        });

        const currentHeadId = checkRes?.departments_by_pk?.head_id;
        const deptName = checkRes?.departments_by_pk?.name;

        // If someone else is already the head, block the update
        if (currentHeadId && currentHeadId !== userId) {
            throw new Error(`The ${deptName} department already has a Head. Please demote the current Head before assigning a new one.`);
        }

        // 2. Proceed with the "Promote to Head" mutation
        const query = `
        mutation UpdateToHead($id: Int!, $set: users_set_input!, $dept_id: Int!) {
            updateUser: update_users_by_pk(pk_columns: { id: $id }, _set: $set) {
                id
                role
            }
            clearOldHead: update_departments(where: { head_id: { _eq: $id } }, _set: { head_id: null }) {
                affected_rows
            }
            setNewHead: update_departments_by_pk(pk_columns: { id: $dept_id }, _set: { head_id: $id }) {
                id
            }
        }`;
        return await hasuraRequest(query, { id: userId, set: updates, dept_id: updates.department_id });
    }

    // 3. Logic for Intern/Admin (Clears head_id if they were a head)
    const query = `
    mutation UpdateToNonHead($id: Int!, $set: users_set_input!) {
        update_users_by_pk(pk_columns: { id: $id }, _set: $set) {
            id
            role
        }
        clearHeadStatus: update_departments(
            where: { head_id: { _eq: $id } }
            _set: { head_id: null }
        ) {
            affected_rows
        }
    }`;
    return await hasuraRequest(query, { id: userId, set: updates });
};


// Insert the new department
export const addDepartment = async (name, headId) => {
    const mutation = `
        mutation AddDept($name: String!, $headId: Int) {
            insert_departments_one(object: {
                name: $name,
            }) {
                id
                name
            }
        }
    `;
    return await hasuraRequest(mutation, { name });
};

// src/lib/useAdmin.js

export const updateProfile = async (id, updates) => {
    const query = `
        mutation UpdateUserProfile($id: Int!, $updates: users_set_input!) {
            update_users_by_pk(pk_columns: {id: $id}, _set: $updates) {
                id
                name
                email
                college
                gender
            }
        }
    `;
    const data = await hasuraRequest(query, { id, updates });
    return data.update_users_by_pk;
};

export const getDeptInterns = async (deptId) => {
    const query = `
        query GetDeptInterns($deptId: Int!) {
            users(where: { 
                role: { _eq: "Intern" }, 
                department_id: { _eq: $deptId }
            }) {
                id
                name
            }
        }
    `;
    const data = await hasuraRequest(query, { deptId });
    return data.users;
};

// 2. Create a new task
export const createTask = async (taskObject) => {
    const mutation = `
        mutation CreateTask($object: tasks_insert_input!) {
            insert_tasks_one(object: $object) {
                id
                title
            }
        }
    `;
    const data = await hasuraRequest(mutation, { object: taskObject });
    return data.insert_tasks_one;
};

// 3. Fetch all tasks for a department (for your Manage page)
export const getDepartmentTasks = async (deptId) => {
    const query = `
        query GetDepartmentTasks($deptId: Int!) {
            tasks(where: { department_id: { _eq: $deptId } }, order_by: { created_at: desc }) {
                id
                title
                description
                status
                priority
                due_date
                user { 
                    name 
                }
            }
        }
    `;
    const data = await hasuraRequest(query, { deptId });
    return data.tasks;
};

export const deleteTask = async (taskId) => {
    const mutation = `
        mutation DeleteTask($id: Int!) {
            delete_tasks_by_pk(id: $id) {
                id
            }
        }
    `;
    const data = await hasuraRequest(mutation, { id: parseInt(taskId) });
    return data.delete_tasks_by_pk;
};

// Fetch a single task by its ID
export const getTaskById = async (taskId) => {
    const query = `
        query GetTaskById($id: Int!) {
            tasks_by_pk(id: $id) {
                id
                title
                description
                priority
                status
                due_date
                assigned_to
            }
        }
    `;
    const data = await hasuraRequest(query, { id: parseInt(taskId) });
    return data.tasks_by_pk;
};

// Update an existing task
export const updateTask = async (taskId, updateObject) => {
    const mutation = `
        mutation UpdateTask($id: Int!, $object: tasks_set_input!) {
            update_tasks_by_pk(pk_columns: { id: $id }, _set: $object) {
                id
                title
            }
        }
    `;
    const data = await hasuraRequest(mutation, { 
        id: parseInt(taskId), 
        object: updateObject 
    });
    return data.update_tasks_by_pk;
};

// Fetch tasks specifically assigned to one intern
export const getInternTasks = async (internId) => {
    const query = `
        query GetInternTasks($internId: Int!) {
            tasks(where: { assigned_to: { _eq: $internId } }, order_by: { created_at: desc }) {
                id
                title
                description
                status
                priority
                due_date
                department_name
            }
        }
    `;
    const data = await hasuraRequest(query, { internId: parseInt(internId) });
    return data.tasks;
};

// Update only the status of a specific task
export const updateTaskStatus = async (taskId, newStatus) => {
    const mutation = `
        mutation UpdateTaskStatus($id: Int!, $status: String!) {
            update_tasks_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
                id
                status
            }
        }
    `;
    const data = await hasuraRequest(mutation, { 
        id: parseInt(taskId), 
        status: newStatus 
    });
    return data.update_tasks_by_pk;
};

export const getDepartmentsList = async () => {
	const query = `
        query GetDeptsAndHeads {
            departments(order_by: {id: asc}) {
                id
                name
                head_id
            }
            users {
                id
                name
            }
        }
    `;
	const data = await hasuraRequest(query);

	// Manual Join: Attach Head Name to each Department
	return data.departments.map((dept) => {
		const headUser = data.users.find(
			(u) => String(u.id) === String(dept.head_id),
		);
		return {
			...dept,
			head_name: headUser ? headUser.name : "No Head Assigned",
		};
	});
};

// Fetch all departments for the dropdown list
export const getUpdateDepartments = async () => {
	const query = `
        query {
            departments(where: {head_id: {_is_null: true}}) {
                id
                name
                head_id
              }
        }
    `;

	const res = await fetch(HASURA_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-hasura-admin-secret": HASURA_ADMIN_SECRET,
		},
		body: JSON.stringify({ query }),
	});

	const json = await res.json();
	if (json.errors) throw new Error(json.errors[0].message);
	return json.data.departments;
};

export const getDeptName = async (deptId) => {
    const query = `
        query GetDeptName($deptId: Int!) {
            departments(where: {
                id: { _eq: $deptId }
            }) {
                id
                name
            }
        }
    `;
    const data = await hasuraRequest(query, { deptId });
    return data.departments;
};

export async function updatePasswordByEmail(email) {
    try {
        // 1. Check if the user exists in the database
        // Replace 'YOUR_GRAPHQL_ENDPOINT' and 'YOUR_ADMIN_SECRET' with your actual environment variables
        const checkUserResponse = await fetch(process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
            },
            body: JSON.stringify({
                query: `
                    query CheckUser($email: String!) {
                        users(where: {email: {_eq: $email}}) {
                            id
                            email
                        }
                    }
                `,
                variables: { email },
            }),
        });

        const checkUserData = await checkUserResponse.json();
        const userExists = checkUserData.data?.users?.length > 0;

        // 2. If email is not registered, return a specific error message
        if (!userExists) {
            return { 
                success: false, 
                message: "This email address is not registered in our system." 
            };
        }

        // 3. Email exists -> Generate random password
        const newPlainPassword = Math.random().toString(36).slice(-10); // 10 chars
        const hashedPassword = await hash(newPlainPassword, 10);

        // 4. Update the password in the database
        const updateResponse = await fetch(process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
            },
            body: JSON.stringify({
                query: `
                    mutation UpdateUserPassword($email: String!, $password: String!) {
                        update_users(where: {email: {_eq: $email}}, _set: {password: $password}) {
                            affected_rows
                        }
                    }
                `,
                variables: { email, password: hashedPassword },
            }),
        });

        const updateData = await updateResponse.json();

        if (updateData.errors || updateData.data?.update_users?.affected_rows === 0) {
            throw new Error("Failed to update password in database.");
        }

        // 5. Send the email with the PLAIN text password
        await sendMail({
            sendTo: email,
            subject: "Your New Access Password",
            text: `Your password has been reset. Your new temporary password is: ${newPlainPassword}\n\nPlease log in and change this password immediately from your profile.`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Password Reset Successful</h2>
                    <p>You requested a password reset. Use the temporary password below to log in:</p>
                    <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; font-size: 20px; font-weight: bold; text-align: center; color: #4f46e5;">
                        ${newPlainPassword}
                    </div>
                    <p style="margin-top: 20px;"><strong>Security Tip:</strong> Please change this password as soon as you log in.</p>
                </div>
            `
        });

        return { 
            success: true, 
            message: "A new password has been sent to your registered email address." 
        };

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return { 
            success: false, 
            message: "An unexpected error occurred. Please try again later." 
        };
    }
}

/**
 * 2. CHANGE PASSWORD: Validates current password and updates to new one
 * Used by the InternProfile modal.
 */
export async function updateProfilePassword(userId, currentPlain, newPlain) {
    try {
        // 1. Fetch the user's current hashed password from Hasura
        const fetchUserResponse = await fetch(process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
            },
            body: JSON.stringify({
                query: `
                    query GetUserPassword($id: Int!) {
                        users_by_pk(id: $id) {
                            password
                        }
                    }
                `,
                variables: { id: userId },
            }),
        });

        const userData = await fetchUserResponse.json();
        const currentHash = userData.data?.users_by_pk?.password;

        if (!currentHash) {
            throw new Error("User record not found.");
        }

        // 2. Verify if the 'Current Password' entered matches the hash in DB
        const isMatch = await compare(currentPlain, currentHash);
        if (!isMatch) {
            // Throwing a specific error message for the frontend to catch
            throw new Error("The current password you entered is incorrect.");
        }

        // 3. Hash the 'New Password'
        const hashedNewPassword = await hash(newPlain, 10);

        // 4. Update the user record in Hasura
        const updateResponse = await fetch(process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
            },
            body: JSON.stringify({
                query: `
                    mutation UpdateUserPassword($id: Int!, $password: String!) { 
                        update_users_by_pk(
                            pk_columns: {id: $id}, 
                            _set: {password: $password}
                        ) {
                            id
                        }
                    }
                `,
                variables: { 
                    id: userId, 
                    password: hashedNewPassword 
                },
            }),
        });

        const updateResult = await updateResponse.json();
        console.log(updateResult , "Update Result ===============================");

        if (updateResult.errors) {
            console.log(updateResult.errors , "Backend=============================================")
            // throw new Error("Failed to update password in database.");
        }

        return { success: true, message: "Password updated successfully!" };

    } catch (error) {
        console.error("Database Error (updateProfilePassword):", error);
        // We re-throw the error so your frontend 'catch' block can use error.message
        throw error;
    }
}
