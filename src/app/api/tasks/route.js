import { NextResponse } from 'next/server';

// --- GRAPHQL QUERIES ---

const GET_TASKS_QUERY = `
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

const GET_DEPT_INTERNS = `
  query GetDeptInterns($deptId: Int!) {
    users(where: { role: { _eq: "Intern" }, deptartment_id: { _eq: $deptId } }) {
      id
      name
    }
  }
`;

// --- GRAPHQL MUTATIONS ---

const CREATE_TASK_MUTATION = `
  mutation CreateTask($object: tasks_insert_input!) {
    insert_tasks_one(object: $object) {
      id
      title
    }
  }
`;

const DELETE_TASK_MUTATION = `
  mutation DeleteTask($id: Int!) {
    delete_tasks_by_pk(id: $id) {
      id
    }
  }
`;

export async function POST(req) {
    try {
        const { action, taskData, deptId, taskId } = await req.json();
        const HASURA_URL = process.env.HASURA_PROJECT_ENDPOINT;
        const ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

        if (!HASURA_URL || !ADMIN_SECRET) {
            return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
        }

        let query = '';
        let variables = {};

        // --- ACTION SWITCHBOARD ---
        switch (action) {
            case 'CREATE':
                query = CREATE_TASK_MUTATION;
                variables = { object: taskData };
                break;

            case 'FETCH':
                query = GET_TASKS_QUERY;
                variables = { deptId: parseInt(deptId) };
                break;

            case 'FETCH_INTERNS':
                query = GET_DEPT_INTERNS;
                variables = { deptId: parseInt(deptId) };
                break;

            case 'DELETE':
                query = DELETE_TASK_MUTATION;
                variables = { id: parseInt(taskId) };
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const response = await fetch(HASURA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': ADMIN_SECRET,
            },
            body: JSON.stringify({ query, variables }),
        });

        const result = await response.json();

        // Handle Hasura Errors
        if (result.errors) {
            console.error("Hasura Error:", result.errors);
            return NextResponse.json({ error: result.errors[0].message }, { status: 400 });
        }

        // Return the specific data part to keep frontend logic simple
        if (action === 'FETCH') return NextResponse.json(result.data.tasks);
        if (action === 'FETCH_INTERNS') return NextResponse.json(result.data.users);
        
        return NextResponse.json(result.data);

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


