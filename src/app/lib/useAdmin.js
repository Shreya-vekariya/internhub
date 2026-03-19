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
    const query = `
        mutation UpdateUser($id: Int!, $set: users_set_input!) {
            update_users_by_pk(pk_columns: {id: $id}, _set: $set) {
                id
                name
                role
                email
                college
                gender         
                deptartment_id
            }
        }
    `;
    // Pass the updates object directly into the _set variable
    return await hasuraRequest(query, { id: parseInt(id), set: updates });
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

