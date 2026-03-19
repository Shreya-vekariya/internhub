"use client"
import { useParams } from 'next/navigation'

import { useRouter } from "next/navigation";
import { useSelector } from 'react-redux';
import { loadUser } from '../../../redux/authActions';
const Subabout = () => {

	const user = useSelector((state) => state.auth.user);
	// console.log(user);
	
    const blog = [
			{ id: 1, title: "Getting Started with Next.js", href: "/About/1" },
			{ id: 2, title: "Mastering Tailwind CSS", href: "/About/2" },
			{ id: 3, title: "Understanding Route Groups", href: "/About/3" },
			{ id: 4, title: "Deploying to Vercel", href: "/About/4" },
		];

    const router = useRouter()
    const { id } = useParams()

// console.log(user);

    const post = blog.find((blog)=>( blog.id.toLocaleString() === id ))

return (
		<>
			<button
				onClick={() => router.back()}
				className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
				<span className="mr-1">←</span> Back
			</button>

			<div className="mt-4 text-xl font-semibold">Viewing Page: {post.id}</div>
			<div className="mt-4 text-xl font-semibold">title: {post.title}</div>
		</>
	);
}

export default Subabout;