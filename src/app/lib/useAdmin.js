const HASURA_URL = process.env.NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET;

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
                deptartment_id
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
        const dept = data.departments.find(d => d.id === user.deptartment_id);
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
                deptartment_id
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
    const dept = data.departments.find(d => d.id === user.deptartment_id);
    
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

	const query = isHead
		? `
        mutation UpdateUser(
            $id: Int!,
            $set: users_set_input!,
            $dept_id: Int!
        ) {
            # 1. Update user
            updateUser: update_users_by_pk(
                pk_columns: { id: $id },
                _set: $set
            ) {
                id
                role
                deptartment_id
            }

            # 2. Remove user as head from ANY previous department
            clearOldHead: update_departments(
                where: { head_id: { _eq: $id } }
                _set: { head_id: null }
            ) {
                affected_rows
            }

            # 3. Assign user as head to new department
            setNewHead: update_departments_by_pk(
                pk_columns: { id: $dept_id }
                _set: { head_id: $id }
            ) {
                id
                head_id
            }
        }
        `
		: `
        mutation UpdateUser(
            $id: Int!,
            $set: users_set_input!
        ) {
            update_users_by_pk(
                pk_columns: { id: $id },
                _set: $set
            ) {
                id
                role
            }
        }
        `;

	const variables = isHead
		? {
				id: parseInt(id),
				set: updates,
				dept_id: updates.deptartment_id,
			}
		: {
				id: parseInt(id),
				set: updates,
			};

	return await hasuraRequest(query, variables);
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
                deptartment_id: { _eq: $deptId }
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

